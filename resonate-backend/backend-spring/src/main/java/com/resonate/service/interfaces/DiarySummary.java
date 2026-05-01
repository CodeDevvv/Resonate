package com.resonate.service.interfaces;
import java.time.LocalDateTime;
import java.util.UUID;


public interface DiarySummary {
    String getTitle();
    LocalDateTime getCreatedAt();
    UUID getEntryId();
}

