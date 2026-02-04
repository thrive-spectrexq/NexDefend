package forensics

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

type ForensicsHandler struct {
	Producer *kafka.Producer
	Topic    string
	UploadDir string
}

func NewForensicsHandler(broker string) (*ForensicsHandler, error) {
    if broker == "" {
        broker = "kafka:9092"
    }
	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": broker})
	if err != nil {
		// Log error but maybe return nil or handle gracefully if Kafka is down?
        // For now, return error
		return nil, err
	}

    uploadDir := "/tmp/forensics_uploads"
    os.MkdirAll(uploadDir, 0755)

	return &ForensicsHandler{
		Producer:  p,
		Topic:     "forensics.tasks",
		UploadDir: uploadDir,
	}, nil
}

func (h *ForensicsHandler) UploadEvidence(w http.ResponseWriter, r *http.Request) {
    if h.Producer == nil {
        http.Error(w, "Forensics service unavailable (Kafka down)", http.StatusServiceUnavailable)
        return
    }

	// Parse multipart form
	err := r.ParseMultipartForm(100 << 20) // 100MB limit
	if err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("evidence")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), handler.Filename)
	filepath := filepath.Join(h.UploadDir, filename)

	f, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}
	defer f.Close()
	io.Copy(f, file)

	// Create Task
	task := map[string]string{
		"filepath": filepath,
		"filename": handler.Filename,
		"type":     r.FormValue("type"), // memory, disk, pcap
        "status": "pending",
        "id": filename,
        "timestamp": time.Now().Format(time.RFC3339),
	}
	taskJSON, _ := json.Marshal(task)

	// Produce to Kafka
	err = h.Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &h.Topic, Partition: kafka.PartitionAny},
		Value:          taskJSON,
	}, nil)

    if err != nil {
        http.Error(w, "Failed to queue task", http.StatusInternalServerError)
        return
    }

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

func (h *ForensicsHandler) ListTasks(w http.ResponseWriter, r *http.Request) {
    // In a real app, this would query a DB where the Python worker updates status.
    // For now, return a mock list or just the files
    files, _ := os.ReadDir(h.UploadDir)
    var tasks []map[string]string
    for _, f := range files {
        tasks = append(tasks, map[string]string{
            "id": f.Name(),
            "status": "uploaded", // mock
        })
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tasks)
}
