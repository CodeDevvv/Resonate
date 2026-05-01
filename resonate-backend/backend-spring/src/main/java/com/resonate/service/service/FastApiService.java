package com.resonate.service.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.resonate.service.enums.AudioStatus;
import com.resonate.service.model.dto.AiAnalysisDTO;
import com.resonate.service.model.dto.FastApiPayloadDTO;
import com.resonate.service.model.entities.DiaryEntry;
import com.resonate.service.repository.DiaryRepository;
import com.resonate.service.util.EncryptionUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class FastApiService {
    private final WebClient fastApiWebClient;
    private final DiaryRepository diaryRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final EncryptionUtil encryptionUtil;

    public void dispatchAnalysis(UUID entryId, String userId) {
        log.info("Start dispatchAnalysis for entryId: " + entryId);
        DiaryEntry diaryEntry = diaryRepository.findByUserIdAndEntryId(userId, entryId).orElseThrow();
        FastApiPayloadDTO fastApiPayloadDTO = new FastApiPayloadDTO();
        fastApiPayloadDTO.setHasTranscript(diaryEntry.getTranscript() != null);
        fastApiPayloadDTO.setHasSummary(diaryEntry.getAi_summary() != null);
        fastApiPayloadDTO.setHasTags(diaryEntry.getTags() != null);
        fastApiPayloadDTO.setHasMoodScores(diaryEntry.getMood_scores() != null);
        fastApiPayloadDTO.setHasReflections(diaryEntry.getReflections() != null);
        fastApiPayloadDTO.setHasSuggestions(diaryEntry.getSuggestions() != null);

        fastApiPayloadDTO.setAudioUrl(storageService.generateSignedUrl(diaryEntry.getAudioUrl()));
        fastApiPayloadDTO.setTranscipt(fastApiPayloadDTO.isHasTranscript() ? diaryEntry.getTranscript() : "");
        fastApiPayloadDTO.setUserId(userId);
        fastApiPayloadDTO.setEntryId(entryId);
        fastApiPayloadDTO.setIsGoalAdded(diaryEntry.getIsGoalAdded());

        log.info("Triggering FastApi for Analysis (Fire and Forget)");
        fastApiWebClient.post()
                .uri("/analyze")
                .bodyValue(fastApiPayloadDTO)
                .retrieve()
                .toBodilessEntity()
                .subscribe(
                        response -> log.info("Task dispatched!"),
                        error -> log.error("FastApi call failed: {}", error.getMessage()));
    }

    @Transactional
    public void handleAiResult(AiAnalysisDTO analysis, FastApiPayloadDTO status) {
        try {
            if (analysis != null && analysis.getStatus().equalsIgnoreCase("failed")) {
                log.error("Input status is failed. Aborting process.");
                throw new Exception("Analysis failed: The background process reported a failure status.");
            }
            log.info("Received AI Results Callback");

            if (status.getEntryId() == null || status.getUserId() == null) {
                log.info("Invalid Webhook Payload");
                throw new Exception("Invalid Webhook Payload: Missing entryId or userId");
            }

            String userId = status.getUserId();
            UUID entryId = status.getEntryId();
            boolean isAnalysisCompleted = true;

            AiAnalysisDTO systemNotAiAnalysisDTO = new AiAnalysisDTO();

            // Get the existing diary entry
            DiaryEntry saveDiaryEntry = diaryRepository.findByUserIdAndEntryId(userId, entryId)
                    .orElseThrow(() -> new Exception(
                            "Diary entry not found for userId: " + userId + " and entryId: " + entryId));

            // Update the diary entry with new analysis results
            // 1. Transcript
            if (!status.isHasTranscript() && analysis != null) {
                if (analysis.getTranscript() != null) {
                    saveDiaryEntry.setTranscript(analysis.getTranscript());
                    systemNotAiAnalysisDTO.setTranscript(encryptionUtil.decrypt(analysis.getTranscript()));
                } else {
                    log.warn("Transcript data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            if (!isAnalysisCompleted) {
                throw new Exception("Transcription failed to generate");
            }

            // 2. Summary
            if (!status.isHasSummary() && analysis != null) {
                if (analysis.getAi_summary() != null) {
                    saveDiaryEntry.setAi_summary(analysis.getAi_summary());
                    systemNotAiAnalysisDTO.setAi_summary(encryptionUtil.decrypt(analysis.getAi_summary()));
                } else {
                    log.warn("Summary data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            // 3. Tags
            if (!status.isHasTags() && analysis != null) {
                if (analysis.getTags() != null) {
                    saveDiaryEntry.setTags(analysis.getTags());
                    systemNotAiAnalysisDTO.setTags(analysis.getTags());
                } else {
                    log.warn("Tags data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            // 4. Mood Scores & Mood
            if (!status.isHasMoodScores() && analysis != null) {
                if (analysis.getMood_scores() != null) {
                    saveDiaryEntry.setMood_scores(analysis.getMood_scores());
                    systemNotAiAnalysisDTO.setMood_scores(analysis.getMood_scores());

                    final double CUT_OFF_MOOD_SCORE = 0.5;
                    Map<String, Double> moodScores = new HashMap<>();

                    moodScores.put("joy", analysis.getMood_scores().getJoy());
                    moodScores.put("calm", analysis.getMood_scores().getCalm());
                    moodScores.put("fear", analysis.getMood_scores().getFear());
                    moodScores.put("love", analysis.getMood_scores().getLove());
                    moodScores.put("anger", analysis.getMood_scores().getAnger());
                    moodScores.put("sadness", analysis.getMood_scores().getSadness());
                    moodScores.put("surprise", analysis.getMood_scores().getSurprise());

                    List<String> mood_labels = moodScores.entrySet().stream()
                            .filter(entry -> entry.getValue() >= CUT_OFF_MOOD_SCORE)
                            .map(Map.Entry::getKey)
                            .toList();
                    saveDiaryEntry.setMood_labels(mood_labels);
                    systemNotAiAnalysisDTO.setMood_labels(mood_labels);
                } else {
                    log.warn("Mood scores data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            // 5. Reflections
            if (!status.isHasReflections() && analysis != null) {
                if (analysis.getReflections() != null) {
                    saveDiaryEntry.setReflections(analysis.getReflections());
                    systemNotAiAnalysisDTO.setReflections(encryptionUtil.decrypt(analysis.getReflections()));
                } else {
                    log.warn("Reflections data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            // 6. Suggestions
            if (!status.isHasSuggestions() && analysis != null) {
                if (analysis.getSuggestions() != null) {
                    saveDiaryEntry.setSuggestions(analysis.getSuggestions());
                    systemNotAiAnalysisDTO.setSuggestions(encryptionUtil.decrypt(analysis.getSuggestions()));
                } else {
                    log.warn("Suggestions data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            // 7. Goals
            if (!status.isHasGoals() && analysis != null) {
                if (analysis.getGoals() != null) {
                    saveDiaryEntry.setGoals(analysis.getGoals());
                    systemNotAiAnalysisDTO.setGoals(encryptionUtil.decrypt(analysis.getGoals()));
                } else {
                    log.warn("Goals data is missing in the analysis result for entryId: " + entryId);
                    isAnalysisCompleted = false;
                }
            }

            saveDiaryEntry.setStatus(isAnalysisCompleted ? AudioStatus.completed : AudioStatus.failed);
            systemNotAiAnalysisDTO
                    .setStatus(isAnalysisCompleted ? AudioStatus.completed.toString() : AudioStatus.failed.toString());

            log.info("Updating DB for Entry {}", entryId);
            diaryRepository.save(saveDiaryEntry);

            log.info("Sending Notification for Entry {}", entryId);
            // Send update to frontend 
            Map<String, Object> update = new HashMap<>();
            update.put("status", systemNotAiAnalysisDTO.getStatus());
            update.put("aiAnalysis", systemNotAiAnalysisDTO);
            notificationService.sendAnalysisUpdate(entryId, update);
        } catch (Exception e) {
            log.error("Error occurred while processing analysis for entryId: " + status.getEntryId(), e);
            if (status.getEntryId() != null && status.getUserId() != null) {
                diaryRepository.findByUserIdAndEntryId(status.getUserId(), status.getEntryId())
                        .ifPresent(diaryEntry -> {
                            diaryEntry.setStatus(AudioStatus.failed);
                            diaryRepository.save(diaryEntry);
                        });
            }

            Map<String, Object> update = new HashMap<>();
            update.put("status", "failed");
            notificationService.sendAnalysisUpdate(status.getEntryId(), update);
        }
    }
}
