import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Eye, Trash, Search } from 'lucide-react'
import CustomSelect from './CustomSelect';
import Img from './Image';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Loading from './Loading';
import { Link } from 'react-router-dom';

const JobSeekerFollowing = () => {
    const { backendUrl, followUnfollow } = useContext(AppContext)
    const [companies, setCompanies] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [industryFilter, setIndustryFilter] = useState("all")
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/getfollowing`);
            setCompanies(data.following || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [itemsPerPage, searchTerm, industryFilter])

    // Get unique industries for filter
    const availableIndustries = useMemo(() => (
        Array.from(new Set(companies.map(company => company.industry || company.category))).filter(Boolean)
    ), [companies])

    // Apply search and filter
    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            const matchesSearch = searchTerm === '' ||
                (company.companyName || company.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            const matchesIndustry = industryFilter === 'all' ||
                (company.industry || company.category) === industryFilter
            return matchesSearch && matchesIndustry
        })
    }, [companies, searchTerm, industryFilter])

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex)

    if (loading) return <Loading />

    return (
        <div className="bg-white rounded-xl w-full min-h-screen border border-gray-200 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Following Companies
                </h1>
            </div>

            {/* Search and Filter Bar */}
            <div className='flex flex-col justify-between lg:flex-row lg:items-center gap-4 mb-6'>
                <div className="relative w-full lg:w-1/2">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                </div>
                <div className='flex gap-3 w-full lg:w-auto'>
                    <CustomSelect
                        value={industryFilter}
                        onChange={(e) => setIndustryFilter(e.target.value)}
                    >
                        <option value="all">All Industries</option>
                        {availableIndustries.map(industry => (
                            <option key={industry} value={industry}>{industry}</option>
                        ))}
                    </CustomSelect>
                </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto rounded-lg border border-gray-300'>
                <table className='min-w-full bg-white border-collapse'>
                    <thead>
                        <tr className='text-left text-gray-500 bg-white border-b border-gray-200'>
                            <th className='px-6 py-4 text-sm font-bold uppercase tracking-wider'>Name</th>
                            <th className='px-6 py-4 text-sm font-bold uppercase tracking-wider'>Founded Date</th>
                            <th className='px-6 py-4 text-sm font-bold uppercase tracking-wider text-center'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            paginatedCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className='px-6 py-6 text-center text-gray-500'>
                                        {searchTerm || industryFilter !== 'all' ? 'No matching companies found.' : 'No companies found.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCompanies.map((company, idx) => (
                                    <tr key={company._id || idx} className='hover:bg-indigo-50/50 border-t border-gray-300 transition duration-150 ease-in-out'>
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center gap-4'>
                                                <Img
                                                    src={company.companyProfile || company.profilePicture || '/placeholder.png'}
                                                    style='w-12 h-12 rounded-full object-cover border border-gray-200'
                                                />
                                                <div className='flex flex-col'>
                                                    <span className='font-semibold text-gray-800'>{company.companyName || company.name}</span>
                                                    <span className='text-sm text-gray-500'>
                                                        {company?.industry || company?.category || "Not Specified"} / {company?.city || "Not Specified"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-sm text-gray-600'>
                                            {company.foundedDate ? new Date(company.foundedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not Specified"}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center justify-center gap-3'>
                                                <Link
                                                    title='View Profile'
                                                    to={`/company-profile/${company._id}`}
                                                    className='p-2 rounded-md hover:bg-gray-100'
                                                >
                                                    <Eye size={18} className="text-gray-600" />
                                                </Link>
                                                <button
                                                    title='Unfollow'
                                                    onClick={() => followUnfollow(company.authId)}
                                                    className='p-2 rounded-md hover:bg-red-50'
                                                >
                                                    <Trash size={18} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredCompanies.length > 0 && (
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6'>
                    <div className='flex items-center gap-4'>
                        <div className='text-sm text-gray-600'>
                            Showing {filteredCompanies.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length}
                        </div>
                        <div>
                            <CustomSelect
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                {[5, 10, 25].map(size => (
                                    <option key={size} value={size}>{size} / page</option>
                                ))}
                            </CustomSelect>
                        </div>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className='px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                        >
                            Previous
                        </button>
                        <span className='text-sm text-gray-600'>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className='px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default JobSeekerFollowing