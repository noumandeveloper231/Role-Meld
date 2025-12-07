import axios from 'axios';
import { memo, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Briefcase, Save, Building, FileText, Camera, Clock, Upload, X, Image, ImageIcon, Loader2 } from 'lucide-react'
import Img from './Image';
import LocationSelector from './LocationSelector';
import SearchSelect from './SelectSearch';
import { CircularProgressbar } from 'react-circular-progressbar';
import { MdWarning } from 'react-icons/md';
import CustomSelect from './CustomSelect';
import ImageCropPortal from '../portals/ImageCropPortal';
import slugify from 'slugify'
import { Editor } from '@tinymce/tinymce-react'
import CompanyCard from './CompanyCard'

const RecruiterProfile = () => {
    const { userData, backendUrl, setUserData } = useContext(AppContext);

    const [formData, setFormData] = useState({
        name: userData?.name || "",
        slug: userData?.slug || "",
        foundedIn: userData?.foundedIn || "",
        company: userData?.company || "",
        website: userData?.website || "",
        members: userData?.members || "",
        city: userData?.city || "",
        country: userData?.country || "",
        state: userData?.state || "",
        contactNumber: userData?.contactNumber || "",
        about: userData?.about || "",
        category: userData?.industry || "",
        address: userData?.address || "",
        companyType: userData?.companyType || "",
    });

    const [companyImages, setCompanyImages] = useState(userData?.companyImages || []);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Crop Portal State
    const [cropPortalOpen, setCropPortalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [pictureLoading, setPictureLoading] = useState(false);


    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "company") {
            const generatedSlug = slugify(value || "", { lower: true });
            setFormData((prev) => ({
                ...prev,
                company: value,
                slug: generatedSlug,
            }));
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));
    };

    // ---------- Update Profile ----------
    const updateProfile = async (e) => {
        if (!formData.name) {
            return toast.error("Name is required")
        }

        if (!formData.company) {
            return toast.error("Company Name is required")
        }

        if (formData?.website && !formData.website.includes("http")) {
            return toast.error("Enter a Valid Website Url")
        }

        if (formData?.about?.split(" ").length > 150) {
            return toast.error("About is required and should be between 50 and 150 words")
        }

        if (!formData.contactNumber && userData?.reviewStatus === "approved") {
            return toast.error("Contact Number is required")
        }

        if (!formData.tagline && userData?.reviewStatus === "approved") {
            return toast.error("Tagline is required")
        }

        if (!formData.city && userData?.reviewStatus === "approved") {
            return toast.error("City is required")
        }

        if (!formData.country && userData?.reviewStatus === "approved") {
            return toast.error("Country is required")
        }

        if (!formData.companyType && userData?.reviewStatus === "approved") {
            return toast.error("Company Type is required")
        }

        if (!formData.industry && userData?.reviewStatus === "approved") {
            return toast.error("Industry is required")
        }
        e.preventDefault();
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
        }
    };

    // Handle profile picture selection
    const handleProfilePictureSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropPortalOpen(true);
        };
        reader.readAsDataURL(file);

        // Reset file input
        e.target.value = '';
    };

    // Handle crop complete
    const handleCropComplete = async (croppedBlob) => {
        if (cropConfig.imageType === 'profile') {
            await uploadProfilePicture(croppedBlob);
        } else if (cropConfig.imageType === 'cover') {
            await uploadBannerImage(croppedBlob);
        }
    };
    const [cropConfig, setCropConfig] = useState({
        shape: 'rect',
        aspect: 1,
        imageType: 'profile'
    });

    const handleBannerImageSelect = (e) => {
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

    // Upload profile picture
    const uploadProfilePicture = async (blob) => {
        setPictureLoading(true);
        const formData = new FormData();
        formData.append("profilePicture", blob, "profile.jpg");

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/updateprofilepicture`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setUserData(data.user);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setPictureLoading(false);
        }
    };

    // ---------- Company Images Upload ----------
    const uploadCompanyImages = async (files) => {
        if (!files || files.length === 0) return;

        setUploadingImages(true);
        const formData = new FormData();

        Array.from(files).forEach(file => {
            formData.append('companyImages', file);
        });

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/upload-company-images`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (data.success) {
                setCompanyImages(data.images);
                setUserData(prev => ({ ...prev, companyImages: data.images }));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to upload images");
        } finally {
            setUploadingImages(false);
        }
    };

    const [companies, setCompanies] = useState([])
    const [isSlugAvailable, setIsSlugAvailable] = useState(true);

    const getCompanies = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/allrecruiters`);
            if (data.success) {
                setCompanies(data.recruiters)
            } else {
                console.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getCompanies()
    }, [])

    const [slugSuggestions, setSlugSuggestions] = useState([]);

    useEffect(() => {
        if (!formData?.company || !formData?.slug) return;

        const exists = companies.some((company) => company.slug === formData.slug);

        setIsSlugAvailable(!exists);

        if (exists) {
            const base = formData.slug;
            setSlugSuggestions(generateSlugSuggestions(base));
        } else {
            setSlugSuggestions([]);
        }
    }, [formData.slug, formData.company]);

    const generateSlugSuggestions = (base) => {
        const timestamp = Date.now().toString().slice(-4); // last 4 digits
        return [
            `${base}-job`,
            `${base}-vacancy`,
            `${base}-position`,
            `${base}-${timestamp}`,   // impossible-to-collide
            `${base}-${timestamp + 8}`,   // impossible-to-collide
            `${base}-${timestamp + 1}`,   // impossible-to-collide
            `${base}-${timestamp + 9}`,   // impossible-to-collide
        ];
    };

    // ---------- Delete Company Image ----------
    const deleteCompanyImage = async (imageUrl) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/delete-company-image`,
                { imageUrl }
            );

            if (data.success) {
                setCompanyImages(data.images);
                setUserData(prev => ({ ...prev, companyImages: data.images }));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete image");
        }
    };

    const [bannerLoading, setBannerLoading] = useState(false);

    const uploadBannerImage = async (blob) => {
        const formData = new FormData();
        formData.append('banner', blob, 'banner.jpg');
        setBannerLoading(true)
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/updatebanner`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setUserData(data.user || data.profile);
                toast.success(data.message || "Cover image updated successfully");
            }
        } catch (error) {
            toast.error("Cover image upload failed");
        } finally {
            setBannerLoading(false)
        }
    };

    const categoryOptions = [
        "Electronics / Electrical",
        "Engineering (Civil / Mechanical / Electrical)",
        "Food & Beverages / Hospitality",
        "Government / Public Sector",
        "Healthcare / Medical",
        "Human Resources (HR)",
        "Information Technology / Software",
        "Legal / Law",
        "Logistics / Supply Chain",
        "Manufacturing",
        "Media / Journalism",
        "NGO / Social Services",
        "Operations / Management",
        "Real Estate",
        "Retail / Sales",
        "Security / Safety",
        "Telecommunications",
        "Tourism / Travel",
        "Transportation / Drivers"
    ];


    return (
        <div className='w-full p-6 bg-white border border-gray-200 rounded-lg'>
            <div className='max-w-7xl mx-auto'>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border border-gray-200 p-6 flex flex-col gap-5">
                        <div className='mb-6 flex items-center justify-between'>
                            <h1 className="text-3xl font-bold text-gray-800">Update Profile</h1>
                            <button
                                onClick={updateProfile}
                                className="primary-btn"
                            >
                                <Save className='w-4 h-4' />
                                Save
                            </button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='col-span-2 flex items-center justify-between pb-4'>
                                <h4 className='text-xl font-semibold text-gray-800'>Basic Info</h4>
                            </div>
                            <div className='w-full space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={userData?.name || "Name"}
                                />
                            </div>
                            <div className='w-full space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder={userData?.company || "Company"}
                                />
                            </div>
                            <div className='col-span-2'>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Slug
                                </label>

                                <div className="flex items-center w-full bg-[#f9f9f9] border border-gray-300 rounded-md overflow-hidden ">

                                    <span className="text-gray-600 bg-[#f9f9f9] px-4 py-2 whitespace-nowrap text-sm border-r border-gray-300 tracking-wider">
                                        https://alfacareers.com/jobs/companies/
                                    </span>

                                    <input
                                        type="text"
                                        name="slug"
                                        value={
                                            formData.slug?.toLowerCase() ||
                                            slugify(formData.company || "").toLowerCase()
                                        }
                                        onChange={handleChange}
                                        className="w-full bg-white px-4 py-2 text-gray-800 outline-none"
                                        placeholder="enter-slug-here"
                                        required
                                    />
                                </div>
                            </div>
                            {!isSlugAvailable && slugSuggestions.length > 0 ? (
                                <div className="col-span-2">
                                    <p className="text-red-600 text-sm mb-1">Slug not available. Try one:</p>

                                    <div className="flex flex-wrap gap-2">
                                        {slugSuggestions.map((s, i) => (
                                            <button
                                                onClick={() => handleChange({ target: { name: "slug", value: s } })}
                                                key={i}
                                                className="
            bg-[var(--accent-color)] 
            text-[var(--primary-color)] 
            px-3 
            py-1
            rounded-full 
            text-xs 
            font-medium 
            flex items-center gap-2 
            border border-[var(--primary-color)]/20
          "
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : isSlugAvailable && formData.slug ? (
                                <p className="text-green-600 text-sm mt-1">Slug is available</p>
                            ) : null}

                            <div className='col-span-2 space-y-2'>
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    About Company
                                </label>
                                <Editor
                                    apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"
                                    value={formData.about}
                                    onEditorChange={(content) =>
                                        handleChange({
                                            target: { name: "about", value: content }
                                        })
                                    }
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

                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Website
                                </label>
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder={userData?.website || "https://"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    // type="te"
                                    type='tel'
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder={userData?.contactNumber || "+92 123 456789"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    className='bg-gray-50 !border-gray-200 !cursor-not-allowed'
                                    readOnly
                                    placeholder={userData?.email || "+92 123 456789"}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Founded In
                                </label>
                                <CustomSelect
                                    label="foundedIn"
                                    name="foundedIn"
                                    value={formData.foundedIn || ""}
                                    onChange={handleChange}
                                >
                                    {
                                        Array.from({ length: 26 }, (_, i) => 2010 + i).map(opt => (
                                            <option value={String(opt)}>{String(opt)}</option>
                                        ))
                                    }
                                </CustomSelect>
                            </div>
                            <div className='space-y-2'>
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Company Size *
                                </label>
                                <CustomSelect
                                    label="Members"
                                    name="members"
                                    value={formData.members || ""}
                                    onChange={handleChange}
                                >
                                    <option value="">Select company size</option>
                                    <option value="0-50">0-50</option>
                                    <option value="50-100">50-100</option>
                                    <option value="100-500">100-500</option>
                                    <option value="500-1000">500-1000</option>
                                    <option value="1000+">1000+</option>
                                </CustomSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">
                                    Category *
                                </label>
                                <CustomSelect
                                    label="Category"
                                    name="category"
                                    value={formData.category || ""}
                                    onChange={handleChange}
                                >
                                    {
                                        categoryOptions.map(opt => (
                                            <option value={opt}>{opt}</option>
                                        ))
                                    }
                                </CustomSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm flex items-center gap-2 font-medium text-gray-700">Company Type</label>
                                <CustomSelect
                                    name="companyType"
                                    value={formData.companyType || ""}
                                    onChange={handleChange}
                                >
                                    <option value="Private Limited Company">Private Limited Company</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Government Organization">Government Organization</option>
                                    <option value="Non-Profit Organization">Non-Profit Organization</option>
                                    <option value="Startup">Startup</option>
                                    <option value="Educational Institute">Educational Institute</option>
                                    <option value="Consultancy / Agency">Consultancy / Agency</option>
                                </CustomSelect>
                            </div>
                        </div>

                        <hr className="border-gray-300 my-5" />

                        <div className='grid grid-cols-1 md:grid-cols-2'>
                            <div className='col-span-2 flex items-center justify-between pb-4'>
                                <h4 className='text-xl font-semibold text-gray-800'>Media</h4>
                            </div>
                            <div className='col-span-2 flex w-full items-center gap-4'>
                                <div className=''>
                                    <label htmlFor="profilePicture" className='text-sm font-medium text-gray-700'>Profile Picture</label>
                                    <div className='mt-1 relative w-36 h-36 rounded-md overflow-hidden flex items-center justify-center'>
                                        <div className='flex items-center justify-center border border-gray-300 w-36 h-36 rounded-md object-cover'>
                                            {pictureLoading ? <div className='flex items-center justify-center'>
                                                <Loader2 className='w-12 h-12 animate-spin' />
                                            </div> :
                                                <Img
                                                    src={userData?.profilePicture || '/placeholder.png'}
                                                    style="w-36 h-36 rounded-md object-cover "
                                                />
                                            }
                                        </div>
                                        <label className='absolute bottom-0 right-0 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition'>
                                            <Camera size={14} />
                                            <input type="file" accept="image/*" className='hidden' onChange={handleProfilePictureSelect} />
                                        </label>
                                    </div>
                                </div>
                                <div className='w-full'>
                                    <label className='text-sm font-medium text-gray-700 '>Cover Image</label>
                                    <div className='mt-1 relative w-full h-36 bg-gray-50 rounded-md overflow-hidden group border border-gray-300'>
                                        {userData?.banner ? (
                                            <>
                                                {bannerLoading ? <div className='flex w-full h-full items-center justify-center'>
                                                    <Loader2 className='w-12 h-12 animate-spin' />
                                                </div> :
                                                    <Img
                                                        src={userData.banner}
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
                                            <Camera size={14} />
                                            <input type="file" accept="image/*" className='hidden' onChange={handleBannerImageSelect} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='border-gray-300 my-5' />

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='col-span-2 flex items-center justify-between pb-4'>
                                <h4 className='text-xl font-semibold text-gray-800'>Location</h4>
                            </div>
                            <div className='space-y-2'>
                                <label className="font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder={userData?.address || "e.g, Block A New London"}
                                    className="mt-2 w-full p-3 border-2 border-gray-300 focus:border-blue-500 focus:outline-none rounded-lg transition-colors"
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className="font-medium text-gray-700">State/Province</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder={userData?.state || "e.g, Punjab"}
                                    className="mt-2 w-full p-3 border-2 border-gray-300 focus:border-blue-500 focus:outline-none rounded-lg transition-colors"
                                />
                            </div>
                            <div className='col-span-2'>
                                <LocationSelector
                                    selectedCountry={formData.country}
                                    selectedCity={formData.city}
                                    onCountryChange={(country) => setFormData(prev => ({ ...prev, country }))}
                                    onCityChange={(city) => setFormData(prev => ({ ...prev, city }))}
                                />
                            </div>
                        </div>

                        <hr className="border-gray-300 my-5" />

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='col-span-2 flex items-center justify-between pb-4'>
                                <h4 className='text-xl font-semibold text-gray-800'>Gallery</h4>
                            </div>
                            <div className='col-span-2 flex flex-col gap-4 w-full'>
                                {companyImages.length > 0 && (
                                    <div className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {companyImages.map((image, index) => (
                                            <div key={index} className=" relative group">
                                                <img
                                                    src={image}
                                                    alt={`Company ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-md border border-gray-200"
                                                />
                                                <button
                                                    onClick={() => deleteCompanyImage(image)}
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
                                    id="companyImages"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => uploadCompanyImages(e.target.files)}
                                />
                                <label
                                    htmlFor="companyImages"
                                    className={`text-center py-8 border bg-[var(--accent-color)]  border-[var(--primary-color)]/80 w-38 h-38 flex flex-col gap-2 cursor-pointer items-center justify-center   rounded-md ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload className='text-[var(--primary-color)]' />
                                    <p>
                                        Upload Images
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='sticky top-0 pointer-events-none'>
                        <CompanyCard company={userData} />
                    </div>
                </div>
            </div>

            {/* Image Crop Portal */}
            <ImageCropPortal
                isOpen={cropPortalOpen}
                onClose={() => setCropPortalOpen(false)}
                imageSrc={selectedImage}
                cropShape="round"
                aspect={1}
                onCropComplete={handleCropComplete}
                requireLandscape={false}
                imageType="profile"
            />
        </div>
    )
}

export default RecruiterProfile