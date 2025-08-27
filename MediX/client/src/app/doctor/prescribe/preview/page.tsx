"use client";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/doctor/header";
import SubHeader from "@/components/doctor/subHeader";
import Footer from "@/components/footer";

interface PrescriptionData {
  name: string;
  age: string;
  gender: string;
  date: string;
  cc: string;
  oe: string;
  invs: string;
  adv: string;
  medicines: {
    name: string;
    nums: string[];
    comment?: string;
  }[];
  patientId: string;
}

interface DoctorInfo {
  user: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  qualifications: {
    qualification: {
      name: string;
    };
  }[];
  specializations: {
    specialization: {
      name: string;
    };
  }[];
}

export default function PrescriptionPreview() {
  const [data, setData] = useState<PrescriptionData | null>(null);
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const patientId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("patientId")
      : null;

  useEffect(() => {
    const stored = localStorage.getItem("prescriptionData");
    if (stored) {
      setData(JSON.parse(stored));
    }
    // Fetch doctor info
    const email = localStorage.getItem("email");
    if (!email) return;
    fetch(`http://localhost:8080/api/doctors/email/${email}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((doc) => setDoctor(doc))
      .catch(() => setDoctor(null));
  }, []);

  const handleEdit = () => {
    window.location.href = `/doctor/prescribe?edit=1&patientId=${
      patientId ?? ""
    }`;
  };

  const handlePrint = () => {
    if (prescriptionRef.current) {
      // Add a print class to only print the prescription section
      prescriptionRef.current.classList.add("print-area");
      window.print();
      setTimeout(() => {
        prescriptionRef.current?.classList.remove("print-area");
      }, 1000);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header />
      <SubHeader />
      <main className="flex-grow container mx-auto px-4 py-10 flex flex-col items-center justify-center">
        <div
          ref={prescriptionRef}
          className="relative w-[794px] h-[1123px] mx-auto bg-white"
        >
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-400 rounded-b-xl shadow-md z-10 border-t-4 border-gray-600"></div>
          <img
            src="/Prescription.png"
            alt="Prescription Background"
            className="absolute w-full h-full object-cover z-0"
          />
          {/* Doctor Info */}
          {doctor && (
            <div className="absolute left-[410px] top-[78px] z-10 flex flex-col items-start">
              <span className="text-3xl font-bold text-green-900 leading-tight">
                {doctor.user.name}
              </span>
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <span className="text-lg text-green-800 font-medium leading-tight">
                  {doctor.qualifications
                    .map((q) => q.qualification.name)
                    .join(", ")}
                </span>
              )}
              {doctor.specializations && doctor.specializations.length > 0 && (
                <span className="text-base text-green-700 leading-tight">
                  {doctor.specializations
                    .map((s) => s.specialization.name)
                    .join(", ")}
                </span>
              )}
              <span className="text-m text-green-600 mt-1">
                Phone: {doctor.user.phoneNumber}
              </span>
            </div>
          )}
          {/* Prescription Data */}
          {data ? (
            <>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[217px] left-[140px] w-[200px] h-[38px] flex items-center">
                {data.name}
              </span>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[217px] left-[480px] w-[70px] h-[38px] flex items-center">
                {data.age}
              </span>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[217px] left-[620px] w-[40px] h-[40px] flex items-center justify-center border-2 border-red-500">
                {data.gender === "Male" ? "✔" : ""}
              </span>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[217px] left-[728px] w-[40px] h-[40px] flex items-center justify-center border-2 border-red-500">
                {data.gender === "Female" ? "✔" : ""}
              </span>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[263px] left-[365px] w-[165px] h-[39px] flex items-center">
                {data.patientId}
              </span>
              <span className="absolute z-10 px-2 text-2xl font-medium top-[263px] left-[612.5px] w-[165px] h-[39px] flex items-center">
                {data.date}
              </span>
              <span className="absolute z-10 px-2 text-lg top-[300px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                {data.cc}
              </span>
              <span className="absolute z-10 px-2 text-lg top-[466px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                {data.oe}
              </span>
              <span className="absolute z-10 px-2 text-lg top-[633px] left-[5px] w-[250px] h-[120px] flex items-start p-2 whitespace-pre-line">
                {data.invs}
              </span>
              <span className="absolute z-10 px-2 text-lg top-[773px] left-[5px] w-[250px] h-[140px] flex items-start p-2 whitespace-pre-line">
                {data.adv}
              </span>
              {/* Medicines List */}
              {Array.isArray(data.medicines) && data.medicines.length > 0 && (
                <div className="absolute z-10 top-[350px] left-[370px] w-[500px] h-[613px] flex flex-col gap-4 p-2 overflow-y-auto">
                  {data.medicines.map((med, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex items-center font-bold text-lg text-green-900 mb-1">
                        <span className="mr-2">{idx + 1}.</span>
                        {med.name}
                      </div>
                      <div className="text-sm text-green-800 mb-1">
                        Dosage: {med.nums && med.nums.join("-")}
                      </div>
                      {med.comment && (
                        <div className="text-xs text-gray-700 italic">
                          Comment: {med.comment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-xl text-gray-600 bg-white/80 px-6 py-4 rounded-lg border border-gray-300">
                No prescription data found.
              </span>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-10 print:hidden">
          <button
            onClick={handleEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-200"
          >
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition duration-200"
          >
            Print
          </button>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        @media print {
          body,
          html {
            margin: 0 !important;
            padding: 0 !important;
            width: 80vw !important;
            height: 100vh !important;
          }
          .print-area {
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
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
