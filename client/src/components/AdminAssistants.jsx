import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Loader2, CheckCircle, XCircle, Mail, Phone, MapPin, Globe, UserRound, Plus, Search } from 'lucide-react';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import Img from './Image';
import CustomSelect from './CustomSelect';

const AdminAssistants = ({ setActiveTab }) => {
    const { backendUrl } = useContext(AppContext);
    const [assistants, setAssistants] = useState([]);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const navigate = useNavigate()

    // Filters and pagination
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const getAssistants = async () => {
        setAssistantLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/get-assistants`);
            if (data.success) {
                setAssistants(data.assistants);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error.message);
        } finally {
            setAssistantLoading(false);
        }
    };

    useEffect(() => {
        getAssistants();
    }, []);

    // Stats and filtering helpers
    const approvedAssistants = assistants.filter(a => a.reviewStatus === 'approved');
    const rejectedAssistants = assistants.filter(a => a.reviewStatus === 'rejected');
    const pendingAssistants = assistants.filter(a => a.reviewStatus === 'pending');
    const activeAssistants = assistants.filter(a => a.isActive);

    const filteredAssistants = assistants
        .filter((a) => {
            const statusMatch = selectedStatus ? a.reviewStatus === selectedStatus : true;
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' || a.name.toLowerCase().includes(searchLower) || a.email.toLowerCase().includes(searchLower);
            return statusMatch && searchMatch;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOrder === 'a-z') return a.name.localeCompare(b.name);
            if (sortOrder === 'z-a') return b.name.localeCompare(a.name);
            return 0;
        });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAssistants.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAssistants = filteredAssistants.slice(startIndex, endIndex);
    const startItem = filteredAssistants.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredAssistants.length);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, searchTerm, sortOrder, itemsPerPage]);

    if (assistantLoading) {
        return (
            <div className="w-full flex justify-center items-center py-16">
                <Loading />
            </div>
        );
    }

    return (
        <div className="bg-white w-full min-h-screen rounded-lg overflow-y-auto border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Assistants</h1>
                <button
                    className="primary-btn flex items-center gap-2"
                    onClick={() => navigate('/admin/add-assistant')}
                >
                    <Plus size={18} /> Add Assistant
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-600 font-medium">Approved</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-1">{approvedAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-600 font-medium">Rejected</p>
                    <h2 className="text-3xl font-bold text-red-600 mt-1">{rejectedAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-600 font-medium">Pending</p>
                    <h2 className="text-3xl font-bold text-yellow-600 mt-1">{pendingAssistants.length}</h2>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-600 font-medium">Active</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{activeAssistants.length}</h2>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
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

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search assistants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!pl-10"
                            />
                        </div>
                    </div>

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

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-300">
                <table className="min-w-full bg-white border-collapse">
                    <thead>
                        <tr className="text-left text-gray-500 bg-white border-b border-gray-200">
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Active</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentAssistants.length > 0 ? (
                            currentAssistants.map((a) => (
                                <tr key={a._id} className="hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out">
                                    <td className="px-6 py-3 flex items-center gap-3">
                                        <Img
                                            src={a.profilePicture ? a.profilePicture : '/default-avatar.png'}
                                            style="w-8 h-8 rounded-full object-cover border"
                                        />
                                        <span className="font-medium text-gray-800">{a.name}</span>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{a.email}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{a.contactNumber || 'N/A'}</td>
                                    <td className="px-6 py-3">
                                        {a.isActive ? (
                                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                                        ) : (
                                            <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        {a.reviewStatus === 'approved' && (
                                            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">Approved</span>
                                        )}
                                        {a.reviewStatus === 'rejected' && (
                                            <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Rejected</span>
                                        )}
                                        {a.reviewStatus === 'pending' && (
                                            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-700">
                                        <div className="w-full flex justify-center">
                                            <button
                                                onClick={() => navigate('/company-profile/' + a.authId)}
                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                            >
                                                <UserRound size={14} /> View Profile
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center pt-6">No assistants found.</td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={6} className="px-6 py-3">
                                {filteredAssistants.length > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
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
                                                {startItem} - {endItem} of {filteredAssistants.length} items
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            {(() => {
                                                const pages = [];
                                                const maxVisiblePages = 5;
                                                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                                                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                                                if (endPage - startPage + 1 < maxVisiblePages) {
                                                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                                                }
                                                if (startPage > 1) {
                                                    pages.push(
                                                        <button key={1} onClick={() => setCurrentPage(1)} className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">1</button>
                                                    );
                                                    if (startPage > 2) {
                                                        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                                                    }
                                                }
                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <span key={i} onClick={() => setCurrentPage(i)} className={`px-3 cursor-pointer py-1 text-sm border rounded-md ${currentPage === i ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-gray-300 hover:bg-gray-50'}`}>{i}</span>
                                                    );
                                                }
                                                if (endPage < totalPages) {
                                                    if (endPage < totalPages - 1) {
                                                        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                                                    }
                                                    pages.push(
                                                        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">{totalPages}</button>
                                                    );
                                                }
                                                return pages;
                                            })()}
                                            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAssistants;