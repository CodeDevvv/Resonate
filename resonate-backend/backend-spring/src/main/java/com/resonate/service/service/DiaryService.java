package com.resonate.service.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.resonate.service.enums.AudioStatus;
import com.resonate.service.interfaces.DiarySummary;
import com.resonate.service.model.dto.AiAnalysisDTO;
import com.resonate.service.model.entities.DiaryEntry;
import com.resonate.service.repository.DiaryRepository;
import com.resonate.service.util.EncryptionUtil;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiaryService {
    private final EncryptionUtil encryptionUtil;
    private final DiaryRepository diaryRepository;
    private final StorageService storageService;
    private final FastApiService fastApiService;
    private final NotificationService notificationService;

    public Map<String, Object> getDiaryEntries(String userId, int page, int size) {
        int pageIndex = (page < 1) ? 0 : page - 1;
        int start = pageIndex * size;
        int end = start + size;
        log.info("Fetching records " + start + " to " + end + " for user " + userId);
        Page<DiarySummary> data = diaryRepository.findDiaryEntriesByUserId(userId, PageRequest.of(pageIndex, size));
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", true);
        resp.put("entries", data.getContent());
        resp.put("hasNext", data.hasNext());
        return resp;
    }

    public Map<String, Object> getDiaryEntry(String userId, UUID entryId) {
        DiaryEntry diaryEntry = diaryRepository.findByUserIdAndEntryId(userId, entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entry not found"));

        // Decrypt
        // diaryEntry.setAi_summary(encryptionUtil.decrypt(diaryEntry.getAi_summary()));
        // diaryEntry.setReflections(encryptionUtil.decrypt(diaryEntry.getReflections()));
        // diaryEntry.setSuggestions(encryptionUtil.decrypt(diaryEntry.getSuggestions()));
        // diaryEntry.setGoals(encryptionUtil.decrypt(diaryEntry.getGoals()));
        // diaryEntry.setTranscript(encryptionUtil.decrypt(diaryEntry.getTranscript()));

        AiAnalysisDTO aiAnalysisDTO = new AiAnalysisDTO();
        aiAnalysisDTO.setAi_summary(encryptionUtil.decrypt(diaryEntry.getAi_summary()));
        aiAnalysisDTO.setReflections(encryptionUtil.decrypt(diaryEntry.getReflections()));
        aiAnalysisDTO.setSuggestions(encryptionUtil.decrypt(diaryEntry.getSuggestions()));
        aiAnalysisDTO.setGoals(encryptionUtil.decrypt(diaryEntry.getGoals()));
        aiAnalysisDTO.setTranscript(encryptionUtil.decrypt(diaryEntry.getTranscript()));
        aiAnalysisDTO.setTags(diaryEntry.getTags());
        aiAnalysisDTO.setMood_labels(diaryEntry.getMood_labels());
        aiAnalysisDTO.setTitle(diaryEntry.getTitle());
        aiAnalysisDTO.setIsGoalAdded(diaryEntry.getIsGoalAdded());
        aiAnalysisDTO.setAudioUrl(storageService.generateSignedUrl(diaryEntry.getAudioUrl()));

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", true);
        resp.put("entryDetails", aiAnalysisDTO);
        return resp;
    }

    @Transactional
    public void deleteEntry(String userId, UUID entryId) {
        DiaryEntry diaryEntry = diaryRepository.findByUserIdAndEntryId(userId, entryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entry not found"));

        diaryRepository.delete(diaryEntry);

        if (diaryEntry.getAudioUrl() != null || !diaryEntry.getAudioUrl().isBlank()) {
            try {
                storageService.deleteFile(diaryEntry.getAudioUrl());
            } catch (Exception e) {
                log.error("Storage Delete Error: {}", e.getMessage());
                throw new RuntimeException("Failed to delete storage, rolling back DB", e);
            }
        }
    }

    @Transactional
    public void updateTitle(String title, UUID entryId) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or empty");
        }
        log.info("Updating Title for entryID: {}", entryId);
        diaryRepository.updateTitle(title, entryId);
    }

    @Transactional
    public UUID createEntry(String userId, MultipartFile audioFile) {
        try {
            String fileName = userId + "/" + System.currentTimeMillis() + "-audio.wav";
            byte[] fileBuffer = audioFile.getBytes();

            storageService.uploadFile(fileName, fileBuffer);
            DiaryEntry diaryEntry = new DiaryEntry();
            diaryEntry.setAudioUrl(fileName);
            diaryEntry.setUserId(userId);
            diaryEntry.setStatus(AudioStatus.processing);
            diaryEntry.setTitle("Untitled");
            DiaryEntry savedDiaryEntry = diaryRepository.save(diaryEntry);
            log.info("Saved diaryEntry : {}", savedDiaryEntry);
            fastApiService.dispatchAnalysis(savedDiaryEntry.getEntryId(), userId);
            return savedDiaryEntry.getEntryId();
        } catch (Exception e) {
            log.error("Error creating entry for user {}: {}", userId, e.getMessage());
        }
        return null;
    }

    public void reanalyzeEntry(String userId, UUID entryId) {
        try {
            fastApiService.dispatchAnalysis(entryId, userId);
            Map<String, Object> update = new HashMap<>();
            update.put("status", "processing");
            notificationService.sendAnalysisUpdate(entryId, update);
        } catch (Exception e) {
            log.error("Error reanalyzing entry {}: {}", entryId, e.getMessage());
            Map<String, Object> update = new HashMap<>();
            update.put("status", "failed");
            notificationService.sendAnalysisUpdate(entryId, update);
        }

    }
}
