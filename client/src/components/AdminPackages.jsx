import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Package as PackageIcon, Trash2, Edit, Power, Plus, X } from "lucide-react";
import CustomSelect from "./CustomSelect";

const AdminPackages = () => {
    const { backendUrl } = useContext(AppContext);
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);

    // Filters
    const [selectedStatus, setSelectedStatus] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        currency: "USD",
        duration: "",
        durationUnit: "month",
        jobPostings: "",
        featuredJobs: "0",
        candidateAccess: false,
        candidatesFollow: "0",
        inviteCandidates: false,
        sendMessages: false,
        printProfiles: false,
        reviewComment: false,
        viewCandidateInfo: false,
        support: "Limited",
        packageType: "Standard",
        features: "",
        displayOrder: "0"
    });

    // Fetch packages
    const getPackages = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/packages`);
            if (data.success) {
                setPackages(data.packages);
                setFilteredPackages(data.packages);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
            toast.error("Failed to fetch packages");
        }
    };

    useEffect(() => {
        getPackages();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...packages];

        if (selectedStatus === "active") filtered = filtered.filter(p => p.isActive);
        if (selectedStatus === "inactive") filtered = filtered.filter(p => !p.isActive);

        if (sortOrder === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sortOrder === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        if (sortOrder === "price-low") filtered.sort((a, b) => a.price - b.price);
        if (sortOrder === "price-high") filtered.sort((a, b) => b.price - a.price);
        if (sortOrder === "a-z") filtered.sort((a, b) => a.name.localeCompare(b.name));
        if (sortOrder === "z-a") filtered.sort((a, b) => b.name.localeCompare(a.name));

        setFilteredPackages(filtered);
        setCurrentPage(1);
    }, [selectedStatus, sortOrder, packages]);

    // Stats
    const totalPackages = packages.length;
    const activePackages = packages.filter(p => p.isActive).length;
    const inactivePackages = totalPackages - activePackages;

    // Pagination
    const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPackages = filteredPackages.slice(startIndex, endIndex);
    const startItem = filteredPackages.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredPackages.length);

    // Open modal for create
    const openCreateModal = () => {
        setEditingPackage(null);
        setFormData({
            name: "",
            price: "",
            currency: "USD",
            duration: "",
            durationUnit: "month",
            jobPostings: "",
            featuredJobs: "0",
            candidateAccess: false,
            candidatesFollow: "0",
            inviteCandidates: false,
            sendMessages: false,
            printProfiles: false,
            reviewComment: false,
            viewCandidateInfo: false,
            support: "Limited",
            packageType: "Standard",
            features: "",
            displayOrder: "0"
        });
        setIsModalOpen(true);
    };

    // Open modal for edit
    const openEditModal = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            currency: pkg.currency,
            duration: pkg.duration.toString(),
            durationUnit: pkg.durationUnit || "month",
            jobPostings: pkg.jobPostings.toString(),
            featuredJobs: pkg.featuredJobs.toString(),
            candidateAccess: pkg.candidateAccess,
            candidatesFollow: (pkg.candidatesFollow || 0).toString(),
            inviteCandidates: pkg.inviteCandidates || false,
            sendMessages: pkg.sendMessages || false,
            printProfiles: pkg.printProfiles || false,
            reviewComment: pkg.reviewComment || false,
            viewCandidateInfo: pkg.viewCandidateInfo || false,
            support: pkg.support || "Limited",
            packageType: pkg.packageType || "Standard",
            features: pkg.features.join("\n"),
            displayOrder: pkg.displayOrder.toString()
        });
        setIsModalOpen(true);
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            price: formData.packageType === "Free" ? 0 : parseFloat(formData.price),
            currency: formData.currency,
            duration: parseInt(formData.duration),
            durationUnit: formData.durationUnit,
            jobPostings: parseInt(formData.jobPostings),
            featuredJobs: parseInt(formData.featuredJobs),
            candidateAccess: formData.candidateAccess,
            candidatesFollow: parseInt(formData.candidatesFollow),
            inviteCandidates: formData.inviteCandidates,
            sendMessages: formData.sendMessages,
            printProfiles: formData.printProfiles,
            reviewComment: formData.reviewComment,
            viewCandidateInfo: formData.viewCandidateInfo,
            support: formData.support,
            packageType: formData.packageType,
            features: formData.features.split("\n").filter(f => f.trim()),
            displayOrder: parseInt(formData.displayOrder)
        };

        try {
            if (editingPackage) {
                const { data } = await axios.patch(`${backendUrl}/api/admin/packages/${editingPackage._id}`, payload);
                if (data.success) {
                    toast.success(data.message);
                    await getPackages();
                    setIsModalOpen(false);
                }
            } else {
                console.log(payload);
                const { data } = await axios.post(`${backendUrl}/api/admin/packages`, payload);
                if (data.success) {
                    toast.success(data.message);
                    await getPackages();
                    setIsModalOpen(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    // Delete package
    const deletePackage = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const { data } = await axios.delete(`${backendUrl}/api/admin/packages/${id}`);
            if (data.success) {
                toast.success(data.message);
                await getPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Delete failed");
        }
    };

    // Toggle status
    const toggleStatus = async (id) => {
        try {
            const { data } = await axios.patch(`${backendUrl}/api/admin/packages/${id}/toggle-status`);
            if (data.success) {
                toast.success(data.message);
                await getPackages();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    return (
        <div className="rounded-xl w-full min-h-screen border border-gray-200 p-6 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800">
                    Manage Packages
                </h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
                >
                    <Plus size={20} />
                    Create Package
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-600 font-medium">Total Packages</p>
                    <h2 className="text-3xl font-bold text-blue-600 mt-1">{totalPackages}</h2>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-600 font-medium">Active Packages</p>
                    <h2 className="text-3xl font-bold text-green-600 mt-1">{activePackages}</h2>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border border-red-200">
                    <p className="text-gray-600 font-medium">Inactive Packages</p>
                    <h2 className="text-3xl font-bold text-red-600 mt-1">{inactivePackages}</h2>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                    <CustomSelect value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </CustomSelect>

                    <CustomSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="a-z">A–Z</option>
                        <option value="z-a">Z–A</option>
                    </CustomSelect>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-white text-gray-500 uppercase text-xs tracking-wide">
                        <tr>
                            <th className="px-6 py-6">Package Name</th>
                            <th className="px-6 py-6">Price</th>
                            <th className="px-6 py-6 text-center">Duration (Days)</th>
                            <th className="px-6 py-6 text-center">Job Postings</th>
                            <th className="px-6 py-6 text-center">Features</th>
                            <th className="px-6 py-6 text-center">Status</th>
                            <th className="px-6 py-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPackages.map((pkg, i) => (
                            <tr key={pkg._id} className={`transition duration-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                                <td className="px-6 py-6 font-semibold text-gray-800">{pkg.name}</td>
                                <td className="px-6 py-6">
                                    {pkg.currency} {pkg.price.toLocaleString()}
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                        {pkg.duration} days
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {pkg.jobPostings}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                        {pkg.features.length}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${pkg.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {pkg.isActive ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => openEditModal(pkg)}
                                            className="cursor-pointer text-blue-500 hover:text-blue-700 transition"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => deletePackage(pkg._id, pkg.name)}
                                            className="cursor-pointer text-red-500 hover:text-red-700 transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(pkg._id)}
                                            className={`cursor-pointer transition ${pkg.isActive ? "text-orange-500 hover:text-orange-700" : "text-green-500 hover:text-green-700"}`}
                                            title={pkg.isActive ? "Deactivate" : "Activate"}
                                        >
                                            <Power size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="py-6 px-6" colSpan={7}>
                                {filteredPackages.length > 0 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                                        {/* Items per page */}
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
                                                {startItem} - {endItem} of {filteredPackages.length} items
                                            </span>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
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
                                                        <button
                                                            key={1}
                                                            onClick={() => setCurrentPage(1)}
                                                            className="px-3 cursor-pointer py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                                        >
                                                            1
                                                        </button>
                                                    );
                                                    if (startPage > 2) {
                                                        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                                                    }
                                                }

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

                                                if (endPage < totalPages) {
                                                    if (endPage < totalPages - 1) {
                                                        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingPackage ? "Edit Package" : "Create New Package"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Package Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price {formData.packageType !== "Free" && <span className="text-red-500">*</span>}
                                        {formData.packageType === "Free" && <span className="text-xs text-gray-500 ml-2">(Auto-set to 0)</span>}
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.packageType === "Free" ? "0" : formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        min="0"
                                        step="0.01"
                                        disabled={formData.packageType === "Free"}
                                        required={formData.packageType !== "Free"}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="PKR">PKR (₨)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="AED">AED (د.إ)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration Unit</label>
                                    <select
                                        value={formData.durationUnit}
                                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="month">Per Month</option>
                                        <option value="year">Per Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Postings <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.jobPostings}
                                        onChange={(e) => setFormData({ ...formData, jobPostings: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured Jobs</label>
                                    <input
                                        type="number"
                                        value={formData.featuredJobs}
                                        onChange={(e) => setFormData({ ...formData, featuredJobs: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Can Follow Candidates</label>
                                    <input
                                        type="number"
                                        value={formData.candidatesFollow}
                                        onChange={(e) => setFormData({ ...formData, candidatesFollow: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        min="0"
                                        placeholder="Number of candidates"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Support</label>
                                    <select
                                        value={formData.support}
                                        onChange={(e) => setFormData({ ...formData, support: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="Limited">Limited</option>
                                        <option value="Full">Full</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
                                    <select
                                        value={formData.packageType}
                                        onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="Free">Free</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                            </div>

                            {/* Checkboxes Section */}
                            <div className="border-t pt-4 mt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Package Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.candidateAccess}
                                            onChange={(e) => setFormData({ ...formData, candidateAccess: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Candidate Database Access</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.inviteCandidates}
                                            onChange={(e) => setFormData({ ...formData, inviteCandidates: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Invite Candidates</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.sendMessages}
                                            onChange={(e) => setFormData({ ...formData, sendMessages: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Send Messages</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.printProfiles}
                                            onChange={(e) => setFormData({ ...formData, printProfiles: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Print Candidate Profiles</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.reviewComment}
                                            onChange={(e) => setFormData({ ...formData, reviewComment: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Review and Comment</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.viewCandidateInfo}
                                            onChange={(e) => setFormData({ ...formData, viewCandidateInfo: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">View Candidate Information</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Features (one per line)
                                </label>
                                <textarea
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={5}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 transition"
                                >
                                    {editingPackage ? "Update Package" : "Create Package"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPackages;
