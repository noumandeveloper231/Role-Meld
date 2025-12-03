import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import CustomSelect from "./CustomSelect";
import SearchSelect from "./SelectSearch";
import JobCard from "./JobCard";
import JoditEditor from 'jodit-react';
import SkillsInput from "./SkillsInput";

const AVAILABLE_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Material UI',
  'MongoDB', 'MySQL', 'PostgreSQL', 'Redis', 'Firebase', 'SQL Server',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Agile', 'Scrum',
  'UI/UX Design', 'Figma Design', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
  'Content Editor', 'Technical Writing', 'Product Manager', 'Communication Skills',
  'BackEnd Developer', 'FrontEnd Developer', 'Full Stack Developer', 'DevOps',
  'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning',
  'Mobile Development', 'iOS Development', 'Android Development', 'React Native', 'Flutter',
  'Testing', 'Unit Testing', 'Integration Testing', 'QA', 'Selenium', 'Jest',
  'Documentation', 'API Development', 'REST API', 'GraphQL', 'Microservices',
  'Problem Solving', 'Team Leadership', 'Project Management', 'Critical Thinking'
];

// Skills Selector Component
const SkillsSelector = ({ selectedSkills, onSkillsChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
    }
    setSearchTerm('');
  };

  const removeSkill = (skillToRemove) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const filteredSkills = AVAILABLE_SKILLS.filter(skill =>
    !selectedSkills.includes(skill) &&
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='space-y-4' ref={dropdownRef}>
      <div className='space-y-2'>
        <label className='text-lg font-semibold text-gray-800'>Select Skills</label>

        {/* Input Box with Selected Skills as Chips */}
        <div
          className='min-h-[60px] w-full p-3 border-2 border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all cursor-text bg-white'
          onClick={() => setIsDropdownOpen(true)}
        >
          <div className='flex flex-wrap gap-2 items-center'>
            {selectedSkills.map((skill, idx) => (
              <span
                key={idx}
                className='bg-[var(--accent-color)] text-[var(--primary-color)] px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-[var(--primary-color)]/20'
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkill(skill);
                  }}
                  className='hover:text-red-600 transition-colors'
                >
                  ×
                </button>
                {skill}
              </span>
            ))}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder={selectedSkills.length === 0 ? "Click to select skills..." : ""}
              className='flex-1 min-w-[200px] outline-none bg-transparent text-gray-700 placeholder-gray-400'
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className='relative'>
            <div className='absolute top-0 left-0 right-0 max-h-[300px] overflow-y-auto bg-white border-2 border-gray-200 rounded-lg shadow-md z-10'>
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    onClick={() => addSkill(skill)}
                    className='px-4 py-2 hover:bg-[var(--accent-color)] hover:text-[var(--primary-color)] cursor-pointer transition-colors text-gray-700 border-b border-gray-100 last:border-b-0'
                  >
                    {skill}
                  </div>
                ))
              ) : (
                <div className='px-4 py-3 text-gray-500 text-center'>
                  {searchTerm ? 'No skills found' : 'All skills selected'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className='text-sm text-gray-500'>
        Click on the input box to see available skills. Selected skills appear as chips inside the box.
      </p>
    </div>
  );
};

const JobForm = ({ setActiveTab }) => {
  const { backendUrl, userData } = useContext(AppContext);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const editor = useRef(null);

  // Form State
  const [jobData, setJobData] = useState({
    title: "",
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

  const [currentSkill, setCurrentSkill] = useState("");

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

      const { data } = await axios.post(`${backendUrl}/api/jobs/addjob`, {
        jobData: payload,
      });

      if (data.success) {
        toast.success(data.message);
        setJobData({
          title: "",
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

  return (
    <main className="w-full p-6 bg-white rounded-lg shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create a job post</h1>
        <div className="flex gap-3">
          <button type="button" onClick={() => setActiveTab("listed-jobs")} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Save as draft</button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={jobData.title}
                  onChange={handleJobChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent outline-none"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Category *</label>
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
                <JoditEditor
                  ref={editor}
                  value={jobData.description}
                  config={{
                    readonly: false,
                    height: 300,
                    uploader: { insertImageAsBase64URI: true },
                    toolbarSticky: false,
                  }}
                  onBlur={(newContent) => setJobData(prev => ({ ...prev, description: newContent }))}
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
                  <option value="Internal">Internal</option>
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