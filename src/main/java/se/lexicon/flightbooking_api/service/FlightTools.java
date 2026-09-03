package se.lexicon.flightbooking_api.service;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;
import se.lexicon.flightbooking_api.dto.AvailableFlightDTO;
import se.lexicon.flightbooking_api.dto.BookFlightRequestDTO;
import se.lexicon.flightbooking_api.dto.FlightBookingDTO;

import java.util.List;

@Component
public class FlightTools {

    // Service instance used to perform flight booking operations in the database
    private final FlightBookingService flightBookingService;

    public FlightTools(FlightBookingService flightBookingService) {
        this.flightBookingService = flightBookingService;
    }

    // Exposes this method as an AI tool for quering available flights
    @Tool(description = "Get all available flights that are open for booking")
    public List<AvailableFlightDTO> getAvailableFlights() {
        return flightBookingService.findAvailableFlights();
    }

    // Exposes this method as an AI tool for reserving a seat on a flight
    @Tool(description = "Book a seat on a flight using flight ID, passenger name, or passenger email")
    public FlightBookingDTO bookFlight(Long flightId, String passengerName, String passengerEmail) {
        BookFlightRequestDTO request = new BookFlightRequestDTO(passengerName, passengerEmail);
        return flightBookingService.bookFlight(flightId, request);
    }

    // Exposes this method as an AI tool for looking up existing bookings by email
    @Tool(description = "Find all flight bookings registered under a specific passenger email address")
    public List<FlightBookingDTO> findBookingsByEmail(String email) {
        return flightBookingService.findBookingsByEmail(email);
    }

    // Exposes this method as an AI tool for cancelling flight reservations
    @Tool(description = "Cancel a flight booking using the flight ID and passenger email address")
    public String cancelFlight(Long flightId, String passengerEmail) {
        flightBookingService.cancelFlight(flightId,passengerEmail);
        return "Booking for flight ID " + flightId + " under email " + passengerEmail + " has been successfully cancelled.";
    }


}
