package com.resonate.service.controller;

import org.springframework.web.bind.annotation.RestController;

import com.resonate.service.model.dto.FastApiResponseDTO;
import com.resonate.service.service.FastApiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class FastApiController {
    private final FastApiService fastApiService;
    @PostMapping("/handleAiResult")
    public ResponseEntity<?> handleAiResult(@RequestBody FastApiResponseDTO fastApiResponseDTO) {
        fastApiService.handleAiResult(fastApiResponseDTO.getAnalysis(), fastApiResponseDTO.getStatus());
        return ResponseEntity.ok("Received AI analysis result successfully");
    }
}

// Analysis : com.resonate.service.model.entities.DiaryEntry@5bb61e3e , status:
// FastApiPayloadDTO(hasTranscript=false, hasSummary=false, hasTags=false,
// hasMoodScores=false, hasReflections=false, hasSuggestions=false,
// hasGoals=false,
// audioUrl=https://dhrygahxgayttrjznrrz.storage.supabase.co/storage/v1/s3/audio-recordings/user_2yklQymno5W1mxNg3V9NETVoqT4/1777547557589-audio.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260430T111238Z&X-Amz-SignedHeaders=host&X-Amz-Credential=b4ef003e81f12474592cee243f51e410%2F20260430%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Expires=3600&X-Amz-Signature=4fd464cfebc887e9f14a87e5249273e2bb076965984772c5cf548abb6b47b627,
// transcipt=null, userId=user_2yklQymno5W1mxNg3V9NETVoqT4,
// entryId=caf00f83-9e4f-4aa8-b8b3-42d2a8ec8041, isGoalAdded=false)
