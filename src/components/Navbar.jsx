import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMssv } from "../contexts/MssvContext";

const Navbar = ({ onCreateEvent }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { mssv, setMssv } = useMssv();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-600 dark:text-blue-400"
      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg ${
        scrolled
          ? "bg-gradient-to-r from-blue-50/80 via-white/90 to-blue-100/80 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-md shadow-xl border-b border-blue-100 dark:border-gray-800"
          : "bg-transparent"
      } rounded-b-2xl`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-9 w-9 text-blue-600 group-hover:scale-110 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 text-2xl font-extrabold text-blue-700 dark:text-white tracking-wide drop-shadow-lg">
                EventHub
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`${isActive("/")} transition-colors duration-300 font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`${isActive("/about")} transition-colors duration-300 font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800`}
            >
              About
            </Link>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your HUST ID..."
                value={mssv}
                onChange={(e) => setMssv(e.target.value)}
                className="w-48 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white text-sm shadow-sm transition-all"
              />
            </div>
            <button
              onClick={onCreateEvent}
              className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow-md hover:scale-105 hover:from-blue-700 hover:to-blue-500 transition-all font-bold"
            >
              Create Event
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-blue-600 dark:text-blue-400 focus:outline-none p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 py-6 rounded-b-2xl shadow-xl border-t border-blue-100 dark:border-gray-800 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`${isActive("/")} px-4 py-2 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`${isActive("/about")} px-4 py-2 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your HUST ID..."
                  value={mssv}
                  onChange={(e) => setMssv(e.target.value)}
                  className="w-48 px-4 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white text-sm shadow-sm transition-all"
                />
              </div>
              <button
                onClick={() => {
                  onCreateEvent();
                  setIsMenuOpen(false);
                }}
                className="mx-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow-md hover:scale-105 hover:from-blue-700 hover:to-blue-500 transition-all font-bold"
              >
                Create Event
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
