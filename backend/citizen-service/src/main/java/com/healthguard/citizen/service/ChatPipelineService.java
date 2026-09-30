package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.ChatAnalysisRequestDTO;
import com.healthguard.citizen.dto.ChatAnalysisResponseDTO;

import java.util.List;

public interface ChatPipelineService {

    /**
     * Executes complete AI Analysis pipeline by calling FastAPI intent, disease, and urgency endpoints,
     * persisting the record in PostgreSQL, and returning the aggregated response.
     *
     * @param request Chat request containing citizenId and message text
     * @return Aggregated ChatAnalysisResponseDTO
     */
    ChatAnalysisResponseDTO analyzeChat(ChatAnalysisRequestDTO request);

    /**
     * Retrieves historical AI analysis records for a specific citizen.
     *
     * @param citizenId Unique Identifier of Citizen
     * @return List of ChatAnalysisResponseDTO
     */
    List<ChatAnalysisResponseDTO> getHistoryByCitizenId(Long citizenId);
}
