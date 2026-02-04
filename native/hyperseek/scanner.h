#ifndef HYPERSEEK_SCANNER_H
#define HYPERSEEK_SCANNER_H

#ifdef __cplusplus
extern "C" {
#endif

typedef void* ScannerHandle;

// Creates a new scanner instance
ScannerHandle NewScanner();

// Destroys the scanner instance
void DestroyScanner(ScannerHandle handle);

// Scans a payload and returns a threat score. 
// out_matches: buffer to store comma-separated matched patterns
// max_len: size of the out_matches buffer
// out_entropy: pointer to store the calculated entropy score (0-8)
float ScanPayload(ScannerHandle handle, const char* payload, int length, char* out_matches, int max_len, float* out_entropy);

#ifdef __cplusplus
}
#endif

#endif // HYPERSEEK_SCANNER_H
