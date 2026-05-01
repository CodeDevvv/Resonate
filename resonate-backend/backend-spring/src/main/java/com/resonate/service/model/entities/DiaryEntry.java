package com.resonate.service.model.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import com.resonate.service.enums.AudioStatus;
import com.resonate.service.model.dto.MoodScores;

@Entity
@Table(name = "\"DiaryEntry\"")
@Getter
@Setter
public class DiaryEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "entry_id")
    private UUID entryId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "audio_path", unique = true)
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @Column(columnDefinition = "TEXT")
    private String ai_summary;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> tags;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "mood_labels", columnDefinition = "text[]")
    private List<String> mood_labels;

    @Column
    private String title;

    @Column
    private String reflections;

    @Column
    private String suggestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mood_scores", columnDefinition = "jsonb")
    private MoodScores mood_scores;

    @Column
    private String goals;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "audio_status")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private AudioStatus status;

    @Column(name = "\"isGoalAdded\"")
    private Boolean isGoalAdded = false;

    public void setIsGoalAdded(boolean isGoalAdded) {
        this.isGoalAdded = isGoalAdded;
    }

    public boolean getIsGoalAdded() {
        return isGoalAdded;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
