import React, { useContext, useEffect, useState } from 'react'

// React Icons
import { CiViewList } from "react-icons/ci";
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from './Loading';
import { FaPlus } from "react-icons/fa";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Cross, X } from 'lucide-react';
import Img from './Image';
const AdminListedBlogs = ({ setActiveTab }) => {
    const { backendUrl, userData } = useContext(AppContext);
    const [allBlogs, setAllBlogs] = useState([]);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const getAllBlogs = async () => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/blog/getallblogs`);
            if (data.success) {
                setAllBlogs(data.blogs);
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
        getAllBlogs()
    }, []);

    // Remove Blog
    const [blogRemovalLoading, setBlogRemovalLoading] = useState(false)
    const removeBlog = async (blogId) => {
        setBlogRemovalLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/blog/removeblog`, { blogId })
            if (data.success) {
                toast.success(data.message)
                getAllBlogs()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBlogRemovalLoading(false)
        }
    }

    const [imageModel, setImageModel] = useState(false);
    const [selectedImg, setSelectedImg] = useState('')

    if (loading) {
        return <div className='w-full flex justify-center'>
            <Loading />
        </div>
    }
    return (
        <div className='rounded-xl w-full flex flex-col min-h-screen border border-gray-200 p-6 bg-white'>
            <h1 className='font-bold flex items-center gap-4'>
                Listed Blogs
            </h1>
            <button className='mt-10 primary-btn self-end flex items-center gap-2 '>
                Add <FaPlus />
            </button>
            <div className='mt-10 overflow-x-auto rounded-lg border border-gray-200'>
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-white text-gray-500 uppercase text-xs tracking-wide">
                        <tr>
                            <th className="px-6 py-6">#</th>
                            <th className="px-6 py-6">Featured Image</th>
                            <th className="px-6 py-6">Title</th>
                            <th className="px-6 py-6">Category</th>
                            <th className="px-6 py-6">Created At</th>
                            <th colSpan={2} className="px-6 py-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>

                        {
                            allBlogs?.length !== 0 ?
                                allBlogs.map((blog, index) => (
                                    <tr
                                        key={index}
                                        className={`transition duration-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-blue-50`}
                                    >
                                        <td className="px-6 py-4 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4 "><Img
                                            src={blog.coverImage}
                                            onClick={() => {
                                                setSelectedImg(blog.coverImage);
                                                setImageModel(true);
                                            }}
                                            className="w-20 h-20 object-cover rounded-lg border border-gray-300 cursor-pointer hover:scale-105 hover:shadow-md transition-transform duration-200"
                                        />
                                        </td>
                                        <td className="px-6 py-4">{blog.title}</td>
                                        <td className="px-6 py-4 font-semibold">{blog.category}</td>
                                        <td className="px-6 py-4">
                                            {blog.createdAt.split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <HiOutlinePencilSquare
                                                    onClick={() => navigate('/editblog?id=' + encodeURIComponent(blog._id))}
                                                    className='cursor-pointer text-blue-300' />
                                                <FaTrash onClick={() => removeBlog(blog._id)} className=' cursor-pointer text-red-300' />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                :
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        No Blogs Found
                                    </td>
                                </tr>
                        }
                    </tbody>
                </table>
            </div>

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
