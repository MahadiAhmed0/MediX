"use client";
import Header from "@/components/receptionist/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface AppointmentRequest {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  status: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
}

export default function AppointmentPage() {
  const pathname = usePathname();
  const [appointmentRequests, setAppointmentRequests] = useState<
    AppointmentRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  // Navigation animation states
  const [clickedRequests, setClickedRequests] = useState(false);
  const [clickedAddAppointment, setClickedAddAppointment] = useState(false);
  const [clickedDoctor, setClickedDoctor] = useState(false);
  const [clickedVitals, setClickedVitals] = useState(false);
  const [clickedList, setClickedList] = useState(false);

  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const receptionistId = localStorage.getItem("receptionistId");
    if (!receptionistId || receptionistId.trim() === "") {
      router.push("/");
      return;
    }
  }, [router]);

  // Fetch appointment requests
  useEffect(() => {
    fetchAppointmentRequests();
  }, []);

  const fetchAppointmentRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8080/api/appointments/with-details"
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }

      const data = await response.json();

      // Filter only REQUESTED appointments
      const requestedAppointments = data.filter(
        (appointment: AppointmentRequest) => appointment.status === "REQUESTED"
      );

      setAppointmentRequests(requestedAppointments);
    } catch (err) {
      console.error("Error fetching appointment requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch appointment requests"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments: only today or future, then search
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredRequests = appointmentRequests
    .filter((request) => {
      const reqDate = new Date(request.appointmentDate);
      reqDate.setHours(0, 0, 0, 0);
      return reqDate >= today;
    })
    .filter(
      (request) =>
        request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.patientPhone.includes(searchTerm) ||
        request.appointmentDate.includes(searchTerm)
    );

  // Handle appointment confirmation
  const handleConfirmAppointment = async (
    appointmentId: number,
    patientId: number
  ) => {
    setConfirmingId(appointmentId);

    try {
      // Update appointment status from REQUESTED to NOT_READY
      const response = await fetch(
        `http://localhost:8080/api/appointments/${patientId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "NOT_READY" }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to confirm appointment: ${response.status}`);
      }

      console.log("Appointment confirmed successfully");

      // Refresh the list
      await fetchAppointmentRequests();

      // Redirect to vitals page
      router.push("/receptionist/appointment/vitals");
    } catch (err) {
      console.error("Error confirming appointment:", err);
      setError(
        err instanceof Error ? err.message : "Failed to confirm appointment"
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const handleNavClick = (navType: string) => {
    switch (navType) {
      case "requests":
        setClickedRequests(true);
        setTimeout(() => setClickedRequests(false), 150);
        break;
      case "addAppointment":
        setClickedAddAppointment(true);
        setTimeout(() => setClickedAddAppointment(false), 150);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });
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
              pathname === "/receptionist/appointment"
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
              pathname === "/receptionist/appointment/add"
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
              pathname === "/receptionist/appointment/doctor"
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
              pathname === "/receptionist/appointment/vitals"
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
              pathname === "/receptionist/appointment/list"
                ? "bg-green-700/80 text-white shadow-lg"
                : "hover:bg-green-600/40"
            } ${clickedList ? "scale-95" : "scale-100"}`}
          >
            Appointment List
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-[#f2fff7] text-gray-900 rounded-t-3xl shadow-inner mb-10 p-10 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 text-center">
            Appointment Requests
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Review and confirm patient appointment requests
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient name, doctor, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c2d0c8,inset_-2px_-2px_4px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">
              Loading appointment requests...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff] text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {appointmentRequests.length}
                </div>
                <div className="text-gray-600">Total Requests</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff] text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {filteredRequests.length}
                </div>
                <div className="text-gray-600">Filtered Results</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff] text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {
                    appointmentRequests.filter(
                      (req) =>
                        new Date(req.appointmentDate).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </div>
                <div className="text-gray-600">Today's Requests</div>
              </div>
            </div>

            {/* Appointment Requests List */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No appointment requests found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No pending appointment requests at the moment"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.appointmentId}
                    className="bg-white rounded-xl p-6 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff] hover:shadow-[8px_8px_20px_#c2d0c8,-8px_-8px_20px_#ffffff] transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                      {/* Patient Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">
                              {request.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {request.patientName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.patientPhone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {request.doctorName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.doctorPhone}
                        </p>
                      </div>

                      {/* Appointment Date */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {formatDate(request.appointmentDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            {request.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            handleConfirmAppointment(
                              request.appointmentId,
                              request.patientId
                            )
                          }
                          disabled={confirmingId === request.appointmentId}
                          className={`px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-[4px_4px_8px_#c2d0c8,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#a8b8af,-6px_-6px_12px_#ffffff] transition-all duration-300 transform hover:scale-105 ${
                            confirmingId === request.appointmentId
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {confirmingId === request.appointmentId ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Confirming...</span>
                            </div>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 inline mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Confirm Appointment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
