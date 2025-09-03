"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/admin/header";
import Footer from "@/components/footer";
import { FaUserCircle, FaUserMd, FaUserNurse, FaUserTie } from "react-icons/fa";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  joiningYear: string;
}

export default function RecordsPage() {
  const router = useRouter();

  // Real users fetched from backend
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        // Map backend data to User interface if needed
        const mapped = (data || []).map((u: any) => {
          const idStr = u.id?.toString() ?? "";
          let joiningYear = "";
          if (idStr.length >= 2) {
            const prefix = idStr.substring(0, 2);
            if (/^\d{2}$/.test(prefix)) {
              joiningYear = `20${prefix}`;
            }
          }
          // Determine role from 3rd and 4th digits
          let role = "";
          if (idStr.length >= 4) {
            const roleCode = idStr.substring(2, 4);
            if (roleCode === "01") role = "Doctor";
            else if (roleCode === "02") role = "Receptionist";
            else if (roleCode === "03") role = "Pharmacist";
          }
          return {
            id: idStr,
            name: u.name ?? "",
            email: u.email ?? "",
            role,
            joiningYear,
          };
        });
        setUsers(mapped);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const [filterRole, setFilterRole] = useState("All");

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
  };

  const handleEdit = (userId: string) => {
    router.push(`/admin/edit-user/${userId}`);
  };

  const handleDelete = (userId: string) => {
    // Simulate delete operation
    setUsers(users.filter((user) => user.id !== userId));
  };

  const filteredUsers =
    filterRole === "All"
      ? users
      : users.filter((user) => user.role === filterRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col">
      <Header />
      <main className="flex-grow px-2 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto bg-white/90 shadow-2xl rounded-3xl p-6 sm:p-10 border border-gray-200">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-800 tracking-tight flex items-center gap-2">
              <FaUserCircle className="text-green-500 text-3xl" /> User Records
            </h1>
            <div className="flex items-center gap-2">
              <label
                htmlFor="role"
                className="text-sm text-gray-700 font-semibold"
              >
                Filter by Role
              </label>
              <select
                id="role"
                value={filterRole}
                onChange={handleFilterChange}
                className="p-2 rounded-xl border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="All">All</option>
                <option value="Doctor">Doctor</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Receptionist">Receptionist</option>
              </select>
            </div>
          </div>

          {/* Loading/Error State */}
          {loading ? (
            <div className="text-center py-16 text-lg text-gray-500 animate-pulse">
              Loading users...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-lg text-red-500">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-lg">
              <table className="min-w-full bg-white rounded-2xl">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-blue-100 text-green-900">
                    <th className="p-4 text-sm font-semibold text-left">#</th>
                    <th className="p-4 text-sm font-semibold text-left">
                      Name
                    </th>
                    <th className="p-4 text-sm font-semibold text-left">
                      Email
                    </th>
                    <th className="p-4 text-sm font-semibold text-left">
                      Role
                    </th>
                    <th className="p-4 text-sm font-semibold text-left">
                      Joining Year
                    </th>
                    <th className="p-4 text-sm font-semibold text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-black text-lg"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 text-black hover:bg-blue-50 transition-colors group"
                      >
                        <td className="p-4 text-sm text-gray-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-4 text-sm flex items-center gap-3">
                          <span className="inline-block">
                            {user.role === "Doctor" ? (
                              <FaUserMd className="text-green-600 text-xl" />
                            ) : user.role === "Receptionist" ? (
                              <FaUserTie className="text-blue-600 text-xl" />
                            ) : user.role === "Pharmacist" ? (
                              <FaUserNurse className="text-purple-600 text-xl" />
                            ) : (
                              <FaUserCircle className="text-gray-400 text-xl" />
                            )}
                          </span>
                          <span>{user.name}</span>
                        </td>
                        <td className="p-4 text-sm text-blue-900">
                          {user.email}
                        </td>
                        <td className="p-4 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold
                            ${
                              user.role === "Doctor"
                                ? "bg-green-100 text-green-800"
                                : user.role === "Receptionist"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "Pharmacist"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {user.role || "-"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-700">
                          {user.joiningYear || "-"}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
