package com.resonate.service.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InsightRequest {
    @JsonProperty("arg_user_id")
    private String userId;
    @JsonProperty("days_to_avg")
    private int daysToAvg;
    @JsonProperty("loopback_day")
    private int loopbackDay;
}