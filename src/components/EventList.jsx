import { useState, useEffect } from "react";
import eventService from "../services/eventService";
import EventCard from "./EventCard";

const EventList = ({ searchTerm = "", category = "" }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filteredEvents, setFilteredEvents] = useState({
    upcoming: [],
    ongoing: [],
    past: [],
  });

  const fetchEvents = async (page = 0, append = false) => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents(page, 10);

      // Ensure response.content exists and is an array
      const newContent = Array.isArray(response?.content)
        ? response.content
        : [];

      const newEvents = append ? [...events, ...newContent] : newContent;

      setEvents(newEvents);
      setHasMore(newContent.length === 10);

      // Apply filters immediately after fetching
      const filtered = filterAndCategorizeEvents(newEvents);
      setFilteredEvents(filtered);
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

  // Filter and categorize events in one pass
  const filterAndCategorizeEvents = (eventsToFilter) => {
    if (!Array.isArray(eventsToFilter))
      return { upcoming: [], ongoing: [], past: [] };

    const now = new Date();
    return eventsToFilter.reduce(
      (acc, event) => {
        // Skip invalid events
        if (!event) return acc;

        // First apply search and category filters
        const matchesSearch =
          !searchTerm ||
          safeStringIncludes(event.name, searchTerm) ||
          safeStringIncludes(event.description, searchTerm) ||
          safeStringIncludes(event.location, searchTerm);

        const matchesType =
          !category || safeStringIncludes(event.type, category);

        // Only categorize if event passes filters
        if (matchesSearch && matchesType) {
          try {
            const startDate = event.startDate
              ? new Date(event.startDate)
              : null;
            const endDate = event.endDate ? new Date(event.endDate) : null;

            // Skip events with invalid dates
            if (!startDate || !endDate) return acc;

            if (endDate < now) {
              acc.past.push(event);
            } else if (startDate > now) {
              acc.upcoming.push(event);
            } else {
              acc.ongoing.push(event);
            }
          } catch (error) {
            console.error("Error processing event dates:", error);
            return acc;
          }
        }
        return acc;
      },
      { upcoming: [], ongoing: [], past: [] }
    );
  };

  // Update filtered events when search term or category changes
  useEffect(() => {
    const filtered = filterAndCategorizeEvents(events);
    setFilteredEvents(filtered);
  }, [searchTerm, category, events]);

  // Initial fetch
  useEffect(() => {
    fetchEvents(0, false);
  }, []);

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

  const TabButton = ({ tab, label, count }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-lg font-medium ${
        activeTab === tab
          ? "bg-blue-600 text-white"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {label} ({count})
    </button>
  );

  const noEventsMessage =
    searchTerm || category
      ? `No ${activeTab} events found matching your criteria`
      : `No ${activeTab} events found`;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <TabButton
          tab="upcoming"
          label="Upcoming Events"
          count={filteredEvents.upcoming.length}
        />
        <TabButton
          tab="ongoing"
          label="Ongoing Events"
          count={filteredEvents.ongoing.length}
        />
        <TabButton
          tab="past"
          label="Past Events"
          count={filteredEvents.past.length}
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents[activeTab].map((event) => (
          <EventCard key={event.id || Math.random()} event={event} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      )}

      {!loading && filteredEvents[activeTab].length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">{noEventsMessage}</p>
        </div>
      )}

      {!loading && hasMore && filteredEvents[activeTab].length > 0 && (
        <div className="text-center py-8">
          <button
            onClick={() => {
              const nextPage = currentPage + 1;
              setCurrentPage(nextPage);
              fetchEvents(nextPage, true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;
