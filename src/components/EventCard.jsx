import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";
import { ToastContainer, toast } from "react-toastify";
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
      await fetchEventDetails(mssv);
      toast.success(`Successfully registered for "${event.name}"!`, { theme: "colored" });
    } catch (error) {
      setError(error.message || `Failed to register for event: ${event.name}`);
      toast.error(error.message || `Failed to register for "${event.name}"!`, { theme: "colored" });
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
        await fetchEventDetails(tempMssv);
        toast.success(`Successfully registered for "${event.name}"!`, { theme: "colored" });
      } catch (error) {
        setError(error.message || `Failed to register for event: ${event.name}`);
        toast.error(error.message || `Failed to register for "${event.name}"!`, { theme: "colored" });
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
        <div className="w-full h-56 overflow-hidden cursor-pointer" onClick={handleViewDetails}>
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
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
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
            <span className="font-semibold text-blue-800 dark:text-blue-300">{event.location}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleViewDetails}
            className="px-5 py-2.5 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center gap-2 
              bg-gray-50 dark:bg-gray-700/60 text-blue-600 dark:text-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-200 hover:scale-105 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
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
                  <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : event.applicationStatus ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Registered
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Register
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MSSV Modal - Positioned in the document body via React Portal */}
      {showMssvModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}}>
          <div 
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-fadeIn border-2 border-blue-200 dark:border-blue-800/50"
            style={{animation: "fadeIn 0.3s ease-out"}}
          >
            <button
              onClick={() => setShowMssvModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="flex flex-col items-center mb-5">
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2zm0 0c0 1.104.896 2 2 2s2-.896 2-2-.896-2-2-2-2 .896-2 2zm-6 8v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">Enter your Student ID</h3>
              <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50 mb-3">
                <h4 className="text-blue-600 dark:text-blue-400 font-semibold text-center">"{event.name}"</h4>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-sm mb-2 text-center">Please enter your Student ID (MSSV) to register for this event.</p>
            </div>
            <input
              type="text"
              value={tempMssv}
              onChange={(e) => setTempMssv(e.target.value)}
              className="border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-3 focus:ring-blue-200/50 dark:focus:border-blue-400 dark:focus:ring-blue-900/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 mb-5 w-full outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Enter your Student ID"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMssvModal(false)}
                className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border-2 border-gray-300 dark:border-gray-600 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleMssvSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 hover:shadow-blue-500/30 dark:hover:shadow-blue-900/40"
                disabled={!tempMssv || isRegistering}
              >
                {isRegistering ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : "Confirm"}
              </button>
    a        </div>
          </div>
        </div>,
        document.body
      )}

      {error && ReactDOM.createPortal(
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg shadow-red-500/20 animate-fadeIn z-[1000] border border-red-400" style={{position: 'fixed'}}>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <div className="font-semibold">{event.name}</div>
              <div>{error}</div>
            </div>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
};

export default EventCard;
