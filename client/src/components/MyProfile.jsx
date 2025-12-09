import axios from 'axios';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaCamera, FaPlus, FaTrash, FaVideo, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaGithub, FaTiktok } from 'react-icons/fa';
import { Link as LinkIcon, MapPin, Briefcase, Save, Image as ImageIcon, Loader2, Loader, Upload, X } from 'lucide-react'
import LocationSelector from './LocationSelector';
import Img from './Image';
import CustomSelect from './CustomSelect';
import ImageCropPortal from '../portals/ImageCropPortal';
import { useLocation } from 'react-router-dom';
import 'react-circular-progressbar/dist/styles.css';
import { Editor } from '@tinymce/tinymce-react';

// Predefined Skills List
import SkillsSelector from './SkillsSelector';

const MyProfile = () => {
    const { userData, backendUrl, setUserData } = useContext(AppContext);
    const location = useLocation();

    // Get tab query from the url
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab');
    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    const [activeTab, setActiveTab] = useState("basic");
    const [loading, setLoading] = useState(false);

    // Field refs for focusing
    const fieldRefs = useRef({});

    const focusField = queryParams.get("focusField");
    if (focusField && fieldRefs.current[focusField]) {
        fieldRefs.current[focusField].focus();
    }


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
        lastName: "",
        age: "",
        email: "",
        phone: "",
        headline: "",
        currentPosition: "",
        category: "",
        description: "",
        dob: "",
        gender: "male",
        language: [],
        qualification: "",
        experienceYears: "1-2 years",
        offeredSalary: 0,
        salaryType: "month",
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
                language: userData.language || [],
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

    // ---------- Project Images Handlers ----------
    const [uploadingProjectImages, setUploadingProjectImages] = useState({});

    const uploadProjectImages = (files, projectIdx) => {
        if (!files || files.length === 0) return;

        setUploadingProjectImages(prev => ({ ...prev, [projectIdx]: true }));

        const imagesToAdd = Array.from(files).map(file => URL.createObjectURL(file));

        setFormData(prev => {
            const updatedProjects = [...prev.projects];
            const existingImages = updatedProjects[projectIdx].images || [];
            updatedProjects[projectIdx].images = [...existingImages, ...imagesToAdd];
            return { ...prev, projects: updatedProjects };
        });

        setUploadingProjectImages(prev => ({ ...prev, [projectIdx]: false }));
    };

    const deleteProjectImage = (projectIdx, imageUrl) => {
        setFormData(prev => {
            const updatedProjects = [...prev.projects];
            updatedProjects[projectIdx].images = updatedProjects[projectIdx].images.filter(img => img !== imageUrl);
            return { ...prev, projects: updatedProjects };
        });
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
            <div className='max-w-6xl mx-auto flex gap-6'>
                <div className=' bg-white rounded-xl border border-gray-200 p-6 md:p-8'>
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

                    <div className='w-full flex gap-8'>
                        <div className='w-[65%]'>
                            {/* Content */}
                            <div className=''>
                                {/* 1️⃣ Basic Info Tab */}
                                {activeTab === 'basic' && (
                                    <div className='space-y-8'>
                                        {/* Cover Image */}
                                        <div className='flex flex-col relative'>
                                            <div className='flex mb-4 items-center gap-4'>
                                                <div>
                                                    <label htmlFor="profilePicture" className=''>Profile Picture</label>
                                                    <div className='mt-1 relative w-36 h-36 rounded-md overflow-hidden flex items-center justify-center'>
                                                        <div className='flex items-center justify-center border border-gray-300 w-36 h-36 rounded-md object-cover'>
                                                            {profilePictureLoading ? <div className='flex items-center justify-center'>
                                                                <Loader2 className='w-12 h-12 animate-spin' />
                                                            </div> :
                                                                <Img
                                                                    src={userData?.profilePicture || '/placeholder.png'}
                                                                    style="w-36 h-36 rounded-md object-cover "
                                                                />
                                                            }
                                                        </div>
                                                        <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                                            <FaCamera size={14} />
                                                            <input type="file" accept="image/*" className='hidden' onChange={handleProfilePictureSelect} />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className='w-full'>
                                                    <label className=' '>Cover Image</label>
                                                    <div className='mt-1 relative w-full h-36 bg-gray-50 rounded-md overflow-hidden group border border-gray-300'>
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
                                                        <label className=''>First Name</label>
                                                        <input
                                                            ref={el => fieldRefs.current['name'] = el}
                                                            type="text"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Last Name</label>
                                                        <input
                                                            ref={el => fieldRefs.current['lastName'] = el}
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Email</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            disabled
                                                            className='w-full border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Phone</label>
                                                        <input
                                                            ref={el => fieldRefs.current['phone'] = el}
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Current Position</label>
                                                        <input
                                                            ref={el => fieldRefs.current['currentPosition'] = el}
                                                            type="text"
                                                            name="currentPosition"
                                                            value={formData.currentPosition}
                                                            onChange={handleChange}
                                                            placeholder="e.g. Senior Developer"
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Category</label>
                                                        <CustomSelect
                                                            ref={el => fieldRefs.current['category'] = el}
                                                            name="category"
                                                            value={formData.category}
                                                            className={"mt-1.5"}
                                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        >
                                                            <option value="Web Developer">Web Developer</option>
                                                            <option value="Designer">Designer</option>
                                                            <option value="Marketing">Marketing</option>
                                                            <option value="Business">Business</option>
                                                            <option value="Data Analyst">Data Analyst</option>
                                                            <option value="Project Manager">Project Manager</option>
                                                            <option value="Sales">Sales</option>
                                                        </CustomSelect>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <hr className='border-gray-100' />

                                        {/* Details */}
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div className='space-y-1'>
                                                <label className=''>Date of Birth</label>
                                                <input
                                                    ref={el => fieldRefs.current['dob'] = el}
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Age</label>
                                                <CustomSelect
                                                    ref={el => fieldRefs.current['age'] = el}
                                                    name="age"
                                                    value={formData.age}
                                                    className={"mt-1.5"}
                                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                >
                                                    <option value="18-25">18-25</option>
                                                    <option value="25-30">25-30</option>
                                                    <option value="30-35">30-35</option>
                                                    <option value="35-40">35-40</option>
                                                </CustomSelect>
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Gender</label>
                                                <CustomSelect
                                                    ref={el => fieldRefs.current['gender'] = el}
                                                    name="gender"
                                                    value={formData.gender}
                                                    className={"mt-1.5"}
                                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </CustomSelect>
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Language</label>
                                                <CustomSelect
                                                    ref={el => fieldRefs.current['language'] = el}
                                                    name="language"
                                                    value={formData.language}
                                                    className={"mt-1.5"}
                                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                >
                                                    <option value="english">English</option>
                                                    <option value="urdu">Urdu</option>
                                                    <option value="hindi">Hindi</option>
                                                    <option value="spanish">Spanish</option>
                                                    <option value="turkey">Turkey</option>
                                                </CustomSelect>
                                            </div>
                                            <div className='space-y-1'>
                                                <label className=''>Qualification</label>
                                                <CustomSelect
                                                    ref={el => fieldRefs.current['qualification'] = el}
                                                    className={"mt-1.5"}
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
                                                <label className=''>Experience</label>
                                                <CustomSelect
                                                    className={"mt-1.5"}
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

                                            <div className='space-y-2'>
                                                <label className="">
                                                    Offered Salary
                                                </label>
                                                <input
                                                    // type="te"
                                                    ref={el => fieldRefs.current['offeredSalary'] = el}

                                                    type='number'
                                                    name="offeredSalary"
                                                    value={formData.offeredSalary || ''}
                                                    onChange={(e) => setFormData({ ...formData, offeredSalary: e.target.value })}
                                                    placeholder={userData?.offeredSalary || "30"}
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <label className="">
                                                    Salary Type
                                                </label>
                                                <CustomSelect
                                                    label="salaryType"
                                                    name="salaryType"
                                                    value={formData.salaryType || ""}
                                                    onChange={handleChange}
                                                >
                                                    <option value="day">Per Day</option>
                                                    <option value="month">Per Month</option>
                                                    <option value="year">Per Year</option>
                                                </CustomSelect>
                                            </div>
                                            <div className='col-span-full space-y-1'>
                                                <label className=''>Description</label>
                                                <Editor
                                                    apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"  // or your TinyMCE key
                                                    value={formData.description}
                                                    onEditorChange={(content) =>
                                                        handleChange({
                                                            target: { name: "description", value: content }
                                                        })
                                                    }
                                                    onInit={(evt, editor) => {
                                                        fieldRefs.current["description"] = editor;
                                                    }}
                                                    init={{
                                                        height: 250,
                                                        menubar: false,

                                                        plugins: "lists link fullscreen",

                                                        toolbar: `
                                                        styles | bold italic |
                                                        bullist numlist |
                                                        blockquote |
                                                        alignleft aligncenter alignright |
                                                        link |
                                                        fullscreen
                                                        `,

                                                        content_style: "body { font-family: Inter, sans-serif; font-size: 14px; }",
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <hr className='border-gray-100' />

                                        {/* Location */}
                                        <div>
                                            <h3 className='text-lg font-semibold text-gray-800 mb-4'>Location</h3>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                <div className='col-span-full space-y-1'>
                                                    <label className=''>Address</label>
                                                    <input
                                                        ref={el => fieldRefs.current['address'] = el}
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder='Enter Your Address here...'
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
                                                    <label className=''>Postal Code</label>
                                                    <input
                                                        type="text"
                                                        name="postal"
                                                        value={formData.postal}
                                                        onChange={handleChange}
                                                        placeholder='Enter Your Postal Code here...'
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
                                                    <label className=' flex items-center gap-2'>
                                                        LinkedIn
                                                    </label>
                                                    <input
                                                        ref={el => fieldRefs.current['linkedin'] = el}
                                                        type="text"
                                                        name="linkedin"
                                                        value={formData.linkedin}
                                                        onChange={handleChange}
                                                        placeholder="https://linkedin.com/in/yourprofile"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        Twitter
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="twitter"
                                                        value={formData.twitter}
                                                        onChange={handleChange}
                                                        placeholder="https://twitter.com/yourprofile"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        Facebook
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="facebook"
                                                        value={formData.facebook}
                                                        onChange={handleChange}
                                                        placeholder="https://facebook.com/yourprofile"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        Instagram
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="instagram"
                                                        value={formData.instagram}
                                                        onChange={handleChange}
                                                        placeholder="https://instagram.com/yourprofile"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        YouTube
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="youtube"
                                                        value={formData.youtube}
                                                        onChange={handleChange}
                                                        placeholder="https://youtube.com/@yourchannel"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        TikTok
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="tiktok"
                                                        value={formData.tiktok}
                                                        onChange={handleChange}
                                                        placeholder="https://tiktok.com/@yourprofile"
                                                    />
                                                </div>

                                                <div className='space-y-1'>
                                                    <label className=' flex items-center gap-2'>
                                                        GitHub
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="github"
                                                        value={formData.github}
                                                        onChange={handleChange}
                                                        placeholder="https://github.com/yourprofile"
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
                                                        />
                                                        <input
                                                            type="text"
                                                            value={net.url}
                                                            onChange={(e) => handleArrayChange(idx, 'customSocialNetworks', 'url', e.target.value)}
                                                            placeholder="Profile URL"
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
                                                <label className=''>Video Introduction</label>
                                                <div className='relative mt-1'>
                                                    <FaVideo className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                                                    <input
                                                        ref={el => fieldRefs.current['videoUrl'] = el}
                                                        type="text"
                                                        name="videoUrl"
                                                        value={formData.videoUrl}
                                                        onChange={handleChange}
                                                        placeholder="e.g. YouTube link"
                                                        className='!pl-10'
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
                                            <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                                <div className='w-full flex items-center justify-between '>
                                                    <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                        Education {idx + 1}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeArrayItem('education', idx)}
                                                        className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='space-y-1'>
                                                        <label className=''>Degree Title</label>
                                                        <input
                                                            type="text"
                                                            value={edu.title || ''}
                                                            onChange={(e) => handleArrayChange(idx, 'education', 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Level</label>
                                                        <input
                                                            type="text"
                                                            value={edu.level || ''}
                                                            onChange={(e) => handleArrayChange(idx, 'education', 'level', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>From</label>
                                                        <input
                                                            type="date"
                                                            value={edu.from ? new Date(edu.from).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleArrayChange(idx, 'education', 'from', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>To</label>
                                                        <input
                                                            type="date"
                                                            value={edu.to ? new Date(edu.to).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleArrayChange(idx, 'education', 'to', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='col-span-full space-y-1'>
                                                        <label className=''>Description</label>
                                                        <Editor
                                                            apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"
                                                            value={edu.description || ''}

                                                            onEditorChange={(content) =>
                                                                handleArrayChange(idx, "education", "description", content)
                                                            }

                                                            onInit={(evt, editor) => {
                                                                if (!fieldRefs.current.education) fieldRefs.current.education = {};
                                                                fieldRefs.current.education[idx] = editor;
                                                            }}

                                                            init={{
                                                                height: 250,
                                                                menubar: false,

                                                                plugins: "lists link fullscreen",

                                                                toolbar: `
                                                            styles | bold italic |
                                                            bullist numlist |
                                                            blockquote |
                                                            alignleft aligncenter alignright |
                                                            link |
                                                            fullscreen
                                                        `,

                                                                content_style:
                                                                    "body { font-family: Inter, sans-serif; font-size: 14px; }",
                                                            }}
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
                                            <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                                <div className='w-full flex items-center justify-between'>
                                                    <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                        Projects {idx + 1}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeArrayItem('experience', idx)}
                                                        className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='space-y-1'>
                                                        <label className=''>Job Title</label>
                                                        <input
                                                            type="text"
                                                            value={exp.jobTitle || ''}
                                                            onChange={(e) => handleArrayChange(idx, 'experience', 'jobTitle', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Company</label>
                                                        <input
                                                            type="text"
                                                            value={exp.company || ''}
                                                            onChange={(e) => handleArrayChange(idx, 'experience', 'company', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>From</label>
                                                        <input
                                                            type="date"
                                                            value={exp.from ? new Date(exp.from).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleArrayChange(idx, 'experience', 'from', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>To</label>
                                                        <input
                                                            type="date"
                                                            value={exp.to ? new Date(exp.to).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleArrayChange(idx, 'experience', 'to', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='col-span-full space-y-1'>
                                                        <label className=''>Description</label>
                                                        <Editor
                                                            apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"
                                                            value={exp.description || ''}

                                                            onEditorChange={(content) =>
                                                                handleArrayChange(idx, "experience", "description", content)
                                                            }

                                                            onInit={(evt, editor) => {
                                                                if (!fieldRefs.current.experience) fieldRefs.current.experience = {};
                                                                fieldRefs.current.experience[idx] = editor;
                                                            }}

                                                            init={{
                                                                height: 250,
                                                                menubar: false,

                                                                plugins: "lists link fullscreen",

                                                                toolbar: `
                                                        styles | bold italic |
                                                        bullist numlist |
                                                        blockquote |
                                                        alignleft aligncenter alignright |
                                                        link |
                                                        fullscreen
                                                    `,

                                                                content_style:
                                                                    "body { font-family: Inter, sans-serif; font-size: 14px; }",
                                                            }}
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
                                            <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                                <div className='w-full flex items-center justify-between'>
                                                    <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                        Projects {idx + 1}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeArrayItem('projects', idx)}
                                                        className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <div className='space-y-4'>
                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                                                        <div className='space-y-1'>
                                                            <label className=''>Project Title</label>
                                                            <input
                                                                type="text"
                                                                value={proj.title || ''}
                                                                onChange={(e) => handleArrayChange(idx, 'projects', 'title', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className='space-y-1'>
                                                            <label className=''>Link</label>
                                                            <input
                                                                type="text"
                                                                value={proj.link || ''}
                                                                onChange={(e) => handleArrayChange(idx, 'projects', 'link', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Description</label>
                                                        <Editor
                                                            apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"
                                                            value={proj.description || ''}

                                                            onEditorChange={(content) =>
                                                                handleArrayChange(idx, "projects", "description", content)
                                                            }

                                                            onInit={(evt, editor) => {
                                                                if (!fieldRefs.current.projects) fieldRefs.current.projects = {};
                                                                fieldRefs.current.projects[idx] = editor;
                                                            }}

                                                            init={{
                                                                height: 250,
                                                                menubar: false,

                                                                plugins: "lists link fullscreen",

                                                                toolbar: `
                                                        styles | bold italic |
                                                        bullist numlist |
                                                        blockquote |
                                                        alignleft aligncenter alignright |
                                                        link |
                                                        fullscreen
                                                    `,

                                                                content_style:
                                                                    "body { font-family: Inter, sans-serif; font-size: 14px; }",
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Project Images */}
                                                    <div className='space-y-1'>
                                                        <label className=''>Project Images</label>
                                                        <div className='flex flex-col gap-4'>
                                                            {proj.images?.length > 0 && (
                                                                <div className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                                    {proj.images.map((image, imageIdx) => (
                                                                        <div key={imageIdx} className="relative group flex flex-col items-center">
                                                                            <img
                                                                                src={image}
                                                                                alt={`Project ${idx + 1} - ${imageIdx + 1}`}
                                                                                className="w-full h-full object-cover rounded-md border border-gray-200"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => deleteProjectImage(idx, image)}
                                                                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <input
                                                                type="file"
                                                                id={`projectImages_${idx}`}
                                                                multiple
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => uploadProjectImages(e.target.files, idx)}
                                                            />
                                                            <label
                                                                htmlFor={`projectImages_${idx}`}
                                                                className={`text-center py-8 border bg-[var(--accent-color)]  border-[var(--primary-color)]/80 w-38 h-38 gap-2 cursor-pointer justify-center rounded-md ${uploadingProjectImages[idx] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className='flex flex-col w-full h-full items-center gap-2'>
                                                                    <Upload className='text-[var(--primary-color)]' />
                                                                    <div>
                                                                        Upload Images
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
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
                                            <div key={idx} className='p-6 rounded-xl border border-gray-200 relative group'>
                                                <div className='w-full flex items-center justify-between'>
                                                    <h4 className='text-xl md:text-2xl text-black font-semibold mb-4 '>
                                                        Award {idx + 1}
                                                    </h4>
                                                    <button
                                                        onClick={() => removeArrayItem('awards', idx)}
                                                        className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity'
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='space-y-1'>
                                                        <label className=''>Award Title</label>
                                                        <input
                                                            type="text"
                                                            value={award.title || ''}
                                                            onChange={(e) => handleArrayChange(idx, 'awards', 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='space-y-1'>
                                                        <label className=''>Date Awarded</label>
                                                        <input
                                                            type="date"
                                                            value={award.date ? new Date(award.date).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => handleArrayChange(idx, 'awards', 'date', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className='col-span-full space-y-1'>
                                                        <label className=''>Description</label>
                                                        <Editor
                                                            apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"
                                                            value={award.description || ''}

                                                            onEditorChange={(content) =>
                                                                handleArrayChange(idx, "awards", "description", content)
                                                            }

                                                            onInit={(evt, editor) => {
                                                                if (!fieldRefs.current.awards) fieldRefs.current.awards = {};
                                                                fieldRefs.current.awards[idx] = editor;
                                                            }}

                                                            init={{
                                                                height: 250,
                                                                menubar: false,

                                                                plugins: "lists link fullscreen",

                                                                toolbar: `
                                                                    styles | bold italic |
                                                                    bullist numlist |
                                                                    blockquote |
                                                                    alignleft aligncenter alignright |
                                                                    link |
                                                                    fullscreen
                                                                `,

                                                                content_style:
                                                                    "body { font-family: Inter, sans-serif; font-size: 14px; }",
                                                            }}
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
                        </div>
                        <div className='w-[30%] flex justify-center'>
                            <div className='sticky top-10 w-62 h-62'>
                                <CircularProgressbar
                                    value={userData?.profileScore}
                                    text={`${userData?.profileScore}%`}
                                    strokeWidth={2.5}
                                    styles={buildStyles({
                                        pathColor: "var(--primary-color)",  // dark green color for filled portion
                                        trailColor: "#e6e6e6", // light gray for unfilled portion
                                        strokeLinecap: "butt", // flat ends like in your image
                                        textColor: "#000",      // black text
                                        textSize: "14px",
                                    })}
                                />
                                <div
                                    className='absolute top-1/2 mt-10 -translate-1/2 left-1/2 text-center'
                                >
                                    Profile Strength
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
    );
};

export default MyProfile;
