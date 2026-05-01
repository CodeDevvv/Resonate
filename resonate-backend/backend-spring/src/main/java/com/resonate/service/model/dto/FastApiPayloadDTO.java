package com.resonate.service.model.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class FastApiPayloadDTO {
    private boolean hasTranscript;
    private boolean hasSummary;
    private boolean hasTags;
    private boolean hasMoodScores;
    private boolean hasReflections;
    private boolean hasSuggestions;
    private boolean hasGoals;

    private String audioUrl;
    private String transcipt;
    private String userId;
    private UUID entryId;

    private boolean isGoalAdded;

    public void setIsGoalAdded(boolean isGoalAdded) {
        this.isGoalAdded = isGoalAdded;
    }

    public boolean getIsGoalAdded() {
        return isGoalAdded;
    }

}
