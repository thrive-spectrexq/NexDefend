package local.nexdefend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/v1/policies")
public class PolicyController {

    private final local.nexdefend.repository.PlaybookRepository playbookRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public PolicyController(local.nexdefend.repository.PlaybookRepository playbookRepository) {
        this.playbookRepository = playbookRepository;
        this.restTemplate = new org.springframework.web.client.RestTemplate();
    }

    @PostMapping("/evaluate")
    public Map<String, Object> evaluatePolicy(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        double threatScore = Double.parseDouble(request.getOrDefault("score", "0").toString());

        if (threatScore > 50.0) {
            response.put("action", "ENFORCE_BLOCKING");
            response.put("recommendation", "GENERATE_PLAYBOOK");
        } else {
            response.put("action", "ALLOW");
        }

        response.put("status", "success");
        return response;
    }

    @PostMapping("/generate-playbook")
    public local.nexdefend.model.Playbook generatePlaybook(@RequestBody Map<String, Object> request) {
        String aiUrl = System.getenv().getOrDefault("PYTHON_API", "http://ai:5000") + "/generate-playbook";
        String aiToken = System.getenv().getOrDefault("AI_SERVICE_TOKEN", "default_token");

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + aiToken);

        org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(
                request, headers);

        try {
            Map<String, Object> aiResponse = restTemplate.postForObject(aiUrl, entity, Map.class);

            local.nexdefend.model.Playbook playbook = new local.nexdefend.model.Playbook();
            playbook.setName("Auto-remediation for block " + request.get("process_id"));
            playbook.setScore(Double.parseDouble(request.getOrDefault("score", "0").toString()));
            playbook.setThreatContext(aiResponse.getOrDefault("threat_analysis", "").toString());

            // Convert list of actions to JSON string for the TEXT column
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            playbook.setActions(mapper.writeValueAsString(aiResponse.get("playbook")));

            return playbookRepository.save(playbook);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate playbook: " + e.getMessage());
        }
    }

    @GetMapping("/playbooks")
    public List<local.nexdefend.model.Playbook> listPlaybooks() {
        return playbookRepository.findAll();
    }

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        Map<String, String> status = new HashMap<>();
        status.put("version", "0.0.1");
        status.put("status", "UP");
        return status;
    }
}
