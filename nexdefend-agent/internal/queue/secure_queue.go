package queue

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// SecureQueue is a file-based queue that encrypts data at rest.
type SecureQueue struct {
	dirPath    string
	encryptionKey []byte
	mutex      sync.Mutex
}

// NewSecureQueue creates a new SecureQueue.
func NewSecureQueue(dirPath string, encryptionKey []byte) (*SecureQueue, error) {
	if err := os.MkdirAll(dirPath, 0700); err != nil {
		return nil, err
	}
	return &SecureQueue{
		dirPath:    dirPath,
		encryptionKey: encryptionKey,
	}, nil
}

// Enqueue adds an item to the queue.
func (q *SecureQueue) Enqueue(data []byte) error {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	encryptedData, err := encrypt(data, q.encryptionKey)
	if err != nil {
		return err
	}

	fileName := filepath.Join(q.dirPath, fmt.Sprintf("%d.event", time.Now().UnixNano()))
	return ioutil.WriteFile(fileName, encryptedData, 0600)
}

// Dequeue removes an item from the queue.
func (q *SecureQueue) Dequeue() ([]byte, error) {
	q.mutex.Lock()
	defer q.mutex.Unlock()

	files, err := ioutil.ReadDir(q.dirPath)
	if err != nil {
		return nil, err
	}

	if len(files) == 0 {
		return nil, nil // No items in queue
	}

	oldestFile := files[0]
	filePath := filepath.Join(q.dirPath, oldestFile.Name())

	encryptedData, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	decryptedData, err := decrypt(encryptedData, q.encryptionKey)
	if err != nil {
		return nil, err
	}

	if err := os.Remove(filePath); err != nil {
		return nil, err
	}

	return decryptedData, nil
}

func encrypt(plaintext []byte, key []byte) ([]byte, error) {
	c, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(c)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func decrypt(ciphertext []byte, key []byte) ([]byte, error) {
	c, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(c)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	return gcm.Open(nil, nonce, ciphertext, nil)
}
