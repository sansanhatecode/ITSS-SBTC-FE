import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

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

const EventList = ({ searchTerm = "", category = "", events = [], loading = false }) => {
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(EVENT_STATUS.ALL);
  const navigate = useNavigate();

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

  // Safe string check function
  const safeStringIncludes = (text, search) => {
    if (!text || !search) return false;
    return text.toString().toLowerCase().includes(search.toLowerCase());
  };

  // Handler để chuyển hướng đến trang chi tiết sự kiện
  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  // Update displayed events when filters change
  useEffect(() => {
    const filtered = (() => {
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
    })();
    setDisplayedEvents(filtered);
  }, [events, searchTerm, category, selectedStatus]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            // fetchEvents(0, false);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {Object.values(EVENT_STATUS).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-5 py-2 rounded-full transition-all shadow-md border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold text-base
              ${selectedStatus === status
                ? "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-blue-600 scale-105"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700"
              }
            `}
          >
            {STATUS_LABELS[status]}
            {status !== EVENT_STATUS.ALL && (
              <span className="ml-2 bg-white bg-opacity-40 px-2 py-0.5 rounded-full text-sm font-bold border border-white/60">
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
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg font-semibold">
                No events found {selectedStatus !== EVENT_STATUS.ALL ? `in ${STATUS_LABELS[selectedStatus].toLowerCase()}` : ""}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedEvents.map((event) => (
                <div key={event.id} onClick={() => handleEventClick(event.id)} className="cursor-pointer">
                  <EventCard
                    event={event}
                    status={getEventStatus(event)}
                    statusLabel={STATUS_LABELS[getEventStatus(event)]}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;