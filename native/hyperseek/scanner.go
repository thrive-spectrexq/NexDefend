package hyperseek

/*
#cgo CXXFLAGS: -std=c++11
#include <stdlib.h>
#include <string.h>
#include "scanner.h"

// Forward declaration of C++ functions (already in scanner.h, but ensuring CGO sees them)
*/
import "C"
import (
	"unsafe"
)

// Scanner is a wrapper around the C++ ThreatScanner
type Scanner struct {
	ptr C.ScannerHandle
}

// NewScanner creates a new instance of the threat scanner
func NewScanner() *Scanner {
	return &Scanner{
		ptr: C.NewScanner(),
	}
}

// Free releases the memory associated with the scanner
func (s *Scanner) Free() {
	if s.ptr != nil {
		C.DestroyScanner(s.ptr)
		s.ptr = nil
	}
}

// Scan performs a threat analysis on the given payload string
// Returns a threat score, a list of matched patterns, and the entropy score
func (s *Scanner) Scan(payload string) (float32, string, float32) {
	if s.ptr == nil {
		return 0.0, "", 0.0
	}

	cPayload := C.CString(payload)
	defer C.free(unsafe.Pointer(cPayload))

	length := C.int(len(payload))

	// Create buffer for matches
	const maxMatchesLen = 1024
	cMatches := (*C.char)(C.malloc(maxMatchesLen))
	defer C.free(unsafe.Pointer(cMatches))

	// Initialize buffer
	C.memset(unsafe.Pointer(cMatches), 0, maxMatchesLen)

	var entropy C.float

	// Call C function
	score := C.ScanPayload(s.ptr, cPayload, length, cMatches, C.int(maxMatchesLen), &entropy)

	matches := C.GoString(cMatches)

	return float32(score), matches, float32(entropy)
}
