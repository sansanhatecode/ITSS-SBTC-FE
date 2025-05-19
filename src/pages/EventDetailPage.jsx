import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { mssv, setMssv } = useMssv();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showMssvModal, setShowMssvModal] = useState(false);
  const [tempMssv, setTempMssv] = useState("");
  // console.log("-------------------------eventId", eventId);
  // console.log("-------------------------mssv", mssv);
  useEffect(() => {
    fetchEventDetails();
  }, [eventId, mssv]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(eventId, mssv);
      console.log("Event details response:", response); // Debug log
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error); // Debug log
      setError(error.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!mssv) {
      setShowMssvModal(true);
      return;
    }

    try {
      setIsRegistering(true);
      await eventService.registerEvent(mssv, eventId);
      await fetchEventDetails();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Event not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

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

  const status = getEventStatus();

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span
              className={`${status.color} text-white text-sm font-bold px-3 py-1 rounded`}
            >
              {status.text}
            </span>
            {mssv && event.applicationStatus !== undefined && (
              <span
                className={`${
                  event.applicationStatus ? "bg-green-500" : "bg-yellow-500"
                } text-white text-sm font-bold px-3 py-1 rounded`}
              >
                {event.applicationStatus ? "Registered" : "Not Registered"}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {event.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <svg
                  className="w-5 h-5 mr-2"
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
                  {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <svg
                  className="w-5 h-5 mr-2"
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

              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>{event.type}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {event.description}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back to Events
            </button>

            {status.text !== "Past" && !event.applicationStatus && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className={`px-6 py-2 ${
                  isRegistering
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-medium rounded-lg`}
              >
                {isRegistering ? "Registering..." : "Register for Event"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MSSV Modal */}
      {showMssvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Enter your HUST ID
            </h3>
            <input
              type="text"
              value={tempMssv}
              onChange={(e) => setTempMssv(e.target.value)}
              placeholder="Enter your HUST ID..."
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
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
