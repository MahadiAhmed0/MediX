"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  status: "READY" | "NOT_READY" | "DONE" | "REQUESTED";
}

interface Medicine {
  id: number;
  medicineName: string;
  morningDose: number;
  afternoonDose: number;
  eveningDose: number;
  comment: string;
}

interface PrescriptionMedicineResponse {
  success: boolean;
  message: string;
  data: Medicine[];
}

interface PatientInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  weight: number;
  bloodPressure: string;
}

interface DoctorQualification {
  id: {
    doctorId: number;
    qualificationId: number;
  };
  qualification: {
    id: number;
    name: string;
  };
}

interface DoctorSpecialization {
  id: {
    doctorId: number;
    specializationId: number;
  };
  specialization: {
    id: number;
    name: string;
  };
}

interface DoctorInfo {
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
  qualifications: DoctorQualification[];
  specializations: DoctorSpecialization[];
}

interface Prescription {
  id: number;
  patientId: number;
  doctorId: number;
  prescriptionDate: string;
  chiefComplaint: string;
  medicines?: Medicine[];
}

interface PrescriptionResponse {
  success: boolean;
  message: string;
  data: Prescription[];
}

export default function PatientStatusPage() {
  const [patientId, setPatientId] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<"appointments" | "prescriptions">(
    "appointments"
  );
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<
    Medicine[]
  >([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const searchParams = useSearchParams();

  // Auto-fill token and search if token is provided in URL
  useEffect(() => {
    const token = searchParams?.get("token");
    if (token) {
      setPatientId(token);
      setShowWelcomeMessage(true);
      // Auto-trigger search after a small delay to ensure state is updated
      setTimeout(() => {
        handleSearchWithToken(token);
      }, 100);
      // Hide welcome message after 5 seconds
      setTimeout(() => {
        setShowWelcomeMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  // Fetch patient info by patientId
  const fetchAndSetPatientInfo = async (patientId: string) => {
    try {
      const patientResponse = await fetch(
        `http://localhost:8080/api/patients/${patientId}`
      );
      if (patientResponse.ok) {
        const patientData: PatientInfo = await patientResponse.json();
        setPatientInfo(patientData);
      } else {
        setPatientInfo(null);
      }
    } catch (error) {
      setPatientInfo(null);
    }
  };

  const handleSearchWithToken = async (tokenId: string) => {
    if (!tokenId.trim()) {
      setError("Please enter your token number");
      return;
    }

    setLoading(true);
    setError("");
    setShowResults(false);

    try {
      // Fetch patient info
      await fetchAndSetPatientInfo(tokenId);

      // Fetch appointments
      const appointmentsResponse = await fetch(
        `http://localhost:8080/api/appointments/patient/${tokenId}`
      );
      if (!appointmentsResponse.ok) {
        throw new Error("Failed to fetch appointments");
      }
      console.log("Fetching appointments for patient ID:", tokenId);
      const appointmentsData = await appointmentsResponse.json();
      console.log("Appointments Data:", appointmentsData);
      setAppointments(appointmentsData);

      // Check if any appointment has "DONE" status to fetch prescriptions
      const hasDoneAppointments = appointmentsData.some(
        (apt: Appointment) => apt.status === "DONE"
      );

      if (hasDoneAppointments) {
        try {
          const prescriptionsResponse = await fetch(
            `http://localhost:8080/api/prescriptions/patient/${tokenId}`
          );
          if (prescriptionsResponse.ok) {
            const prescriptionsData: PrescriptionResponse =
              await prescriptionsResponse.json();
            setPrescriptions(prescriptionsData.data || []);
          }
        } catch (prescError) {
          console.warn("Could not fetch prescriptions:", prescError);
          setPrescriptions([]);
        }
      } else {
        setPrescriptions([]);
      }

      setShowResults(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await handleSearchWithToken(patientId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY":
        return "bg-blue-100 text-blue-800";
      case "NOT_READY":
        return "bg-green-100 text-green-800";
      case "DONE":
        return "bg-purple-100 text-purple-800";
      case "REQUESTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return 1;
      case "NOT_READY":
        return 2;
      case "READY":
        return 3;
      case "DONE":
        return 4;
      default:
        return 1;
    }
  };

  const progressSteps = [
    { id: 1, name: "Requested", icon: "📝" },
    { id: 2, name: "Accepted", icon: "✅" },
    { id: 3, name: "In Progress", icon: "⚕️" },
    { id: 4, name: "Completed", icon: "🎉" },
  ];

  const ProgressTracker = ({ status }: { status: string }) => {
    const currentStep = getStatusProgress(status);

    return (
      <div className="w-full py-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
        <div className="max-w-4xl mx-auto px-6">
          {/* Progress Steps */}
          <div className="grid grid-cols-4 gap-4">
            {progressSteps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step Circle */}
                <div className="relative mb-3">
                  {step.id <= currentStep ? (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
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
                  ) : (
                    <div className="w-16 h-16 rounded-full border-3 border-gray-300 bg-gray-100 flex items-center justify-center transition-all duration-300">
                      <span className="text-xl font-bold text-gray-400">
                        {step.id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step Info */}
                <div className="text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3
                    className={`text-sm font-semibold ${
                      step.id <= currentStep
                        ? "text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </h3>
                  {step.id === currentStep && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="ml-1 text-xs text-green-600 font-medium">
                        Current
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mt-6">
            <div
              className={`px-6 py-3 rounded-full font-semibold text-sm shadow-md ${getStatusColor(
                status
              )}`}
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                Status: {status === "NOT_READY" ? "ACCEPTED" : status}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasDoneAppointments = appointments.some((apt) => apt.status === "DONE");

  const handleViewPrescription = async (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
    setLoadingModal(true);

    try {
      // Fetch prescription medicines
      const medicinesResponse = await fetch(
        `http://localhost:8080/api/prescriptions/${prescription.id}/medicines`
      );
      if (medicinesResponse.ok) {
        const medicinesData: PrescriptionMedicineResponse =
          await medicinesResponse.json();
        setPrescriptionMedicines(medicinesData.data || []);
      } else {
        setPrescriptionMedicines([]);
      }

      // Fetch patient info
      const patientResponse = await fetch(
        `http://localhost:8080/api/patients/${prescription.patientId}`
      );
      if (patientResponse.ok) {
        const patientData: PatientInfo = await patientResponse.json();
        setPatientInfo(patientData);
      } else {
        setPatientInfo(null);
      }

      // Fetch doctor info
      const doctorResponse = await fetch(
        `http://localhost:8080/api/doctors/${prescription.doctorId}`
      );
      if (doctorResponse.ok) {
        const doctorData: DoctorInfo = await doctorResponse.json();
        setDoctorInfo(doctorData);
      } else {
        setDoctorInfo(null);
      }
    } catch (error) {
      console.warn("Error fetching prescription details:", error);
      setPrescriptionMedicines([]);
      setPatientInfo(null);
      setDoctorInfo(null);
    } finally {
      setLoadingModal(false);
    }
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
    setPrescriptionMedicines([]);
    setPatientInfo(null);
    setDoctorInfo(null);
    setLoadingModal(false);
  };

  const PrescriptionModal = () => {
    if (!selectedPrescription) return null;

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-20">
            <h2 className="text-2xl font-bold text-gray-900">
              Prescription #{selectedPrescription.id}
            </h2>
            <button
              onClick={closePrescriptionModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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

          {/* Prescription Preview - Same as Doctor's Preview */}
          <div className="p-6 flex flex-col items-center justify-center">
            {loadingModal ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading prescription details...
                </span>
              </div>
            ) : (
              <>
                <div className="relative w-[794px] h-[1123px] mx-auto bg-white">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-400 rounded-b-xl shadow-md z-10 border-t-4 border-gray-600"></div>
                  <img
                    src="/Prescription.png"
                    alt="Prescription Background"
                    className="absolute w-full h-full object-cover z-0"
                  />

                  {/* Doctor Info */}
                  <div className="absolute left-[410px] top-[78px] z-10 flex flex-col items-start">
                    <span className="text-3xl font-bold text-green-900 leading-tight">
                      {doctorInfo ? doctorInfo.user.name : "Dr. [Doctor Name]"}
                    </span>
                    <span className="text-lg text-green-800 font-medium leading-tight">
                      {doctorInfo && doctorInfo.qualifications.length > 0
                        ? doctorInfo.qualifications
                            .map((q) => q.qualification.name)
                            .join(", ")
                        : "[Qualifications]"}
                    </span>
                    <span className="text-base text-green-700 leading-tight">
                      {doctorInfo && doctorInfo.specializations.length > 0
                        ? doctorInfo.specializations
                            .map((s) => s.specialization.name)
                            .join(", ")
                        : "[Specializations]"}
                    </span>
                    <span className="text-m text-green-600 mt-1">
                      Phone:{" "}
                      {doctorInfo
                        ? doctorInfo.user.phoneNumber
                        : "[Phone Number]"}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[217px] left-[140px] w-[200px] h-[38px] flex items-center">
                    {patientInfo ? patientInfo.name : "[Patient Name]"}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[217px] left-[480px] w-[70px] h-[38px] flex items-center">
                    {patientInfo ? patientInfo.age : "[Age]"}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[217px] left-[620px] w-[40px] h-[40px] flex items-center justify-center">
                    {patientInfo && patientInfo.gender === "Male" ? "✔" : ""}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[217px] left-[728px] w-[40px] h-[40px] flex items-center justify-center">
                    {patientInfo && patientInfo.gender === "Female" ? "✔" : ""}
                  </span>

                  {/* Patient ID and Date */}
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[263px] left-[365px] w-[165px] h-[39px] flex items-center">
                    {selectedPrescription.patientId}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-2xl font-medium top-[263px] left-[612.5px] w-[165px] h-[39px] flex items-center">
                    {new Date(
                      selectedPrescription.prescriptionDate
                    ).toLocaleDateString()}
                  </span>

                  {/* Chief Complaint */}
                  <span className="absolute z-10 px-2 text-black text-lg top-[300px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                    {selectedPrescription.chiefComplaint}
                  </span>

                  {/* Placeholder sections */}
                  <span className="absolute z-10 px-2 text-black text-lg top-[466px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                    {/* O/E section - placeholder */}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-lg top-[633px] left-[5px] w-[250px] h-[120px] flex items-start p-2 whitespace-pre-line">
                    {/* Investigations section - placeholder */}
                  </span>
                  <span className="absolute z-10 px-2 text-black text-lg top-[773px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                    {/* Advice section - placeholder */}
                  </span>

                  {/* Medicines List */}
                  {prescriptionMedicines &&
                    prescriptionMedicines.length > 0 && (
                      <div className="absolute z-10 top-[350px] left-[370px] w-[500px] h-[613px] flex flex-col gap-4 p-2 overflow-y-auto">
                        {prescriptionMedicines.map((medicine, idx) => (
                          <div key={medicine.id} className="mb-2">
                            <div className="font-bold text-lg text-green-900 mb-1">
                              {medicine.medicineName}
                            </div>
                            <div className="text-sm text-green-800 mb-1">
                              Dosage: {medicine.morningDose}-
                              {medicine.afternoonDose}-{medicine.eveningDose}
                            </div>
                            {medicine.comment && (
                              <div className="text-xs text-gray-700 italic">
                                Instructions: {medicine.comment}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-6 mt-10">
                  <button
                    onClick={() => window.print()}
                    className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-200"
                    disabled={loadingModal}
                  >
                    Print
                  </button>
                  <button
                    onClick={closePrescriptionModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-200"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body,
            html {
              margin: 0 !important;
              padding: 0 !important;
              width: 80vw !important;
              height: 100vh !important;
            }
            .prescription-print-area {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              position: absolute !important;
              left: 0;
              top: 0;
              background: white !important;
              z-index: 9999 !important;
              box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/lo.png"
              alt="MediX Logo"
              width={50}
              height={40}
              className="rounded-lg"
              priority
            />
            <span className="text-2xl font-bold text-green-700">
              Medi<span className="text-gray-800">X</span>
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/signin"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message for Direct Link from Booking */}
        {showWelcomeMessage && (
          <div className="mb-8 mx-auto max-w-2xl">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">
                    🎉 Appointment Booked Successfully!
                  </h3>
                  <p className="text-green-700">
                    Your token #{patientId} has been automatically loaded. You
                    can now track your appointment status and view prescriptions
                    below.
                  </p>
                </div>
                <button
                  onClick={() => setShowWelcomeMessage(false)}
                  className="ml-auto text-green-600 hover:text-green-800 transition-colors"
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
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Check Your <span className="text-green-600">Medical Status</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your token number to view your appointment status and
            prescriptions
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-md mx-auto">
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Token Number
              {searchParams?.get("token") && (
                <span className="ml-2 text-xs text-green-600 font-medium">
                  ✓ Auto-filled from booking
                </span>
              )}
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter your token number"
                className={`flex-1 text-black px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 ${
                  searchParams?.get("token")
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300"
                }`}
                disabled={loading}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === "appointments"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Appointments ({appointments.length})
                </button>
                {hasDoneAppointments && (
                  <button
                    onClick={() => setActiveTab("prescriptions")}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === "prescriptions"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Prescriptions ({prescriptions.length})
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {/* Appointments Tab */}
              {activeTab === "appointments" && (
                <div>
                  {appointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📅</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Appointments Found
                      </h3>
                      <p className="text-gray-600">
                        No appointments found for this token number.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {patientInfo ? patientInfo.name + "'s" : "Patient's"}{" "}
                        Appointments
                      </h2>
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Appointment #{appointment.id}
                              </h3>
                              <p className="text-gray-600">
                                Doctor ID: {appointment.doctorId}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(appointment.appointmentDate)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Tracker */}
                          <ProgressTracker status={appointment.status} />

                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Patient ID
                              </p>
                              <p className="font-medium text-gray-900">
                                {appointment.patientId}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === "prescriptions" && hasDoneAppointments && (
                <div>
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">💊</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Prescriptions Found
                      </h3>
                      <p className="text-gray-600">
                        No prescriptions available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Your Prescriptions
                      </h2>
                      {prescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Prescription #{prescription.id}
                              </h3>
                              <p className="text-gray-600">
                                Doctor ID: {prescription.doctorId}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(prescription.prescriptionDate)}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">
                              Chief Complaint
                            </p>
                            <p className="font-medium text-gray-900">
                              {prescription.chiefComplaint}
                            </p>
                          </div>

                          {prescription.medicines &&
                            prescription.medicines.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-500 mb-2">
                                  Medicines (Preview - Click "View Full
                                  Prescription" for details)
                                </p>
                                <div className="space-y-2">
                                  {prescription.medicines
                                    .slice(0, 2)
                                    .map((medicine) => (
                                      <div
                                        key={medicine.id}
                                        className="bg-gray-50 rounded-lg p-3"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {medicine.medicineName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Dosage: {medicine.morningDose}-
                                              {medicine.afternoonDose}-
                                              {medicine.eveningDose}
                                            </p>
                                          </div>
                                        </div>
                                        {medicine.comment && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            Instructions: {medicine.comment}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  {prescription.medicines.length > 2 && (
                                    <p className="text-sm text-gray-500 italic">
                                      +{prescription.medicines.length - 2} more
                                      medicines...
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* View Prescription Button */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() =>
                                handleViewPrescription(prescription)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View Full Prescription
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!showResults && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Don't have a token number yet?</p>
            <Link
              href="/request-appointment"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Book New Appointment
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {showPrescriptionModal && <PrescriptionModal />}
    </div>
  );
}
