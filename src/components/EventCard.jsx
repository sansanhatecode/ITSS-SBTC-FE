import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";

const getStatusStyle = (status) => {
  switch (status) {
    case "past":
      return "bg-gray-500";
    case "ongoing":
      return "bg-green-500";
    case "upcoming":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
};

const EventCard = ({ event: initialEvent, status, statusLabel }) => {
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

  const handleRegister = async () => {
    if (!mssv) {
      setShowMssvModal(true);
      return;
    }

    try {
      setIsRegistering(true);
      await eventService.registerEvent(mssv, event.id);
      await fetchEventDetails(mssv);
    } catch (error) {
      setError(error.message || "Failed to register for event");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMssvSubmit = () => {
    if (tempMssv) {
      setMssv(tempMssv);
      setShowMssvModal(false);
      handleRegister();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
            className={`${getStatusStyle(
              status
            )} text-white text-xs font-bold px-3 py-1 rounded-full`}
          >
            {statusLabel}
          </span>
          {event.applicationStatus !== undefined && (
            <span
              className={`${
                event.applicationStatus ? "bg-green-500" : "bg-yellow-500"
              } text-white text-xs font-bold px-3 py-1 rounded-full`}
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

        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/event/${event.id}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View Details
          </Link>
          <button
            onClick={handleRegister}
            disabled={isRegistering || event.applicationStatus}
            className={`px-4 py-2 rounded-lg ${
              event.applicationStatus
                ? "bg-green-500 text-white cursor-not-allowed"
                : isRegistering
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isRegistering
              ? "Registering..."
              : event.applicationStatus
              ? "Registered"
              : "Register"}
          </button>
        </div>
      </div>

      {/* MSSV Modal */}
      {showMssvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Enter your Student ID</h3>
            <input
              type="text"
              value={tempMssv}
              onChange={(e) => setTempMssv(e.target.value)}
              className="border p-2 mb-4 w-full"
              placeholder="Enter your Student ID"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowMssvModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMssvSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default EventCard;
