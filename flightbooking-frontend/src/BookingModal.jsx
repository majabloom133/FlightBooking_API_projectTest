import React, {useState} from "react";

export function BookingModal({ flight, onClose, onSubmit }) {
    // State for passenger count, list of names, and contact email
    const [passengerCount, setPassengerCount] = useState(1);
    const [passengerNames, setPassengerNames] = useState(['']);
    const [contactEmail, setContactEmail] = useState('');

    // Update count and adjust passenger name array length
    const handleCountChange = (count) => {
        const newCount = Math.max(1, count);
        setPassengerCount(newCount);

        setPassengerNames((prevNames) => {
            const updated = [...prevNames];
            while (updated.length < newCount) {
                updated.push('');
            }
            return updated.slice(0, newCount);
        });
    };

    //Update individual passenger name in array
    const handleNameChange = (index, value) => {
        const updated = [...passengerNames];
        updated[index] = value;
        setPassengerNames(updated);
    };

    // Handle form submission and pass data to parent
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            flightId: flight.id,
            flightNumber: flight.flightNumber,
            email: contactEmail,
            passengers: passengerNames
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Book Flight {flight.flightNumber || flight.id}</h3>
                <p className="modal-subtitle">Destination: {flight.destination}</p>

                <form onSubmit={handleSubmit}>
                    {/* Passenger count selector */}
                    <div className="form-group">
                        <label>Number of Passengers</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={passengerCount}
                            onChange={(e) => handleCountChange(parseInt(e.target.value) || 1)}
                            required
                        />
                    </div>

                    {/* Dynamic passenger name fields */}
                    {passengerNames.map((name, idx) => (
                        <div className="form-group" key={idx}>
                            <label>Passenger {idx + 1} Name</label>
                            <input
                            type="text"
                            placeholder={`Full name for passenger ${idx + 1}`}
                            value={name}
                            onChange={(e) => handleNameChange(idx, e.target.value)}
                            required
                            />
                        </div>
                    ))}

                    {/* Single contact email address */}
                    <div className="form-group">
                        <label>Contact Email (for all tickets)</label>
                        <input
                            type="email"
                            placeholder="e.g. maja@example.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Modal action buttons */}
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-confirm">
                            Confirm Booking
                        </button>
                    </div>
            </form>
            </div>
        </div>
    );
}