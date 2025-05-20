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

function getRandomItems(arr, n) {
  const result = [];
  const taken = new Set();
  while (result.length < n && taken.size < arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    if (!taken.has(idx)) {
      result.push(arr[idx]);
      taken.add(idx);
    }
  }
  return result;
}

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { mssv } = useMssv();

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getAllEvents(mssv, 0, 100);
        // Only keep events that have not ended
        const now = new Date();
        const notEndedEvents = response.content.filter(
          (event) => new Date(event.endDate) >= now
        );
        // Pick 5 random events
        const randomEvents = getRandomItems(notEndedEvents, 5);
        setEvents(randomEvents);
      } catch (error) {
        console.error("Error fetching featured events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, [mssv]);

  useEffect(() => {
    if (events.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (loading) {
    return (
      <div className="relative h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="relative h-96 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No featured events available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Events Slider */}
      <div className="relative h-[500px] overflow-hidden rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300">
        {events.map((event, index) => (
          <Link
            to={`/event/${event.id}`}
            key={event.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out
              ${
                index === currentIndex
                  ? "opacity-100 translate-x-0 z-10 scale-100"
                  : index < currentIndex
                  ? "opacity-0 -translate-x-10 scale-95 z-0"
                  : "opacity-0 translate-x-10 scale-95 z-0"
              }
              group hover:scale-[1.01] hover:shadow-2xl`}
            style={{
              boxShadow:
                index === currentIndex
                  ? "0 12px 40px 0 rgba(31, 38, 135, 0.18)"
                  : undefined,
            }}
          >
            <div className="relative h-full overflow-hidden rounded-3xl">
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end">
                {/* Event name and description at bottom, above info row */}
                <div className="absolute left-0 right-0 bottom-20 px-8 flex flex-col items-start">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 drop-shadow-lg leading-tight text-white text-left w-full">
                    {event.name}
                  </h2>
                  <p className="mb-2 text-white/90 line-clamp-2 text-base md:text-lg font-medium text-left w-full">
                    {event.description}
                  </p>
                </div>
                {/* Date and location at bottom left */}
                <div className="absolute left-8 bottom-6 flex flex-col items-start space-y-2 z-20">
                  <span className="flex items-center text-sm md:text-base font-semibold text-white/90">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-200"
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
                  <span className="flex items-center text-sm md:text-base font-semibold text-white/90">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-200"
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
          </Link>
        ))}
        {/* Navigation dots overlap inside card, bottom right, beautiful style */}
        <div className="absolute bottom-6 right-8 flex space-x-3 z-30">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all duration-500 focus:outline-none p-0
                ${
                  index === currentIndex
                    ? "border-blue-400 bg-gradient-to-tr from-blue-400 to-blue-600 shadow-lg scale-125 ring-2 ring-blue-200"
                    : "border-gray-300 bg-white/70 hover:bg-blue-100 hover:border-blue-400 shadow"
                }
              `}
              style={{
                boxShadow:
                  index === currentIndex
                    ? "0 2px 12px 0 rgba(59,130,246,0.25)"
                    : undefined,
              }}
              aria-label={`Go to event ${index + 1}`}
            >
              <span
                className={`block w-3 h-3 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "bg-white shadow-md scale-110"
                    : "bg-gray-400"
                }`}
              ></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvents;
