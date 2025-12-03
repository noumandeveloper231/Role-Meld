import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUsers, FaTrash } from "react-icons/fa";
import { Ban, Unlock, Mail, Filter } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AdminUsers = () => {
  const { backendUrl } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const getUsers = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/allusers`);
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Delete
  const deleteUser = async (id) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/delete-user`, { id });
      if (data.success) {
        toast.success(data.message);
        await getUsers();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Ban / Unban
  const toggleBan = async (email, isBanned) => {
    const url = isBanned
      ? `${backendUrl}/api/auth/unban-user`
      : `${backendUrl}/api/auth/ban-user`;

    try {
      const { data } = await axios.post(url, { email });
      if (data.success) {
        toast.success(data.message);
        await getUsers();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    if (selectedCity) filtered = filtered.filter((u) => u.city?.toLowerCase() === selectedCity.toLowerCase());
    if (selectedRole) filtered = filtered.filter((u) => u.role?.toLowerCase() === selectedRole.toLowerCase());
    if (selectedStatus) filtered = filtered.filter((u) => u.status === selectedStatus);

    if (timeFilter) {
      const now = new Date();
      filtered = filtered.filter((u) => {
        const createdAt = new Date(u.createdAt);
        if (timeFilter === "7days") return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
        if (timeFilter === "month") return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
        if (timeFilter === "3months") return now - createdAt <= 90 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    if (sortOrder === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortOrder === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortOrder === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedCity, selectedRole, selectedStatus, timeFilter, sortOrder, users]);

  // Stats
  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.isBanned).length;
  const activeUsers = totalUsers - bannedUsers;

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const startItem = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredUsers.length);

  return (
    <div className="rounded-xl w-full min-h-screen border border-gray-200 p-6 rouned-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
          Manage Users
        </h1>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-600 font-medium">Total Users</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalUsers}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
          <p className="text-gray-600 font-medium">Active Users</p>
          <h2 className="text-3xl font-bold text-green-600 mt-1">{activeUsers}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
          <p className="text-gray-600 font-medium">Banned Users</p>
          <h2 className="text-3xl font-bold text-red-600 mt-1">{bannedUsers}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">

          <div className="w-full grid grid-cols-2 md:grid-cols- lg:grid-cols-4 gap-2">
            <CustomSelect
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {[...new Set(users.map((u) => u.city))].map((city) => city && <option key={city} value={city}>{city}</option>)}
            </CustomSelect>

            <CustomSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </CustomSelect>

            <CustomSelect
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
            </CustomSelect>

            <CustomSelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A–Z</option>
              <option value="z-a">Z–A</option>
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-white text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-6">Name</th>
              <th className="px-6 py-6">Email</th>
              <th className="px-6 py-6">City</th>
              <th className="px-6 py-6 text-center">Applied Jobs</th>
              <th className="px-6 py-6 text-center">Status</th>
              <th className="px-6 py-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u, i) => (
              <tr key={u.authId || i} className={`transition duration-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                <td className="px-6 py-6 font-semibold text-gray-800">{u.name}</td>
                <td className="px-6 py-6 flex items-center gap-2">
                  <Mail size={15} className="text-gray-500" /> {u.email}
                </td>
                <td className="px-6 py-6">{u.city || <span className="text-gray-400">N/A</span>}</td>
                <td className="px-6 py-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {u.appliedJobs?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold ${u.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button onClick={() => deleteUser(u.authId)} className="cursor-pointer text-red-500 hover:text-red-700 transition" title="Delete">
                      <FaTrash size={18} />
                    </button>
                    {u.isBanned ? (
                      <button onClick={() => toggleBan(u.email, true)} className="cursor-pointer text-green-500 hover:text-green-700 transition" title="Unban">
                        <Unlock size={18} />
                      </button>
                    ) : (
                      <button onClick={() => toggleBan(u.email, false)} className="cursor-pointer text-red-500 hover:text-red-700 transition" title="Ban">
                        <Ban size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-6 px-6" colSpan={7}>
                {filteredUsers.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-sm text-gray-600">
                        {startItem} - {endItem} of {filteredUsers.length} items
                      </span>
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                      {/* Previous button */}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      {/* Page numbers */}
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        // First page
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                        }

                        // Visible pages
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 cursor-pointer py-1 text-sm border rounded-md ${currentPage === i
                                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Last page
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-500">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      {/* Next button */}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}

    </div>
  );
};

export default AdminUsers;
