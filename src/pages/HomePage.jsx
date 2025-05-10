import { useState } from 'react';
import events from '../data';
import EventCard from '../components/EventCard';
import FeaturedEvents from '../components/FeaturedEvents';

const HomePage = () => {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [...new Set(events.map(event => event.category))];
  
  // Filter events based on search term and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(filter.toLowerCase()) || 
                           event.description.toLowerCase().includes(filter.toLowerCase()) ||
                           event.location.toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Featured Events */}
      <section className="mb-12">
        <FeaturedEvents />
      </section>

      {/* Search and Filter Section */}
      <section className="mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Find Your Next Event</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <svg className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Events List Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upcoming Events</h2>
          <p className="text-gray-600 dark:text-gray-300">{filteredEvents.length} events found</p>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No events found</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;