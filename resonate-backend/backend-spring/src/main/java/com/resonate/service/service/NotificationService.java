package com.resonate.service.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendAnalysisUpdate(UUID entryId, Map<String, Object> eventPayload) {
        String destination = "/topic/entry/" + entryId;
        Map<String, String> processingMessage = new HashMap<>();
        
        if ("processing".equals(eventPayload.get("status"))) {
            processingMessage.put("status", "processing");
            messagingTemplate.convertAndSend(destination, processingMessage);
        } else if (eventPayload.get("status") != null && "completed".equals(eventPayload.get("status"))) {
            messagingTemplate.convertAndSend(destination, eventPayload.get("aiAnalysis"));
        } else {
            processingMessage.put("status", "failed");
            messagingTemplate.convertAndSend(destination, processingMessage);
        }
    }
}
