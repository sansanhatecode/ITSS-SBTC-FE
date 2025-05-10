import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const registrationPercentage = Math.round((event.registeredAttendees / event.seats) * 100);
  const remainingSeats = event.seats - event.registeredAttendees;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
        {event.featured && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        )}
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          {event.category}
        </span>
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{event.title}</h3>
        <div className="mb-3 text-gray-600 dark:text-gray-300 text-sm">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
            </svg>
            {event.date}
          </div>
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
            {event.time}
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            {event.location}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm">
          {event.description}
        </p>
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2">
          <div className="flex justify-between mb-1 text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Registration: {registrationPercentage}%</span>
            <span className="text-gray-600 dark:text-gray-300">{remainingSeats} seats left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                registrationPercentage > 80 ? 'bg-red-500' : 
                registrationPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${registrationPercentage}%` }}
            ></div>
          </div>
        </div>
        <Link 
          to={`/event/${event.id}`} 
          className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;