
package kubernetes

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type KubernetesEvent struct {
	EventType string      `json:"event_type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

type PodMetric struct {
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	Phase     string `json:"phase"`
	NodeName  string `json:"node_name"`
	PodIP     string `json:"pod_ip"`
}

// StartKubernetesWatcher starts the Kubernetes watcher.
func StartKubernetesWatcher(getProducer func() *kafka.Producer, topic string) {
	log.Println("Starting Kubernetes watcher...")

	config, err := rest.InClusterConfig()
	if err != nil {
		log.Printf("Failed to get in-cluster config: %v. Kubernetes monitoring disabled.", err)
		return
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Printf("Failed to create Kubernetes client: %v", err)
		return
	}

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			log.Println("Collecting Kubernetes Pod metrics...")

			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			pods, err := clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
			cancel()
			if err != nil {
				log.Printf("Failed to list pods: %v", err)
				continue
			}

			for _, pod := range pods.Items {
				// --- NEW LOGIC: Check for Container Failures ---
				detailedStatus := string(pod.Status.Phase)
				for _, containerStatus := range pod.Status.ContainerStatuses {
					if containerStatus.State.Waiting != nil {
						reason := containerStatus.State.Waiting.Reason
						if reason == "CrashLoopBackOff" || reason == "ImagePullBackOff" || reason == "ErrImagePull" {
							detailedStatus = reason
							break // Prioritize the error state
						}
					}
				}
				// ----------------------------------------------

				metric := PodMetric{
					Name:      pod.Name,
					Namespace: pod.Namespace,
					Phase:     detailedStatus,
					NodeName:  pod.Spec.NodeName,
					PodIP:     pod.Status.PodIP,
				}

				event := KubernetesEvent{
					EventType: "kubernetes_pod",
					Timestamp: time.Now(),
					Data:      metric,
				}

				eventJSON, err := json.Marshal(event)
				if err != nil {
					log.Printf("Failed to marshal kubernetes event: %v", err)
					continue
				}

				producer := getProducer()
				if producer != nil {
					producer.Produce(&kafka.Message{
						TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
						Value:          eventJSON,
					}, nil)
				}
			}

			// Also watch for Events (Warnings, Errors)
			ctxEvents, cancelEvents := context.WithTimeout(context.Background(), 10*time.Second)
			events, err := clientset.CoreV1().Events("").List(ctxEvents, metav1.ListOptions{
				FieldSelector: "type!=Normal", // Only interested in warnings/errors
			})
			cancelEvents()
			if err != nil {
				continue
			}

			for _, k8sEvent := range events.Items {
				// Only send recent events (last minute) to avoid duplicates/flood on restart
				if time.Since(k8sEvent.LastTimestamp.Time) < 1*time.Minute {
					alertData := map[string]interface{}{
						"reason":    k8sEvent.Reason,
						"message":   k8sEvent.Message,
						"object":    k8sEvent.InvolvedObject.Kind + "/" + k8sEvent.InvolvedObject.Name,
						"namespace": k8sEvent.InvolvedObject.Namespace,
					}

					event := KubernetesEvent{
						EventType: "kubernetes_alert",
						Timestamp: k8sEvent.LastTimestamp.Time,
						Data:      alertData,
					}

					eventJSON, err := json.Marshal(event)
					if err == nil {
						producer := getProducer()
						if producer != nil {
							producer.Produce(&kafka.Message{
								TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
								Value:          eventJSON,
							}, nil)
						}
					}
				}
			}
		}
	}()
}
