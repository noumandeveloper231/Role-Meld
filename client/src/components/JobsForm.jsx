import { useState, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import CustomSelect from "./CustomSelect";
import JobCard from "./JobCard";
import JoditEditor from 'jodit-react';
import SkillsSelector from './SkillsSelector'
import slugify from 'slugify'
import { Editor } from "@tinymce/tinymce-react";

const JobForm = ({ setActiveTab }) => {
  const { backendUrl, userData } = useContext(AppContext);
  const location = useLocation();
  const editJob = location.state?.editJob;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const editor = useRef(null);

  // Form State
  const [jobData, setJobData] = useState({
    title: "",
    slug: "",
    category: "",
    subCategory: "",
    jobType: "",
    skills: [],
    description: "",
    careerLevel: "",
    experience: "",
    qualifications: "",
    quantity: 1,
    gender: "Any",
    closingDays: 30,
    salaryType: "fixed",
    minSalary: "",
    maxSalary: "",
    fixedSalary: "",
    currency: "USD",
    salaryRate: "Monthly",
    jobApplyType: "Email",
    externalUrl: "",
    userEmail: "",
    location: "",
    gallery: [],
    video: "",
    responsibilities: [],
    benefits: [],
    companyProfile: userData?.profilePicture,
  });

  // Pre-populate form if editing an existing job
  useEffect(() => {
    if (editJob) {
      setJobData({
        ...editJob,
        skills: editJob.skills || [],
        responsibilities: editJob.responsibilities || [],
        benefits: editJob.benefits || [],
        gallery: editJob.gallery || [],
      });
    }
  }, [editJob]);

  const [jobs, setJobs] = useState([])
  const [isSlugAvailable, setIsSlugAvailable] = useState(true);

  const getJobs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`);
      if (data.success) {
        setJobs(data.jobs)
      } else {
        console.error(data.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getJobs()
  }, [])


  const [slugSuggestions, setSlugSuggestions] = useState([]);

  useEffect(() => {
    if (!jobData?.title || !jobData?.slug || jobs.length === 0) return;

    const exists = jobs.some((job) => job.slug === jobData.slug);

    setIsSlugAvailable(!exists);

    if (exists) {
      const base = jobData.slug;
      setSlugSuggestions(generateSlugSuggestions(base));
    } else {
      setSlugSuggestions([]);
    }
  }, [jobData.slug, jobData.title]);

  const getCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/categories`);
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleJobChange = (e) => {
    const { name, value } = e.target;

    // Auto-generate slug whenever the title changes so availability checks run
    if (name === "title") {
      const generatedSlug = slugify(value || "", { lower: true });
      setJobData((prev) => ({
        ...prev,
        title: value,
        slug: generatedSlug,
      }));
      return;
    }

    if (name === "category") {
      const selectedCategory = categories.find((cat) => cat.name === value);
      setSubCategories(selectedCategory?.subcategories || []);
      setJobData((prev) => ({
        ...prev,
        category: value,
        subCategory: "",
      }));
    } else {
      setJobData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const postJob = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!jobData.title || !jobData.category || !jobData.jobType || !jobData.description || !jobData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        ...jobData,
        companyProfile: userData.profilePicture,
        company: userData.company,
      };

      const url = editJob
        ? `${backendUrl}/api/jobs/updatejob/${editJob._id}`
        : `${backendUrl}/api/jobs/addjob`;

      const method = editJob ? 'put' : 'post';

      const { data } = await axios[method](url, {
        jobData: payload,
      });

      if (data.success) {
        toast.success(data.message);
        setJobData({
          title: "",
          slug: "",
          category: "",
          subCategory: "",
          jobType: "",
          skills: [],
          description: "",
          careerLevel: "",
          experience: "",
          qualifications: "",
          quantity: 1,
          gender: "Any",
          closingDays: 30,
          salaryType: "fixed",
          minSalary: "",
          maxSalary: "",
          fixedSalary: "",
          currency: "USD",
          salaryRate: "Monthly",
          jobApplyType: "Email",
          externalUrl: "",
          userEmail: "",
          location: "",
          gallery: [],
          video: "",
          responsibilities: [],
          benefits: []
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const saveDraft = async (e) => {
    if (e) e.preventDefault();

    const hasContent =
      jobData.title.trim() !== '' ||
      jobData.description.trim() !== '' ||
      jobData.category.trim() !== '' ||
      jobData.location.trim() !== '' ||
      jobData.skills.length > 0 ||
      jobData.fixedSalary !== '' ||
      jobData.minSalary !== '' ||
      jobData.maxSalary !== '' ||
      jobData.quantity !== '' ||
      jobData.gender !== '' ||
      jobData.closingDays !== '' ||
      jobData.salaryType !== '' ||
      jobData.currency !== '' ||
      jobData.salaryRate !== '' ||
      jobData.jobApplyType !== '' ||
      jobData.externalUrl !== '' ||
      jobData.userEmail !== '' ||
      jobData.gallery.length > 0 ||
      jobData.video !== '' ||
      jobData.responsibilities.length > 0 ||
      jobData.benefits.length > 0;

    if (!hasContent) {
      toast.error("Please fill in at least one field to save as a draft.");
      return;
    }

    try {
      const payload = {
        ...jobData,
        companyProfile: userData.profilePicture,
        company: userData.company,
      };

      const url = editJob
        ? `${backendUrl}/api/jobs/updatejob/${editJob._id}`
        : `${backendUrl}/api/jobs/addjob`;

      const method = editJob ? 'put' : 'post';

      const { data } = await axios[method](url, {
        jobData: payload,
        saveAsDraft: true,
      });

      if (data.success) {
        toast.success(data.message);
        setJobData({
          title: "",
          slug: "",
          category: "",
          subCategory: "",
          jobType: "",
          skills: [],
          description: "",
          careerLevel: "",
          experience: "",
          qualifications: "",
          quantity: 1,
          gender: "Any",
          closingDays: 30,
          salaryType: "fixed",
          minSalary: "",
          maxSalary: "",
          fixedSalary: "",
          currency: "USD",
          salaryRate: "Monthly",
          jobApplyType: "Email",
          externalUrl: "",
          userEmail: "",
          location: "",
          gallery: [],
          video: "",
          responsibilities: [],
          benefits: []
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const currencyOptions = [
    { code: "USD", name: "United States Dollar" },
    { code: "AED", name: "United Arab Emirates Dirham" },
    { code: "PKR", name: "Pakistani Rupee" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "INR", name: "Indian Rupee" },
    { code: "BDT", name: "Bangladesh Taka" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
  ];

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


  return (
    <main className="w-full p-6 bg-white rounded-lg shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{editJob ? 'Edit Job' : 'Create a job post'}</h1>
        <div className="flex gap-3">
          <button type="button" onClick={() => setActiveTab("listed-jobs")} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button type="button" onClick={saveDraft} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Save as draft</button>
          <button type="button" onClick={postJob} className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90">Post Job</button>
        </div>
      </div>

      <div className="flex gap-6">
        <form className="flex flex-col gap-8 flex-1" onSubmit={postJob}>
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Info</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleJobChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug
                </label>

                <div className="flex items-center w-full bg-[#f9f9f9] border border-gray-300 rounded-md overflow-hidden">

                  <span className="text-gray-600 bg-[#f9f9f9] px-4 py-2 whitespace-nowrap text-sm border-r border-gray-300 tracking-wider">
                    https://alfacareers.com/jobs/<b>{jobData?.category || "category"}</b>/
                  </span>

                  <input
                    type="text"
                    name="slug"
                    value={
                      jobData.slug?.toLowerCase() ||
                      slugify(jobData.title || "").toLowerCase()
                    }
                    onChange={handleJobChange}
                    className="w-full bg-white px-4 py-2 text-gray-800 outline-none"
                    placeholder="enter-slug-here"
                    required
                  />
                </div>
              </div>

              {!isSlugAvailable && slugSuggestions.length > 0 ? (
                <div className="mt-2">
                  <p className="text-red-600 text-sm mb-1">Slug not available. Try one:</p>

                  <div className="flex flex-wrap gap-2">
                    {slugSuggestions.map((s, i) => (
                      <button
                        onClick={() => handleJobChange({ target: { name: "slug", value: s } })}
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
              ) : isSlugAvailable && jobData.slug ? (
                <p className="text-green-600 text-sm mt-1">Slug is available</p>
              ) : null}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className=" block text-sm font-medium text-gray-700 mb-1">Job Category *</label>
                  <CustomSelect
                    name="category"
                    value={jobData.category}
                    onChange={handleJobChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </CustomSelect>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                  <CustomSelect
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleJobChange}
                  >
                    <option value="">Select Job Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </CustomSelect>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills *</label>
                <SkillsSelector
                  selectedSkills={jobData.skills || []}
                  onSkillsChange={(skills) => setJobData(prev => ({ ...prev, skills }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Editor
                  apiKey="dznz0nlhha6epdf1cqah52owptipjne3a23b9e67vgtdgv22"  // or your TinyMCE key
                  value={jobData.description}
                  onEditorChange={(content) =>
                    handleJobChange({
                      target: { name: "description", value: content }
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
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Details Section */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Level</label>
                <CustomSelect name="careerLevel" value={jobData.careerLevel} onChange={handleJobChange}>
                  <option value="">Select Career Level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <CustomSelect name="experience" value={jobData.experience} onChange={handleJobChange}>
                  <option value="">Select Experience</option>
                  <option value="Fresh">Fresh</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                  <option value="5 Years+">5 Years+</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <CustomSelect name="qualifications" value={jobData.qualifications} onChange={handleJobChange}>
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" name="quantity" value={jobData.quantity} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <CustomSelect name="gender" value={jobData.gender} onChange={handleJobChange}>
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Days</label>
                <input type="number" name="closingDays" value={jobData.closingDays} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" min="1" />
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Salary Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Salary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
                <CustomSelect name="salaryType" value={jobData.salaryType} onChange={handleJobChange}>
                  <option value="fixed">Fixed</option>
                  <option value="range">Range</option>
                </CustomSelect>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <CustomSelect name="currency" value={jobData.currency} onChange={handleJobChange}>
                  <option value="">Select Currency</option>
                  {
                    currencyOptions.map(curr => (
                      <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                    ))
                  }
                </CustomSelect>
              </div>

              {jobData.salaryType === 'range' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                    <input type="number" name="minSalary" value={jobData.minSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Min" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                    <input type="number" name="maxSalary" value={jobData.maxSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Max" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Salary</label>
                  <input type="number" name="fixedSalary" value={jobData.fixedSalary} onChange={handleJobChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="Amount" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                <CustomSelect name="salaryRate" value={jobData.salaryRate} onChange={handleJobChange}>
                  <option value="Hourly">Per Hour</option>
                  <option value="Monthly">Per Month</option>
                  <option value="Yearly">Per Year</option>
                </CustomSelect>
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Job Apply Type */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Job Apply Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apply Method</label>
                <CustomSelect name="jobApplyType" value={jobData.jobApplyType} onChange={handleJobChange}>
                  <option value="Email">By Email</option>
                  <option value="External">External Link</option>
                  <option value="Call">By Call</option>
                </CustomSelect>
              </div>
              {
                jobData.jobApplyType !== "Internal" &&
                <div >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {jobData.jobApplyType === 'Email' ? 'Email Address' : jobData.jobApplyType === 'Call' ? 'Phone Number' : 'External URL'}
                  </label>
                  <input
                    type={jobData.jobApplyType === 'Email' ? 'email' : jobData.jobApplyType === 'Call' ? 'tel' : 'url'}
                    name={jobData.jobApplyType === 'Email' ? 'userEmail' : jobData.jobApplyType === 'Call' ? 'userPhone' : 'externalUrl'}
                    value={jobData.jobApplyType === 'Email' ? jobData.userEmail : jobData.jobApplyType === 'Call' ? jobData.userPhone : jobData.externalUrl}
                    onChange={handleJobChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder={jobData.jobApplyType === 'Email' ? 'Enter email address' : jobData.jobApplyType === 'Call' ? 'Enter phone number' : 'https://example.com/apply'}
                  />
                </div>
              }

            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Location (Simple) */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
              <input
                type="text"
                name="location"
                value={jobData.location}
                onChange={handleJobChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                placeholder="e.g. New York, NY, USA"
                required
              />
            </div>
          </section>

          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={() => setActiveTab("listed-jobs")} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-8 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-90 font-medium">Post Job</button>
          </div>
        </form>
        <div className="w-full max-w-md">
          <JobCard e={jobData} />
        </div>
      </div>
    </main>
  );
};

export default JobForm;