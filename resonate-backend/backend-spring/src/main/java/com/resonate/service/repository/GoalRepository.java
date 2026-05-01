package com.resonate.service.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.resonate.service.model.entities.GoalEntry;

public interface GoalRepository  extends JpaRepository<GoalEntry, UUID>{
    public List<GoalEntry> findByUserId(String userId);
    public Optional<GoalEntry> findByGoalId(UUID goalId);
} 
