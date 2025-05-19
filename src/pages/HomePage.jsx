import { useState, useEffect, useCallback } from "react";
import EventList from "../components/EventList";
import CreateEventModal from "../components/CreateEventModal";
import FeaturedEvents from "../components/FeaturedEvents";
import Navbar from "../components/Navbar";
import eventService from "../services/eventService";
import { useMssv } from "../contexts/MssvContext";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { mssv } = useMssv();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getAllEvents(mssv, 0, 100);
      setEvents(response?.content || []);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [mssv]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await eventService.getAllEvents(mssv, 0, 100);
      if (Array.isArray(response?.content)) {
        const uniqueTypes = [
          ...new Set(
            response.content.map((event) => event?.type).filter((type) => type)
          ),
        ].sort();
        setCategories(uniqueTypes);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, [mssv]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchEvents, fetchCategories]);

  const handleEventCreated = () => {
    fetchEvents(); // Refresh event list after creating a new event
    fetchCategories(); // Also refresh categories in case a new type was added
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onCreateEvent={() => setIsCreateModalOpen(true)} />
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Featured Events Section */}
        <section className="mb-12">
          <FeaturedEvents />
        </section>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            HUST Student Events
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 \
                     focus:outline-none focus:ring-2 focus:ring-blue-500 \
                     dark:bg-gray-700 dark:text-white"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 \
                     focus:outline-none focus:ring-2 focus:ring-blue-500 \
                     dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Event List */}
        <EventList
          searchTerm={searchTerm}
          category={selectedCategory}
          events={events}
          loading={loading}
        />
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default HomePage;
