package com.resonate.service.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.resonate.service.interfaces.DiarySummary;
import com.resonate.service.model.entities.DiaryEntry;


@Repository
public interface DiaryRepository extends JpaRepository<DiaryEntry ,UUID>{
    // Page<DiaryEntry> findByUserIdOrderByCreatedAtDesc(String userId , Pageable pageable);
    @Query("SELECT d.title as title, d.createdAt as createdAt, d.entryId as entryId " +
           "FROM DiaryEntry d WHERE d.userId = :userId ORDER BY d.createdAt DESC")
    Page<DiarySummary> findDiaryEntriesByUserId(String userId, Pageable pageable);

    Optional<DiaryEntry> findByUserIdAndEntryId(String userId, UUID entryId);

    @Modifying(clearAutomatically = true)
    @Query("Update DiaryEntry d SET d.title = :title where d.entryId = :entryId")
    int updateTitle(@Param("title") String title , @Param("entryId") UUID entryId);
} 