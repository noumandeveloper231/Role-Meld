import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import CustomSelect from './CustomSelect';
import { Search, Eye, Check, X, CreditCard, Briefcase } from 'lucide-react';
import { MdOutlinePayment, MdCancel } from "react-icons/md";

const AdminJobRequests = () => {
  const { backendUrl } = useContext(AppContext);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingJobId, setLoadingJobId] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all pending jobs
  const getPendingJobs = async () => {
    setLoadingA(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getpendingjobs`);
      if (data.success) {
        setPendingJobs(data.jobs);
      }
    } catch (error) {
      toast.error("Error fetching pending jobs: " + error.message);
    } finally {
      setLoadingA(false);
    }
  };

  useEffect(() => {
    getPendingJobs();
  }, []);

  // Update job status
  const updateJobStatus = async (id, status) => {
    setLoadingJobId(id);
    try {
      const { data } = await axios.patch(`${backendUrl}/api/jobs/updatejobstatus`, { jobId: id, status });
      if (data.success) {
        toast.success("Job status updated successfully");
        getPendingJobs();
      }
    } catch (error) {
      toast.error("Error updating job status: " + error.message);
    } finally {
      setLoadingJobId(null);
    }
  };

  // View job details
  const viewDetails = (id) => {
    navigate(`/jobDetails/${id}`);
  };

  // Filter Logic
  const filteredJobs = pendingJobs.filter((job) => {
    // Apply search filter
    const searchMatch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  }).sort((a, b) => {
    // Apply sorting
    if (sortOrder === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    if (sortOrder === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
    if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
    if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);
  const startItem = filteredJobs.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(endIndex, filteredJobs.length);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  // Stats Calculations
  const requestsThisWeek = pendingJobs.filter(job => {
    const jobDate = new Date(job.createdAt || job.date);
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return jobDate >= oneWeekAgo;
  }).length;

  if (loadingA) return <div className='w-full'> <Loading /></div>;

  return (
    <div className='bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6'>
      <div className='rounded-lg'>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
            Job Requests
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
            <p className="text-gray-600 font-medium">Requests this week</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-1">{requestsThisWeek}</h2>
          </div>
          <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-gray-600 font-medium">Pending</p>
            <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingJobs.length}</h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full flex justify-between gap-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!pl-10"
                />
              </div>

              {/* Sort Order */}
              <CustomSelect
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={"w-40"}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
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
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Company</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Sponsored</th>
                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs?.length > 0 ? (
                currentJobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-3 font-semibold text-gray-800">{job.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 flex items-center gap-2">
                      <Briefcase size={14} className="text-[var(--primary-color)]" />
                      {job.company}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{job.category}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(job.createdAt || job.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold
                        ${job.approved === "pending" ? "bg-yellow-100 text-yellow-700" :
                          job.approved === "approved" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                        }`}
                      >
                        {job.approved}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${job.sponsored ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                        {job.sponsored ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-700">
                      <div className='w-full flex justify-center items-center gap-2'>
                        <button
                          onClick={() => navigate(`/jobs/${job?.category}/${job.slug}`)}
                          className='p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500'
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => updateJobStatus(job._id, "approved")}
                          className='p-2 rounded-full hover:bg-green-50 transition-colors text-green-500'
                          title="Approve"
                          disabled={loadingJobId === job._id}
                        >
                          <Check size={18} />
                        </button>

                        <button
                          onClick={() => updateJobStatus(job._id, "rejected")}
                          className='p-2 rounded-full hover:bg-red-50 transition-colors text-red-500'
                          title="Reject"
                          disabled={loadingJobId === job._id}
                        >
                          <X size={18} />
                        </button>

                        {job.sponsored && (
                          <button
                            onClick={() => setShowPaymentDetails(job)}
                            className='p-2 rounded-full hover:bg-blue-50 transition-colors text-blue-500'
                            title="Payment Details"
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center pt-6 pb-6">
                    No job requests found.
                  </td>
                </tr>
              )}

              {/* Pagination Row */}
              <tr>
                <td className='px-6 py-3' colSpan={7}>
                  {filteredJobs.length > 0 && (
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
                          {startItem} - {endItem} of {filteredJobs.length} items
                        </span>
                      </div>

                      {/* Page navigation */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {/* Pagination Numbers Logic */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 cursor-pointer py-1 text-sm border rounded-md ${currentPage === pageNum
                                ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                : "border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

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
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && (
        <div className="flex items-center justify-center fixed top-0 left-0 h-screen w-full backdrop-blur-sm z-50">
          <div className="bg-white shadow-lg relative rounded-2xl p-6 border border-gray-300 w-11/12 sm:w-1/2">
            <MdCancel
              className="absolute top-3 right-3 text-gray-500 cursor-pointer hover:text-red-500"
              size={22}
              onClick={() => setShowPaymentDetails(null)}
            />
            <h2 className="font-semibold flex items-center gap-3 text-lg mb-4">
              <MdOutlinePayment className="text-[var(--primary-color)]" /> Payment Details
            </h2>
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <h4 className="font-semibold">Payment Name</h4>
                <p>{showPaymentDetails.cardName || "N/A"}</p>
              </div>

              <div>
                <h4 className="font-semibold mt-2">Card Number</h4>
                <p>{showPaymentDetails.cardNumber || "N/A"}</p>
              </div>

              <div className="flex items-center justify-between w-3/4 mt-2">
                <div>
                  <h4 className="font-semibold">Expiry Date</h4>
                  <p>{showPaymentDetails.expiryDate || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold">CVV</h4>
                  <p>{showPaymentDetails.cvv || "N/A"}</p>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="font-semibold">Payment Amount</h4>
                <p>10 $</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobRequests;