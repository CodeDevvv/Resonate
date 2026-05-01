package com.resonate.service.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import com.resonate.service.model.dto.Thought;

import jakarta.annotation.PostConstruct;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Service
public class ThoughtService {
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    private List<Thought> thoughts = new ArrayList<>();

    public ThoughtService(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void loadThoughts() {
        try {
            Resource resource = resourceLoader.getResource("classpath:daily_thoughts.json");

            thoughts = objectMapper.readValue(
                    resource.getInputStream(),
                    new TypeReference<List<Thought>>() {
                    });
        } catch (IOException e) {
            throw new RuntimeException("Failed to load thoughts JSON", e);
        }
    }

    public Thought getThought() {
        if (thoughts.isEmpty()) {
            return null;
        }
        long daysSinceEpoch = LocalDate.now().toEpochDay();
        int index = (int) (daysSinceEpoch % thoughts.size());
        return thoughts.get(index);
    }

}
