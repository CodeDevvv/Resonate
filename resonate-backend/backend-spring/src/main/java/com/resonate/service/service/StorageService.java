package com.resonate.service.service;

import java.time.Duration;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
@Slf4j
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner s3Presigner;

    // For deletions
    private final S3Client s3Client;

    @Value("${supabase.s3.bucket}")
    private String bucketName;

    public String generateSignedUrl(String audioPath) {
        if (audioPath == null || audioPath.isBlank())
            return null;

        // 1. Define the request
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(audioPath)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofHours(1)) // 3600 seconds
                .getObjectRequest(getObjectRequest)
                .build();

        // 2. Generate the URL
        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toString();
    }

    public void deleteFile(String audioPath) {
        if (audioPath == null || audioPath.isBlank())
            return;

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(audioPath)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Successfully deleted file from storage: {}", audioPath);
        } catch (Exception e) {
            log.error("Failed to delete file from storage: {}", audioPath, e);
            throw new RuntimeException("Failed to delete storage, rolling back DB", e);        }
    }

    public void uploadFile(String fileName , byte[] fileBuffer) throws Exception {
        PutObjectRequest putbObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .contentType("audio/wav")
            .build();

        s3Client.putObject(putbObjectRequest, RequestBody.fromBytes(fileBuffer));
    }

}