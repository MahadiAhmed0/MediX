"use client";
import Header from "@/components/receptionist/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AddAppointmentPage() {
  const lowerNavBgColor = "#1F4604";
  const lowerNavTextColor = "#ffffff";
  const router = useRouter();
  const [clickedAdd, setClickedAdd] = useState(false);
  const [clickedClear, setClickedClear] = useState(false);
  const [clickedAddAppointment, setClickedAddAppointment] = useState(false);
  const [clickedRequests, setClickedRequests] = useState(false);
  const [clickedDoctor, setClickedDoctor] = useState(false);
  const [clickedVitals, setClickedVitals] = useState(false);
  const [clickedList, setClickedList] = useState(false);

  const searchParams = useSearchParams();
  const selectedDoctorFromQuery = searchParams?.get("doctor");
  const selectedDoctorIdFromQuery = searchParams?.get("doctorId");
  const selectedDoctorNameFromQuery = searchParams?.get("doctorName");

  // Authentication check
  useEffect(() => {
    const receptionistId = localStorage.getItem("receptionistId");
    if (!receptionistId || receptionistId.trim() === "") {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (selectedDoctorFromQuery) {
      setPatient((prev) => ({
        ...prev,
        doctor: selectedDoctorFromQuery,
      }));
    }

    // Handle new URL parameters from doctor selection
    if (selectedDoctorIdFromQuery && selectedDoctorNameFromQuery) {
      setPatient((prev) => ({
        ...prev,
        doctor: selectedDoctorIdFromQuery,
      }));
      setSearchTerm(decodeURIComponent(selectedDoctorNameFromQuery));

      // Find and set the selected doctor object
      fetch("http://localhost:8080/api/doctors")
        .then((res) => res.json())
        .then((data) => {
          const doctor = data.find(
            (d: any) => d.doctorId.toString() === selectedDoctorIdFromQuery
          );
          if (doctor) {
            setSelectedDoctor(doctor);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [
    selectedDoctorFromQuery,
    selectedDoctorIdFromQuery,
    selectedDoctorNameFromQuery,
  ]);

  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // First fetch available doctors
    fetch("http://localhost:8080/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        setAvailableDoctors(data);
        setFilteredDoctors(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter doctors based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoctors(availableDoctors);
    } else {
      const filtered = availableDoctors.filter(
        (doctor) =>
          doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.specialization &&
            doctor.specialization
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, availableDoctors]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const todayDate = new Date().toISOString().slice(0, 10);

  const [patient, setPatient] = useState({
    name: "",
    contact: "+88 ",
    appointmentDate: todayDate,
    doctor: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow letters and spaces, remove any other characters
    const lettersOnly = input.replace(/[^a-zA-Z\s]/g, "");

    // Update the patient name
    setPatient((prev) => ({ ...prev, name: lettersOnly }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setPatient((prev) => ({ ...prev, doctor: doctor.doctorId.toString() }));
    setSearchTerm(doctor.user.name);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedDoctor(null);
    setPatient((prev) => ({ ...prev, doctor: "" }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name length and content
    const nameOnly = patient.name.replace(/\s+/g, ""); // Remove spaces to count only letters
    if (nameOnly.length < 3) {
      alert("Name must be at least 3 letters long");
      return;
    }

    // Validate phone number length
    const phoneNumbers = patient.contact.replace(/^\+88\s?/, "");
    if (phoneNumbers.length !== 11) {
      alert("Phone number must be exactly 11 digits long");
      return;
    }

    // Trigger button press animation
    setClickedAdd(true);
    setTimeout(() => setClickedAdd(false), 150); // Reset animation

    try {
      let patientId;

      // Step 1 & 2: Check if patient exists by phone number
      const patientResponse = await fetch(
        `http://localhost:8080/api/patients/by-phone?phoneNumber=${patient.contact}`
      );

      console.log("Patient response status:", patientResponse.status);

      if (patientResponse.ok) {
        // Patient exists, get their ID
        const existingPatient = await patientResponse.json();
        patientId = existingPatient.id;
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
        patientId = newPatient.id;
        console.log("New patient created with ID:", patientId);
      } else {
        // Handle other errors
        console.error(
          "Failed to check for patient:",
          patientResponse.statusText
        );
        return;
      }

      // Step 4 & 5 is assumed: you have the doctorId
      if (!patient.doctor) {
        console.error("Doctor not selected");
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
        alert(
          "Duplicate appointment found! This patient already has an appointment with this doctor on this date."
        );
        return;
      }

      // Step 6: Create the appointment
      const appointmentData = {
        patientId: patientId,
        doctorId: parseInt(patient.doctor, 10), // This should now be a valid ID
        appointmentDate: patient.appointmentDate,
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
      } else {
        console.log("Appointment created successfully");
        // clearForm();
      }
    } catch (error) {
      console.error("Error in appointment creation process:", error);
    }

    router.push("/receptionist/appointment/vitals");
  };

  const clearForm = () => {
    // Trigger button press animation
    setClickedClear(true);
    setTimeout(() => setClickedClear(false), 150); // Reset animation

    setPatient({
      name: "",
      contact: "+88 ",
      appointmentDate: todayDate,
      doctor: "",
    });

    // Clear search related state
    setSearchTerm("");
    setSelectedDoctor(null);
    setShowDropdown(false);
  };

  const handleNavClick = (navType: string) => {
    // Trigger button press animation based on nav type
    switch (navType) {
      case "addAppointment":
        setClickedAddAppointment(true);
        setTimeout(() => setClickedAddAppointment(false), 150);
        break;
      case "requests":
        setClickedRequests(true);
        setTimeout(() => setClickedRequests(false), 150);
        break;
      case "doctor":
        setClickedDoctor(true);
        setTimeout(() => setClickedDoctor(false), 150);
        break;
      case "vitals":
        setClickedVitals(true);
        setTimeout(() => setClickedVitals(false), 150);
        break;
      case "list":
        setClickedList(true);
        setTimeout(() => setClickedList(false), 150);
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />

      {/* Subheader / Navigation Tabs */}
      <nav className="bg-green-100/60 backdrop-blur-sm rounded-2xl shadow-sm py-5 px-6 sm:px-10 lg:px-16 text-center border border-green-300 max-w-7xl mx-auto mt-2 mb-6">
        <div className="flex justify-center gap-6 text-green-800 font-semibold text-lg select-none transition-all duration-500">
          <Link
            href="/receptionist/appointment"
            onClick={() => handleNavClick("requests")}
            className={`px-4 py-2 rounded-lg transition transform ${
              usePathname() === "/receptionist/appointment"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedRequests ? "scale-95" : "scale-100"}`}
          >
            Appointment Requests
          </Link>
          <Link
            href="/receptionist/appointment/add"
            onClick={() => handleNavClick("addAppointment")}
            className={`px-4 py-2 rounded-lg transition transform ${
              usePathname() === "/receptionist/appointment/add"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedAddAppointment ? "scale-95" : "scale-100"}`}
          >
            Add Appointment
          </Link>
          <Link
            href="/receptionist/appointment/doctor"
            onClick={() => handleNavClick("doctor")}
            className={`px-4 py-2 rounded-lg transition transform ${
              usePathname() === "/receptionist/appointment/doctor"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedDoctor ? "scale-95" : "scale-100"}`}
          >
            Doctor
          </Link>
          <Link
            href="/receptionist/appointment/vitals"
            onClick={() => handleNavClick("vitals")}
            className={`px-4 py-2 rounded-lg transition transform ${
              usePathname() === "/receptionist/appointment/vitals"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedVitals ? "scale-95" : "scale-100"}`}
          >
            Vitals Entry
          </Link>
          <Link
            href="/receptionist/appointment/list"
            onClick={() => handleNavClick("list")}
            className={`px-4 py-2 rounded-lg transition transform ${
              usePathname() === "/receptionist/appointment/list"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedList ? "scale-95" : "scale-100"}`}
          >
            Appointment List
          </Link>
        </div>
      </nav>

      {/* Body Content */}
      <main className="flex-grow bg-[#f2fff7] text-gray-900 rounded-t-3xl shadow-inner mx-6 mb-10 p-10  mx-[420px]">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Patient Info
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 max-w-md mx-auto space-y-6 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff]"
        >
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Patient Name"
              required
              value={patient.name}
              onChange={handleNameChange}
              className="w-full p-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c2d0c8,inset_-2px_-2px_4px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {patient.name.length > 0 &&
              patient.name.replace(/\s+/g, "").length < 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm">
                  Min 3 letters
                </div>
              )}
          </div>

          <div className="relative">
            <input
              type="tel"
              name="contact"
              placeholder="+88 01XXXXXXXXX"
              required
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
              className="w-full p-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c2d0c8,inset_-2px_-2px_4px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {patient.contact.replace(/^\+88\s?/, "").length > 0 &&
              patient.contact.replace(/^\+88\s?/, "").length !== 11 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-sm">
                  Must be 11 digits
                </div>
              )}
          </div>

          {/* Doctor Search */}
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a doctor..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                required={!selectedDoctor}
                className="w-full p-3 pl-10 pr-10 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c2d0c8,inset_-2px_-2px_4px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              {/* Search Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Clear Button */}
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.doctorId}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                        {doctor.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {doctor.user.name}
                        </div>
                        {doctor.specialization && (
                          <div className="text-sm text-gray-500">
                            {doctor.specialization}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    No doctors found
                  </div>
                )}
              </div>
            )}

            {/* Selected Doctor Display */}
            {selectedDoctor && !showDropdown && (
              <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                    {selectedDoctor.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedDoctor.user.name}
                    </div>
                    {selectedDoctor.specialization && (
                      <div className="text-sm text-gray-500">
                        {selectedDoctor.specialization}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <input
            type="date"
            name="appointmentDate"
            required
            value={patient.appointmentDate || ""}
            onChange={handleChange}
            min={todayDate}
            className="w-full p-3 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c2d0c8,inset_-2px_-2px_4px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="flex justify-between gap-6">
            <button
              type="submit"
              aria-pressed={clickedAdd}
              className={`flex-1 bg-[#e0e5ec] text-green-800 font-semibold py-3 rounded-xl shadow-[6px_6px_10px_#c2c8d0,-6px_-6px_10px_#ffffff] hover:bg-green-100 transition duration-500 transform ${
                clickedAdd ? "scale-95" : "scale-100"
              }`}
            >
              Add Appointment
            </button>
            <button
              type="button"
              onClick={clearForm}
              aria-pressed={clickedClear}
              className={`flex-1 bg-[#e0e5ec] text-red-700 font-semibold py-3 rounded-xl shadow-[6px_6px_10px_#c2c8d0,-6px_-6px_10px_#ffffff] hover:bg-red-100 transition duration-500 transform ${
                clickedClear ? "scale-95" : "scale-100"
              }`}
            >
              Clear
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
