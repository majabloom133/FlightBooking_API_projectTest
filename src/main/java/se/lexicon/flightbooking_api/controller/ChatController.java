package se.lexicon.flightbooking_api.controller;

// Import Spring Web annotation for REST endpoints
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Import Spring AI ChatClient, Advisors and Memory components
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemory;

// Import request/response records and Spring AI tool bean
import se.lexicon.flightbooking_api.dto.ChatRequestDTO;
import se.lexicon.flightbooking_api.dto.ChatResponseDTO;
import se.lexicon.flightbooking_api.service.FlightTools;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder, FlightTools flightTools) {
        this.chatClient = builder
                .defaultSystem("""
                        You are a polite, helpful and professional AI customer support agent for Lexicon Airline.
                        Your task is to assist passengers in finding available flights, booking tickets, checking existing bookings, and cancelling reservations.
                        Always use the provided flight tools when answering questions about flight status or executing bookings.
                        If required parameters like email or passenger name are missing for booking, ask the user clearly.
                        Keep your responses concise, friendly and structured.
                        """)
                .defaultTools(flightTools)
                .defaultAdvisors(new MessageChatMemoryAdvisor(new InMemoryChatMemory()))
                .build();
    }

    @PostMapping
    public ChatResponseDTO chat(@Valid @RequestBody ChatRequestDTO request) {
        String chatId = (request.chatId() != null && !request.chatId().isBlank())
                ? request.chatId()
                : UUID.randomUUID().toString();

        String aiResponse = chatClient.prompt()
                .user(request.message())
                .advisors(advisorSpec -> advisorSpec.param(MessageChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, chatId))
                .call()
                .content();

        return new ChatResponseDTO(aiResponse, chatId);
    }

}
