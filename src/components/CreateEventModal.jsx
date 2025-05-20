import { useState, useEffect, useRef } from "react";
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
    creatorName: "",
    creatorPhone: "",
    creatorEmail: "",
    maxCapacity: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

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
    if (!formData.creatorName.trim())
      newErrors.creatorName = "Creator name is required";
    if (!formData.creatorPhone.trim())
      newErrors.creatorPhone = "Creator phone is required";
    if (!formData.creatorEmail.trim())
      newErrors.creatorEmail = "Creator email is required";
    if (!formData.maxCapacity)
      newErrors.maxCapacity = "Maximum capacity is required";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.creatorEmail && !emailRegex.test(formData.creatorEmail)) {
      newErrors.creatorEmail = "Invalid email format";
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (
      formData.creatorPhone &&
      !phoneRegex.test(formData.creatorPhone.replace(/\D/g, ""))
    ) {
      newErrors.creatorPhone = "Invalid phone number format";
    }

    // Validate max capacity is a positive number
    if (
      formData.maxCapacity &&
      (isNaN(formData.maxCapacity) || parseInt(formData.maxCapacity) <= 0)
    ) {
      newErrors.maxCapacity = "Maximum capacity must be a positive number";
    }

    // Validate start date is not in the past
    if (formData.startDate && new Date(formData.startDate) < new Date(today)) {
      newErrors.startDate = "Start date cannot be in the past";
    }

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
      const file = files[0];
      setImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      setFormData((prev) => ({ ...prev, image: file.name }));
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

  const handleRemoveImage = () => {
    // Revoke the preview URL to avoid memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Reset all image-related states
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await eventService.uploadImage(imageFile);
        console.log(imageUrl);
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
        creatorName: "",
        creatorPhone: "",
        creatorEmail: "",
        maxCapacity: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      toast.error(error.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-white tracking-wide drop-shadow-lg">
            Create New Event
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Basic Information
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                  Event Name <span className="text-red-500">*</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    Event Type <span className="text-red-500">*</span>
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
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    Maximum Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="maxCapacity"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                      errors.maxCapacity ? "border-red-500" : "border-blue-200"
                    }`}
                    placeholder="Enter maximum capacity"
                  />
                  {errors.maxCapacity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxCapacity}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                  Description <span className="text-red-500">*</span>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule & Location Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
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
              Schedule & Location
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={today}
                    className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                      errors.startDate ? "border-red-500" : "border-blue-200"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || today}
                    className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                      errors.endDate ? "border-red-500" : "border-blue-200"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                  Location <span className="text-red-500">*</span>
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
            </div>
          </div>

          {/* Creator Information Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Creator Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    Creator Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="creatorName"
                    value={formData.creatorName}
                    onChange={handleChange}
                    className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                      errors.creatorName ? "border-red-500" : "border-blue-200"
                    }`}
                    placeholder="Enter creator name"
                  />
                  {errors.creatorName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.creatorName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                    Creator Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="creatorPhone"
                    value={formData.creatorPhone}
                    onChange={handleChange}
                    className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                      errors.creatorPhone ? "border-red-500" : "border-blue-200"
                    }`}
                    placeholder="Enter creator phone"
                  />
                  {errors.creatorPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.creatorPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                  Creator Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="creatorEmail"
                  value={formData.creatorEmail}
                  onChange={handleChange}
                  className={`w-full p-3 border-2 rounded-lg text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-blue-700 dark:text-white transition-all ${
                    errors.creatorEmail ? "border-red-500" : "border-blue-200"
                  }`}
                  placeholder="Enter creator email"
                />
                {errors.creatorEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.creatorEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Event Image
            </h3>
            <div>
              <label className="block text-base font-bold text-blue-700 dark:text-white mb-1">
                Upload Image <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  errors.image
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-blue-200 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="image-upload"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                )}
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-2">{errors.image}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
          )}

          <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg hover:from-blue-700 hover:to-blue-500 font-bold shadow-md transition-all ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Creating...
                </span>
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
