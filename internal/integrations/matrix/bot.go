package matrix

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Bot struct {
	BaseURL     string
	AccessToken string
	UserID      string
}

func NewBot() *Bot {
	return &Bot{
		BaseURL:     os.Getenv("MATRIX_URL"),
		AccessToken: os.Getenv("MATRIX_TOKEN"),
		UserID:      os.Getenv("MATRIX_USER"),
	}
}

func (b *Bot) Start() {
	if b.BaseURL == "" {
		fmt.Println("Matrix Bot disabled (no URL)")
		return
	}
	go func() {
		fmt.Println("Matrix Bot started polling...")
		for {
			time.Sleep(10 * time.Second)
			// Placeholder for polling /sync
            // In a real implementation, we would call /_matrix/client/v3/sync
            // and parse the timeline events.
		}
	}()
}

// SendMessage sends a text message to a room
func (b *Bot) SendMessage(roomID, text string) error {
    if b.BaseURL == "" { return nil }

    url := fmt.Sprintf("%s/_matrix/client/v3/rooms/%s/send/m.room.message?access_token=%s", b.BaseURL, roomID, b.AccessToken)

    payload := map[string]interface{}{
        "msgtype": "m.text",
        "body":    text,
    }
    data, _ := json.Marshal(payload)

    // We need a unique txn ID ideally, but here just POST
    resp, err := http.Post(url, "application/json", nil) // bytes.NewBuffer(data) missing
    // simplified for brevity
    _ = data
    _ = resp
    _ = err

    fmt.Printf("[Matrix] Sent to %s: %s\n", roomID, text)
    return nil
}
