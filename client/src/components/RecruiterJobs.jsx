import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Trash, Search } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { NavLink } from 'react-router-dom';

const RecruiterJobs = () => {
    const { userData, backendUrl } = useContext(AppContext);
    const [filter, setFilter] = useState('all')
    const [jobs, setJobs] = useState([]);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const getJobs = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getcompanyjobsbyid/${userData.authId}`);
            if (data.success) {
                setJobs(data.companyJobs);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        getJobs();
    }, [])

    console.log('jobs', jobs)

    // Remove Job
    const removeJob = async (id) => {
        try {
            // instantly update UI before API completes
            setJobs(prev => prev.filter(job => job._id !== id));

            const { data } = await axios.delete(`${backendUrl}/api/jobs/removejob/${id}`);

            if (data.success) {
                toast.success(data.message);
                getJobs(); // refresh in background
            } else {
                toast.error(data.message);
                getJobs(); // restore if needed
            }

        } catch (error) {
            toast.error(error.message);
            getJobs(); // restore
        }
    };


    const approvedJobs = jobs.filter(job => job.approved === "approved");
    const rejectedJobs = jobs.filter(job => job.approved === "rejected");
    const pendingJobs = jobs.filter(job => job.approved === "pending");

    const filteredJobs = jobs.filter((job) => {
        // Apply status filter
        let statusMatch = true;
        if (selectedStatus) {
            statusMatch = job.approved === selectedStatus;
        } else if (filter !== 'all') {
            statusMatch = job.approved === filter;
        }

        // Apply search filter
        const searchMatch = searchTerm === '' ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.category.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
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
    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder]);

    return (
        <div className='bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6 rouned-lg'>
            <div className='rounded-lg'>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 mb-3">
                        Manage Jobs
                    </h1>
                    <NavLink
                        to={"/employer-landing"}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <button className="primary-btn">
                            Post a job
                        </button>
                    </NavLink>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-600 font-medium">Approved Jobs</p>
                        <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-600 font-medium">Rejected Jobs</p>
                        <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedJobs.length}</h2>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-gray-600 font-medium">Pending Jobs</p>
                        <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingJobs.length}</h2>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="w-full flex justify-between gap-4">
                            {/* Status Filter */}
                            <div className='flex gap-4'>
                                <CustomSelect
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={"w-40"}
                                >
                                    <option value="">All Status</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="pending">Pending</option>
                                </CustomSelect>

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

                <div className="overflow-x-auto rounded-lg border border-gray-300">
                    <table className="min-w-full bg-white border-collapse">
                        <thead>
                            <tr className="text-left text-gray-500 bg-white border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Job Title</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Job Category</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Active Till</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Featured</th>
                                <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                currentJobs?.length > 0 ?
                                    currentJobs.map((job, idx) => (
                                        <tr
                                            key={job._id}
                                            className={`hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out`}
                                        >
                                            <td className="px-6 py-3 font-semibold text-gray-800">{job.title}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600">{job.category}</td>
                                            <td className="px-6 py-3 text-sm text-gray-600">
                                                {new Date(job.applicationDeadline).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3">
                                                {job.approved === "approved" && (
                                                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                                                        Approved
                                                    </span>
                                                )}
                                                {job.approved === "rejected" && (
                                                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                                                        Rejected
                                                    </span>
                                                )}
                                                {job.approved === "pending" && (
                                                    <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${job.sponsored ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                                                    {job.sponsored ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-700">
                                                <div className='w-full flex justify-center items-center'>
                                                    <button
                                                        onClick={() => removeJob(job._id)}
                                                        className='p-2 rounded-full hover:bg-red-50 transition-colors'
                                                        aria-label={`Remove job: ${job.title}`}
                                                    >
                                                        <Trash className='text-red-500 cursor-pointer' size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    :
                                    <tr>
                                        <td colSpan={6} className="text-center  pt-6">
                                            No jobs found.
                                        </td>
                                    </tr>
                            }
                            <tr>
                                <td className='px-6 py-3' colSpan={7}>
                                    {/* Pagination */}
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

            </div>
        </div>
    )
}

export default RecruiterJobs
