package com.resonate.service.model.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "\"GoalEntry\"")
@Getter
@Setter
public class GoalEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "goal_id")
    private UUID goalId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "description" , columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_completed")
    private boolean isCompleted = false;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "entry_id")
    private UUID entryId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "title" , columnDefinition = "TEXT")
    private String title;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
