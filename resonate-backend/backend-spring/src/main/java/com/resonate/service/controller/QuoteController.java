package com.resonate.service.controller;

import org.springframework.web.bind.annotation.RestController;

import com.resonate.service.model.dto.Thought;
import com.resonate.service.service.ThoughtService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@RestController
@RequestMapping("/api/quotes")
public class QuoteController {
    private final ThoughtService thoughtService;
    
    public QuoteController(ThoughtService thoughtService) {
        this.thoughtService = thoughtService;
    }

    @GetMapping("/getDailyQuote")
    public ResponseEntity<?> getQuote() {
        Thought thought = thoughtService.getThought();
        if(thought == null) {
            return ResponseEntity.status(500).body("Could not load thoughts");
        }
        log.info("Fetched Thoughts Successfully");
        return ResponseEntity.ok(thought);
    }
}
