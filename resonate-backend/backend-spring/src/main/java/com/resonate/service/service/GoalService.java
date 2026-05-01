package com.resonate.service.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.resonate.service.model.dto.GoalEntryDTO;
import com.resonate.service.model.entities.GoalEntry;
import com.resonate.service.repository.GoalRepository;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GoalService {
    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public void addGoal(GoalEntryDTO goalEntryDTO, String userId) {
        GoalEntry goalEntry = new GoalEntry();
        goalEntry.setTitle(goalEntryDTO.getTitle());
        goalEntry.setDescription(goalEntryDTO.getDescription());
        if (goalEntryDTO.getEntryId() != null) {
            goalEntry.setEntryId(goalEntryDTO.getEntryId());
        }
        goalEntry.setUserId(userId);
        goalEntry.setTargetDate(goalEntryDTO.getTargetDate());
        goalEntry.setCompleted(false);
        goalEntry.setCreatedAt(LocalDateTime.now());
        goalRepository.save(goalEntry);
    }

    public Map<String, Object> getGoalEntries(String userId) {
        List<GoalEntry> goalEntries = goalRepository.findByUserId(userId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", true);
        resp.put("message", "Goals fetched successfully");
        resp.put("goalEntries", goalEntries);
        return resp;
    }

    @Transactional
    public void updateGoal(GoalEntryDTO goalEntryDTO) {
        log.info("goalEntryDTo: {}", goalEntryDTO);
        if (goalEntryDTO.getGoalId() == null) {
            throw new IllegalArgumentException("Goal ID must not be null for updates");
        }
        GoalEntry goalEntry = goalRepository.findByGoalId(goalEntryDTO.getGoalId()).orElseThrow();
        goalEntry.setTitle(goalEntryDTO.getTitle());
        goalEntry.setDescription(goalEntryDTO.getDescription());
        goalEntry.setTargetDate(goalEntryDTO.getTargetDate());
        goalEntry.setCompleted(goalEntryDTO.isCompleted());
    }

    @Transactional
    public void deleteGoal(UUID goalId) {
        GoalEntry goalEntry = goalRepository.findByGoalId(goalId).orElseThrow();
        goalRepository.delete(goalEntry);
    }
}
