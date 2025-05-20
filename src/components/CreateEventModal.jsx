import { useState } from "react";
import { toast } from "react-toastify";
import eventService from "../services/eventService";

const EVENT_TYPES = {
  TECHNOLOGY: "TECHNOLOGY",
  BUSINESS: "BUSINESS",
  EDUCATION: "EDUCATION",
  DESIGN: "DESIGN",
  ENTERTAINMENT: "ENTERTAINMENT",
};

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    image: "",
    type: EVENT_TYPES.TECHNOLOGY, // Default to TECHNOLOGY
  });

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const determineEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "NOT_STARTED";
    } else if (now > end) {
      return "COMPLETED";
    } else {
      return "IN_PROGRESS";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!imageFile) newErrors.image = "Image is required";

    // Validate end date is after start date
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setImageFile(files[0]);
      setFormData((prev) => ({ ...prev, image: files[0].name }));
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await eventService.uploadImage(imageFile);
        console.log(imageUrl)
      }
      const formattedData = {
        ...formData,
        image: imageUrl,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: determineEventStatus(formData.startDate, formData.endDate),
        type: formData.type,
      };
      await eventService.createEvent(formattedData);
      setErrors({});
      toast.success("Event created successfully!");
      if (onEventCreated) onEventCreated();
      onClose();
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        image: "",
        type: EVENT_TYPES.TECHNOLOGY,
      });
      setImageFile(null);
    } catch (error) {
      toast.error(error.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-white tracking-wide drop-shadow-lg">
            Create New Event
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 p-2 rounded-full transition-colors"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                errors.name ? "border-red-500" : "border-blue-200"
              }`}
              placeholder="Enter event name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
              Event Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                errors.type ? "border-red-500" : "border-blue-200"
              }`}
            >
              {Object.entries(EVENT_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                errors.description ? "border-red-500" : "border-blue-200"
              }`}
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                  errors.startDate ? "border-red-500" : "border-blue-200"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                  errors.endDate ? "border-red-500" : "border-blue-200"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                errors.location ? "border-red-500" : "border-blue-200"
              }`}
              placeholder="Enter event location"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
              Image *
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                errors.image ? "border-red-500" : "border-blue-200"
              }`}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg hover:from-blue-700 hover:to-blue-500 font-bold shadow-md transition-all ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
