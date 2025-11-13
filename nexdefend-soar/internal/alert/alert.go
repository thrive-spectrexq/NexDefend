
package alert

import (
	"encoding/json"
	"log"
	"net/http"

	"nexdefend/nexdefend-soar/internal/playbook"
)

type Alert struct {
	Labels      map[string]string `json:"labels"`
	Annotations map[string]string `json:"annotations"`
}

type WebhookPayload struct {
	Alerts []Alert `json:"alerts"`
}

func WebhookHandler(playbooks []playbook.Playbook) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payload WebhookPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		for _, alert := range payload.Alerts {
			log.Printf("Received alert: %s", alert.Annotations["summary"])
			for _, pb := range playbooks {
				if pb.Trigger == alert.Labels["alertname"] {
					log.Printf("Triggering playbook %s", pb.ID)
					err := pb.Execute()
					if err != nil {
						log.Printf("Failed to execute playbook %s: %v", pb.ID, err)
					}
				}
			}
		}

		w.WriteHeader(http.StatusOK)
	}
}
