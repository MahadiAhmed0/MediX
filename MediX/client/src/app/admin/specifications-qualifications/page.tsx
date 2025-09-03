"use client";
import { useEffect, useState } from "react";
import Header from "@/components/admin/header";
import Footer from "@/components/footer";

type Specialization = {
  id: number;
  name: string;
};
type Qualification = {
  id: number;
  name: string;
};

type EditMode = "none" | "edit" | "delete";

export default function SpecificationsQualificationsPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add mode states
  const [showAddSpecialization, setShowAddSpecialization] = useState(false);
  const [showAddQualification, setShowAddQualification] = useState(false);
  const [newSpecializationName, setNewSpecializationName] = useState("");
  const [newQualificationName, setNewQualificationName] = useState("");

  // Edit/Delete mode states
  const [specializationEditMode, setSpecializationEditMode] =
    useState<EditMode>("none");
  const [qualificationEditMode, setQualificationEditMode] =
    useState<EditMode>("none");
  const [editingSpecializationId, setEditingSpecializationId] = useState<
    number | null
  >(null);
  const [editingQualificationId, setEditingQualificationId] = useState<
    number | null
  >(null);
  const [editSpecializationName, setEditSpecializationName] = useState("");
  const [editQualificationName, setEditQualificationName] = useState("");

  // Loading states for operations
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [specsRes, qualsRes] = await Promise.all([
        fetch("http://localhost:8080/api/specializations"),
        fetch("http://localhost:8080/api/qualifications"),
      ]);

      if (!specsRes.ok) throw new Error("Failed to fetch specializations");
      if (!qualsRes.ok) throw new Error("Failed to fetch qualifications");

      const specs = await specsRes.json();
      const quals = await qualsRes.json();

      setSpecializations(specs);
      setQualifications(quals);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add functions
  const addSpecialization = async () => {
    if (!newSpecializationName.trim()) return;

    setOperationLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/specializations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newSpecializationName.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add specialization");
      }

      const newSpec = await response.json();
      setSpecializations((prev) => [...prev, newSpec]);
      setNewSpecializationName("");
      setShowAddSpecialization(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const addQualification = async () => {
    if (!newQualificationName.trim()) return;

    setOperationLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/qualifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newQualificationName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add qualification");
      }

      const newQual = await response.json();
      setQualifications((prev) => [...prev, newQual]);
      setNewQualificationName("");
      setShowAddQualification(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  // Edit functions
  const startEditSpecialization = (spec: Specialization) => {
    setEditingSpecializationId(spec.id);
    setEditSpecializationName(spec.name);
    setSpecializationEditMode("none");
  };

  const saveEditSpecialization = async () => {
    if (!editSpecializationName.trim() || !editingSpecializationId) return;

    setOperationLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/specializations/${editingSpecializationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editSpecializationName.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update specialization");
      }

      const updatedSpec = await response.json();
      setSpecializations((prev) =>
        prev.map((spec) =>
          spec.id === editingSpecializationId ? updatedSpec : spec
        )
      );
      setEditingSpecializationId(null);
      setEditSpecializationName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const startEditQualification = (qual: Qualification) => {
    setEditingQualificationId(qual.id);
    setEditQualificationName(qual.name);
    setQualificationEditMode("none");
  };

  const saveEditQualification = async () => {
    if (!editQualificationName.trim() || !editingQualificationId) return;

    setOperationLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/qualifications/${editingQualificationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editQualificationName.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update qualification");
      }

      const updatedQual = await response.json();
      setQualifications((prev) =>
        prev.map((qual) =>
          qual.id === editingQualificationId ? updatedQual : qual
        )
      );
      setEditingQualificationId(null);
      setEditQualificationName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  // Delete functions
  const deleteSpecialization = async (id: number) => {
    setOperationLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/specializations/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Check for foreign key constraint violations
        if (
          response.status === 409 ||
          (response.status === 500 &&
            (errorData.details?.includes("foreign key constraint") ||
              errorData.details?.includes("constraint violation") ||
              errorData.details?.includes("referential integrity") ||
              errorData.message?.includes("foreign key constraint") ||
              errorData.message?.includes("constraint violation")))
        ) {
          throw new Error(
            "Cannot delete this specialization because it is currently assigned to one or more doctors. Please remove this specialization from all doctors first."
          );
        }
        throw new Error(errorData.error || "Failed to delete specialization");
      }

      setSpecializations((prev) => prev.filter((spec) => spec.id !== id));
      setSpecializationEditMode("none");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const deleteQualification = async (id: number) => {
    setOperationLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/qualifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Check for foreign key constraint violations
        if (
          response.status === 409 ||
          (response.status === 500 &&
            (errorData.details?.includes("foreign key constraint") ||
              errorData.details?.includes("constraint violation") ||
              errorData.details?.includes("referential integrity") ||
              errorData.message?.includes("foreign key constraint") ||
              errorData.message?.includes("constraint violation")))
        ) {
          throw new Error(
            "Cannot delete this qualification because it is currently assigned to one or more doctors. Please remove this qualification from all doctors first."
          );
        }
        throw new Error(errorData.error || "Failed to delete qualification");
      }

      setQualifications((prev) => prev.filter((qual) => qual.id !== id));
      setQualificationEditMode("none");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto py-10 px-4 w-full">
        <div className="bg-gradient-to-r from-green-100/80 via-green-200/50 to-green-100/80 rounded-2xl shadow-lg p-8 border border-green-200">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl md:text-4xl">🎓</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-green-900 tracking-tight">
              Specializations & Degrees
            </h1>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-green-800 animate-pulse">
              <svg
                className="w-5 h-5 animate-spin"
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span>Loading specializations and degrees...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Specializations Section */}
              <section className="bg-white/80 rounded-xl shadow p-6 border border-green-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                    <span className="text-green-700">🩺</span> Specializations
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSpecializationEditMode(
                          specializationEditMode === "edit" ? "none" : "edit"
                        )
                      }
                      className={`px-3 py-1 rounded text-sm transition ${
                        specializationEditMode === "edit"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      disabled={operationLoading}
                    >
                      {specializationEditMode === "edit"
                        ? "Cancel Edit"
                        : "Edit"}
                    </button>
                    <button
                      onClick={() =>
                        setSpecializationEditMode(
                          specializationEditMode === "delete"
                            ? "none"
                            : "delete"
                        )
                      }
                      className={`px-3 py-1 rounded text-sm transition ${
                        specializationEditMode === "delete"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                      disabled={operationLoading}
                    >
                      {specializationEditMode === "delete"
                        ? "Cancel Delete"
                        : "Delete"}
                    </button>
                  </div>
                </div>

                {specializationEditMode === "edit" && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      Click on a specialization to edit it
                    </p>
                  </div>
                )}

                {specializationEditMode === "delete" && (
                  <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-red-700 text-sm">
                      Click on a specialization to delete it
                    </p>
                  </div>
                )}

                <ul className="flex-1 space-y-2">
                  {specializations.length === 0 ? (
                    <li className="text-gray-400 italic">
                      No specializations found.
                    </li>
                  ) : (
                    specializations.map((spec) => (
                      <li key={spec.id}>
                        {editingSpecializationId === spec.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editSpecializationName}
                              onChange={(e) =>
                                setEditSpecializationName(e.target.value)
                              }
                              className="flex-1 px-3 py-2 text-black border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              disabled={operationLoading}
                              onKeyPress={(e) =>
                                e.key === "Enter" && saveEditSpecialization()
                              }
                            />
                            <button
                              onClick={saveEditSpecialization}
                              disabled={operationLoading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingSpecializationId(null);
                                setEditSpecializationName("");
                              }}
                              disabled={operationLoading}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`px-3 py-2 rounded bg-green-50 border border-green-100 text-green-900 shadow-sm transition ${
                              specializationEditMode === "edit"
                                ? "hover:bg-blue-100 cursor-pointer"
                                : specializationEditMode === "delete"
                                ? "hover:bg-red-100 cursor-pointer"
                                : "hover:bg-green-100"
                            }`}
                            onClick={() => {
                              if (specializationEditMode === "edit") {
                                startEditSpecialization(spec);
                              } else if (specializationEditMode === "delete") {
                                if (
                                  confirm(
                                    `Are you sure you want to delete "${spec.name}"?`
                                  )
                                ) {
                                  deleteSpecialization(spec.id);
                                }
                              }
                            }}
                          >
                            {spec.name}
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>

                {/* Add Specialization */}
                {showAddSpecialization ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newSpecializationName}
                      onChange={(e) => setNewSpecializationName(e.target.value)}
                      placeholder="Enter specialization name"
                      className="flex-1 text-black px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={operationLoading}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addSpecialization()
                      }
                      autoFocus
                    />
                    <button
                      onClick={addSpecialization}
                      disabled={
                        operationLoading || !newSpecializationName.trim()
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSpecialization(false);
                        setNewSpecializationName("");
                      }}
                      disabled={operationLoading}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddSpecialization(true)}
                    disabled={
                      operationLoading || specializationEditMode !== "none"
                    }
                    className="mt-4 w-full py-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition disabled:opacity-50"
                  >
                    <span className="text-2xl">+</span>
                    <div className="text-sm">Add Specialization</div>
                  </button>
                )}
              </section>

              {/* Qualifications Section */}
              <section className="bg-white/80 rounded-xl shadow p-6 border border-green-100 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
                    <span className="text-green-700">📜</span> Degrees
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setQualificationEditMode(
                          qualificationEditMode === "edit" ? "none" : "edit"
                        )
                      }
                      className={`px-3 py-1 rounded text-sm transition ${
                        qualificationEditMode === "edit"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      disabled={operationLoading}
                    >
                      {qualificationEditMode === "edit"
                        ? "Cancel Edit"
                        : "Edit"}
                    </button>
                    <button
                      onClick={() =>
                        setQualificationEditMode(
                          qualificationEditMode === "delete" ? "none" : "delete"
                        )
                      }
                      className={`px-3 py-1 rounded text-sm transition ${
                        qualificationEditMode === "delete"
                          ? "bg-red-600 text-white"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                      disabled={operationLoading}
                    >
                      {qualificationEditMode === "delete"
                        ? "Cancel Delete"
                        : "Delete"}
                    </button>
                  </div>
                </div>

                {qualificationEditMode === "edit" && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-700 text-sm">
                      Click on a degree to edit it
                    </p>
                  </div>
                )}

                {qualificationEditMode === "delete" && (
                  <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                    <p className="text-red-700 text-sm">
                      Click on a degree to delete it
                    </p>
                  </div>
                )}

                <ul className="flex-1 space-y-2">
                  {qualifications.length === 0 ? (
                    <li className="text-gray-400 italic">No degrees found.</li>
                  ) : (
                    qualifications.map((qual) => (
                      <li key={qual.id}>
                        {editingQualificationId === qual.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editQualificationName}
                              onChange={(e) =>
                                setEditQualificationName(e.target.value)
                              }
                              className="flex-1 text-black px-3 py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                              disabled={operationLoading}
                              onKeyPress={(e) =>
                                e.key === "Enter" && saveEditQualification()
                              }
                            />
                            <button
                              onClick={saveEditQualification}
                              disabled={operationLoading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingQualificationId(null);
                                setEditQualificationName("");
                              }}
                              disabled={operationLoading}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`px-3 py-2 rounded bg-green-50 border border-green-100 text-green-900 shadow-sm transition ${
                              qualificationEditMode === "edit"
                                ? "hover:bg-blue-100 cursor-pointer"
                                : qualificationEditMode === "delete"
                                ? "hover:bg-red-100 cursor-pointer"
                                : "hover:bg-green-100"
                            }`}
                            onClick={() => {
                              if (qualificationEditMode === "edit") {
                                startEditQualification(qual);
                              } else if (qualificationEditMode === "delete") {
                                if (
                                  confirm(
                                    `Are you sure you want to delete "${qual.name}"?`
                                  )
                                ) {
                                  deleteQualification(qual.id);
                                }
                              }
                            }}
                          >
                            {qual.name}
                          </div>
                        )}
                      </li>
                    ))
                  )}
                </ul>

                {/* Add Qualification */}
                {showAddQualification ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newQualificationName}
                      onChange={(e) => setNewQualificationName(e.target.value)}
                      placeholder="Enter degree name"
                      className="flex-1 px-3 text-black py-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={operationLoading}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addQualification()
                      }
                      autoFocus
                    />
                    <button
                      onClick={addQualification}
                      disabled={
                        operationLoading || !newQualificationName.trim()
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddQualification(false);
                        setNewQualificationName("");
                      }}
                      disabled={operationLoading}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddQualification(true)}
                    disabled={
                      operationLoading || qualificationEditMode !== "none"
                    }
                    className="mt-4 w-full py-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition disabled:opacity-50"
                  >
                    <span className="text-2xl">+</span>
                    <div className="text-sm">Add Degree</div>
                  </button>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
