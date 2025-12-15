import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash, Ban, Unlock, Mail, MapPin, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AdminRecruiters = () => {
  const { backendUrl } = useContext(AppContext);
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);

  // Filters
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [timeFilter, setTimeFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const getRecruiters = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/allrecruiters`);
      if (data.success) {
        setRecruiters(data.recruiters);
        setFilteredRecruiters(data.recruiters);
      }
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  };

  useEffect(() => {
    getRecruiters();
  }, []);

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recruiter?")) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/delete-user`, { id });
      if (data.success) {
        toast.success(data.message);
        await getRecruiters();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Ban / Unban user
  const toggleBan = async (email, isBanned) => {
    const url = isBanned
      ? `${backendUrl}/api/auth/unban-user`
      : `${backendUrl}/api/auth/ban-user`;

    try {
      const { data } = await axios.post(url, { email });
      if (data.success) {
        toast.success(data.message);
        await getRecruiters();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...recruiters];

    if (selectedCity) {
      filtered = filtered.filter((r) => r.city?.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedRole) {
      filtered = filtered.filter((r) => r.role?.toLowerCase() === selectedRole.toLowerCase());
    }
    if (selectedStatus) {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (timeFilter) {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const createdAt = new Date(r.createdAt);
        if (timeFilter === "7days") return now - createdAt <= 7 * 24 * 60 * 60 * 1000;
        if (timeFilter === "month") return now - createdAt <= 30 * 24 * 60 * 60 * 1000;
        if (timeFilter === "3months") return now - createdAt <= 90 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOrder === "a-z") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "z-a") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredRecruiters(filtered);
  }, [selectedCity, selectedRole, selectedStatus, timeFilter, sortOrder, recruiters]);

  const totalPages = Math.ceil(recruiters.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecruiters = recruiters.slice(startIndex, endIndex)

  // Count stats
  const approvedCount = recruiters.filter((r) => r.reviewStatus === "approved").length;
  const pendingCount = recruiters.filter((r) => r.reviewStatus === "pending").length;
  const rejectedCount = recruiters.filter((r) => r.reviewStatus === "rejected").length;
  const underReviewCount = recruiters.filter((r) => r.reviewStatus === "udnerReview").length;

  return (
    <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
          Recruiters Management
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
          <p className="text-gray-600 font-medium">Approved</p>
          <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-gray-600 font-medium">Pending</p>
          <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
          <p className="text-gray-600 font-medium">Rejected</p>
          <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</h2>
        </div>
        <div className="p-5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
          <p className="text-gray-600 font-medium">Requests</p>
          <h2 className="text-3xl font-bold text-orange-600 mt-1">{underReviewCount}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            <CustomSelect
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {[...new Set(recruiters.map((r) => r.city))].map(
                (city) => city && <option key={city} value={city}>{city}</option>
              )}
            </CustomSelect>

            <CustomSelect
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="underReview">Under Review</option>
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
      <div className="overflow-x-auto rounded-lg border border-gray-300">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="text-left text-gray-500 bg-white border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">City</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Jobs</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecruiters.length > 0 ? (
              paginatedRecruiters.map((r, i) => (
                <tr
                  key={r._id}
                  className="hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-3 font-medium text-gray-600">{i + 1}</td>
                  <td className="px-6 py-3 font-semibold text-gray-800">{r.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {r.email}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      {r.city || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-gray-400" />
                      {r.company || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{r.role || "N/A"}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {r.sentJobs?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {r.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => deleteUser(r.authId)}
                        className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                      {r.isBanned ? (
                        <button
                          onClick={() => toggleBan(r.email, true)}
                          className="p-2 rounded-full hover:bg-green-50 transition-colors text-green-500"
                          title="Unban"
                        >
                          <Unlock size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleBan(r.email, false)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500"
                          title="Ban"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center pt-6 pb-6">
                  No recruiters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6'>
        <div className='flex items-center gap-4'>
          <div>
            <CustomSelect
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[5, 10, 25].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </CustomSelect>
          </div>
          <div className='text-sm text-gray-600'>
            Showing {paginatedRecruiters.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, paginatedRecruiters.length)} of {paginatedRecruiters.length}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className='p-1 text-sm border border-gray-300 rounded-full disabled:opacity-50'
          >
            <ChevronLeft />
          </button>
          <span className='text-sm text-gray-600'>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className='p-1 text-sm border border-gray-300 rounded-full disabled:opacity-50'
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRecruiters;
