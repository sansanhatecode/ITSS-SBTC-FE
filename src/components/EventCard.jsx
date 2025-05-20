import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";
import { toast } from "react-toastify";
import ReactDOM from "react-dom";
import "react-toastify/dist/ReactToastify.css";

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
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showMssvModal, setShowMssvModal] = useState(false);
  const [tempMssv, setTempMssv] = useState("");
  const [debouncedMssv, setDebouncedMssv] = useState("");
  const { mssv, setMssv } = useMssv();
  const [event, setEvent] = useState(initialEvent);

  // Debounce tempMssv changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMssv(tempMssv);
    }, 500);

    return () => clearTimeout(timer);
  }, [tempMssv]);

  // Use debounced value for API calls
  useEffect(() => {
    if (debouncedMssv) {
      fetchEventDetails(debouncedMssv);
    }
  }, [debouncedMssv]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mssv, event.id]);

  const handleRegister = async () => {
    if (!mssv) {
      setShowMssvModal(true);
      return;
    }
    try {
      setIsRegistering(true);
      await eventService.registerEvent(mssv, event.id);
      // Update event details after successful registration
      const response = await eventService.getEventById(event.id, mssv);
      setEvent({
        ...response.data,
        applicationStatus: true, // Force set to true after successful registration
      });
      toast.success(`Successfully registered for "${event.name}"!`, {
        theme: "colored",
      });
    } catch (error) {
      toast.error(error.message || `Failed to register for "${event.name}"!`, {
        theme: "colored",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleMssvSubmit = async () => {
    if (tempMssv) {
      setMssv(tempMssv);
      setShowMssvModal(false);
      setIsRegistering(true);
      try {
        await eventService.registerEvent(tempMssv, event.id);
        // Update event details after successful registration
        const response = await eventService.getEventById(event.id, tempMssv);
        setEvent({
          ...response.data,
          applicationStatus: true, // Force set to true after successful registration
        });
        toast.success(`Successfully registered for "${event.name}"!`, {
          theme: "colored",
        });
      } catch (error) {
        toast.error(
          error.message || `Failed to register for "${event.name}"!`,
          { theme: "colored" }
        );
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleViewDetails = () => {
    navigate(`/event/${event.id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group border border-blue-100 dark:border-gray-700 scale-100 hover:scale-103 hover:border-blue-300 dark:hover:border-blue-500 relative">
      <div className="relative">
        <div
          className="w-full h-56 overflow-hidden cursor-pointer"
          onClick={handleViewDetails}
        >
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out relative z-0"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[1]"></div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-[2]">
          <span
            className={`${getStatusStyle(
              status
            )} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm bg-opacity-90 border border-white/40 animate-fadeIn`}
          >
            {statusLabel}
          </span>
          {event.applicationStatus !== undefined && (
            <span
              className={`${
                event.applicationStatus ? "bg-green-500" : "bg-yellow-500"
              } text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm bg-opacity-90 border border-white/40 animate-fadeIn`}
            >
              {event.applicationStatus ? "Registered" : "Not Registered"}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3
          className="text-xl font-extrabold mb-2.5 text-gray-800 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 cursor-pointer"
          onClick={handleViewDetails}
        >
          {event.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-2 font-medium">
          {event.description}
        </p>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-blue-100 dark:border-gray-600">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-500 group-hover:text-blue-600 transition-colors duration-300 flex-shrink-0"
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
            <span className="font-semibold text-blue-800 dark:text-blue-300">
              {formatDate(event.startDate) === formatDate(event.endDate)
                ? formatDate(event.startDate)
                : `${formatDate(event.startDate)} - ${formatDate(
                    event.endDate
                  )}`}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-500 group-hover:text-blue-600 transition-colors duration-300 flex-shrink-0"
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
            <span className="font-semibold text-blue-800 dark:text-blue-300 text-left truncate max-w-full block">
              {event.location}
            </span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-blue-500 group-hover:text-blue-600 transition-colors duration-300 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="font-semibold">
              {event.numberOfMssv === null ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1 animate-pulse">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Be the first one to join!
                </span>
              ) : (
                <div className="flex flex-col">
                  <span className="text-blue-800 dark:text-blue-300 flex items-center">
                    {event.numberOfMssv ?? 0} registered
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleViewDetails}
            className="px-5 py-2.5 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center gap-2 
              bg-gray-50 dark:bg-gray-700/60 text-blue-600 dark:text-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 hover:scale-105 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            View Details
          </button>

          {status !== "past" && (
            <button
              onClick={handleRegister}
              disabled={isRegistering || event.applicationStatus}
              className={`px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center gap-2
                ${
                  event.applicationStatus
                    ? "bg-green-500 text-white cursor-not-allowed border-2 border-green-400"
                    : "bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 hover:scale-105 hover:shadow-blue-300/50 dark:hover:shadow-blue-900/30"
                }
                ${isRegistering ? "opacity-70" : ""}
              `}
            >
              {isRegistering ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registering...
                </>
              ) : event.applicationStatus ? (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  Registered
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Register
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MSSV Modal - Positioned in the document body via React Portal */}
      {showMssvModal &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <div
              className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-fadeIn border-2 border-blue-200 dark:border-blue-800/50"
              style={{ animation: "fadeIn 0.3s ease-out" }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-start mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Enter your HUST ID
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      To register for "{event.name}"
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Your HUST ID is required to register for events. We'll
                  remember this for future registrations.
                </p>

                <div className="relative mb-6">
                  <input
                    type="text"
                    value={tempMssv}
                    onChange={(e) => setTempMssv(e.target.value)}
                    placeholder="e.g., 20200001"
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white text-lg transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                  <svg
                    className="w-6 h-6 absolute left-3 top-3.5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowMssvModal(false)}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl
                         hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium border border-gray-200 dark:border-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMssvSubmit}
                    disabled={!tempMssv.trim()}
                    className={`px-5 py-2.5 rounded-xl font-medium text-white
                         transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                           !tempMssv.trim()
                             ? "bg-blue-400 cursor-not-allowed opacity-70"
                             : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg"
                         }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Confirm & Register</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default EventCard;
