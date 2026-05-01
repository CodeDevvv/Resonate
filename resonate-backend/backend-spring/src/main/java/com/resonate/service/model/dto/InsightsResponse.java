package com.resonate.service.model.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class InsightsResponse {
    @JsonProperty("chartData")
    private List<ChartDataDTO> chartData;
    @JsonProperty("heatmapData")
    private List<HeatmapDataDTO> heatmapData;
    @JsonProperty("topics")
    private List<TopicDTO> topics;

    @Data
    public static class ChartDataDTO {
        @JsonProperty("mood_scores")
        private Map<String, Double> moodScores;
        @JsonProperty("created_at")
        private String createdAt;
    }

    @Data
    public static class HeatmapDataDTO {
        private String day;
        private Map<String, Double> moods;
    }

    @Data
    public static class TopicDTO {
        private String topic;
        private int count;
    }
}
