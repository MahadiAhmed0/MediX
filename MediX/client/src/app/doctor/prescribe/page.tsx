"use client";
import Header from "@/components/doctor/header";
import SubHeader from "@/components/doctor/subHeader";
import Footer from "@/components/footer";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import medicineCommentsData from "@/data/medicineComments.json";

export default function Prescribe() {
  // Medicine type for backend API
  type MedicineFromAPI = {
    id: number;
    company: string;
    medicineName: string;
    genericName: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    expiryDate: string;
  };
  // State for all medicines from backend
  const [allMedicines, setAllMedicines] = useState<MedicineFromAPI[]>([]);
  // State for medicine name input disclaimer
  const [medicineNameWarnings, setMedicineNameWarnings] = useState<{
    [idx: number]: boolean;
  }>({});
  // Fetch all medicines from backend on mount (in-memory, most efficient for this use case)
  useEffect(() => {
    fetch("http://localhost:8080/api/medicines")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllMedicines(data);
      })
      .catch(() => setAllMedicines([]));
  }, []);
  const [showHistory, setShowHistory] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    pressure1: "",
    pressure2: "",
    cc: "",
    oe: "",
    invs: "",
    adv: "",
  });

  // Patient ID state
  const [patientId, setPatientId] = useState<number | null>(null);
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [patientError, setPatientError] = useState<string>("");
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [patientFromUrl, setPatientFromUrl] = useState(false);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);
  const [patientUpdateSuccess, setPatientUpdateSuccess] = useState(false);

  // Add state for dynamic medicine fields
  const [medicines, setMedicines] = useState([
    { name: "", nums: ["", "", ""], numberOfDays: "", comment: "" },
  ]);

  // Add state for prescription saving
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState<string>("");

  // Add state for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPrescriptionId, setEditPrescriptionId] = useState<number | null>(
    null
  );

  // Add state for autocomplete
  const [autocompleteStates, setAutocompleteStates] = useState<{
    [key: number]: {
      suggestions: string[];
      showSuggestions: boolean;
      selectedIndex: number;
    };
  }>({});
  const commentRefs = useRef<{ [key: number]: HTMLTextAreaElement | null }>({});
  const suggestionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    const urlEmail = searchParams?.get("email");
    if (urlEmail) {
      localStorage.setItem("email", urlEmail);
      setEmail(urlEmail);
    } else {
      const stored = localStorage.getItem("email") || "";
      setEmail(stored);
    }

    // Check if patient ID is passed in URL
    const urlPatientId = searchParams?.get("patientId");
    if (urlPatientId) {
      const patientIdNum = parseInt(urlPatientId);
      if (!isNaN(patientIdNum)) {
        fetchPatientById(patientIdNum);

        // Only load prescription data if we're in edit mode (edit=1 in URL)
        const isEdit = searchParams?.get("edit") === "1";
        if (isEdit) {
          // Also load prescription data if coming from preview page (edit mode)
          const prescriptionData = localStorage.getItem("prescriptionData");
          if (prescriptionData) {
            const parsed = JSON.parse(prescriptionData);
            // Only load prescription fields (cc, oe, invs, adv, medicines)
            // Patient data will be loaded by fetchPatientById
            setTimeout(() => {
              setForm((prev) => ({
                ...prev,
                cc: parsed.cc || "",
                oe: parsed.oe || "",
                invs: parsed.invs || "",
                adv: parsed.adv || "",
              }));

              // Load medicines from localStorage if available
              if (
                parsed.medicines &&
                Array.isArray(parsed.medicines) &&
                parsed.medicines.length > 0
              ) {
                setMedicines(parsed.medicines);
              }
            }, 100); // Small delay to ensure patient data loads first
          }
        }

        return; // Skip other initialization when loading from URL
      }
    }

    // Check if we should load patient data
    // Only prefill if ?edit=1 is present
    const isEdit = searchParams?.get("edit") === "1";
    // hasPatientData is true if both ?edit=1 and ?patientId are present
    const hasPatientData = isEdit && !!searchParams?.get("patientId");

    if (hasPatientData) {
      // Load patient data from localStorage
      const patientData = localStorage.getItem("patientData");
      if (patientData) {
        const parsed = JSON.parse(patientData);
        setForm({
          name: parsed.name || "",
          age: parsed.age || "",
          gender: parsed.gender || "",
          weight: parsed.weight || "",
          pressure1: parsed.pressure1 || "",
          pressure2: parsed.pressure2 || "",
          cc: parsed.cc || "",
          oe: parsed.oe || "",
          invs: parsed.invs || "",
          adv: parsed.adv || "",
        });
        // Clear the patient data from localStorage after loading
        localStorage.removeItem("patientData");
      }
      // Reset medicines to default when loading patient data
      setMedicines([
        { name: "", nums: ["", "", ""], numberOfDays: "", comment: "" },
      ]);
      setPatientId(null);
      setPatientError("");
      setPatientFromUrl(false);
      setPatientUpdateSuccess(false);
    } else if (isEdit) {
      const prescriptionData = localStorage.getItem("prescriptionData");
      if (prescriptionData) {
        const parsed = JSON.parse(prescriptionData);
        setForm({
          name: parsed.name || "",
          age: parsed.age || "",
          gender: parsed.gender || "",
          weight: parsed.weight || "",
          pressure1: parsed.pressure1 || "",
          pressure2: parsed.pressure2 || "",
          cc: parsed.cc || "",
          oe: parsed.oe || "",
          invs: parsed.invs || "",
          adv: parsed.adv || "",
        });
        // Load medicines from localStorage if available
        if (
          parsed.medicines &&
          Array.isArray(parsed.medicines) &&
          parsed.medicines.length > 0
        ) {
          setMedicines(parsed.medicines);
        }
        // Set patient ID if available in prescription data
        if (parsed.patientId) {
          setPatientId(parsed.patientId);
        }
        // Set edit mode and prescription ID
        setIsEditMode(true);
        if (parsed.prescriptionId) {
          setEditPrescriptionId(parsed.prescriptionId);
        }
      }
    } else {
      setForm({
        name: "",
        age: "",
        gender: "",
        weight: "",
        pressure1: "",
        pressure2: "",
        cc: "",
        oe: "",
        invs: "",
        adv: "",
      });
      // Reset medicines to default when not editing
      setMedicines([
        { name: "", nums: ["", "", ""], numberOfDays: "", comment: "" },
      ]);
      setPatientId(null);
      setPatientError("");
      setPatientFromUrl(false);
      setPatientUpdateSuccess(false);
      // Reset edit mode
      setIsEditMode(false);
      setEditPrescriptionId(null);
    }
  }, [searchParams]);

  // Initialize autocomplete state for initial medicines
  useEffect(() => {
    medicines.forEach((_, idx) => {
      if (!autocompleteStates[idx]) {
        setAutocompleteStates((prev) => ({
          ...prev,
          [idx]: {
            suggestions: medicineCommentsData.commonComments.slice(0, 5),
            showSuggestions: false,
            selectedIndex: -1,
          },
        }));
      }
    });
  }, [medicines.length]);

  const mockHistory = [
    {
      id: 1,
      date: "2024-12-01",
      notes: "Prescribed Amoxicillin 500mg for 7 days. Advised rest.",
    },
    {
      id: 2,
      date: "2024-11-15",
      notes: "Follow-up visit. Condition improving. Reduced dosage.",
    },
    {
      id: 3,
      date: "2024-11-01",
      notes: "Initial consultation. Diagnosed with throat infection.",
    },
  ];

  // Add medicine handler
  const addMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: "", nums: ["", "", ""], numberOfDays: "", comment: "" },
    ]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "radio") {
      setForm((prev) => ({ ...prev, gender: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMedicineChange = (
    idx: number,
    field: string,
    value: string,
    numIdx?: number
  ) => {
    setMedicines((prev) =>
      prev.map((med, i) => {
        if (i !== idx) return med;
        if (field === "name") {
          // Check if name is in stock
          const inStock = allMedicines.some(
            (m) => m.medicineName.toLowerCase() === value.trim().toLowerCase()
          );
          setMedicineNameWarnings((prevWarn) => ({
            ...prevWarn,
            [idx]: !inStock && value.trim() !== "",
          }));
          return { ...med, name: value };
        }
        if (field === "comment") return { ...med, comment: value };
        if (field === "num" && numIdx !== undefined) {
          const newNums = [...med.nums];
          newNums[numIdx] = value;
          return { ...med, nums: newNums };
        }
        if (field === "numberOfDays") return { ...med, numberOfDays: value };
        return med;
      })
    );
  };

  const removeMedicine = () => {
    setMedicines((prev) => {
      if (prev.length > 1) {
        const newMedicines = prev.slice(0, -1);
        // Clean up autocomplete state for removed medicine
        const removedIdx = prev.length - 1;
        setAutocompleteStates((prevState) => {
          const newState = { ...prevState };
          delete newState[removedIdx];
          return newState;
        });
        return newMedicines;
      }
      return prev;
    });
  };

  // Autocomplete functions
  const getFilteredSuggestions = (input: string): string[] => {
    if (!input.trim()) return medicineCommentsData.commonComments.slice(0, 5);

    const inputLower = input.toLowerCase().trim();
    const words = inputLower.split(" ");
    const lastWord = words[words.length - 1];

    // First, find suggestions that start with the last word (for word completion)
    const startsWith = medicineCommentsData.commonComments.filter((comment) =>
      comment.toLowerCase().startsWith(lastWord)
    );

    // Then, find suggestions that start with the full input
    const fullStartsWith = medicineCommentsData.commonComments.filter(
      (comment) =>
        comment.toLowerCase().startsWith(inputLower) &&
        !comment.toLowerCase().startsWith(lastWord)
    );

    // Then, find suggestions that contain the input but don't start with it
    const contains = medicineCommentsData.commonComments.filter(
      (comment) =>
        comment.toLowerCase().includes(inputLower) &&
        !comment.toLowerCase().startsWith(inputLower) &&
        !comment.toLowerCase().startsWith(lastWord)
    );

    // Combine them with priority: lastWord startsWith, full startsWith, then contains
    const filtered = [...startsWith, ...fullStartsWith, ...contains];

    // Remove duplicates
    const unique = filtered.filter(
      (item, index) => filtered.indexOf(item) === index
    );

    return unique.slice(0, 8);
  };

  const handleCommentChange = (idx: number, value: string) => {
    handleMedicineChange(idx, "comment", value);

    const suggestions = getFilteredSuggestions(value);
    setAutocompleteStates((prev) => ({
      ...prev,
      [idx]: {
        suggestions,
        showSuggestions: suggestions.length > 0,
        selectedIndex: suggestions.length > 0 ? 0 : -1, // Auto-select first suggestion
      },
    }));
  };

  const handleCommentKeyDown = (idx: number, e: React.KeyboardEvent) => {
    const state = autocompleteStates[idx];
    if (!state?.showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setAutocompleteStates((prev) => ({
          ...prev,
          [idx]: {
            ...state,
            selectedIndex: Math.min(
              state.selectedIndex + 1,
              state.suggestions.length - 1
            ),
          },
        }));
        break;
      case "ArrowUp":
        e.preventDefault();
        setAutocompleteStates((prev) => ({
          ...prev,
          [idx]: {
            ...state,
            selectedIndex: Math.max(state.selectedIndex - 1, -1),
          },
        }));
        break;
      case "Enter":
        e.preventDefault();
        if (state.selectedIndex >= 0) {
          selectSuggestion(idx, state.suggestions[state.selectedIndex]);
        } else if (state.suggestions.length > 0) {
          // If no item is selected but there are suggestions, select the first one
          selectSuggestion(idx, state.suggestions[0]);
        }
        break;
      case "Tab":
        e.preventDefault();
        if (state.selectedIndex >= 0) {
          selectSuggestion(idx, state.suggestions[state.selectedIndex]);
        } else if (state.suggestions.length > 0) {
          // If no item is selected but there are suggestions, select the first one
          selectSuggestion(idx, state.suggestions[0]);
        }
        break;
      case "Escape":
        hideSuggestions(idx);
        break;
    }
  };

  const selectSuggestion = (idx: number, suggestion: string) => {
    const currentValue = medicines[idx]?.comment || "";
    const cursorPosition =
      commentRefs.current[idx]?.selectionStart || currentValue.length;

    // Split text at cursor position
    const beforeCursor = currentValue.substring(0, cursorPosition);
    const afterCursor = currentValue.substring(cursorPosition);

    // Find the current word being typed
    const words = beforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    let newValue;
    let newCursorPosition;

    if (
      lastWord &&
      suggestion.toLowerCase().startsWith(lastWord.toLowerCase()) &&
      lastWord.length > 0
    ) {
      // Replace the last partial word with the complete suggestion
      const beforeLastWord = words.slice(0, -1).join(" ");
      const prefix = beforeLastWord ? beforeLastWord + " " : "";
      newValue = prefix + suggestion + afterCursor;
      newCursorPosition = prefix.length + suggestion.length;
    } else {
      // If it's a complete replacement or new addition
      if (beforeCursor.trim() === "" || beforeCursor.endsWith(" ")) {
        // Add suggestion at cursor position
        newValue = beforeCursor + suggestion + afterCursor;
        newCursorPosition = beforeCursor.length + suggestion.length;
      } else {
        // Replace entire text with suggestion
        newValue = suggestion;
        newCursorPosition = suggestion.length;
      }
    }

    handleMedicineChange(idx, "comment", newValue);
    hideSuggestions(idx);

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      const textarea = commentRefs.current[idx];
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  const hideSuggestions = (idx: number) => {
    setAutocompleteStates((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        showSuggestions: false,
        selectedIndex: -1,
      },
    }));
  };

  const handleCommentFocus = (idx: number) => {
    const currentValue = medicines[idx]?.comment || "";
    const suggestions = getFilteredSuggestions(currentValue);
    setAutocompleteStates((prev) => ({
      ...prev,
      [idx]: {
        suggestions,
        showSuggestions: suggestions.length > 0,
        selectedIndex: suggestions.length > 0 ? 0 : -1, // Auto-select first suggestion
      },
    }));
  };

  const handleCommentBlur = (idx: number) => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      hideSuggestions(idx);
    }, 150);
  };

  // Create appointment for patient function
  const createAppointmentForPatient = async (patientId: number) => {
    try {
      // Get doctor ID from email
      const doctorId = await getDoctorIdByEmail(email);
      if (!doctorId) {
        throw new Error("Failed to get doctor information for appointment");
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const appointmentDate = `${yyyy}-${mm}-${dd}`;

      // Create appointment
      const appointmentData = {
        patientId: patientId,
        doctorId: doctorId,
        appointmentDate: appointmentDate,
      };

      console.log("Creating appointment with data:", appointmentData);

      const appointmentResponse = await fetch(
        "http://localhost:8080/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const appointment = await appointmentResponse.json();
      console.log("Appointment created successfully:", appointment);

      // Update appointment status to DONE
      const statusUpdateResponse = await fetch(
        `http://localhost:8080/api/appointments/${patientId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "DONE",
          }),
        }
      );

      if (!statusUpdateResponse.ok) {
        const errorData = await statusUpdateResponse.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to update appointment status"
        );
      }

      const statusUpdate = await statusUpdateResponse.json();
      console.log("Appointment status updated to DONE:", statusUpdate);
    } catch (error) {
      console.error("Error in appointment creation/update:", error);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  // Create patient function
  const createPatient = async () => {
    if (!form.name.trim()) {
      setPatientError("Patient name is required");
      return null;
    }

    setIsCreatingPatient(true);
    setPatientError("");

    try {
      // First create basic patient with name and phone (empty for now)
      const basicPatientResponse = await fetch(
        "http://localhost:8080/api/patients/basic",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            phoneNumber: "N/A", // Placeholder phone number
          }),
        }
      );

      if (!basicPatientResponse.ok) {
        const errorData = await basicPatientResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create basic patient");
      }

      const basicPatient = await basicPatientResponse.json();
      const newPatientId = basicPatient.id;

      // Now update with additional details if they exist
      const hasAdditionalDetails =
        form.age ||
        form.gender ||
        form.weight ||
        form.pressure1 ||
        form.pressure2;

      if (hasAdditionalDetails) {
        const updateData: any = {};

        if (form.age) updateData.age = parseInt(form.age);
        if (form.gender) updateData.gender = form.gender;
        if (form.weight) updateData.weight = parseFloat(form.weight);
        if (form.pressure1 && form.pressure2) {
          updateData.bloodPressure = `${form.pressure1}/${form.pressure2}`;
        } else if (form.pressure1) {
          updateData.bloodPressure = `${form.pressure1}/0`;
        } else if (form.pressure2) {
          updateData.bloodPressure = `0/${form.pressure2}`;
        }

        const updateResponse = await fetch(
          `http://localhost:8080/api/patients/${newPatientId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error || "Failed to update patient details"
          );
        }
      }

      setPatientId(newPatientId);
      console.log(`Patient created successfully with ID: ${newPatientId}`);

      // Create appointment for this patient with the current doctor
      try {
        await createAppointmentForPatient(newPatientId);
      } catch (appointmentError) {
        console.error("Error creating appointment:", appointmentError);
        // Note: We don't return null here because patient creation was successful
        // The appointment creation failure is logged but doesn't affect patient creation
      }

      return newPatientId;
    } catch (error) {
      console.error("Error creating patient:", error);
      setPatientError(
        error instanceof Error ? error.message : "Failed to create patient"
      );
      return null;
    } finally {
      setIsCreatingPatient(false);
    }
  };

  // Fetch patient information by ID
  const fetchPatientById = async (id: number) => {
    setIsLoadingPatient(true);
    setPatientError("");

    try {
      const response = await fetch(`http://localhost:8080/api/patients/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch patient");
      }

      const patient = await response.json();

      // Pre-populate form with patient data
      const [pressure1 = "", pressure2 = ""] = patient.bloodPressure
        ? patient.bloodPressure.split("/")
        : ["", ""];

      setForm({
        name: patient.name || "",
        age: patient.age ? patient.age.toString() : "",
        gender: patient.gender || "",
        weight: patient.weight ? patient.weight.toString() : "",
        pressure1: pressure1,
        pressure2: pressure2,
        cc: "",
        oe: "",
        invs: "",
        adv: "",
      });

      setPatientId(patient.id);
      setPatientFromUrl(true);
      console.log(`Patient loaded successfully with ID: ${patient.id}`);
    } catch (error) {
      console.error("Error fetching patient:", error);
      setPatientError(
        error instanceof Error ? error.message : "Failed to fetch patient"
      );
    } finally {
      setIsLoadingPatient(false);
    }
  };

  // Update patient details function
  const updatePatientDetails = async () => {
    if (!patientId) {
      setPatientError("No patient ID available for update");
      return;
    }

    setIsUpdatingPatient(true);
    setPatientError("");
    setPatientUpdateSuccess(false);

    try {
      const updateData: any = {};

      if (form.age) updateData.age = parseInt(form.age);
      if (form.weight) updateData.weight = parseFloat(form.weight);
      if (form.pressure1 && form.pressure2) {
        updateData.bloodPressure = `${form.pressure1}/${form.pressure2}`;
      } else if (form.pressure1) {
        updateData.bloodPressure = `${form.pressure1}/0`;
      } else if (form.pressure2) {
        updateData.bloodPressure = `0/${form.pressure2}`;
      }

      const response = await fetch(
        `http://localhost:8080/api/patients/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update patient details");
      }

      setPatientUpdateSuccess(true);
      console.log(`Patient updated successfully with ID: ${patientId}`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPatientUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating patient:", error);
      setPatientError(
        error instanceof Error ? error.message : "Failed to update patient"
      );
    } finally {
      setIsUpdatingPatient(false);
    }
  };

  // Function to get doctor ID by email
  const getDoctorIdByEmail = async (email: string): Promise<number | null> => {
    try {
      console.log("Fetching doctor ID for email:", email);
      const response = await fetch(
        `http://localhost:8080/api/doctors/email/${email}`
      );
      console.log("Doctor fetch response status:", response.status);

      if (!response.ok) {
        console.error("Failed to fetch doctor. Status:", response.status);
        throw new Error(`HTTP ${response.status}`);
      }
      const doctor = await response.json();
      console.log("Doctor data received:", doctor);
      return doctor.doctorId;
    } catch (error) {
      console.error("Error fetching doctor ID:", error);
      return null;
    }
  };

  // Test function to check backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection...");
      const response = await fetch("http://localhost:8080/api/prescriptions");
      console.log("Backend connection test - Status:", response.status);
      const data = await response.json();
      console.log("Backend connection test - Data:", data);
    } catch (error) {
      console.error("Backend connection test failed:", error);
    }
  };

  const handleContinue = async () => {
    // Create patient first if not already created
    let currentPatientId = patientId;

    if (!currentPatientId) {
      currentPatientId = await createPatient();
      if (!currentPatientId) {
        // Patient creation failed, error message already set
        return;
      }
    }

    // Get doctor ID from email
    const doctorId = await getDoctorIdByEmail(email);
    console.log("Doctor ID fetched:", doctorId);
    if (!doctorId) {
      setPrescriptionError(
        "Failed to get doctor information. Please try again."
      );
      return;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const currentDate = `${yyyy}-${mm}-${dd}`;

    // Filter and validate medicines
    const validMedicines = medicines.filter((med) => med.name.trim() !== "");
    console.log("Valid medicines count:", validMedicines.length);

    if (validMedicines.length === 0) {
      setPrescriptionError("Please add at least one medicine with a name.");
      return;
    }

    // Validate medicine data
    for (let i = 0; i < validMedicines.length; i++) {
      const med = validMedicines[i];
      if (!med.name || med.name.trim() === "") {
        setPrescriptionError(`Medicine ${i + 1} name is required.`);
        return;
      }
      // Ensure nums array has 3 elements
      if (!med.nums || med.nums.length !== 3) {
        setPrescriptionError(
          `Medicine ${i + 1} dosage information is incomplete.`
        );
        return;
      }
    }

    // Prepare prescription data for API
    const prescriptionData = {
      patientId: currentPatientId,
      doctorId: doctorId,
      prescriptionDate: currentDate,
      chiefComplaint: form.cc,
      onExamination: form.oe,
      investigations: form.invs,
      advice: form.adv,
      medicines: validMedicines.map((med) => ({
        ...med,
        numberOfDays: med.numberOfDays ? parseInt(med.numberOfDays) : 1,
      })),
    };

    // Debug logging - log the data being sent
    console.log(
      "Sending prescription data:",
      JSON.stringify(prescriptionData, null, 2)
    );

    setIsSavingPrescription(true);
    setPrescriptionError("");

    try {
      // Determine if we're editing or creating
      const isEditing = isEditMode && editPrescriptionId;
      const apiUrl = isEditing
        ? `http://localhost:8080/api/prescriptions/${editPrescriptionId}/from-frontend`
        : "http://localhost:8080/api/prescriptions/from-frontend";
      const method = isEditing ? "PUT" : "POST";

      console.log(
        `${
          isEditing ? "Updating" : "Creating"
        } prescription using ${method} to ${apiUrl}`
      );

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      });

      // Log response status and headers for debugging
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const result = await response.json();
      console.log("Response body:", result);

      if (result.success) {
        console.log(
          `Prescription ${isEditing ? "updated" : "saved"}:`,
          result.data
        );

        // Save prescription data to localStorage for preview page (as backup)
        localStorage.setItem(
          "prescriptionData",
          JSON.stringify({
            ...form,
            date: currentDate,
            medicines,
            patientId: currentPatientId,
            prescriptionId: result.data.id,
          })
        );

        // Navigate to preview page with prescription ID
        router.push(
          `/doctor/prescribe/preview?prescriptionId=${result.data.id}`
        );
      } else {
        console.error(
          `Error ${isEditing ? "updating" : "saving"} prescription:`,
          result.error
        );
        console.error(
          "Error details:",
          result.details || "No details provided"
        );
        setPrescriptionError(
          `${result.error}${result.details ? ` - ${result.details}` : ""}`
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      setPrescriptionError(
        `Network error: Failed to ${
          isEditMode ? "update" : "save"
        } prescription`
      );
    } finally {
      setIsSavingPrescription(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header />
      <SubHeader />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-center items-start gap-8">
          {/* Form Section */}
          <div className="w-full max-w-2xl mx-auto md:mx-0 bg-white border border-green-200 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-green-800 flex items-center gap-3">
              {isEditMode ? "Edit Prescription" : "New Prescription"}
              {isEditMode && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  Editing ID: {editPrescriptionId}
                </span>
              )}
            </h2>

            {/* Patient Creation Status */}
            {patientError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {patientError}
              </div>
            )}

            {/* Prescription Saving Status */}
            {prescriptionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {prescriptionError}
              </div>
            )}

            {isLoadingPatient && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-blue-700">
                Loading patient information...
              </div>
            )}

            {patientId && patientFromUrl && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700">
                Patient loaded successfully! ID: {patientId}
              </div>
            )}

            {patientId && !patientFromUrl && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700">
                Patient created successfully! ID: {patientId}
              </div>
            )}

            {patientUpdateSuccess && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-blue-700">
                Patient details updated successfully!
              </div>
            )}
            <form className="space-y-5">
              {/* Patient ID Display Box - Only show when patient is loaded from URL */}
              {patientFromUrl && patientId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-700">
                      Patient ID:
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      {patientId}
                    </span>
                    <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Existing Patient
                    </span>
                  </div>
                </div>
              )}

              {/* Note for existing patient */}
              {patientFromUrl && (
                <div className="mb-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <span className="font-medium">Note:</span> Patient name and
                  gender cannot be edited. You can update age, weight, and blood
                  pressure.
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Patient Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 h-[42px] ${
                      patientFromUrl ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    autoComplete="off"
                    disabled={patientFromUrl}
                  />
                </div>
                <div className="flex flex-col w-24">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 h-[42px]"
                    autoComplete="off"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="flex flex-col justify-end h-full min-h-[60px]">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Gender:
                  </label>
                  <div className="flex items-center gap-2 h-[42px]">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={form.gender === "Male"}
                        onChange={handleChange}
                        className="accent-green-600"
                        disabled={patientFromUrl}
                      />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={form.gender === "Female"}
                        onChange={handleChange}
                        className="accent-green-600"
                        disabled={patientFromUrl}
                      />
                      <span>Female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Create Patient Button - Only show when not loading from URL */}
              {!patientFromUrl && (
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={createPatient}
                    disabled={
                      isCreatingPatient || !form.name.trim() || !!patientId
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      isCreatingPatient || !form.name.trim() || !!patientId
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isCreatingPatient
                      ? "Creating Patient..."
                      : patientId
                      ? "Patient Created"
                      : "Create Patient"}
                  </button>

                  {patientId && !patientFromUrl && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Patient ID: {patientId}
                    </span>
                  )}
                </div>
              )}

              {/* Update Patient Button - Only show when loading from URL */}
              {patientFromUrl && (
                <div className="flex justify-between items-center mb-4">
                  <button
                    type="button"
                    onClick={updatePatientDetails}
                    disabled={isUpdatingPatient}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      isUpdatingPatient
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                  >
                    {isUpdatingPatient
                      ? "Updating..."
                      : "Update Patient Details"}
                  </button>

                  <span className="text-sm text-blue-600 font-medium">
                    Patient ID: {patientId}
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex flex-col w-32">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    name="weight"
                    value={form.weight ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, weight: e.target.value }))
                    }
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 h-[42px]"
                    autoComplete="off"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="flex flex-col w-40">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    Pressure (mmHg)
                  </label>
                  <div className="flex items-center gap-2 h-[42px]">
                    <input
                      name="pressure1"
                      value={form.pressure1 ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pressure1: e.target.value,
                        }))
                      }
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                      autoComplete="off"
                      type="number"
                      min="0"
                    />
                    <span>/</span>
                    <input
                      name="pressure2"
                      value={form.pressure2 ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pressure2: e.target.value,
                        }))
                      }
                      className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                      autoComplete="off"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  C/C (Chief Complaint)
                </label>
                <textarea
                  name="cc"
                  value={form.cc}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows={3}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  O/E (On Examination)
                </label>
                <textarea
                  name="oe"
                  value={form.oe}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows={3}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  Invs (Investigations)
                </label>
                <textarea
                  name="invs"
                  value={form.invs}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows={2}
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  ADV (Advice)
                </label>
                <textarea
                  name="adv"
                  value={form.adv}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  rows={2}
                />
              </div>
              {/* Dynamic Medicine Section */}
              <div className="flex flex-col gap-6 mt-6">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative overflow-visible"
                  >
                    <div className="flex flex-col mb-2 relative">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Medicine Name
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) =>
                          handleMedicineChange(idx, "name", e.target.value)
                        }
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        list={`medicine-suggestions-${idx}`}
                        autoComplete="off"
                      />
                      {/* Autosuggest dropdown using datalist */}
                      <datalist id={`medicine-suggestions-${idx}`}>
                        {allMedicines
                          .filter((m) =>
                            med.name.trim() === ""
                              ? true
                              : m.medicineName
                                  .toLowerCase()
                                  .includes(med.name.trim().toLowerCase())
                          )
                          .slice(0, 10)
                          .map((m) => (
                            <option key={m.id} value={m.medicineName} />
                          ))}
                      </datalist>
                      {/* Disclaimer if not in stock */}
                      {medicineNameWarnings[idx] && (
                        <span className="text-xs text-red-600 mt-1 absolute left-0 top-full">
                          This medicine is not available in the stock.
                        </span>
                      )}
                    </div>
                    <div className="flex flex-between items-center gap-2 mb-2 mt-10">
                      <label className="text-sm font-medium text-gray-700 mr-2">
                        Dosage
                      </label>
                      <input
                        type="number"
                        value={med.nums[0]}
                        onChange={(e) => {
                          handleMedicineChange(idx, "num", e.target.value, 0);
                          // Auto-focus next input if single digit entered
                          if (
                            e.target.value.length === 1 &&
                            /^\d$/.test(e.target.value)
                          ) {
                            const nextInput =
                              e.target.parentElement?.querySelector(
                                `input[data-dosage-idx="${idx}-1"]`
                              ) as HTMLInputElement;
                            if (nextInput) {
                              setTimeout(() => nextInput.focus(), 0);
                            }
                          }
                        }}
                        data-dosage-idx={`${idx}-0`}
                        className="w-12 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                        min="0"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={med.nums[1]}
                        onChange={(e) => {
                          handleMedicineChange(idx, "num", e.target.value, 1);
                          // Auto-focus next input if single digit entered
                          if (
                            e.target.value.length === 1 &&
                            /^\d$/.test(e.target.value)
                          ) {
                            const nextInput =
                              e.target.parentElement?.querySelector(
                                `input[data-dosage-idx="${idx}-2"]`
                              ) as HTMLInputElement;
                            if (nextInput) {
                              setTimeout(() => nextInput.focus(), 0);
                            }
                          }
                        }}
                        data-dosage-idx={`${idx}-1`}
                        className="w-12 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                        min="0"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={med.nums[2]}
                        onChange={(e) =>
                          handleMedicineChange(idx, "num", e.target.value, 2)
                        }
                        data-dosage-idx={`${idx}-2`}
                        className="w-12 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                        min="0"
                      />
                      <span className="ml-4 text-sm font-medium text-gray-700">
                        Days
                      </span>
                      <input
                        type="number"
                        value={med.numberOfDays}
                        onChange={(e) =>
                          handleMedicineChange(
                            idx,
                            "numberOfDays",
                            e.target.value
                          )
                        }
                        className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                        min="1"
                        placeholder="Days"
                      />
                    </div>
                    <div className="flex flex-col mb-2 relative mt-5">
                      <textarea
                        ref={(el) => {
                          commentRefs.current[idx] = el;
                        }}
                        value={med.comment}
                        onChange={(e) =>
                          handleCommentChange(idx, e.target.value)
                        }
                        onKeyDown={(e) => handleCommentKeyDown(idx, e)}
                        onFocus={() => handleCommentFocus(idx)}
                        onBlur={() => handleCommentBlur(idx)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        rows={2}
                        placeholder="Type to see suggestions..."
                      />

                      {/* Autocomplete suggestions */}
                      {autocompleteStates[idx]?.showSuggestions && (
                        <div
                          ref={(el) => {
                            suggestionRefs.current[idx] = el;
                          }}
                          className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1"
                        >
                          {autocompleteStates[idx].suggestions.map(
                            (suggestion, suggestionIdx) => (
                              <div
                                key={suggestionIdx}
                                className={`px-4 py-2 cursor-pointer text-sm hover:bg-green-50 border-b border-gray-100 last:border-b-0 ${
                                  autocompleteStates[idx].selectedIndex ===
                                  suggestionIdx
                                    ? "bg-green-100 text-green-800 font-medium"
                                    : "text-gray-700"
                                }`}
                                onClick={() =>
                                  selectSuggestion(idx, suggestion)
                                }
                                onMouseEnter={() => {
                                  setAutocompleteStates((prev) => ({
                                    ...prev,
                                    [idx]: {
                                      ...prev[idx],
                                      selectedIndex: suggestionIdx,
                                    },
                                  }));
                                }}
                              >
                                {suggestion}
                                {autocompleteStates[idx].selectedIndex ===
                                  suggestionIdx && (
                                  <span className="text-xs text-green-600 ml-2">
                                    ⏎ Tab
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    {/* Remove button for all but the first set */}
                    {medicines.length > 1 && idx === medicines.length - 1 && (
                      <button
                        type="button"
                        onClick={removeMedicine}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                        aria-label="Remove medicine"
                      >
                        &minus;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedicine}
                  className="self-end bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl shadow-md"
                  aria-label="Add medicine"
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200"
                  onClick={() => {
                    setForm({
                      name: "",
                      age: "",
                      gender: "",
                      weight: "",
                      pressure1: "",
                      pressure2: "",
                      cc: "",
                      oe: "",
                      invs: "",
                      adv: "",
                    });
                    setMedicines([
                      {
                        name: "",
                        nums: ["", "", ""],
                        numberOfDays: "",
                        comment: "",
                      },
                    ]);
                    setPatientId(null);
                    setPatientError("");
                    setPatientFromUrl(false);
                    setPatientUpdateSuccess(false);
                    // Reset edit mode
                    setIsEditMode(false);
                    setEditPrescriptionId(null);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleContinue}
                  disabled={isCreatingPatient || isSavingPrescription}
                >
                  {isCreatingPatient
                    ? "Creating Patient..."
                    : isSavingPrescription
                    ? isEditMode
                      ? "Updating Prescription..."
                      : "Saving Prescription..."
                    : isEditMode
                    ? "Update and Continue"
                    : "Save and Continue"}
                </button>
              </div>
            </form>
          </div>

          {/* History Toggle Section */}
          <div className="w-full md:w-[300px] flex flex-col justify-start items-center text-center">
            <button
              onClick={() => setShowHistory((prev) => !prev)}
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-4 rounded-2xl text-lg shadow-md transition-all duration-300"
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
            {showHistory && (
              <div className="mt-6 w-full bg-green-50/70 border border-green-200 rounded-2xl p-4 space-y-4 shadow">
                <h2 className="text-xl font-semibold border-b border-green-400 pb-2 text-green-800">
                  Prescription History
                </h2>
                {mockHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-l-4 border-green-600 pl-4 text-left"
                  >
                    <p className="text-sm text-gray-500">{entry.date}</p>
                    <p className="text-gray-800">{entry.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
