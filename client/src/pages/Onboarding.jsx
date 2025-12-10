import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, CheckCircle, SkipForward, Upload, User, Briefcase, MapPin, Building, Globe, Users, Save } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import SearchSelect from '../components/SelectSearch';
import ImageCropPortal from '../portals/ImageCropPortal';
import Img from '../components/Image';
import LocationSelector from '../components/LocationSelector';
import SkillsSelector from '../components/SkillsSelector';

const Onboarding = () => {
    const { userData, backendUrl, setUserData, getUserData } = useContext(AppContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Crop Portal State
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [cropConfig, setCropConfig] = useState({
        shape: 'rect',
        aspect: 1,
        imageType: 'profile', // 'profile', 'cover', 'banner'
        fieldName: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        profilePicture: null,
        profilePicturePreview: null,
        country: '',
        city: '',
        // User specific
        currentPosition: '',
        category: '',
        experienceYears: '',
        skills: '', // comma separated
        resume: null,
        coverImage: null,
        coverImagePreview: null,
        // Recruiter specific
        company: '',
        industry: '',
        companyType: '',
        members: '',
        website: '',
        banner: null,
        bannerPreview: null,
        description: '' // about
    });

    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || '',
                country: userData.country || '',
                city: userData.city || '',
                currentPosition: userData.currentPosition || '',
                category: userData.category || '',
                experienceYears: userData.experienceYears || '',
                skills: userData.skills ? userData.skills.join(', ') : '',
                company: userData.company || '',
                industry: userData.industry || '',
                companyType: userData.companyType || '',
                members: userData.members || '',
                website: userData.website || '',
                description: userData.about || ''
            }));
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (fieldName === 'resume') {
            if (file.type !== 'application/pdf') {
                return toast.error("Please upload a PDF file");
            }
            setFormData(prev => ({ ...prev, resume: file }));
            return;
        }

        // Image validation
        if (!file.type.startsWith('image/')) {
            return toast.error('Please select an image file');
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error('Image size should be less than 5MB');
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            let config = { fieldName };

            if (fieldName === 'profilePicture') {
                config = { ...config, shape: 'round', aspect: 1, imageType: 'profile' };
            } else if (fieldName === 'coverImage') {
                config = { ...config, shape: 'rect', aspect: 16 / 9, imageType: 'cover' };
            } else if (fieldName === 'banner') {
                config = { ...config, shape: 'rect', aspect: 16 / 9, imageType: 'banner' };
            }

            setCropConfig(config);
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);
        e.target.value = ''; // Reset input
    };

    const handleCropComplete = (croppedBlob) => {
        const fieldName = cropConfig.fieldName;
        const previewUrl = URL.createObjectURL(croppedBlob);

        setFormData(prev => ({
            ...prev,
            [fieldName]: croppedBlob,
            [`${fieldName}Preview`]: previewUrl
        }));
        setCropPortalOpen(false);
    };

    const handleSkip = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: { isOnboardingCompleted: true }
            });
            if (data.success) {
                await getUserData();
                toast.info("Onboarding skipped");
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Error skipping onboarding");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            if (!formData.name) return toast.error("Name is required");
            setStep(2);
        } else if (step === 2) {
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        console.log('formData?.skills', formData?.skills)
        try {
            // 1. Update Profile Text Data
            const updateData = {
                name: formData.name,
                country: formData.country,
                city: formData.city,
                isOnboardingCompleted: true
            };

            if (userData.role === 'user') {
                updateData.currentPosition = formData.currentPosition;
                updateData.category = formData.category;
                updateData.experienceYears = formData.experienceYears;
                updateData.skills = formData.skills
            } else {
                updateData.company = formData.company;
                updateData.industry = formData.industry;
                updateData.companyType = formData.companyType;
                updateData.members = formData.members;
                updateData.website = formData.website;
                updateData.about = formData.description;
            }

            const { data: profileData } = await axios.post(`${backendUrl}/api/user/updateprofile`, {
                updateUser: updateData
            });

            if (!profileData.success) throw new Error(profileData.message);

            // 2. Upload Files
            if (formData.profilePicture instanceof Blob) {
                const ppData = new FormData();
                ppData.append('profilePicture', formData.profilePicture, 'profile.jpg');
                await axios.post(`${backendUrl}/api/user/updateprofilepicture`, ppData);
            }

            if (userData.role === 'user') {
                if (formData.coverImage instanceof Blob) {
                    const ciData = new FormData();
                    ciData.append('coverImage', formData.coverImage, 'cover.jpg');
                    await axios.post(`${backendUrl}/api/user/updatecoverimage`, ciData);
                }
                if (formData.resume) {
                    const rData = new FormData();
                    rData.append('resume', formData.resume);
                    await axios.post(`${backendUrl}/api/user/updateresume`, rData);
                }
            } else {
                if (formData.banner instanceof Blob) {
                    const bData = new FormData();
                    bData.append('banner', formData.banner, 'banner.jpg');
                    await axios.post(`${backendUrl}/api/user/updatebanner`, bData);
                }
            }

            await getUserData();
            toast.success("Profile Setup Complete!");
            navigate('/');

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const industryOptions = [
        { name: "1", code: "Electronics / Electrical" },
        { name: "2", code: "Engineering (Civil / Mechanical / Electrical)" },
        { name: "3", code: "Food & Beverages / Hospitality" },
        { name: "4", code: "Government / Public Sector" },
        { name: "5", code: "Healthcare / Medical" },
        { name: "6", code: "Human Resources (HR)" },
        { name: "7", code: "Information Technology / Software" },
        { name: "8", code: "Legal / Law" },
        { name: "9", code: "Logistics / Supply Chain" },
        { name: "10", code: "Manufacturing" },
        { name: "11", code: "Media / Journalism" },
        { name: "12", code: "NGO / Social Services" },
        { name: "13", code: "Operations / Management" },
        { name: "14", code: "Real Estate" },
        { name: "15", code: "Retail / Sales" },
        { name: "16", code: "Security / Safety" },
        { name: "17", code: "Telecommunications" },
        { name: "18", code: "Tourism / Travel" },
        { name: "19", code: "Transportation / Drivers" }
    ];

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar */}
                <div className="bg-[var(--primary-color)] p-8 md:w-1/3 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/pattern.png')] bg-cover"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
                        <p className="text-blue-100 mb-8">Let's set up your profile to get you started.</p>

                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 transition-all duration-300 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-2'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > 1 ? 'bg-white text-[var(--primary-color)] border-white' : 'border-white'}`}>
                                    {step > 1 ? <CheckCircle size={20} /> : '1'}
                                </div>
                                <span className="font-medium text-lg">Basic Info</span>
                            </div>
                            <div className={`flex items-center gap-4 transition-all duration-300 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-50 -translate-x-2'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step > 2 ? 'bg-white text-[var(--primary-color)] border-white' : 'border-white'}`}>
                                    {step > 2 ? <CheckCircle size={20} /> : '2'}
                                </div>
                                <span className="font-medium text-lg">{userData.role === 'recruiter' ? 'Company Details' : 'Professional Info'}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSkip} className="relative z-10 flex items-center gap-2 text-blue-200 hover:text-white transition-colors mt-8 group">
                        <SkipForward size={16} className="group-hover:translate-x-1 transition-transform" /> Skip for now
                    </button>
                </div>

                {/* Form Area */}
                <div className="p-8 md:w-2/3 overflow-y-auto max-h-[90vh] bg-white">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Basic Information</h2>

                            {/* Profile Picture Upload */}
                            <div className="flex justify-center mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                        {formData.profilePicturePreview || userData.profilePicture ? (
                                            <img src={formData.profilePicturePreview || userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                <User size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-[var(--primary-color)] !text-white p-2.5 rounded-full cursor-pointer hover:bg-[var(--primary-color)]/70 transition-colors">
                                        <Camera size={18} />
                                        <input type="file" onChange={(e) => handleFileChange(e, 'profilePicture')} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <LocationSelector
                                        selectedCountry={formData.country}
                                        selectedCity={formData.city}
                                        onCountryChange={(c) => setFormData(prev => ({ ...prev, country: c }))}
                                        onCityChange={(c) => setFormData(prev => ({ ...prev, city: c }))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && userData.role === 'user' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Professional Details</h2>

                            {/* Cover Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                                <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] transition-colors group">
                                    {formData.coverImagePreview || userData.coverImage ? (
                                        <img src={formData.coverImagePreview || userData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Upload size={32} className="mb-2 group-hover:text-[var(--primary-color)] transition-colors" />
                                            <span className="text-sm font-medium">Click to upload cover image</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={(e) => handleFileChange(e, 'coverImage')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="currentPosition"
                                            value={formData.currentPosition}
                                            onChange={handleInputChange}
                                            placeholder="Software Engineer"
                                            className='!pl-10'
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                    <CustomSelect
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Experience</option>
                                        <option value="Fresher">Fresher</option>
                                        <option value="1-2 years">1-2 Years</option>
                                        <option value="3-5 years">3-5 Years</option>
                                        <option value="6-8 years">6-8 Years</option>
                                        <option value="9+ years">9+ Years</option>
                                    </CustomSelect>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <CustomSelect
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Programming">Programming</option>
                                    <option value="Design">Design</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                </CustomSelect>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                                <SkillsSelector
                                    selectedSkills={formData.skills || []}
                                    onSkillsChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200 w-full justify-center">
                                        <Upload size={18} />
                                        <span className="font-medium truncate max-w-[200px]">{formData.resume ? formData.resume.name : "Upload Resume"}</span>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'resume')} accept=".pdf" className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && userData.role === 'recruiter' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Company Details</h2>

                            {/* Banner Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Banner</label>
                                <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] transition-colors group">
                                    {formData.bannerPreview || userData.banner ? (
                                        <img src={formData.bannerPreview || userData.banner} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <Upload size={32} className="mb-2 group-hover:text-[var(--primary-color)] transition-colors" />
                                            <span className="text-sm font-medium">Click to upload banner</span>
                                        </div>
                                    )}
                                    <input type="file" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Acme Corp"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <SearchSelect
                                        label="Industry"
                                        labelStyle="text-sm font-medium text-gray-700 mb-1 block"
                                        options={industryOptions}
                                        value={formData.industry}
                                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                        placeholder="Select Industry"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                                    <CustomSelect
                                        name="companyType"
                                        value={formData.companyType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Private Limited Company">Private Limited Company</option>
                                        <option value="Partnership">Partnership</option>
                                        <option value="Government Organization">Government Organization</option>
                                        <option value="Non-Profit Organization">Non-Profit Organization</option>
                                        <option value="Startup">Startup</option>
                                        <option value="Educational Institute">Educational Institute</option>
                                        <option value="Consultancy / Agency">Consultancy / Agency</option>
                                    </CustomSelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                                    <CustomSelect
                                        name="members"
                                        value={formData.members}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Size</option>
                                        <option value="0-50">0-50</option>
                                        <option value="11-50">11-50</option>
                                        <option value="51-200">51-200</option>
                                        <option value="201-500">201-500</option>
                                        <option value="500+">500+</option>
                                    </CustomSelect>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                                    placeholder="Tell us about your company..."
                                ></textarea>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end gap-4 pt-4 border-t border-gray-100">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className="primary-btn flex items-center gap-2 px-8 py-2.5 rounded-lg shadow-lg shadow-blue-500/30"
                        >
                            {loading ? 'Saving...' : step === 2 ? 'Finish' : 'Next'}
                            {!loading && step !== 2 && <ChevronRight size={18} />}
                            {!loading && step === 2 && <Save size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Crop Portal */}
            <ImageCropPortal
                isOpen={cropPortalOpen}
                onClose={() => setCropPortalOpen(false)}
                imageSrc={selectedImage}
                cropShape={cropConfig.shape}
                aspect={cropConfig.aspect}
                onCropComplete={handleCropComplete}
                imageType={cropConfig.imageType}
            />
        </div>
    );
};

export default Onboarding;
