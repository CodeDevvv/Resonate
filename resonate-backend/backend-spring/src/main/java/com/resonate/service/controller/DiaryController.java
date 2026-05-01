package com.resonate.service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.resonate.service.service.DiaryService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;

@Slf4j
@RestController
@RequestMapping("/api/entries")
public class DiaryController {
    private final DiaryService diaryService;

    DiaryController(DiaryService diaryService) {
        this.diaryService = diaryService;
    }

    @GetMapping("/getEntriesList")
    public ResponseEntity<?> getEntriesList(@AuthenticationPrincipal Jwt jwt, @RequestParam Integer page,
            @RequestParam Integer pagesize) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(diaryService.getDiaryEntries(userId, page, pagesize));
    }

    @GetMapping("/getEntryById")
    public ResponseEntity<?> getMethodName(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID entryId) {
        String userId = jwt.getSubject();
        return ResponseEntity.ok(diaryService.getDiaryEntry(userId, entryId));
    }

    @DeleteMapping("/deleteEntry")
    public ResponseEntity<?> deleteEntry(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID entryId) {
        String userId = jwt.getSubject();
        diaryService.deleteEntry(userId, entryId);
        return ResponseEntity.ok(Map.of("message", "Entry and Audio deleted successfully"));
    }

    @PatchMapping("/updateTitle")
    public ResponseEntity<?> updateTitle(@RequestParam UUID entryId, @RequestBody Map<String, String> updates) {
        String newTitle = updates.get("newTitle");

        if (newTitle == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Key 'title' missing in request body"));
        }

        diaryService.updateTitle(newTitle, entryId);
        return ResponseEntity.ok(Map.of("message", "Title updated successfully"));
    }

    @PostMapping("/createEntry")
    public ResponseEntity<?> createEntry(@AuthenticationPrincipal Jwt jwt,
            @RequestParam("audio") MultipartFile audioFile) {
        String userId = jwt.getSubject();
        UUID entryId = diaryService.createEntry(userId, audioFile);
        if (entryId != null) {

            return ResponseEntity.ok(Map.of("status", true, "message", "Save Sucess, analyzing", "entryId", entryId));
        }
        return ResponseEntity.ok(null);
    }

    @GetMapping("/reanalyzeEntry")
    public ResponseEntity<?> reanalyzeEntry(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID entryId) {
        String userId = jwt.getSubject();
        // Implementation for reanalyzing entry
        diaryService.reanalyzeEntry(userId, entryId);
        return ResponseEntity.ok(new String());
    }

}
