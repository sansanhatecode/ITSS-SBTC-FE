import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import events from '../data';

const FeaturedEvents = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredEvents = events.filter(event => event.featured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredEvents.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  if (featuredEvents.length === 0) return null;

  return (
    <div className="relative h-96 overflow-hidden rounded-xl">
      {featuredEvents.map((event, index) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-70"></div>
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
            <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded mb-2">
              {event.category}
            </span>
            <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
            <p className="mb-4 text-gray-200 max-w-2xl">{event.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                {event.date}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                {event.location}
              </div>
            </div>
            <Link 
              to={`/event/${event.id}`} 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 right-4 z-30 flex space-x-2">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedEvents;