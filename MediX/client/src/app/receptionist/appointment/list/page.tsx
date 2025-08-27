"use client";
import Header from "@/components/receptionist/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AppointmentPage() {
  const lowerNavBgColor = "#1F4604";
  const lowerNavTextColor = "#ffffff";

  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "upcoming">(
    "today"
  );
  const [showOldAppointments, setShowOldAppointments] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [clickedShowMore, setClickedShowMore] = useState<number | null>(null);
  const [clickedEnterVitals, setClickedEnterVitals] = useState<number | null>(
    null
  );
  const [clickedApprove, setClickedApprove] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [clickedRequests, setClickedRequests] = useState(false);
  const [clickedAddAppointment, setClickedAddAppointment] = useState(false);
  const [clickedDoctor, setClickedDoctor] = useState(false);
  const [clickedVitals, setClickedVitals] = useState(false);
  const [clickedList, setClickedList] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] =
    useState<any>(null);
  const [vitals, setVitals] = useState({
    age: "",
    gender: "",
    weight: "",
    pressure1: "",
    pressure2: "",
  });
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const receptionistId = localStorage.getItem("receptionistId");
    if (!receptionistId || receptionistId.trim() === "") {
      router.push("/");
      return;
    }
  }, [router]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:8080/api/appointments/with-details",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const displayedAppointments = appointments.filter(
    (appt) =>
      appt.status === "READY" ||
      appt.status === "NOT_READY" ||
      appt.status === "REQUESTED" ||
      appt.status === "DONE"
  );

  const rows = displayedAppointments.map((appt) => ({
    ...appt,
    patientName: appt.patientName || "",
    patientPhone: appt.patientPhone || "",
    doctorName: appt.doctorName || "",
    appointmentDate: appt.appointmentDate,
    age: appt.age,
    gender: appt.gender,
    weight: appt.weight,
    pressure: appt.pressure,
  }));

  // Helper functions for date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  };

  const isFuture = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() >= today.getTime();
  };

  const isOld = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() < today.getTime();
  };

  // Helper function to calculate daily serial numbers for current/future appointments
  const calculateDailySerials = (rows: any[]) => {
    // Group appointments by date
    const appointmentsByDate = rows.reduce((acc, row) => {
      const date = row.appointmentDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(row);
      return acc;
    }, {} as Record<string, any[]>);

    // Assign daily serial numbers for each date
    const rowsWithDailySerial = [...rows];

    Object.keys(appointmentsByDate).forEach((date) => {
      // Sort appointments for this date by their original serial number (id)
      const appointmentsForDate = appointmentsByDate[date].sort(
        (a: any, b: any) => a.id - b.id
      );

      // Assign daily serial numbers starting from 1
      appointmentsForDate.forEach((appointment: any, index: number) => {
        const rowIndex = rowsWithDailySerial.findIndex(
          (r) => r.id === appointment.id
        );
        if (rowIndex !== -1) {
          rowsWithDailySerial[rowIndex] = {
            ...rowsWithDailySerial[rowIndex],
            dailySerial: index + 1,
          };
        }
      });
    });

    return rowsWithDailySerial;
  };

  // Separate appointments into current/future and old
  const currentAndFutureRows = rows.filter((r) => isFuture(r.appointmentDate));
  const oldRows = rows.filter((r) => isOld(r.appointmentDate));

  // Apply date filter to current/future appointments
  const getFilteredCurrentRows = () => {
    let filtered = currentAndFutureRows;

    if (dateFilter === "today") {
      filtered = currentAndFutureRows.filter((r) => isToday(r.appointmentDate));
    } else if (dateFilter === "upcoming") {
      filtered = currentAndFutureRows.filter(
        (r) => !isToday(r.appointmentDate) && isFuture(r.appointmentDate)
      );
    }

    // Apply search filter
    return filtered.filter(
      (r) =>
        r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        r.patientPhone?.includes(search) ||
        r.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toString().includes(search)
    );
  };

  // Apply search filter to old appointments
  const getFilteredOldRows = () => {
    return oldRows.filter(
      (r) =>
        r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        r.patientPhone?.includes(search) ||
        r.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toString().includes(search)
    );
  };

  const filteredCurrentRows = getFilteredCurrentRows();
  const filteredOldRows = getFilteredOldRows();

  // Sort appointments by date (most recent first for current, oldest first for old)
  const sortedCurrentRows = [...filteredCurrentRows].sort(
    (a, b) =>
      new Date(a.appointmentDate).getTime() -
      new Date(b.appointmentDate).getTime()
  );

  // Calculate daily serial numbers for current/future appointments
  const currentRowsWithDailySerial = calculateDailySerials(sortedCurrentRows);

  const sortedOldRows = [...filteredOldRows].sort(
    (a, b) =>
      new Date(b.appointmentDate).getTime() -
      new Date(a.appointmentDate).getTime()
  );

  const handleShowMore = (row: any) => {
    // Trigger button press animation
    setClickedShowMore(row.id);
    setTimeout(() => setClickedShowMore(null), 150); // Reset animation

    setSelectedAppointment(row);
    setShowModal(true);
  };

  const handleEnterVitals = (row: any) => {
    // Trigger button press animation
    setClickedEnterVitals(row.id);
    setTimeout(() => setClickedEnterVitals(null), 150); // Reset animation

    // Open vitals modal instead of redirecting
    setSelectedPatientForVitals(row);
    setShowVitalsModal(true);
  };

  const handleApprove = async (row: any) => {
    // Trigger button press animation
    setClickedApprove(row.id);
    setTimeout(() => setClickedApprove(null), 150); // Reset animation

    setApprovingId(row.id);

    try {
      // Update appointment status from REQUESTED to NOT_READY
      const response = await fetch(
        `http://localhost:8080/api/appointments/${row.patientId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "NOT_READY" }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to approve appointment: ${response.status}`);
      }

      console.log("Appointment approved successfully");

      // Show success message
      setSuccessMessage("Appointment approved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds

      // Refresh the appointments list to reflect the status change
      await fetchAppointments();
    } catch (err) {
      console.error("Error approving appointment:", err);
      setError(
        err instanceof Error ? err.message : "Failed to approve appointment"
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleVitalsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientForVitals) return;

    setApprovingId(selectedPatientForVitals.id); // Use existing loading state

    try {
      // Build request payload
      const payload = {
        age: parseInt(vitals.age, 10),
        gender: vitals.gender,
        weight: parseFloat(vitals.weight),
        bloodPressure: `${vitals.pressure1}/${vitals.pressure2}`,
      };

      console.log(
        "PUT vitals for patient",
        selectedPatientForVitals.patientId,
        payload
      );

      // First, update the patient with vitals data
      const res = await fetch(
        `http://localhost:8080/api/patients/${selectedPatientForVitals.patientId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to save vitals:", res.status, errorText);
        throw new Error(`Failed to save vitals: ${res.status}`);
      }

      console.log(
        "Vitals saved for:",
        selectedPatientForVitals.patientName,
        payload
      );

      // Then, update the appointment status to READY
      const statusRes = await fetch(
        `http://localhost:8080/api/appointments/${selectedPatientForVitals.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READY" }),
        }
      );

      if (!statusRes.ok) {
        const errorText = await statusRes.text();
        console.error(
          "Failed to update appointment status:",
          statusRes.status,
          errorText
        );
        throw new Error(
          `Failed to update appointment status: ${statusRes.status}`
        );
      }

      console.log("Appointment status set to READY");

      // Show success message
      setSuccessMessage(
        "Vitals saved and appointment status updated successfully!"
      );
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh the appointments list
      await fetchAppointments();

      // Clear form and close modal
      clearVitalsForm();
      setShowVitalsModal(false);
      setSelectedPatientForVitals(null);
    } catch (err: any) {
      console.error("Error in vitals submission:", err);
      setError(`Failed to save vitals: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  const clearVitalsForm = () => {
    setVitals({
      age: "",
      gender: "",
      weight: "",
      pressure1: "",
      pressure2: "",
    });
  };

  const handleCloseVitalsModal = () => {
    clearVitalsForm();
    setShowVitalsModal(false);
    setSelectedPatientForVitals(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleNavClick = (navType: string) => {
    // Trigger button press animation based on nav type
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays === -1) {
      return "Yesterday";
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    }
  };

  // Helper function to render table rows
  const renderTableRows = (
    rows: any[],
    useDailySerial: boolean = false,
    isOldAppointments: boolean = false
  ) => {
    return rows.map((row: any) => (
      <tr
        key={row.id}
        className="hover:bg-green-50 cursor-pointer transition duration-200"
      >
        <td className="p-3 border border-gray-200">{row.patientId}</td>
        <td className="p-3 border border-gray-200">{row.patientName}</td>
        <td className="p-3 border border-gray-200">{row.patientPhone}</td>
        <td className="p-3 border border-gray-200">{row.doctorName}</td>
        <td className="p-3 border border-gray-200">
          <div className="flex flex-col items-center">
            <span className=" text-lg">
              {useDailySerial ? row.dailySerial : row.id}
            </span>
          </div>
        </td>
        <td className="p-3 border border-gray-200">
          <div className="flex flex-col">
            <span className="font-medium">
              {formatDate(row.appointmentDate)}
            </span>
            <span className="text-xs text-gray-500">{row.appointmentDate}</span>
          </div>
        </td>
        <td className="p-3 border border-gray-200">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              row.status === "READY"
                ? "bg-green-100 text-green-800"
                : row.status === "NOT_READY"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {row.status === "READY"
              ? "Ready"
              : row.status === "NOT_READY"
              ? "Not Ready"
              : row.status === "REQUESTED"
              ? "Requested"
              : "Done"}
          </span>
        </td>
        <td className="p-3 border border-gray-200">
          {row.status === "READY" || row.status === "DONE" ? (
            <button
              onClick={() => handleShowMore(row)}
              aria-pressed={clickedShowMore === row.id}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow-[3px_3px_8px_#bfc5cc,-3px_-3px_8px_#ffffff] transition transform ${
                clickedShowMore === row.id ? "scale-95" : "scale-100"
              }`}
            >
              Show Vitals
            </button>
          ) : row.status === "NOT_READY" ? (
            isOldAppointments ? (
              <div className="flex items-center justify-center px-5 py-2">
                <span className="text-gray-500 text-sm font-medium">
                  Vitals Missing
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleEnterVitals(row)}
                aria-pressed={clickedEnterVitals === row.id}
                className={`bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl shadow-[3px_3px_8px_#bfc5cc,-3px_-3px_8px_#ffffff] transition transform ${
                  clickedEnterVitals === row.id ? "scale-95" : "scale-100"
                }`}
              >
                Enter Vitals
              </button>
            )
          ) : isOldAppointments ? (
            <div className="flex items-center justify-center px-5 py-2">
              <span className="text-gray-400 text-sm">Past Appointment</span>
            </div>
          ) : (
            <button
              onClick={() => handleApprove(row)}
              disabled={approvingId === row.id}
              aria-pressed={clickedApprove === row.id}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl shadow-[3px_3px_8px_#bfc5cc,-3px_-3px_8px_#ffffff] transition transform ${
                clickedApprove === row.id ? "scale-95" : "scale-100"
              } ${
                approvingId === row.id ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {approvingId === row.id ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                "Approve"
              )}
            </button>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />

      {/* Subheader */}
      <nav className="bg-green-100/60 backdrop-blur-sm rounded-2xl shadow-sm py-5 px-6 sm:px-10 lg:px-16 text-center border border-green-300 max-w-7xl mx-auto mt-2 mb-6">
        <div className="flex justify-center gap-6 text-green-800 font-semibold text-lg select-none transition-all duration-500">
          {[
            ["Appointment Requests", "/receptionist/appointment"],
            ["Add Appointment", "/receptionist/appointment/add"],
            ["Doctor", "/receptionist/appointment/doctor"],
            ["Vitals Entry", "/receptionist/appointment/vitals"],
            ["Appointment List", "/receptionist/appointment/list"],
          ].map(([label, path]) => (
            <Link
              key={path}
              href={path}
              onClick={() =>
                handleNavClick(
                  path === "/receptionist/appointment"
                    ? "requests"
                    : path === "/receptionist/appointment/add"
                    ? "addAppointment"
                    : path === "/receptionist/appointment/doctor"
                    ? "doctor"
                    : path === "/receptionist/appointment/vitals"
                    ? "vitals"
                    : "list"
                )
              }
              className={`px-4 py-2 rounded-lg transition transform ${
                usePathname() === path
                  ? "bg-green-700/80 text-white shadow-lg"
                  : "hover:bg-green-600/40"
              } ${
                (path === "/receptionist/appointment" && clickedRequests) ||
                (path === "/receptionist/appointment/add" &&
                  clickedAddAppointment) ||
                (path === "/receptionist/appointment/doctor" &&
                  clickedDoctor) ||
                (path === "/receptionist/appointment/vitals" &&
                  clickedVitals) ||
                (path === "/receptionist/appointment/list" && clickedList)
                  ? "scale-95"
                  : "scale-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-grow px-6 sm:px-12 pb-12">
        {/* Search and Filter */}
        <div className="flex justify-between items-end mb-10 px-4">
          {/* Date Filter - Left Side */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2">
              Date Filter
            </label>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "today", label: "Today" },
                { value: "upcoming", label: "Upcoming" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setDateFilter(option.value as "all" | "today" | "upcoming")
                  }
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 min-w-[80px] ${
                    dateFilter === option.value
                      ? "bg-green-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 shadow-[inset_2px_2px_4px_#c0c5cc,inset_-2px_-2px_4px_#ffffff] hover:bg-green-50"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        dateFilter === option.value
                          ? "border-white"
                          : "border-gray-400"
                      }`}
                    >
                      {dateFilter === option.value && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search Box - Center */}
          <div className="flex flex-col flex-1 max-w-lg mx-auto">
            <label
              htmlFor="search"
              className="text-gray-700 font-semibold mb-2 text-center"
            >
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients"
              className="w-full p-4 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c0c5cc,inset_-2px_-2px_4px_#ffffff] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Empty div for balance - Right Side */}
          <div className="w-[240px]"></div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
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
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Success Display */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-green-800 font-semibold">Success</h3>
                <p className="text-green-600">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-500 hover:text-green-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Current/Future Appointments Table */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>Current & Upcoming Appointments</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              {currentRowsWithDailySerial.length} appointments
            </span>
            {dateFilter === "today" && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Today only
              </span>
            )}
            {dateFilter === "upcoming" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                Upcoming only
              </span>
            )}
          </h2>

          {/* Quick Stats */}
          {!loading && currentRowsWithDailySerial.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {
                    currentRowsWithDailySerial.filter(
                      (r) => r.status === "REQUESTED"
                    ).length
                  }
                </div>
                <div className="text-sm text-blue-700">Requested</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    currentRowsWithDailySerial.filter(
                      (r) => r.status === "NOT_READY"
                    ).length
                  }
                </div>
                <div className="text-sm text-yellow-700">Not Ready</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    currentRowsWithDailySerial.filter(
                      (r) => r.status === "READY"
                    ).length
                  }
                </div>
                <div className="text-sm text-green-700">Ready</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {
                    currentRowsWithDailySerial.filter((r) =>
                      isToday(r.appointmentDate)
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-700">Today</div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">
                  Loading appointments...
                </p>
              </div>
            </div>
          ) : currentRowsWithDailySerial.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No appointments found
                </h3>
                <p className="text-gray-500">
                  {dateFilter === "today"
                    ? "No appointments scheduled for today"
                    : dateFilter === "upcoming"
                    ? "No upcoming appointments scheduled"
                    : search
                    ? "No appointments match your search criteria"
                    : "No current or upcoming appointments"}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-center text-gray-800">
              <thead className="bg-green-700 text-white text-md select-none">
                <tr>
                  {[
                    "Patient ID",
                    "Patient Name",
                    "Phone",
                    "Doctor Name",
                    "Serial",
                    "Date",
                    "Status",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="p-3 border border-green-600 whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderTableRows(currentRowsWithDailySerial, true, false)}
              </tbody>
            </table>
          )}
        </div>

        {/* Old Appointments Section */}
        {sortedOldRows.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowOldAppointments(!showOldAppointments)}
              className="flex items-center justify-between w-full p-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Old Appointments ({sortedOldRows.length})
                </h3>
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                  Past dates
                </span>
              </div>
              <svg
                className={`w-6 h-6 text-gray-600 transform transition-transform duration-200 ${
                  showOldAppointments ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showOldAppointments && (
              <div className="mt-4 overflow-x-auto border border-gray-200 rounded-2xl shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff]">
                <table className="w-full text-center text-gray-800">
                  <thead className="bg-gray-600 text-white text-md select-none">
                    <tr>
                      {[
                        "Patient ID",
                        "Patient Name",
                        "Phone",
                        "Doctor Name",
                        "Serial #",
                        "Date",
                        "Status",
                        "Action",
                      ].map((header) => (
                        <th
                          key={header}
                          className="p-3 border border-gray-500 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{renderTableRows(sortedOldRows, false, true)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white text-gray-800 p-6 rounded-3xl w-full max-w-md relative">
              <button
                className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-6 text-center text-green-800">
                Patient Details
              </h2>
              <div className="space-y-4 text-base">
                <div>
                  <span className="font-semibold">Age:</span>{" "}
                  {selectedAppointment.age}
                </div>
                <div>
                  <span className="font-semibold">Gender:</span>{" "}
                  {selectedAppointment.gender}
                </div>
                <div>
                  <span className="font-semibold">Weight:</span>{" "}
                  {selectedAppointment.weight}
                </div>
                <div>
                  <span className="font-semibold">Pressure:</span>{" "}
                  {selectedAppointment.pressure}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vitals Entry Modal */}
        {showVitalsModal && selectedPatientForVitals && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
                Enter Vitals for {selectedPatientForVitals.patientName}
              </h2>

              <form onSubmit={handleVitalsSubmit} className="space-y-5">
                {/* Age Field */}
                <div>
                  <label className="mb-2 text-sm font-medium text-gray-700 block">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    placeholder="Age"
                    value={vitals.age}
                    onChange={handleVitalsChange}
                    className="w-full p-3 rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Gender Field */}
                <div>
                  <label className="mb-2 text-sm font-medium text-gray-700 block">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={vitals.gender}
                    onChange={handleVitalsChange}
                    required
                    className="w-full p-3 rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Weight Field */}
                <div>
                  <label className="mb-2 text-sm font-medium text-gray-700 block">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    required
                    placeholder="Weight"
                    value={vitals.weight}
                    onChange={handleVitalsChange}
                    className="w-full p-3 rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Blood Pressure Field */}
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-medium text-gray-700">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="pressure1"
                      value={vitals.pressure1}
                      onChange={handleVitalsChange}
                      required
                      placeholder="120"
                      min="0"
                      className="flex-1 p-3 w-[50px] rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    />
                    <span className="text-gray-600 font-semibold">/</span>
                    <input
                      type="number"
                      name="pressure2"
                      value={vitals.pressure2}
                      onChange={handleVitalsChange}
                      required
                      placeholder="80"
                      min="0"
                      className="flex-1 p-3 w-[50px] rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-2 gap-4">
                  <button
                    type="submit"
                    disabled={approvingId === selectedPatientForVitals.id}
                    className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-[4px_4px_8px_#bfc5cc,-4px_-4px_8px_#ffffff] transition ${
                      approvingId === selectedPatientForVitals.id
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {approvingId === selectedPatientForVitals.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseVitalsModal}
                    disabled={approvingId === selectedPatientForVitals.id}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-[4px_4px_8px_#bfc5cc,-4px_-4px_8px_#ffffff] transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
