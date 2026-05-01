package com.resonate.service.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {
    @Bean
    public S3Presigner s3Presigner(@Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.access-key}") String accessKey,
            @Value("${supabase.s3.secret-key}") String secretKey) {

        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();
        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.AP_NORTHEAST_1)
                .serviceConfiguration(s3Configuration)
                .build();
    }

    @Bean
    public S3Client s3Client(@Value("${supabase.s3.endpoint}") String endpoint,
            @Value("${supabase.s3.access-key}") String accessKey,
            @Value("${supabase.s3.secret-key}") String secretKey) {

        S3Configuration s3Configuration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.AP_NORTHEAST_1)
                .serviceConfiguration(s3Configuration)
                .build();
    }
}
