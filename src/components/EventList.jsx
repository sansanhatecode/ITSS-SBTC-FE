import { useState, useEffect } from "react";
import eventService from "../services/eventService";
import EventCard from "./EventCard";
import { useMssv } from "../contexts/MssvContext";

const EventList = ({ searchTerm = "", category = "" }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { mssv } = useMssv(); // Use MSSV from context

  const fetchEvents = async (page = 0, append = false) => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents(mssv, page, 10);

      // Log the response to see what we're getting
      console.log("Events response:", response);

      // Get the events from the response
      const newContent = response?.content || [];
      console.log("Events content:", newContent);

      setEvents(append ? [...events, ...newContent] : newContent);
      setHasMore(newContent.length === 10);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setError(error.message || "Error loading events");
    } finally {
      setLoading(false);
    }
  };

  // Safe string check function
  const safeStringIncludes = (text, search) => {
    if (!text || !search) return false;
    return text.toString().toLowerCase().includes(search.toLowerCase());
  };

  // Filter events based on search and category
  const getFilteredEvents = () => {
    if (!Array.isArray(events)) return [];

    return events.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        safeStringIncludes(event.name, searchTerm) ||
        safeStringIncludes(event.description, searchTerm) ||
        safeStringIncludes(event.location, searchTerm);

      const matchesType = !category || safeStringIncludes(event.type, category);

      return matchesSearch && matchesType;
    });
  };

  // Handle successful registration
  const handleRegistration = async (eventId) => {
    // Refresh the events list to update registration status
    await fetchEvents(currentPage, false);
  };

  // Initial fetch and refetch when MSSV changes
  useEffect(() => {
    fetchEvents(0, false);
  }, [mssv]); // Add mssv as dependency

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchEvents(0, false);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredEvents = getFilteredEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && events.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={handleRegistration}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchEvents(currentPage + 1, true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {filteredEvents.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
