package com.resonate.service.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoodScores {
    // JSONB structure for mood_scores
    private Double joy;
    private Double calm;
    private Double fear;
    private Double love;
    private Double anger;
    private Double sadness;
    private Double surprise;
}
