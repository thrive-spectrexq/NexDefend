#include "scanner.h"
#include <iostream>
#include <string>
#include <vector>
#include <regex>
#include <algorithm>
#include <cstring>
#include <cmath>
#include <map>

class ThreatScanner {
public:
    ThreatScanner() {
        // Initialize some dummy patterns for simulation
        // In a real scenario, these would be loaded from a database or file
        patterns.push_back(std::regex("eval\\s*\\(", std::regex_constants::icase));
        patterns.push_back(std::regex("base64_decode", std::regex_constants::icase));
        patterns.push_back(std::regex("UNION SELECT", std::regex_constants::icase));
        patterns.push_back(std::regex("/etc/passwd", std::regex_constants::icase));
        patterns.push_back(std::regex("<script>", std::regex_constants::icase));
    }

    float Scan(const std::string& input, std::string& out_matches, float& out_entropy) {
        float score = 0.0f;
        std::vector<std::string> matches;
        
        // 1. Calculate Entropy
        out_entropy = CalculateEntropy(input);
        if (out_entropy > 7.5f) { // High entropy (packed/encrypted)
            score += 30.0f;
            matches.push_back("HIGH_ENTROPY_DETECTED");
        }

        // 2. Magic Byte Analysis
        std::string magicMatch = CheckMagicBytes(input);
        if (!magicMatch.empty()) {
            matches.push_back("FILE_TYPE_" + magicMatch);
            // If it's an executable (ELF/PE) in a payload, that's suspicious
            if (magicMatch == "ELF" || magicMatch == "PE") {
                score += 50.0f; 
            }
        }

        // 3. Regex Matching
        for (const auto& pattern : patterns) {
            if (std::regex_search(input, pattern)) {
                score += 20.0f;
                matches.push_back("SuspiciousPattern"); 
            }
        }

        // Better simulation: specific names
        if (input.find("eval") != std::string::npos) matches.push_back("EVAL_DETECTED");
        if (input.find("base64_decode") != std::string::npos) matches.push_back("BASE64_DECODE");
        if (input.find("UNION SELECT") != std::string::npos || input.find("union select") != std::string::npos) matches.push_back("SQL_INJECTION");
        if (input.find("/etc/passwd") != std::string::npos) matches.push_back("LFI_ATTEMPT");
        if (input.find("<script>") != std::string::npos) matches.push_back("XSS_ATTEMPT");

        if (score > 0 && matches.empty()) matches.push_back("GENERIC_HEURISTIC");

        // Heuristic: excessive length
        if (input.length() > 10000) {
            score += 10.0f;
            matches.push_back("EXCESSIVE_LENGTH");
        }

        // Join matches
        for (size_t i = 0; i < matches.size(); ++i) {
            out_matches += matches[i];
            if (i < matches.size() - 1) out_matches += ",";
        }
        
        return std::min(score, 100.0f);
    }

private:
    float CalculateEntropy(const std::string& data) {
        if (data.empty()) return 0.0f;
        
        std::map<char, int> frequencies;
        for (char c : data) frequencies[c]++;
        
        float entropy = 0.0f;
        float len = static_cast<float>(data.length());
        
        for (auto const& pair : frequencies) {
            float p = static_cast<float>(pair.second) / len;
            entropy -= p * log2(p);
        }
        return entropy;
    }

    std::string CheckMagicBytes(const std::string& data) {
        if (data.length() < 4) return "";

        // Signatures (simplified)
        // ELF: 7F 45 4C 46
        if (data[0] == '\x7F' && data[1] == 'E' && data[2] == 'L' && data[3] == 'F') return "ELF";
        // PE (Windows): MZ (4D 5A)
        if (data[0] == 'M' && data[1] == 'Z') return "PE";
        // PNG: 89 50 4E 47
        if (data[0] == '\x89' && data[1] == 'P' && data[2] == 'N' && data[3] == 'G') return "PNG";
        // ZIP: PK (50 4B)
        if (data[0] == 'P' && data[1] == 'K') return "ZIP"; // Often used for java jars too

        return "";
    }

private:
    std::vector<std::regex> patterns;
};

extern "C" {

ScannerHandle NewScanner() {
    return new ThreatScanner();
}

void DestroyScanner(ScannerHandle handle) {
    delete static_cast<ThreatScanner*>(handle);
}

float ScanPayload(ScannerHandle handle, const char* payload, int length, char* out_matches, int max_len, float* out_entropy) {
    if (!handle || !payload) return 0.0f;
    ThreatScanner* scanner = static_cast<ThreatScanner*>(handle);
    std::string input(payload, length);
    std::string matches;
    float entropy = 0.0f;
    float score = scanner->Scan(input, matches, entropy);
    
    if (out_entropy) {
        *out_entropy = entropy;
    }

    if (out_matches && max_len > 0) {
        // Safe copy
        size_t copy_len = std::min((size_t)max_len - 1, matches.length());
        strncpy(out_matches, matches.c_str(), copy_len);
        out_matches[copy_len] = '\0';
    }
    
    return score;
}

}
