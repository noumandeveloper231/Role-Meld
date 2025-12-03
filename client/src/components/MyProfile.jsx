import axios from 'axios';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { CircularProgressbar } from 'react-circular-progressbar';
import { FaCamera, FaPlus, FaTrash, FaVideo, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaGithub, FaTiktok } from 'react-icons/fa';
import { User, Phone, Link as LinkIcon, MapPin, Briefcase, Save, Image as ImageIcon, Loader2, Loader } from 'lucide-react'
import LocationSelector from './LocationSelector';
import Img from './Image';
import CustomSelect from './CustomSelect';
import ImageCropPortal from '../portals/ImageCropPortal';
import { useLocation } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';



// Predefined Skills List
import SkillsSelector from './SkillsSelector';

const MyProfile = () => {
    const { userData, backendUrl, setUserData } = useContext(AppContext);
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);

    // Field refs for focusing
    const fieldRefs = useRef({});

    // Image Crop Portal State
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [cropConfig, setCropConfig] = useState({
        shape: 'rect',
        aspect: 1,
        imageType: 'profile'
    });

    // Initial State
    const [formData, setFormData] = useState({
        // Basic Info
        name: "",
        email: "",
        phone: "",
        headline: "",
        currentPosition: "",
        category: "",
        description: "",
        dob: "",
        gender: "male",
        languages: [],
        qualification: "",
        experienceYears: "1-2 years",
        offeredSalary: 0,
        salaryType: "Monthly",
        currency: "USD",

        // Location
        address: "",
        city: "",
        country: "",
        postal: "",

        // Resume & Portfolio
        resume: "",
        portfolio: "",

        // Predefined Social Links
        linkedin: "",
        twitter: "",
        facebook: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        github: "",

        // Custom Social Networks
        customSocialNetworks: [],

        // Video
        videoUrl: "",

        // Arrays
        education: [],
        experience: [],
        skills: [],
        projects: [],
        awards: []
    });

    // Load data from userData
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                ...userData,
                // Ensure arrays are initialized
                languages: userData.languages || [],
                customSocialNetworks: userData.customSocialNetworks || [],
                education: userData.education || [],
                experience: userData.experience || [],
                skills: userData.skills || [],
                projects: userData.projects || [],
                awards: userData.awards || []
            }));
        }
    }, [userData]);

    // Handle navigation from dashboard
    useEffect(() => {
        if (location.state) {
            const { activeTab: navTab, focusField } = location.state;

            if (navTab) {
                setActiveTab(navTab);
            }

            // Focus on field after tab switch
            if (focusField) {
                setTimeout(() => {
                    const fieldElement = fieldRefs.current[focusField];
                    if (fieldElement) {
                        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        fieldElement.focus();

                        // Add highlight animation
                        fieldElement.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
                        setTimeout(() => {
                            fieldElement.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
                        }, 2000);
                    }
                }, 300);
            }

            // Clear navigation state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (index, field, key, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index] = { ...updatedArray[index], [key]: value };
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const addArrayItem = (field, initialItem) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], initialItem]
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Save Profile
    const updateProfile = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: formData,
            });
            if (data.success) {
                setUserData(data.profile);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Image Selection Handlers
    const handleProfilePictureSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropConfig({
                shape: 'round',
                aspect: 1,
                imageType: 'profile'
            });
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCoverImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropConfig({
                shape: 'rect',
                aspect: 16 / 9,
                imageType: 'cover'
            });
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob) => {
        if (cropConfig.imageType === 'profile') {
            await uploadProfilePicture(croppedBlob);
        } else {
            await uploadCoverImage(croppedBlob);
        }
        setCropPortalOpen(false);
    };

    const [profilePictureLoading, setProfilePictureLoading] = useState(false)

    const uploadProfilePicture = async (blob) => {
        const formData = new FormData();
        formData.append('profilePicture', blob, 'profile.jpg');
        setProfilePictureLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofilepicture`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error("Profile picture upload failed");
        } finally {
            setProfilePictureLoading(false);
        }
    };

    const [coverImageloading, setCoverImageloading] = useState(false);

    const uploadCoverImage = async (blob) => {
        const formData = new FormData();
        formData.append('coverImage', blob, 'cover.jpg');
        setCoverImageloading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updatecoverimage`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message || "Cover image updated successfully");
            }
        } catch (error) {
            toast.error("Cover image upload failed");
        } finally {
            setCoverImageloading(false)
        }
    };

    // Tabs Configuration
    const tabs = [
        { id: "basic", label: "Basic Info" },
        { id: "education", label: "Education" },
        { id: "experience", label: "Experience" },
        { id: "skills", label: "Skills" },
        { id: "projects", label: "Projects" },
        { id: "awards", label: "Awards" },
    ];

    return (
        <div className='w-full min-h-[calc(100vh-4.6rem)] bg-gray-50 p-6'>
            <div className='max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 p-6 md:p-8'>
                {/* Header */}
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    </div>
                    <button
                        onClick={updateProfile}
                        disabled={loading}
                        className="primary-btn flex items-center gap-2"
                    >
                        <Save size={18} />
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {/* Tabs */}
                <div className='mb-6'>
                    <div className='flex min-w-max'>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`cursor-pointer px-6 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className=''>
                    {/* 1️⃣ Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className='space-y-8'>
                            {/* Cover Image */}


                            {/* Profile Picture & Basic Details */}
                            <div className='flex flex-col relative'>
                                <div className='flex mb-4 items-center gap-4'>
                                    <div>
                                        <label htmlFor="profilePicture" className='text-sm font-medium text-gray-700'>Profile Picture</label>
                                        <div className='mt-1 relative w-32 h-32 flex items-center justify-center'>
                                            <div className='flex items-center justify-center border border-gray-300 w-32 h-32 object-cover'>
                                                {profilePictureLoading ? <div className='flex items-center justify-center'>
                                                    <Loader2 className='w-12 h-12 animate-spin' />
                                                </div> :
                                                    <Img
                                                        src={userData?.profilePicture || '/placeholder.png'}
                                                        style="w-32 h-32 rounded-full object-cover "
                                                    />
                                                }
                                            </div>
                                            <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                                <FaCamera size={14} />
                                                <input type="file" accept="image/*" className='hidden' onChange={handleProfilePictureSelect} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className='text-sm font-medium text-gray-700 '>Cover Image</label>
                                        <div className='mt-1 relative w-100 h-32 bg-gray-50 rounded-md overflow-hidden group border border-gray-300'>
                                            {userData?.coverImage ? (
                                                <>
                                                    {coverImageloading ? <div className='flex w-full h-full items-center justify-center'>
                                                        <Loader className='w-12 h-12 animate-spin' />
                                                    </div> :
                                                        <Img
                                                            src={userData.coverImage}
                                                            style="w-full h-full object-cover"
                                                        />
                                                    }
                                                </>
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-white'>
                                                    <ImageIcon size={48} className='opacity-50' />
                                                </div>
                                            )}
                                            <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                                <FaCamera size={14} />
                                                <input type="file" accept="image/*" className='hidden' onChange={handleCoverImageSelect} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className='md:col-span-2 space-y-4 mt-16 md:mt-0'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Full Name</label>
                                            <input
                                                ref={el => fieldRefs.current['name'] = el}
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Current Position</label>
                                            <input
                                                ref={el => fieldRefs.current['currentPosition'] = el}
                                                type="text"
                                                name="currentPosition"
                                                value={formData.currentPosition}
                                                onChange={handleChange}
                                                placeholder="e.g. Senior Developer"
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                disabled
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Phone</label>
                                            <input
                                                ref={el => fieldRefs.current['phone'] = el}
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-100' />

                            {/* Details */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                                        onChange={handleChange}
                                        className='mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Gender</label>
                                    <CustomSelect
                                        name="gender"
                                        value={formData.gender}
                                        className={"mt-1"}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </CustomSelect>
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Qualification</label>
                                    <CustomSelect
                                        className={"mt-1 "}
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                    >
                                        <option value="">Select Qualification</option>
                                        <option value="High School">High School</option>
                                        <option value="Bachelors">Bachelors</option>
                                        <option value="Masters">Masters</option>
                                        <option value="PhD">PhD</option>
                                    </CustomSelect>
                                </div>
                                <div className='space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Experience</label>
                                    <CustomSelect
                                        className={"mt-1 "}
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                                    >
                                        <option value="Fresher">Fresher</option>
                                        <option value="1-2 years">1-2 Years</option>
                                        <option value="3-5 years">3-5 Years</option>
                                        <option value="6-8 years">6-8 Years</option>
                                        <option value="9+ years">9+ Years</option>
                                    </CustomSelect>
                                </div>
                                <div className='col-span-full space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Description</label>
                                    <textarea

                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none'
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <hr className='border-gray-100' />

                            {/* Location */}
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Location</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='col-span-full space-y-1'>
                                        <label className='text-sm font-medium text-gray-700'>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder='Enter Your Address here...'
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <LocationSelector
                                            selectedCountry={formData.country}
                                            selectedCity={formData.city}
                                            onCountryChange={(c) => setFormData({ ...formData, country: c })}
                                            onCityChange={(c) => setFormData({ ...formData, city: c })}
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700'>Postal Code</label>
                                        <input
                                            type="text"
                                            name="postal"
                                            value={formData.postal}
                                            onChange={handleChange}
                                            placeholder='Enter Your Postal Code here...'
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-100' />

                            {/* Social Links */}
                            <div>
                                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Social Networks</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* Predefined Social Links */}
                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            LinkedIn
                                        </label>
                                        <input
                                            type="text"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            Twitter
                                        </label>
                                        <input
                                            type="text"
                                            name="twitter"
                                            value={formData.twitter}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            Facebook
                                        </label>
                                        <input
                                            type="text"
                                            name="facebook"
                                            value={formData.facebook}
                                            onChange={handleChange}
                                            placeholder="https://facebook.com/yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            Instagram
                                        </label>
                                        <input
                                            type="text"
                                            name="instagram"
                                            value={formData.instagram}
                                            onChange={handleChange}
                                            placeholder="https://instagram.com/yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            YouTube
                                        </label>
                                        <input
                                            type="text"
                                            name="youtube"
                                            value={formData.youtube}
                                            onChange={handleChange}
                                            placeholder="https://youtube.com/@yourchannel"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            TikTok
                                        </label>
                                        <input
                                            type="text"
                                            name="tiktok"
                                            value={formData.tiktok}
                                            onChange={handleChange}
                                            placeholder="https://tiktok.com/@yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>

                                    <div className='space-y-1'>
                                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                            GitHub
                                        </label>
                                        <input
                                            type="text"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleChange}
                                            placeholder="https://github.com/yourprofile"
                                            className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>
                                </div>

                                {/* Custom Social Networks */}
                                <div className='mt-6 space-y-4'>
                                    <h4 className='text-sm font-semibold text-gray-700'>Other Social Networks</h4>
                                    {formData.customSocialNetworks?.map((net, idx) => (
                                        <div key={idx} className='flex gap-3 items-center'>
                                            <input
                                                type="text"
                                                value={net.network}
                                                onChange={(e) => handleArrayChange(idx, 'customSocialNetworks', 'network', e.target.value)}
                                                placeholder="Network name"
                                                className='mt-1 w-40 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                            />
                                            <input
                                                type="text"
                                                value={net.url}
                                                onChange={(e) => handleArrayChange(idx, 'customSocialNetworks', 'url', e.target.value)}
                                                placeholder="Profile URL"
                                                className='mt-1 flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                            />
                                            <button
                                                onClick={() => removeArrayItem('customSocialNetworks', idx)}
                                                className='text-red-500 hover:bg-red-50 p-2 rounded-lg'
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addArrayItem('customSocialNetworks', { network: '', url: '' })}
                                        className='text-[var(--primary-color)] font-medium text-sm flex items-center gap-2 hover:underline'
                                    >
                                        <FaPlus size={12} /> Add More Social Networks
                                    </button>
                                </div>

                                {/* Video URL */}
                                <div className='mt-6 space-y-1'>
                                    <label className='text-sm font-medium text-gray-700'>Video Introduction</label>
                                    <div className='relative mt-1'>
                                        <FaVideo className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                        <input
                                            type="text"
                                            name="videoUrl"
                                            value={formData.videoUrl}
                                            onChange={handleChange}
                                            placeholder="e.g. YouTube link"
                                            className='w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2️⃣ Education Tab */}
                    {activeTab === 'education' && (
                        <div className='space-y-6'>
                            {formData.education?.map((edu, idx) => (
                                <div key={idx} className='bg-gray-50 p-6 rounded-xl border border-gray-200 relative group'>
                                    <button
                                        onClick={() => removeArrayItem('education', idx)}
                                        className='absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Degree Title</label>
                                            <input
                                                type="text"
                                                value={edu.title || ''}
                                                onChange={(e) => handleArrayChange(idx, 'education', 'title', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Level</label>
                                            <input
                                                type="text"
                                                value={edu.level || ''}
                                                onChange={(e) => handleArrayChange(idx, 'education', 'level', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>From</label>
                                            <input
                                                type="date"
                                                value={edu.from ? new Date(edu.from).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleArrayChange(idx, 'education', 'from', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>To</label>
                                            <input
                                                type="date"
                                                value={edu.to ? new Date(edu.to).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleArrayChange(idx, 'education', 'to', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='col-span-full space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Description</label>
                                            <textarea
                                                value={edu.description || ''}
                                                onChange={(e) => handleArrayChange(idx, 'education', 'description', e.target.value)}
                                                rows={3}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addArrayItem('education', { title: '', level: '', from: '', to: '', description: '' })}
                                className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                            >
                                <FaPlus /> Add Education
                            </button>
                        </div>
                    )}

                    {/* 3️⃣ Experience Tab */}
                    {activeTab === 'experience' && (
                        <div className='space-y-6'>
                            {formData.experience?.map((exp, idx) => (
                                <div key={idx} className='bg-gray-50 p-6 rounded-xl border border-gray-200 relative group'>
                                    <button
                                        onClick={() => removeArrayItem('experience', idx)}
                                        className='absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.jobTitle || ''}
                                                onChange={(e) => handleArrayChange(idx, 'experience', 'jobTitle', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Company</label>
                                            <input
                                                type="text"
                                                value={exp.company || ''}
                                                onChange={(e) => handleArrayChange(idx, 'experience', 'company', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>From</label>
                                            <input
                                                type="date"
                                                value={exp.from ? new Date(exp.from).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleArrayChange(idx, 'experience', 'from', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>To</label>
                                            <input
                                                type="date"
                                                value={exp.to ? new Date(exp.to).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleArrayChange(idx, 'experience', 'to', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='col-span-full space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Description</label>
                                            <textarea
                                                value={exp.description || ''}
                                                onChange={(e) => handleArrayChange(idx, 'experience', 'description', e.target.value)}
                                                rows={3}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addArrayItem('experience', { jobTitle: '', company: '', from: '', to: '', description: '' })}
                                className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                            >
                                <FaPlus /> Add Experience
                            </button>
                        </div>
                    )}

                    {/* 4️⃣ Skills Tab */}
                    {activeTab === 'skills' && (
                        <SkillsSelector
                            selectedSkills={formData.skills || []}
                            onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                        />
                    )}

                    {/* 5️⃣ Projects Tab */}
                    {activeTab === 'projects' && (
                        <div className='space-y-6'>
                            {formData.projects?.map((proj, idx) => (
                                <div key={idx} className='bg-gray-50 p-6 rounded-xl border border-gray-200 relative group'>
                                    <button
                                        onClick={() => removeArrayItem('projects', idx)}
                                        className='absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div className='space-y-1'>
                                                <label className='text-sm font-medium text-gray-700'>Project Title</label>
                                                <input
                                                    type="text"
                                                    value={proj.title || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'projects', 'title', e.target.value)}
                                                    className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className='text-sm font-medium text-gray-700'>Link</label>
                                                <input
                                                    type="text"
                                                    value={proj.link || ''}
                                                    onChange={(e) => handleArrayChange(idx, 'projects', 'link', e.target.value)}
                                                    className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                                />
                                            </div>
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Description</label>
                                            <textarea
                                                value={proj.description || ''}
                                                onChange={(e) => handleArrayChange(idx, 'projects', 'description', e.target.value)}
                                                rows={3}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addArrayItem('projects', { title: '', link: '', description: '', images: [] })}
                                className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                            >
                                <FaPlus /> Add Project
                            </button>
                        </div>
                    )}

                    {/* 6️⃣ Awards Tab */}
                    {activeTab === 'awards' && (
                        <div className='space-y-6'>
                            {formData.awards?.map((award, idx) => (
                                <div key={idx} className='bg-gray-50 p-6 rounded-xl border border-gray-200 relative group'>
                                    <button
                                        onClick={() => removeArrayItem('awards', idx)}
                                        className='absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <FaTrash />
                                    </button>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Award Title</label>
                                            <input
                                                type="text"
                                                value={award.title || ''}
                                                onChange={(e) => handleArrayChange(idx, 'awards', 'title', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Date Awarded</label>
                                            <input
                                                type="date"
                                                value={award.date ? new Date(award.date).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleArrayChange(idx, 'awards', 'date', e.target.value)}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg'
                                            />
                                        </div>
                                        <div className='col-span-full space-y-1'>
                                            <label className='text-sm font-medium text-gray-700'>Description</label>
                                            <textarea
                                                value={award.description || ''}
                                                onChange={(e) => handleArrayChange(idx, 'awards', 'description', e.target.value)}
                                                rows={3}
                                                className='mt-1 w-full p-2.5 border border-gray-300 rounded-lg resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => addArrayItem('awards', { title: '', date: '', description: '' })}
                                className='w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors flex items-center justify-center gap-2 font-medium'
                            >
                                <FaPlus /> Add Award
                            </button>
                        </div>
                    )}

                </div>

                {/* Image Crop Portal */}
                <ImageCropPortal
                    isOpen={cropPortalOpen}
                    onClose={() => setCropPortalOpen(false)}
                    imageSrc={selectedImage}
                    cropShape={cropConfig.shape}
                    aspect={cropConfig.aspect}
                    onCropComplete={handleCropComplete}
                    requireLandscape={cropConfig.imageType === 'cover'}
                    imageType={cropConfig.imageType}
                />
            </div>
        </div>
    );
};

export default MyProfile;
