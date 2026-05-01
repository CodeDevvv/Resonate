package com.resonate.service.model.dto;

import lombok.Data;

@Data
public class FastApiResponseDTO {
    private AiAnalysisDTO analysis;
    private FastApiPayloadDTO status;
}
