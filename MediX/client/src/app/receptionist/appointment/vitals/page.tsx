"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/receptionist/header";
import Footer from "@/components/footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function VitalsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
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

  const today = new Date().toISOString().slice(0, 10);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/appointments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
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

  const pendingAppointments = appointments.filter(
    (appt) => appt.status === "NOT_READY" && appt.appointmentDate >= today
  );

  useEffect(() => {
    const fetchPatient = async () => {
      let patientPhone = pendingAppointments.map(
        (appointment) => appointment.contact
      );
      try {
        const res = await fetch(
          `http://localhost:8080/api/patients?phone=${patientPhone.join(",")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPatients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, []);

  useEffect(() => {
    if (pendingAppointments.length === 0) return;

    const fetchDoctors = async () => {
      let doctorId = pendingAppointments.map(
        (appointment) => appointment.doctorId
      );
      try {
        const res = await fetch(
          `http://localhost:8080/api/doctors?id=${doctorId.join(",")}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDoctors(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [pendingAppointments]);

  const rows = pendingAppointments.map((appt) => {
    const pat = patients.find((p) => p.id === appt.patientId) || {};
    const doc = doctors.find((d) => d.doctorId === appt.doctorId) || {};
    return {
      appointmentId: appt.id, // appointment PK
      patientId: appt.patientId, // add this!
      name: pat.name,
      phoneNumber: pat.phoneNumber,
      doctorName: doc.user?.name || doc.name || "",
      date: appt.appointmentDate || appt.date || "",
    };
  });

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [vitals, setVitals] = useState({
    age: "",
    gender: "",
    weight: "",
    pressure1: "",
    pressure2: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    // Use the correct patient ID from the selected patient
    const patientId = selectedPatient.patientId;

    // Build request payload
    const payload = {
      age: parseInt(vitals.age, 10),
      gender: vitals.gender,
      weight: parseFloat(vitals.weight),
      bloodPressure: `${vitals.pressure1}/${vitals.pressure2}`,
    };

    console.log("PUT vitals for patient", patientId, payload);

    try {
      // First, update the patient with vitals data
      const res = await fetch(
        `http://localhost:8080/api/patients/${patientId}`,
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

      console.log("Vitals saved for:", selectedPatient.name, payload);

      // Then, update the appointment status to READY
      const statusRes = await fetch(
        `http://localhost:8080/api/appointments/${selectedPatient.appointmentId}/status`,
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

      // Refresh the appointments list
      await fetchAppointments();

      // Clear form and close modal
      clearForm();
      setSelectedPatient(null);
    } catch (err: any) {
      console.error("Error in vitals submission:", err);
      alert(`Failed to save vitals: ${err.message}`);
    }
  };

  const clearForm = () => {
    setVitals({
      age: "",
      gender: "",
      weight: "",
      pressure1: "",
      pressure2: "",
    });
  };

  const [search, setSearch] = useState("");

  const filteredAppointments = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phoneNumber.includes(search) ||
      r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      r.date.includes(search)
  );

  const lowerNavBgColor = "#1F4604";
  const lowerNavTextColor = "#ffffff";

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

  return (
    <main className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />

      {/* Subheader Navigation */}
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

      <div className="px-6 sm:px-12 pb-10">
        {/* Search Bar */}
        <div className="flex justify-center mb-10 items-end gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="search"
              className="text-gray-700 font-semibold mb-2"
            >
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-96 p-4 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c0c5cc,inset_-2px_-2px_4px_#ffffff] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Select a Patient to Enter Vitals
        </h1>

        {/* Table */}
        {loading && (
          <p className="text-center text-gray-500">Loading appointments...</p>
        )}
        {error && <p className="text-center text-red-600">Error: {error}</p>}

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-[6px_6px_16px_#d0d4da,-6px_-6px_16px_#ffffff]">
          <table className="w-full text-center text-gray-700">
            <thead className="bg-green-700 text-white text-md select-none">
              <tr>
                <th className="p-4 border border-green-600">Name</th>
                <th className="p-4 border border-green-600">Contact</th>
                <th className="p-4 border border-green-600">Doctor</th>
                <th className="p-4 border border-green-600">
                  Appointment Date
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((item) => (
                <tr
                  key={item.appointmentId}
                  className="hover:bg-green-50 cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedPatient(item)}
                >
                  <td className="p-4 border border-gray-200">{item.name}</td>
                  <td className="p-4 border border-gray-200">
                    {item.phoneNumber}
                  </td>
                  <td className="p-4 border border-gray-200">
                    {item.doctorName}
                  </td>
                  <td className="p-4 border border-gray-200">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vitals Entry Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md ">
            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
              Enter Vitals for {selectedPatient.name}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Fields */}
              {["age", "gender", "weight", "pressure"].map((field) => {
                if (field === "gender") {
                  return (
                    <div>
                      <label className="mb-2 text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        key={field}
                        name="gender"
                        value={vitals.gender}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  );
                }

                if (field === "pressure") {
                  return (
                    <div key={field} className="flex flex-col">
                      <label className="mb-2 text-sm font-medium text-gray-700">
                        Blood Pressure (mmHg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="pressure1"
                          value={vitals.pressure1}
                          onChange={handleChange}
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
                          onChange={handleChange}
                          required
                          placeholder="80"
                          min="0"
                          className="flex-1 p-3 w-[50px] rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                        />
                      </div>
                    </div>
                  );
                }

                const type = ["age", "weight"].includes(field)
                  ? "number"
                  : "text";
                return (
                  <div>
                    <label className="mb-2 text-sm font-medium text-gray-700">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      key={field}
                      type={type}
                      name={field}
                      required
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={(vitals as any)[field]}
                      onChange={handleChange}
                      className="w-full p-3 rounded-xl bg-white shadow-[inset_4px_4px_6px_#c2c8d0,inset_-4px_-4px_6px_#ffffff] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                );
              })}

              {/* Buttons */}
              <div className="flex justify-between pt-2 gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-[4px_4px_8px_#bfc5cc,-4px_-4px_8px_#ffffff] transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    setSelectedPatient(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-[4px_4px_8px_#bfc5cc,-4px_-4px_8px_#ffffff] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
