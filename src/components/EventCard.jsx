import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";

const EventCard = ({ event: initialEvent, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [showMssvModal, setShowMssvModal] = useState(false);
  const [tempMssv, setTempMssv] = useState("");
  const { mssv, setMssv } = useMssv();
  const [event, setEvent] = useState(initialEvent);

  // Update event when initialEvent changes
  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  // Fetch updated event details when MSSV changes or after registration
  const fetchEventDetails = async (currentMssv) => {
    if (currentMssv && event.id) {
      try {
        const response = await eventService.getEventById(event.id, currentMssv);
        if (response?.data) {
          setEvent({
            ...response.data,
            applicationStatus: response.data.applicationStatus || false,
          });
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    }
  };

  useEffect(() => {
    fetchEventDetails(mssv);
  }, [mssv, event.id]);

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      return { text: "Past", color: "bg-gray-500" };
    } else if (startDate > now) {
      return { text: "Upcoming", color: "bg-blue-500" };
    }
    return { text: "Ongoing", color: "bg-green-500" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRegister = async (useMssv = mssv) => {
    if (!useMssv) {
      setShowMssvModal(true);
      return;
    }

    try {
      setIsRegistering(true);
      setError(null);

      // Try to register
      await eventService.registerEvent(useMssv, event.id);

      // After successful registration, fetch updated event details
      await fetchEventDetails(useMssv);

      if (onRegister) {
        onRegister(event.id);
      }

      setShowMssvModal(false);
    } catch (error) {
      console.error("Registration error:", error);
      // If the error indicates already registered, update the event status
      if (error.message?.includes("has already been registered")) {
        setEvent((prev) => ({
          ...prev,
          applicationStatus: true,
        }));
        setShowMssvModal(false);
      } else {
        setError(error.message || "Failed to register for event");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMssvSubmit = async () => {
    if (tempMssv) {
      setMssv(tempMssv); // Update global MSSV
      await handleRegister(tempMssv);
    }
  };

  const status = getEventStatus();

  // Only show registration status if MSSV is provided
  const showRegistrationStatus = mssv && event.applicationStatus !== undefined;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <span
            className={`${status.color} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {status.text}
          </span>
          {showRegistrationStatus && (
            <span
              className={`${
                event.applicationStatus ? "bg-green-500" : "bg-yellow-500"
              } text-white text-xs font-bold px-2 py-1 rounded`}
            >
              {event.applicationStatus ? "Registered" : "Not Registered"}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          {event.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
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
            <span>
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </span>
          </div>

          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
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
            <span>{event.location}</span>
          </div>
        </div>

        {error && (
          <div className="mt-2 text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="mt-4 space-y-2">
          <Link
            to={`/event/${event.id}`}
            className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            View Details
          </Link>

          {!event.applicationStatus && status.text !== "Past" && (
            <button
              onClick={() => handleRegister()}
              disabled={isRegistering}
              className={`block w-full text-center py-2 ${
                isRegistering
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-medium rounded-lg transition-colors duration-300`}
            >
              {isRegistering ? "Registering..." : "Register for Event"}
            </button>
          )}
        </div>
      </div>

      {/* MSSV Modal */}
      {showMssvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Enter your MSSV
            </h3>
            <input
              type="text"
              value={tempMssv}
              onChange={(e) => setTempMssv(e.target.value)}
              placeholder="Enter your MSSV..."
              className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowMssvModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleMssvSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
