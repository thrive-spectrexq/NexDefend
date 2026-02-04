package hyperseek

import (
	"sync"

	native "github.com/thrive-spectrexq/NexDefend/native/hyperseek"
)

type Service struct {
	scanner *native.Scanner
	mu      sync.Mutex
}

func NewService() *Service {
	return &Service{
		scanner: native.NewScanner(),
	}
}

func (s *Service) Close() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.scanner != nil {
		s.scanner.Free()
		s.scanner = nil
	}
}

func (s *Service) AnalyzePayload(payload string) (float32, string, float32) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.scanner == nil {
		return 0.0, "", 0.0
	}
	return s.scanner.Scan(payload)
}
