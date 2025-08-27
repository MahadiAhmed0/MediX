"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/footer";

interface Doctor {
  doctorId: number;
  user: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    address: string;
  };
  yearsOfExperience: number;
  availableDays: string;
  availableTimes: string;
  licenseNumber: string;
  qualifications: Array<{
    id: {
      doctorId: number;
      qualificationId: number;
    };
    qualification: {
      id: number;
      name: string;
    };
  }>;
  specializations: Array<{
    id: {
      doctorId: number;
      specializationId: number;
    };
    specialization: {
      id: number;
      name: string;
    };
  }>;
}

export default function BookAppointment() {
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get available dates based on doctor's available days
  const getAvailableDates = () => {
    if (!selectedDoctor || !selectedDoctor.availableDays) {
      return [];
    }

    const availableDayNames = selectedDoctor.availableDays
      .split(",")
      .map((day) => day.trim().toLowerCase());
    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const availableDayNumbers = availableDayNames
      .map((day) => dayMap[day])
      .filter((num) => num !== undefined);

    // Generate next 30 days that match available days
    const availableDates: string[] = [];
    const today = new Date();

    for (let i = 0; i < 90; i++) {
      // Check next 90 days
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      if (availableDayNumbers.includes(currentDate.getDay())) {
        availableDates.push(currentDate.toISOString().split("T")[0]);
      }
    }

    return availableDates;
  };

  // Check if a date is available
  const isDateAvailable = (dateString: string) => {
    const availableDates = getAvailableDates();
    return availableDates.includes(dateString);
  };

  const todayDate = getMinDate();

  const [patient, setPatient] = useState({
    name: "",
    contact: "+88 ",
    doctor: "",
    appointmentDate: todayDate,
  });

  // Added state to control visibility of available dates dropdown
  const [showAvailableDates, setShowAvailableDates] = useState(true);

  useEffect(() => {
    const doctorId = searchParams?.get("doctorId");
    const doctorName = searchParams?.get("doctorName");

    if (doctorId) {
      // Fetch doctor details
      fetch(`http://localhost:8080/api/doctors`)
        .then((res) => res.json())
        .then((data: Doctor[]) => {
          const doctor = data.find((d) => d.doctorId.toString() === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
            setPatient((prev) => ({ ...prev, doctor: doctorId }));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // If changing appointment date, validate it's an available day
    if (name === "appointmentDate" && selectedDoctor) {
      if (!isDateAvailable(value)) {
        setError(
          `Selected date is not available. Dr. ${selectedDoctor.user.name} is available on: ${selectedDoctor.availableDays}`
        );
        return;
      } else {
        setError(null); // Clear any previous error
      }
    }

    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow letters and spaces, remove any other characters
    const lettersOnly = input.replace(/[^a-zA-Z\s]/g, "");

    // Update the patient name
    setPatient((prev) => ({ ...prev, name: lettersOnly }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove +88 prefix to get just the number part
    const numberPart = input.replace(/^\+88\s?/, "");

    // Only allow digits and limit to 11 digits
    const numbersOnly = numberPart.replace(/\D/g, "").slice(0, 11);

    // Update the patient contact with full number including +88
    if (numbersOnly.length <= 11) {
      setPatient((prev) => ({ ...prev, contact: `+88 ${numbersOnly}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Trigger button press animation
    setClicked(true);
    setTimeout(() => setClicked(false), 150);

    // Validate name length and content
    const nameOnly = patient.name.replace(/\s+/g, ""); // Remove spaces to count only letters
    if (nameOnly.length < 3) {
      setError("Name must be at least 3 letters long");
      setLoading(false);
      return;
    }

    // Validate phone number length
    const phoneNumbers = patient.contact.replace(/^\+88\s?/, "");
    if (phoneNumbers.length !== 11) {
      setError("Phone number must be exactly 11 digits long");
      setLoading(false);
      return;
    }

    try {
      // Validate selected date is available
      if (selectedDoctor && !isDateAvailable(patient.appointmentDate)) {
        setError(
          `Selected date is not available. Dr. ${selectedDoctor.user.name} is available on: ${selectedDoctor.availableDays}`
        );
        setLoading(false);
        return;
      }

      let currentPatientId;

      // Step 1 & 2: Check if patient exists by phone number
      const patientResponse = await fetch(
        `http://localhost:8080/api/patients/by-phone?phoneNumber=${patient.contact}`
      );

      console.log("Patient response status:", patientResponse.status);

      if (patientResponse.ok) {
        // Patient exists, get their ID
        const existingPatient = await patientResponse.json();
        currentPatientId = existingPatient.id;
      } else if (patientResponse.status === 404) {
        console.log("Patient not found, creating a new one");
        // Step 3: Patient does not exist, create a new one
        const newPatientResponse = await fetch(
          "http://localhost:8080/api/patients/basic",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: patient.name,
              phoneNumber: patient.contact,
            }),
          }
        );
        console.log("New patient response status:", newPatientResponse.status);
        const newPatient = await newPatientResponse.json();
        currentPatientId = newPatient.id;
        console.log("New patient created with ID:", currentPatientId);
      } else {
        // Handle other errors
        console.error(
          "Failed to check for patient:",
          patientResponse.statusText
        );
        setError("Failed to process patient information");
        setLoading(false);
        return;
      }

      // Step 4 & 5: Check doctor selection
      if (!patient.doctor) {
        console.error("Doctor not selected");
        setError("Please select a doctor");
        setLoading(false);
        return;
      }

      // DUPLICATE CHECK: Fetch all appointments and check for duplicate
      const appointmentsResponse = await fetch(
        "http://localhost:8080/api/appointments/with-details"
      );
      const appointments = await appointmentsResponse.json();
      const duplicate = appointments.some(
        (appt: any) =>
          appt.patientName?.trim().toLowerCase() ===
            patient.name.trim().toLowerCase() &&
          String(appt.doctorId) === String(patient.doctor) &&
          appt.patientPhone?.trim() === patient.contact.trim() &&
          appt.appointmentDate.slice(0, 10) === patient.appointmentDate
      );

      if (duplicate) {
        setError(
          "Duplicate appointment found! You already have an appointment with this doctor on this date."
        );
        setLoading(false);
        return;
      }

      // Step 6: Create the appointment
      const appointmentData = {
        patientId: currentPatientId,
        doctorId: parseInt(patient.doctor, 10),
        appointmentDate: patient.appointmentDate, // Use selected date
      };

      const appointmentResponse = await fetch(
        "http://localhost:8080/api/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!appointmentResponse.ok) {
        console.error(
          "Failed to create appointment:",
          appointmentResponse.statusText
        );
        setError("Failed to create appointment");
        setLoading(false);
        return;
      }

      // Update appointment status to DONE
      const statusRes = await fetch(
        `http://localhost:8080/api/appointments/${currentPatientId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "REQUESTED" }),
        }
      );

      if (!statusRes.ok) {
        const errorText = await statusRes.text();
        console.error(
          "Failed to update appointment status:",
          statusRes.status,
          errorText
        );
        setError("Appointment created but failed to update status");
        setLoading(false);
        return;
      }

      console.log("Appointment created successfully");
      // Set the patient ID state first, then show success message with a small delay
      setPatientId(currentPatientId);

      // Small delay to ensure state update is processed
      setTimeout(() => {
        setSuccess(`Appopintment requested successfully.`);
      }, 100);

      // Clear form but preserve patient ID for the success popup
      setPatient({
        name: "",
        contact: "+88 ",
        doctor: selectedDoctor ? selectedDoctor.doctorId.toString() : "",
        appointmentDate: todayDate,
      });
    } catch (error) {
      console.error("Error in appointment creation process:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setPatient({
      name: "",
      contact: "+88 ",
      doctor: selectedDoctor ? selectedDoctor.doctorId.toString() : "",
      appointmentDate: todayDate,
    });
    setPatientId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f2ec] via-[#f0f6f2] to-[#e6f2ec] flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-green-200 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="flex-grow flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-lg rounded-3xl bg-[#e6f2ec] p-10 shadow-[20px_20px_60px_#c2d0c8,-20px_-20px_60px_#ffffff] border border-white/20 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-500 ease-out">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-gray-800 via-green-700 to-gray-800 bg-clip-text text-transparent">
              Book <span className="text-green-700">Appointment</span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full mb-4 animate-pulse"></div>
            <p className="text-gray-600 text-lg font-medium">
              Complete your appointment booking
            </p>
          </div>

          {/* Selected Doctor Display */}
          {selectedDoctor && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-sm">
                    {selectedDoctor.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-green-800 text-lg">
                    {selectedDoctor.user.name}
                  </div>
                </div>
                <button
                  onClick={() => router.push("/request-appointment/doctors")}
                  className="ml-auto text-green-600 hover:text-green-800 transition-colors duration-200"
                  title="Change Doctor"
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
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Appointment Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Patient Name */}
            <div className="relative group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={patient.name}
                onChange={handleNameChange}
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#e6f2ec] text-gray-800 shadow-[inset_6px_6px_12px_#c2d0c8,inset_-6px_-6px_12px_#ffffff] placeholder-gray-500 "
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              {patient.name.length > 0 &&
                patient.name.replace(/\s+/g, "").length < 3 && (
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-red-500 text-sm font-medium">
                    Min 3 letters
                  </div>
                )}
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <input
                type="tel"
                name="contact"
                placeholder="+88 01XXXXXXXXX"
                value={patient.contact}
                onChange={handlePhoneChange}
                onKeyDown={(e) => {
                  // Prevent deleting +88 prefix
                  if (
                    (e.key === "Backspace" || e.key === "Delete") &&
                    (e.currentTarget.selectionStart ?? 0) <= 4
                  ) {
                    e.preventDefault();
                  }
                }}
                onFocus={(e) => {
                  // Set cursor position after +88
                  setTimeout(() => {
                    if (e.target.value.length <= 4) {
                      e.target.setSelectionRange(4, 4);
                    }
                  }, 0);
                }}
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#e6f2ec] text-gray-800 shadow-[inset_6px_6px_12px_#c2d0c8,inset_-6px_-6px_12px_#ffffff] placeholder-gray-500 "
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-blue-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              {patient.contact.replace(/^\+88\s?/, "").length > 0 &&
                patient.contact.replace(/^\+88\s?/, "").length !== 11 && (
                  <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-red-500 text-sm font-medium">
                    Must be 11 digits
                  </div>
                )}
            </div>

            {/* Appointment Date */}
            <div className="relative group">
              <input
                type="date"
                name="appointmentDate"
                value={patient.appointmentDate}
                onChange={handleChange}
                onFocus={() => setIsDateFocused(true)}
                onBlur={() => setIsDateFocused(false)}
                min={getMinDate()}
                className="w-full px-6 py-4 rounded-2xl border-none bg-[#e6f2ec] text-gray-800 shadow-[inset_6px_6px_12px_#c2d0c8,inset_-6px_-6px_12px_#ffffff] cursor-pointer"
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-orange-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              {/* Available dates helper - only show when date input is focused */}
              {isDateFocused &&
                selectedDoctor &&
                selectedDoctor.availableDays && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-1">
                        📅 Available Days:
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedDoctor.availableDays
                          .split(",")
                          .map((day, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {day.trim()}
                            </span>
                          ))}
                      </div>

                      {/* Quick date suggestions */}
                      <div className="mb-2">
                        <div className="font-semibold mb-1 text-xs">
                          ⚡ Quick Select (Next Available):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {getAvailableDates()
                            .slice(0, 5)
                            .map((date, index) => {
                              const dateObj = new Date(date);
                              const dayName = dateObj.toLocaleDateString(
                                "en-US",
                                { weekday: "short" }
                              );
                              const dateStr = dateObj.toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              );

                              return (
                                <button
                                  key={date}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking button
                                  onClick={() => {
                                    setPatient((prev) => ({
                                      ...prev,
                                      appointmentDate: date,
                                    }));
                                    setIsDateFocused(false); // Hide the helper after selection
                                  }}
                                  className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer"
                                >
                                  {dayName} {dateStr}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedDoctor}
              aria-pressed={clicked}
              className={`mt-4 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-lg shadow-[8px_8px_20px_#c2d0c8,-8px_-8px_20px_#ffffff] hover:from-green-700 hover:to-green-800 hover:shadow-[12px_12px_30px_#a8b8af,-12px_-12px_30px_#ffffff] active:shadow-[inset_4px_4px_8px_#4a5d4f,inset_-4px_-4px_8px_#6b8570] transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                clicked ? "scale-95" : "scale-100"
              } ${
                loading || !selectedDoctor
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:animate-pulse"
              } relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Book Appointment"
                )}
              </span>
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 flex justify-between text-center">
            <button
              onClick={() => router.push("/request-appointment/doctors")}
              className="group inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium text-base transition-all duration-300 hover:scale-105"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Choose Different Doctor
            </button>

            <button
              onClick={() => router.push("/")}
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-base transition-all duration-300 hover:scale-105"
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
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>
          </div>

          {/* Success Popup */}
          {success && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl p-8 shadow-[20px_20px_60px_rgba(0,0,0,0.3)] max-w-sm w-full text-center mx-4 transform animate-slideInUp border border-green-200">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Success!
                </h2>
                <p className="text-2xl text-gray-600 mb-4 leading-relaxed">
                  {success}
                </p>

                {/* Token Number Display - Only show when patientId is available */}
                {patientId && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-blue-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-blue-800">
                        Your Token Number
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mb-2">
                      #{patientId}
                    </div>
                    <p className="text-xs text-blue-600 font-medium">
                      💡 Remember this token ID for future uses
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const currentPatientId = patientId; // Store the current value
                      setSuccess(null);
                      setPatientId(null);
                      router.push(`/patient-status?token=${currentPatientId}`);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Check Status & Prescriptions
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(null);
                      setPatientId(null);
                      router.push("/");
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Popup */}
          {error && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-3xl p-8 shadow-[20px_20px_60px_rgba(0,0,0,0.3)] max-w-sm w-full text-center mx-4 transform animate-slideInUp border border-red-200">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Error
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
