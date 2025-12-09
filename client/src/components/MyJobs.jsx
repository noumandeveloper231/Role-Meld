import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaRegEye, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { Search, Briefcase } from 'lucide-react';
import Loading from './Loading';
import NotFound404 from './NotFound404';
import CustomSelect from './CustomSelect';
import { Link } from 'react-router-dom';
import Img from './Image';
import Currency from './CurrencyCovertor';

const MyJobs = () => {
    const { backendUrl, toggleSaveJob } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("applied"); // "applied" or "saved"

    // Applied Jobs State
    const [applications, setApplications] = useState([]);

    // Saved Jobs State
    const [savedJobs, setSavedJobs] = useState([]);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch Applied Jobs
    const fetchAppliedJobs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/applications/appliedjobs`);
            if (data.success) {
                setApplications(data.applications);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Saved Jobs
    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getsavedjobs`);
            if (data?.success) {
                setSavedJobs(data.savedJobs || []);
            } else {
                setSavedJobs([]);
            }
        } catch (err) {
            toast.error(err?.message || "Failed to load saved jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "applied") {
            fetchAppliedJobs();
        } else {
            fetchSavedJobs();
        }
    }, [tab]);

    // Reset filters when tab changes
    useEffect(() => {
        setSearchTerm("");
        setSelectedStatus("");
        setSortOrder("newest");
        setCurrentPage(1);
    }, [tab]);

    // Apply filters and sorting for Applied Jobs
    const filteredApplications = applications.filter((app) => {
        const statusMatch = selectedStatus === '' || app.status === selectedStatus;
        const searchMatch = searchTerm === '' ||
            app?.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app?.job?.company?.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'a-z') return (a?.job?.title || '').localeCompare(b?.job?.title || '');
        if (sortOrder === 'z-a') return (b?.job?.title || '').localeCompare(a?.job?.title || '');
        return 0;
    });

    // Apply filters and sorting for Saved Jobs
    const filteredSavedJobs = savedJobs.filter((job) => {
        const searchMatch = searchTerm === '' ||
            job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job?.company?.toLowerCase().includes(searchTerm.toLowerCase());
        return searchMatch;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'a-z') return (a?.title || '').localeCompare(b?.title || '');
        if (sortOrder === 'z-a') return (b?.title || '').localeCompare(a?.title || '');
        return 0;
    });

    // Determine which data to show based on tab
    const currentData = tab === "applied" ? filteredApplications : filteredSavedJobs;

    // Pagination calculations
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = currentData.slice(startIndex, endIndex);
    const startItem = currentData.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, currentData.length);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder]);

    // Handle unsave job
    const handleUnsaveJob = async (jobId) => {
        const prev = [...savedJobs];
        setSavedJobs((p) => p.filter((j) => j._id !== jobId));
        try {
            await toggleSaveJob(jobId);
            toast.success("Job removed from saved jobs");
            fetchSavedJobs();
        } catch (err) {
            setSavedJobs(prev);
            toast.error(err?.message || "Failed to unsave job");
        }
    };



    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className='rounded-lg'>
                {/* Header */}
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-6">
                    My Jobs
                </h1>

                {/* Tab Bar */}
                <div className='flex items-center gap-8 cursor-pointer mb-6'>
                    <span
                        onClick={() => setTab('applied')}
                        className={`${tab === "applied" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        Applied({applications.length})
                    </span>
                    <span
                        onClick={() => setTab('saved')}
                        className={`${tab === "saved" ? "font-semibold underline text-[var(--primary-color)]" : "text-gray-400"} underline-offset-8`}
                    >
                        Wishlist({savedJobs.length})
                    </span>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="w-full flex justify-between gap-4">
                            {/* Status Filter and Search */}
                            <div className='flex gap-4'>
                                {tab === "applied" && (
                                    <CustomSelect
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className={"w-40"}
                                    >
                                        <option value="">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="applied">Pending</option>
                                    </CustomSelect>
                                )}

                                {/* Search Input */}
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="!pl-10"
                                    />
                                </div>
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
                {
                    loading ?
                        <div className='w-full'>
                            <Loading />
                        </div>
                        :
                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                            <table className="min-w-full bg-white border-collapse">
                                <thead>
                                    <tr className="text-left text-gray-500 bg-white border-b border-gray-200">
                                        <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">#</th>
                                        <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Job Title</th>
                                        <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Company</th>
                                        {tab === "applied" ? (
                                            <>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Applied At</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Job Type</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Salary</th>
                                            </>
                                        )}
                                        <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        paginatedData?.length > 0 ?
                                            paginatedData.map((item, idx) => (
                                                tab === "applied" ? (
                                                    // Applied Jobs Row
                                                    <tr
                                                        key={item._id || idx}
                                                        className={`hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out`}
                                                    >
                                                        <td className="px-6 py-3 text-gray-600">{startIndex + idx + 1}</td>
                                                        <td className="px-6 py-3 font-semibold text-gray-800">
                                                            {item?.job?.title || "Title not found"}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600">
                                                            <div className="flex font-semibold items-center gap-3">
                                                                <span className="border p-2 rounded-xl border-gray-300">
                                                                    <img
                                                                        src={item?.job?.companyProfile}
                                                                        alt="Company"
                                                                        decoding="async"
                                                                        loading="lazy"
                                                                        width="30"
                                                                        height="30"
                                                                        className="rounded-md object-cover"
                                                                    />
                                                                </span>
                                                                {item?.job?.company || "Company not found"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600">
                                                            {new Date(item?.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            {item?.status === "approved" && (
                                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                                                                    Approved
                                                                </span>
                                                            )}
                                                            {item?.status === "rejected" && (
                                                                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                                                                    Rejected
                                                                </span>
                                                            )}
                                                            {item?.status === "applied" && (
                                                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 font-medium text-gray-700">
                                                            <div className='w-full flex justify-center items-center'>
                                                                <button
                                                                    onClick={() => window.open(`/jobdetails/${item?.job?._id}`, "_blank")}
                                                                    className='flex items-center gap-2 px-4 py-2 text-[var(--primary-color)] border border-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)] hover:text-white transition'
                                                                >
                                                                    <FaRegEye size={18} />
                                                                    View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    // Saved Jobs Row
                                                    <tr
                                                        key={item._id || idx}
                                                        className={`hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out`}
                                                    >
                                                        <td className="px-6 py-3 text-gray-600">{startIndex + idx + 1}</td>
                                                        <td className="px-6 py-3 font-semibold text-gray-800">
                                                            {item?.title || "Title not found"}
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600">
                                                            <div className="flex font-semibold items-center gap-3">
                                                                <span className="border p-2 rounded-xl border-gray-300">
                                                                    <Img
                                                                        src={item?.companyProfile || item?.image}
                                                                        style="w-[30px] h-[30px] rounded-md object-cover"
                                                                    />
                                                                </span>
                                                                {item?.company || "Company not found"}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600">
                                                            <span className={`px-3 py-1 whitespace-nowrap rounded-full text-xs font-medium ${/full/i.test(item?.jobType || "")
                                                                ? "bg-green-100 text-green-800"
                                                                : /part/i.test(item?.jobType || "")
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                {item?.jobType || "—"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600">
                                                            <div className="text-sm">{item?.location || "—"}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {item?.locationType || (item?.remoteOption ? "Remote" : "Onsite")}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                            {item?.salaryType === "fixed" ? (
                                                                <Currency amount={item?.fixedSalary} from={item?.jobsCurrency} />
                                                            ) : (
                                                                <span>
                                                                    <Currency amount={item?.minSalary} from={item?.jobsCurrency} /> - <Currency amount={item?.maxSalary} from={item?.jobsCurrency} />
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-3 font-medium text-gray-700">
                                                            <div className='w-full flex justify-center items-center gap-2'>
                                                                <button
                                                                    onClick={() => handleUnsaveJob(item._id)}
                                                                    className='p-2 rounded-md hover:bg-red-50 text-red-600'
                                                                    title="Remove from saved"
                                                                >
                                                                    <FaTrash size={16} />
                                                                </button>
                                                                <Link
                                                                    to={`/jobdetails/${item._id}`}
                                                                    className='p-2 rounded-md hover:bg-gray-100'
                                                                    title="View job"
                                                                >
                                                                    <FaExternalLinkAlt size={16} />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            ))
                                            :
                                            <tr>
                                                <td colSpan={tab === "applied" ? 6 : 7} className="text-center pt-6">
                                                    <NotFound404 value={"No Jobs Found"} />
                                                </td>
                                            </tr>
                                    }
                                    <tr>
                                        <td className='px-6 py-3' colSpan={tab === "applied" ? 6 : 7}>
                                            {/* Pagination */}
                                            {currentData.length > 0 && (
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
                                                            {startItem} - {endItem} of {currentData.length} items
                                                        </span>
                                                    </div>

                                                    {/* Page navigation */}
                                                    <div className="flex items-center gap-1">
                                                        {/* Previous button */}
                                                        <button
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
                                                                    <span
                                                                        key={i}
                                                                        onClick={() => setCurrentPage(i)}
                                                                        className={`px-3 cursor-pointer py-1 text-sm border rounded-md ${currentPage === i
                                                                            ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]"
                                                                            : "border-gray-300 hover:bg-gray-50"
                                                                            }`}
                                                                    >
                                                                        {i}
                                                                    </span>
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
                }
            </div>
        </div>
    );
};

export default MyJobs;
