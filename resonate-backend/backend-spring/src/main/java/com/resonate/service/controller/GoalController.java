package com.resonate.service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.resonate.service.model.dto.GoalEntryDTO;
import com.resonate.service.service.GoalService;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping("/addGoal")
    public ResponseEntity<?> addGoal(@AuthenticationPrincipal Jwt jwt, @RequestBody GoalEntryDTO goalEntryDTO) {
        String userId = jwt.getSubject();
        goalService.addGoal(goalEntryDTO, userId);
        return ResponseEntity.ok(Map.of("status", true, "message", "Goal has been added successfully"));
    }

    @GetMapping("/getGoals")
    public ResponseEntity<?> getGoals(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(goalService.getGoalEntries(userId));
    }

    @PutMapping("/updateGoal")
    public ResponseEntity<?> updateGoal(@RequestBody GoalEntryDTO goalEntryDTO) {
        goalService.updateGoal(goalEntryDTO);
        return ResponseEntity.ok(Map.of("status", true));
    }

    @DeleteMapping("/deleteGoal")
    public ResponseEntity<?> deleteGoal(@RequestParam UUID goalId) {
        goalService.deleteGoal(goalId);
        return ResponseEntity.ok(Map.of("status", true, "message", "Goal delete successfully"));
    }
}
