import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMssv } from "../contexts/MssvContext";
import eventService from "../services/eventService";
import { toast } from "react-toastify";

const EventDetailPage = () => {
  const location = useLocation();
  console.log("Current path:", location.pathname); // Debug the current path
  const extractIdFromPath = () => {
    const path = location.pathname;
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  const eventId = extractIdFromPath();
  console.log("Extracted event ID:", eventId);

  const navigate = useNavigate();
  const { mssv, setMssv } = useMssv();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showMssvModal, setShowMssvModal] = useState(false);
  const [tempMssv, setTempMssv] = useState("");
  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, mssv]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(eventId, mssv);
      setEvent(response);
    } catch (error) {
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
      toast.success("Successfully registered for the event!");
    } catch (error) {
      setError(error.message || "Failed to register for event");
      toast.error(error.message || "Failed to register for the event!");
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
        await eventService.registerEvent(tempMssv, eventId);
        await fetchEventDetails();
        toast.success("Successfully registered for the event!");
      } catch (error) {
        setError(error.message || "Failed to register for event");
        toast.error(error.message || "Failed to register for the event!");
      } finally {
        setIsRegistering(false);
      }
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
        <p className="text-red-500 mb-4 animate-[fadeIn_0.5s_ease-out_forwards]">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4 animate-[fadeIn_0.5s_ease-out_forwards]">Event not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]"
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
    <div className="container mx-auto px-4 py-8 mt-20 overflow-hidden">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="relative overflow-hidden group">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110 filter group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent transform transition-all duration-500 group-hover:opacity-80"></div>
          <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white drop-shadow-lg opacity-0 animate-[fadeInRight_0.7s_ease-out_0.2s_forwards] transition-all duration-300 group-hover:translate-x-2">
            {event.name}
          </h1>
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <span
              className={`${status.color} text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:scale-105 opacity-0 animate-[fadeInLeft_0.7s_ease-out_0.3s_forwards] group-hover:translate-x-1`}
            >
              {status.text}
            </span>
            {mssv && event.applicationStatus !== undefined && (
              <span
                className={`${
                  event.applicationStatus ? "bg-green-500" : "bg-yellow-500"
                } text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md backdrop-blur-sm bg-opacity-90 transition-all duration-300 hover:scale-105 opacity-0 animate-[fadeInLeft_0.7s_ease-out_0.5s_forwards] group-hover:-translate-x-1`}
              >
                {event.applicationStatus ? "Registered" : "Not Registered"}
              </span>
            )}
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
            <div className="md:w-1/2 space-y-5 opacity-0 animate-[fadeInLeft_0.8s_ease-out_0.6s_forwards]">
              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-l-4 hover:border-blue-500 opacity-0 animate-[fadeIn_0.5s_ease-out_0.7s_forwards]">
                <svg
                  className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400 animate-bounce-slight"
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
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium">
                    {new Date(event.startDate).toLocaleDateString()} -{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-l-4 hover:border-red-500 opacity-0 animate-[fadeIn_0.5s_ease-out_0.9s_forwards]">
                <svg
                  className="w-6 h-6 mr-3 text-red-600 dark:text-red-400 animate-float"
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
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-l-4 hover:border-purple-500 opacity-0 animate-[fadeIn_0.5s_ease-out_1.1s_forwards]">
                <svg
                  className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400 animate-pulse-scale"
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
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Event Type</p>
                  <p className="font-medium">{event.type}</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 opacity-0 animate-[fadeInRight_0.8s_ease-out_0.8s_forwards]">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center relative">
                <svg className="w-5 h-5 mr-2 text-blue-600 animate-bounce-slight" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="relative">
                  About this event
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-300 transform scale-x-0 transition-transform origin-left group-hover:scale-x-100 animate-shimmer bg-[length:200%_100%]"></span>
                </span>
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg shadow-inner transition-all duration-300 hover:shadow-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/30 group"
                style={{backgroundImage: "linear-gradient(110deg, transparent 0%, transparent 40%, rgba(0,0,255,0.05) 50%, transparent 60%, transparent 100%)", 
                        backgroundSize: "200% 100%",
                        animation: "shimmer 3s infinite linear"}}>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed transform transition-transform duration-300 group-hover:scale-[1.01]">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 border-t pt-6 border-gray-200 dark:border-gray-700 opacity-0 animate-[fadeIn_0.8s_ease-out_1s_forwards]">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-300 flex items-center hover:shadow-md transform hover:-translate-x-1"
            >
              <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </button>

            {status.text !== "Past" && !event.applicationStatus && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className={`px-6 py-2.5 ${
                  isRegistering
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                } text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex items-center transform hover:scale-105 hover:translate-x-1 relative overflow-hidden group`}
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-45 transition-all duration-500 ease-out -translate-x-full group-hover:translate-x-full"></span>
                {isRegistering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Register for Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MSSV Modal */}
      {showMssvModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out_forwards]">
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl p-8 w-96 shadow-2xl transform transition-all duration-500 opacity-0 animate-[scaleIn_0.4s_ease-out_0.1s_forwards] relative overflow-hidden"
            style={{boxShadow: "0 10px 50px -5px rgba(0, 0, 0, 0.3)"}}
          >
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/10 rounded-full"></div>
            
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center relative z-10">
              <svg className="w-6 h-6 mr-2 text-blue-500 animate-pulse-scale" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="relative group">
                Enter your HUST ID
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </h3>
            <div className="relative mb-6 z-10">
              <input
                type="text"
                value={tempMssv}
                onChange={(e) => setTempMssv(e.target.value)}
                placeholder="e.g., 20200001"
                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white text-lg transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
              />
              <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400 animate-bounce-slight" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex justify-end space-x-3 z-10 relative">
              <button
                onClick={() => setShowMssvModal(false)}
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg 
                         hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 hover:-translate-x-1"
              >
                Cancel
              </button>
              <button
                onClick={handleMssvSubmit}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg 
                         hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex items-center shadow-md hover:shadow-lg transform hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-45 transition-all duration-500 ease-out -translate-x-full group-hover:translate-x-full"></span>
                <svg className="w-4 h-4 mr-1 relative z-10" fill="currentColor" viewBox="0 0 20 20"                >
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="relative z-10">Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-image: linear-gradient(110deg, transparent 0%, transparent 40%, rgba(0,0,255,0.05) 50%, transparent 60%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default EventDetailPage;
