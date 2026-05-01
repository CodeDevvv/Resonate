package com.resonate.service.model.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class GoalEntryDTO {
    private UUID goalId;
    private String title;
    private String description;
    private LocalDate targetDate;
    private String userId;
    private UUID entryId;
    private boolean isCompleted;
}
