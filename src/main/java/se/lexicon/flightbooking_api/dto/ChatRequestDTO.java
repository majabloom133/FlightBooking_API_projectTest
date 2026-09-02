package se.lexicon.flightbooking_api.dto;

// Record representing incoming request payload from frontend client
public record ChatRequestDTO(
        String message,
        String chatId
) {}
