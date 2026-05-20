package com.pvpsit.facility.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pvpsit.facility.config.NotificationWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private NotificationWebSocketHandler webSocketHandler;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendNotification(String title, String desc) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("title", title);
            payload.put("desc", desc);
            String json = objectMapper.writeValueAsString(payload);
            webSocketHandler.broadcast(json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
