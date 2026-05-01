package com.resonate.service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient fastApiWebClient(@Value("${fastapi.Baseurl}") String baseUrl, WebClient.Builder builder) {
        return builder.baseUrl(baseUrl).build();
    }

    @Bean
    public WebClient supabaseWebClient(@Value("${supabase.Baseurl}") String baseUrl, @Value("${supabase.apiKey}") String apiKey, WebClient.Builder builder) {
        return builder.baseUrl(baseUrl + "/rest/v1/rpc/")
                .defaultHeader("apikey", apiKey)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}