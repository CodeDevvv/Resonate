package com.resonate.service.model.dto;

import java.util.List;

import lombok.Data;

@Data
public class AiAnalysisDTO {
    private String ai_summary;
    private List<String> tags;
    private MoodScores mood_scores;
    private String reflections;
    private String suggestions;
    private String goals;
    private String transcript;
    private String status;
    private List<String> mood_labels;
    private String audioUrl;
    private String title;
    private Boolean isGoalAdded = false;
}
