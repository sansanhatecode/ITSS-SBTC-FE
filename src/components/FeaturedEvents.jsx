import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import eventService from "../services/eventService";
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

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allEvents, setAllEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(EVENT_STATUS.ALL);
  const { mssv } = useMssv();

  const categorizeEvents = (events) => {
    const now = new Date();
    return events.reduce(
      (acc, event) => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (endDate < now) {
          acc.past.push(event);
        } else if (startDate > now) {
          acc.upcoming.push(event);
        } else {
          acc.ongoing.push(event);
        }
        return acc;
      },
      { past: [], ongoing: [], upcoming: [] }
    );
  };

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

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getAllEvents(mssv, 0, 100);
        setAllEvents(response.content);
        setDisplayedEvents(response.content);
      } catch (error) {
        console.error("Error fetching featured events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, [mssv]);

  useEffect(() => {
    if (selectedStatus === EVENT_STATUS.ALL) {
      setDisplayedEvents(allEvents);
    } else {
      const filteredEvents = allEvents.filter(
        (event) => getEventStatus(event) === selectedStatus
      );
      setDisplayedEvents(filteredEvents);
    }
    setCurrentIndex(0); // Reset slider index when changing filter
  }, [selectedStatus, allEvents]);

  useEffect(() => {
    if (displayedEvents.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === displayedEvents.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [displayedEvents.length]);

  const getStatusStyle = (status) => {
    switch (status) {
      case EVENT_STATUS.PAST:
        return "bg-gray-500";
      case EVENT_STATUS.ONGOING:
        return "bg-green-500";
      case EVENT_STATUS.UPCOMING:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="relative h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (displayedEvents.length === 0) {
    return (
      <div className="relative h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No featured events available
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
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
                  allEvents.filter((event) => getEventStatus(event) === status)
                    .length
                }
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative h-96 overflow-hidden rounded-xl">
        {displayedEvents.map((event, index) => (
          <Link
            to={`/event/${event.id}`}
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="relative h-full">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`${getStatusStyle(
                        getEventStatus(event)
                      )} text-white text-sm px-3 py-1 rounded-full`}
                    >
                      {STATUS_LABELS[getEventStatus(event)]}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{event.name}</h2>
                  <p className="mb-2">{event.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(event.startDate).toLocaleDateString("en-US")}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Navigation dots */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {displayedEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvents;
