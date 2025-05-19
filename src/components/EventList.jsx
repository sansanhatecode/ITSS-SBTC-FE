import { useState, useEffect } from "react";
import eventService from "../services/eventService";
import EventCard from "./EventCard";
import { useMssv } from "../contexts/MssvContext";

const EVENT_STATUS = {
  ALL: "all",
  PAST: "past",
  ONGOING: "ongoing",
  UPCOMING: "upcoming",
};

const STATUS_LABELS = {
  [EVENT_STATUS.ALL]: "All Events",
  [EVENT_STATUS.PAST]: "Past Events",
  [EVENT_STATUS.ONGOING]: "Ongoing Events",
  [EVENT_STATUS.UPCOMING]: "Upcoming Events",
};

const EventList = ({ searchTerm = "", category = "" }) => {
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(EVENT_STATUS.ALL);
  const { mssv } = useMssv();

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      return EVENT_STATUS.PAST;
    } else if (startDate > now) {
      return EVENT_STATUS.UPCOMING;
    }
    return EVENT_STATUS.ONGOING;
  };

  const fetchEvents = async (page = 0, append = false) => {
    try {
      setLoading(true);
      const response = await eventService.getAllEvents(mssv, page, 10);
      const newContent = response?.content || [];

      if (append) {
        setEvents((prev) => [...prev, ...newContent]);
      } else {
        setEvents(newContent);
      }
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

  // Filter events based on search, category and status
  const filterEvents = () => {
    if (!Array.isArray(events)) return [];

    return events.filter((event) => {
      const matchesSearch =
        !searchTerm ||
        safeStringIncludes(event.name, searchTerm) ||
        safeStringIncludes(event.description, searchTerm) ||
        safeStringIncludes(event.location, searchTerm);

      const matchesType = !category || safeStringIncludes(event.type, category);

      const matchesStatus =
        selectedStatus === EVENT_STATUS.ALL ||
        getEventStatus(event) === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  // Update displayed events when filters change
  useEffect(() => {
    setDisplayedEvents(filterEvents());
  }, [events, searchTerm, category, selectedStatus]);

  // Initial fetch
  useEffect(() => {
    fetchEvents(0, false);
  }, [mssv]);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.values(EVENT_STATUS).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {STATUS_LABELS[status]}
            {status !== EVENT_STATUS.ALL && (
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-sm">
                {
                  events.filter((event) => getEventStatus(event) === status)
                    .length
                }
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && events.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {displayedEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No events found{" "}
                {selectedStatus !== EVENT_STATUS.ALL
                  ? `in ${STATUS_LABELS[selectedStatus].toLowerCase()}`
                  : ""}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  status={getEventStatus(event)}
                  statusLabel={STATUS_LABELS[getEventStatus(event)]}
                />
              ))}
            </div>
          )}

          {hasMore && displayedEvents.length > 0 && (
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
        </>
      )}
    </div>
  );
};

export default EventList;
