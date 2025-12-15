import React, { useContext, useEffect, useMemo, useState } from 'react'

// React Icons
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from './Loading';
import { FaPlus } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import Img from './Image';
import CustomSelect from './CustomSelect';
import slugToName from '../utils/categoryNames'

const AdminListedBlogs = () => {
    const { backendUrl } = useContext(AppContext);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/blog/getallblogs`);
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                setLoading(false)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, []);

    // Remove Blog
    const [blogRemovalLoading, setBlogRemovalLoading] = useState(false)
    const removeBlog = async (blogId) => {
        setBlogRemovalLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/blog/removeblog`, { blogId })
            if (data.success) {
                toast.success(data.message)
                fetchBlogs()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBlogRemovalLoading(false)
        }
    }

    // Status & filter states (placed before any early return to avoid hook mismatch)
    const [selectedStatus, setSelectedStatus] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [imageModel, setImageModel] = useState(false);
    const [selectedImg, setSelectedImg] = useState('')


    // Derived data
    const publishedBlogs = blogs.filter((b) => b.status === "published");
    const draftBlogs = blogs.filter((b) => b.status === "draft");

    const filteredBlogs = useMemo(() => {
        return blogs
            .filter((blog) => {
                let statusMatch = true;
                if (selectedStatus) statusMatch = blog.status === selectedStatus;

                const lowerSearch = searchTerm.toLowerCase();
                const searchMatch =
                    lowerSearch === "" ||
                    blog.title?.toLowerCase().includes(lowerSearch) ||
                    blog.category?.toLowerCase().includes(lowerSearch);
                return statusMatch && searchMatch;
            })
            .sort((a, b) => {
                const aDate = new Date(a.createdAt);
                const bDate = new Date(b.createdAt);
                if (sortOrder === "newest") return bDate - aDate;
                if (sortOrder === "oldest") return aDate - bDate;
                if (sortOrder === "a-z") return (a.title || "").localeCompare(b.title || "");
                if (sortOrder === "z-a") return (b.title || "").localeCompare(a.title || "");
                return 0;
            });
    }, [blogs, selectedStatus, searchTerm, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);
    const startItem = filteredBlogs.length === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(endIndex, filteredBlogs.length);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    if (loading) {
        return (
            <div className='w-full flex justify-center'>
                <Loading />
            </div>
        );
    }

    return (
        <div className='rounded-xl w-full flex flex-col min-h-screen border border-gray-200 p-6 bg-white'>
            <div className='flex items-center justify-between mb-6'>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800">
                    Manage Blogs
                </h1>
                <button onClick={() => navigate('/admin/blog/add')} className='primary-btn'>
                    <FaPlus /> Add Blog
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="p-5 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-500">Published Blogs</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{publishedBlogs.length}</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-500">Draft Blogs</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{draftBlogs.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <CustomSelect className={"w-40"} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </CustomSelect>

                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="!pl-10"
                            />
                        </div>
                    </div>

                    <CustomSelect className={"w-40"} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="a-z">A – Z</option>
                        <option value="z-a">Z – A</option>
                    </CustomSelect>
                </div>
            </div>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-white text-gray-500 uppercase text-xs tracking-wide">
                        <tr>
                            <th className="px-6 py-6">#</th>
                            <th className="px-6 py-6">Featured Image</th>
                            <th className="px-6 py-6">Title</th>
                            <th className="px-6 py-6">Category</th>
                            <th className="px-6 py-6">Created At</th>
                            <th className="px-6 py-6">Status</th>
                            <th colSpan={2} className="px-6 py-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            currentBlogs?.length !== 0 ?
                                currentBlogs.map((blog, index) => (
                                    <tr
                                        key={index}
                                        className={`transition duration-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-blue-50`}
                                    >
                                        <td className="px-6 py-4 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 ">
                                            <Img
                                                willOpen
                                                src={blog.coverImage}
                                                style="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:scale-105 hover:shadow-md transition-transform duration-200"
                                            />
                                        </td>
                                        <td className="px-6 py-4">{blog.title}</td>
                                        <td className="px-6 py-4 font-semibold">{slugToName(blog.category) || blog.category}</td>
                                        <td className="px-6 py-4">{blog.createdAt?.split('T')[0]}</td>
                                        <td className="px-6 py-4">
                                            {blog.status === 'published' && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">Published</span>
                                            )}
                                            {blog.status === 'draft' && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-semibold">Draft</span>
                                            )}
                                            {!blog.status && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-semibold">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <HiOutlinePencilSquare
                                                    onClick={() => navigate('/admin/blog/add?edit=' + blog.slug)}   
                                                    className='cursor-pointer text-blue-500' />
                                                <FaTrash onClick={() => removeBlog(blog._id)} className=' cursor-pointer text-red-500' />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                :
                                <div className='min-h-100'>
                                    <p className="px-6 py-4 text-center">No Blogs Found</p>
                                </div>
                        }
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredBlogs.length > 0 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        >
                            {[10, 25, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <span>{startItem} - {endItem} of {filteredBlogs.length}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {(() => {
                            const pages = [];
                            const maxVisible = 5;
                            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let end = Math.min(totalPages, start + maxVisible - 1);
                            if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                            if (start > 1) {
                                pages.push(<button key={1} onClick={() => setCurrentPage(1)} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">1</button>);
                                if (start > 2) pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
                            }
                            for (let i = start; i <= end; i++) {
                                pages.push(<button key={i} onClick={() => setCurrentPage(i)} className={`px-3 py-1 border rounded-md ${currentPage === i ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : 'border-gray-300 hover:bg-gray-50'}`}>{i}</button>);
                            }
                            if (end < totalPages) {
                                if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
                                pages.push(<button key={totalPages} onClick={() => setCurrentPage(totalPages)} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">{totalPages}</button>);
                            }
                            return pages;
                        })()}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}



            {/* Image Model */}
            {imageModel &&
                <div className='fixed top-0 left-0 w-full h-screen bg-black/50 flex items-center justify-center '>
                    <div className='p-2 rounded-md bg-white relative '>
                        <X onClick={() => setImageModel(false)} className=' cursor-pointer border border-gray-300 bg-white rounded-md absolute top-3 right-3' />
                        <Img src={`${backendUrl}/${selectedImg}`} style="max-w-100 rounded-md" />
                    </div>
                </div>
            }
        </div>
    )
}

export default AdminListedBlogs
