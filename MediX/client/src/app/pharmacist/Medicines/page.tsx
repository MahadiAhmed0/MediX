"use client";
import Header from "@/components/pharmacist/header";
import SubHeader from "@/components/pharmacist/subHeader";
import Footer from "@/components/footer";

import React, { useState, useEffect } from "react";

type Medicine = {
  id: number;
  company: string;
  name: string;
  genericName: string;
  quantity: number;
  totalCostPrice?: number;
  sellingPricePerUnit?: number;
  expiryDate?: string;
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Medicine | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );
  const [form, setForm] = useState({
    company: "",
    name: "",
    genericName: "",
    quantity: "",
    totalCostPrice: "",
    sellingPricePerUnit: "",
    expiryDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    // Fetch medicines from backend API
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/medicines");
        if (!response.ok) throw new Error("Failed to fetch medicines");
        const data = await response.json();
        // Map backend fields to frontend Medicine type if needed
        const mapped = data.map((med: any) => ({
          id: med.id || med.medicineId || Date.now() + Math.random(),
          company: med.company,
          name: med.medicineName,
          genericName: med.genericName,
          quantity: med.quantity,
          totalCostPrice: med.unitCost, // backend: unitCost
          sellingPricePerUnit: med.unitPrice, // backend: unitPrice
          expiryDate: med.expiryDate,
        }));
        setMedicines(mapped);
      } catch (error) {
        setMedicines([]);
      }
    };
    fetchMedicines();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Hide toast after 3 seconds
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.company ||
      !form.name ||
      !form.genericName ||
      !form.quantity ||
      !form.totalCostPrice ||
      !form.sellingPricePerUnit ||
      !form.expiryDate
    )
      return;

    const requestBody = {
      company: form.company,
      medicineName: form.name,
      genericName: form.genericName,
      quantity: Number(form.quantity),
      unitCost: Number(form.totalCostPrice),
      unitPrice: Number(form.sellingPricePerUnit),
      expiryDate: form.expiryDate,
    };

    try {
      const response = await fetch("http://localhost:8080/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || "Failed to add medicine.", "error");
        return;
      }

      showToast("Medicine added successfully!", "success");
      setForm({
        company: "",
        name: "",
        genericName: "",
        quantity: "",
        totalCostPrice: "",
        sellingPricePerUnit: "",
        expiryDate: "",
      });
      setShowAddForm(false);
      // Refresh medicines list from backend
      const updated = await fetch("http://localhost:8080/api/medicines");
      if (updated.ok) {
        const data = await updated.json();
        const mapped = data.map((med: any) => ({
          id: med.id || med.medicineId || Date.now() + Math.random(),
          company: med.company,
          name: med.medicineName,
          genericName: med.genericName,
          quantity: med.quantity,
          totalCostPrice: med.unitCost,
          sellingPricePerUnit: med.unitPrice,
          expiryDate: med.expiryDate,
        }));
        setMedicines(mapped);
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
  };

  const handleEdit = (id: number) => {
    const med = medicines.find((m) => m.id === id);
    if (med) {
      setForm({
        company: med.company,
        name: med.name,
        genericName: med.genericName,
        quantity: med.quantity?.toString() || "",
        totalCostPrice: med.totalCostPrice?.toString() || "",
        sellingPricePerUnit: med.sellingPricePerUnit?.toString() || "",
        expiryDate: "", // Don't populate expiry date for editing
      });
      setEditId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;

    // Find the medicine to get its backend ID if needed
    const med = medicines.find((m) => m.id === editId);
    if (!med) return;

    // Prepare request body as per backend API (excluding expiry date for updates)
    const requestBody = {
      id: med.id, // or medicineId if backend expects
      company: form.company,
      medicineName: form.name,
      genericName: form.genericName,
      quantity: Number(form.quantity),
      unitCost: Number(form.totalCostPrice),
      unitPrice: Number(form.sellingPricePerUnit),
      expiryDate: med.expiryDate, // Keep original expiry date
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/medicines/${med.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || "Failed to update medicine.", "error");
        return;
      }

      showToast("Medicine updated successfully!", "success");
      setForm({
        company: "",
        name: "",
        genericName: "",
        quantity: "",
        totalCostPrice: "",
        sellingPricePerUnit: "",
        expiryDate: "",
      });
      setEditId(null);
      setShowAddForm(false);
      // Refresh medicines list from backend
      const updated = await fetch("http://localhost:8080/api/medicines");
      if (updated.ok) {
        const data = await updated.json();
        const mapped = data.map((med: any) => ({
          id: med.id || med.medicineId || Date.now() + Math.random(),
          company: med.company,
          name: med.medicineName,
          genericName: med.genericName,
          quantity: med.quantity,
          totalCostPrice: med.unitCost,
          sellingPricePerUnit: med.unitPrice,
          expiryDate: med.expiryDate,
        }));
        setMedicines(mapped);
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) {
      showToast("Deletion canceled!", "error");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/medicines/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.message || "Failed to delete medicine.", "error");
        return;
      }
      showToast("Medicine deleted successfully!", "success");
      // Refresh medicines list from backend
      const updated = await fetch("http://localhost:8080/api/medicines");
      if (updated.ok) {
        const data = await updated.json();
        const mapped = data.map((med: any) => ({
          id: med.id || med.medicineId || Date.now() + Math.random(),
          company: med.company,
          name: med.medicineName,
          genericName: med.genericName,
          quantity: med.quantity,
          totalCostPrice: med.unitCost,
          sellingPricePerUnit: med.unitPrice,
          expiryDate: med.expiryDate,
        }));
        setMedicines(mapped);
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    }
  };

  const filteredMeds = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLowStockFilter = () => {
    setFilterLowStock(!filterLowStock);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Sorting function
  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null (default)
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // Start with ascending for new field
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Get sort icon for header
  const getSortIcon = (field: keyof Medicine) => {
    if (sortField !== field) {
      return "↕️"; // Default/neutral sort icon
    }
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Apply sorting to filtered medicines
  let sortedMeds = filterLowStock
    ? filteredMeds.filter((m) => m.quantity < 30)
    : filteredMeds;

  if (sortField && sortDirection) {
    sortedMeds = [...sortedMeds].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle different data types
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        // Fallback to string comparison (including dates)
        comparison = String(aValue || "").localeCompare(String(bValue || ""));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }

  const allFilteredMeds = sortedMeds;

  // Pagination logic
  const totalPages = Math.ceil(allFilteredMeds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const medsToDisplay = allFilteredMeds.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Function to determine stock tag based on quantity
  const getStockTag = (quantity: number) => {
    if (quantity >= 60) return "High";
    if (quantity >= 30) return "Medium";
    return "Low";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <SubHeader />

      <main className="flex flex-col items-center flex-grow mt-10 px-4 w-full">
        <div className="flex gap-4 mb-6">
          <button
            className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800"
            onClick={() => {
              setShowAddForm(true);
              setEditId(null);
              setForm({
                company: "",
                name: "",
                genericName: "",
                quantity: "",
                totalCostPrice: "",
                sellingPricePerUnit: "",
                expiryDate: "",
              });
            }}
          >
            ➕ Add Medicine
          </button>
          <button
            className={`px-4 py-2 rounded font-bold ${
              filterLowStock
                ? "bg-green-800 text-white"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
            onClick={toggleLowStockFilter}
          >
            {filterLowStock ? "Show All" : "Low Stock List"}
          </button>
        </div>

        {/* Search Input */}
        <div className="flex mb-6 w-full max-w-xs">
          <input
            type="text"
            placeholder="Search by name, company, or generic name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-2 text-black border-purple-300 rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Medicine List Table */}
        <div className="w-full max-w-7xl mb-10">
          <table className="min-w-full bg-white shadow rounded-lg overflow-x-auto">
            <thead className="bg-green-700 text-white text-sm">
              <tr>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("company")}
                  >
                    Company{" "}
                    <span className="ml-1">{getSortIcon("company")}</span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    Medicine Name{" "}
                    <span className="ml-1">{getSortIcon("name")}</span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("genericName")}
                  >
                    Generic Name{" "}
                    <span className="ml-1">{getSortIcon("genericName")}</span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("quantity")}
                  >
                    Quantity{" "}
                    <span className="ml-1">{getSortIcon("quantity")}</span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("totalCostPrice")}
                  >
                    Total Cost Price{" "}
                    <span className="ml-1">
                      {getSortIcon("totalCostPrice")}
                    </span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("sellingPricePerUnit")}
                  >
                    Selling Price/Unit{" "}
                    <span className="ml-1">
                      {getSortIcon("sellingPricePerUnit")}
                    </span>
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button
                    className="flex items-center justify-center w-full text-white hover:text-gray-200 transition-colors"
                    onClick={() => handleSort("expiryDate")}
                  >
                    Expiry Date{" "}
                    <span className="ml-1">{getSortIcon("expiryDate")}</span>
                  </button>
                </th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-black">
              {medsToDisplay.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-black">
                    No medicines found.
                  </td>
                </tr>
              ) : (
                medsToDisplay.map((med) => (
                  <tr
                    key={med.id}
                    className={med.quantity < 30 ? "bg-red-100" : ""}
                  >
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.company}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">{med.name}</td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.genericName}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.quantity}{" "}
                      <span
                        className={`px-2 py-1 rounded-full ${
                          getStockTag(med.quantity) === "High"
                            ? "bg-green-500"
                            : getStockTag(med.quantity) === "Medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        } text-white`}
                      >
                        {getStockTag(med.quantity)}
                      </span>
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.totalCostPrice !== undefined
                        ? med.totalCostPrice
                        : "-"}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.sellingPricePerUnit !== undefined
                        ? med.sellingPricePerUnit
                        : "-"}
                    </td>
                    <td className="py-2 px-6 whitespace-nowrap">
                      {med.expiryDate || "-"}
                    </td>
                    <td className="py-2 px-6 flex gap-2 whitespace-nowrap">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                        onClick={() => handleEdit(med.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => handleDelete(med.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {allFilteredMeds.length > 0 && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <div className="flex items-center space-x-1">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } transition-colors`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } transition-colors`}
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <div className="ml-4 mb-20 text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, allFilteredMeds.length)} of{" "}
              {allFilteredMeds.length} entries
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Add/Edit Form as Modal */}
        {showAddForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <form
              onSubmit={editId ? handleUpdate : handleAdd}
              className="flex flex-col gap-5 w-full max-w-md bg-white border border-gray-200 shadow-xl p-8 rounded-2xl overflow-hidden relative animate-fadeIn overflow-y-auto"
              style={{ minWidth: "320px", maxHeight: "90vh" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {editId ? "Edit Medicine" : "Add Medicine"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditId(null);
                    setForm({
                      company: "",
                      name: "",
                      genericName: "",
                      quantity: "",
                      totalCostPrice: "",
                      sellingPricePerUnit: "",
                      expiryDate: "",
                    });
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="e.g. Square Pharmaceuticals"
                    value={form.company}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Medicine Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. Napa"
                    value={form.name}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="genericName"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Generic Name
                  </label>
                  <input
                    id="genericName"
                    name="genericName"
                    type="text"
                    placeholder="e.g. Paracetamol"
                    value={form.genericName}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={form.quantity}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="totalCostPrice"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Total Cost Price
                  </label>
                  <input
                    id="totalCostPrice"
                    name="totalCostPrice"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={form.totalCostPrice}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="sellingPricePerUnit"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Selling Price Per Unit
                  </label>
                  <input
                    id="sellingPricePerUnit"
                    name="sellingPricePerUnit"
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={form.sellingPricePerUnit}
                    onChange={handleInputChange}
                    className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                    required
                  />
                </div>
                {/* Only show expiry date input when adding new medicine, not when editing */}
                {!editId && (
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Expiry Date
                    </label>
                    <input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={form.expiryDate}
                      onChange={handleInputChange}
                      className="block w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditId(null);
                    setForm({
                      company: "",
                      name: "",
                      genericName: "",
                      quantity: "",
                      totalCostPrice: "",
                      sellingPricePerUnit: "",
                      expiryDate: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-purple-700 active:scale-95 transition"
                >
                  {editId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
