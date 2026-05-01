package com.resonate.service.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.resonate.service.model.dto.InsightRequest;
import com.resonate.service.model.dto.InsightsResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class InsightsService {
    private final WebClient supabaseWebClient;

    public Map<String, Object> getInsights(String userId) {
        log.info("[Insights] Fetching data for User: {}", userId);
        InsightRequest request = new InsightRequest(userId, 30, 7);

        log.info("[Insights] Request Payload: {}", request);

        log.info("[Insights] Calling Supabase RPC endpoint...");

        InsightsResponse insightsResponse = supabaseWebClient.post()
                .uri("get_insights")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(InsightsResponse.class)
                .block();

        log.info("[Insights] Response : {}", insightsResponse);
        Map<String , Object> responseMap = new HashMap<>();
        responseMap.put("status", true);
        responseMap.put("insights", insightsResponse);
        return responseMap;
    }
}
