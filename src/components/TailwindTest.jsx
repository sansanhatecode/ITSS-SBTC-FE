import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-6 w-full bg-white shadow-md flex items-center space-x-4 my-4">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
      </div>
      <div className="flex-grow">
        <div className="text-xl font-medium text-black">Tailwind Test</div>
        <p className="text-3xl">This component tests if Tailwind CSS is working properly</p>
      </div>
    </div>
  );
};

export default TailwindTest;