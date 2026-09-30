package com.healthguard.ai.service;

import com.healthguard.ai.dto.ChatRequest;
import com.healthguard.ai.dto.ChatResponse;

import java.util.List;

public interface ChatService {

    ChatResponse processChat(ChatRequest request);

    List<ChatResponse> getChatHistoryByUserId(Long userId);
}
