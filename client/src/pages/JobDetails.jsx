import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
// React Icons
import { IoHome, IoWarning } from "react-icons/io5";
import { toast } from 'react-toastify';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import Img from '../components/Image';
import { ExternalLink, Calendar, Star, DollarSignIcon, Mail, MapPin, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Pencil, User, Briefcase } from "lucide-react";
import {
    Phone,
    Globe,
    GraduationCap,
    Link as LinkIcon,
    FileBadge,
} from "lucide-react";
import Currency from '../components/CurrencyCovertor';
import Navbar from '../components/Navbar';
import LoginPortal from '../portals/LoginPortal';
import ApplyJobPortal from '../portals/ApplyJobPortal';
import { FaLevelUpAlt } from 'react-icons/fa';


const JobDetails = () => {
    // Auto Scroll to top
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    const { backendUrl, userData, isLoggedIn } = useContext(AppContext);
    const [loginReminder, setLoginReminder] = useState(false)
    const [jobData, setJobData] = useState(null);
    const [jobLoading, setJobLoading] = useState(false)
    const [companyJobsLoading, setCompanyJobsLoading] = useState(false)
    const [tab, setTab] = useState('Overview');

    const navigate = useNavigate();
    const { slug } = useParams();

    console.log('slug', slug);

    const getJob = async () => {
        setJobLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getjobbyslug/${slug}`);
            if (data.success) {
                setJobData(data.job);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setJobLoading(false)
        }
    }
    console.log(jobData)

    const [applyJobModel, setApplyJobModel] = useState(false);

    const [companyJobs, setCompanyJobs] = useState([])
    // Get More Related Jobs;
    const getCompanyJobs = async () => {
        setCompanyJobsLoading(true)
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs/getcompanyjobs/${jobData?.postedBy}`);
            if (data.success) {
                setCompanyJobs(data.companyJobs);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setCompanyJobsLoading(false)
        }
    }

    useEffect(() => {
        getJob();
        getCompanyJobs();
    }, [slug])

    if (companyJobsLoading || jobLoading) {
        return <Loading />
    }

    return (
        <div className='bg-[#f9f9f9]'>
            <div className="w-full border-b border-gray-200 shadow-sm">
                <Navbar className={"max-w-6x bg-white mx-auto"} />
            </div>
            <main className=' max-w-6xl mx-auto p-4 min-h-screen'>
                {/* Breadcrumb */}
                <nav className='mb-6'>
                    <div className='flex items-center text-sm text-gray-600'>
                        <NavLink to={'/'} className='cursor-pointer flex items-center gap-1'>
                            Home
                        </NavLink>
                        <span className='mx-2'>/</span>
                        <NavLink to={'/find-jobs'} className='cursor-pointer flex items-center gap-1'>
                            Jobs
                        </NavLink>
                        <span className='mx-2'>/</span>
                        <NavLink to={'/find-jobs?category=' + jobData?.category  } className='cursor-pointer flex items-center gap-1'>
                            {jobData?.category}
                        </NavLink>
                        <span className='mx-2'>/</span>
                        <NavLink to={'/jobs'} className='cursor-pointer flex items-center gap-1'>
                            {jobData?.title}
                        </NavLink>
                    </div>
                </nav>

                {/* Main Content */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Left Content */}
                    <div className='col-span-2'>
                        <div className=' space-y-6 bg-white rounded-3xl border border-gray-200 p-6'>
                            {/* Job Header */}
                            <div className='p-4'>
                                <div className='flex flex-col items-start gap-4'>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-16 h-16 rounded-full'>
                                            {jobData?.companyProfile ? (
                                                <Img
                                                    style="w-16 h-16 rounded-full object-cover border border-gray-100 flex-shrink-0"
                                                    src={jobData?.companyProfile}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 text-[var(--primary-color)] font-bold text-xl flex-shrink-0"
                                                >
                                                    {jobData?.company?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex-1'>
                                            <h4 className='text-2xl text-gray-900 mb-1'>{jobData?.title}</h4>
                                            <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2'>
                                                <span className='font-medium'>by <b>{jobData?.company}</b></span>
                                                {jobData?.category && (
                                                    <>
                                                        <span>in</span>
                                                        <span className='text-green-700 font-medium'>{jobData?.category}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-between w-full'>
                                        <div className='flex flex-wrap items-center gap-3 text-xs text-gray-600'>
                                            {jobData?.location && (
                                                <span className='px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium'>
                                                    {jobData?.location}
                                                </span>
                                            )}
                                            {jobData?.locationType && (
                                                <span className='px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium'>
                                                    {jobData?.locationType.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-end gap-2'>

                                        {jobData?.applicationDeadline && (
                                            <span className='text-xs text-gray-500'>
                                                Closing on {new Date(jobData?.applicationDeadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-300' />

                            {/* Job Role Insights */}
                            <div className=' p-4'>
                                <h2 className='text-lg font-semibold text-gray-900 mb-4'>Job role insights</h2>
                                <div className='grid md:grid-cols-3 gap-4'>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Calendar size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Date posted</div>
                                            <div className='text-sm text-gray-500'>
                                                {new Date(jobData?.createdAt).toLocaleDateString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Calendar size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Closing date</div>
                                            <div className='text-sm text-gray-500'>
                                                {jobData?.applicationDeadline ?
                                                    new Date(jobData?.applicationDeadline).toLocaleDateString('en-US', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : 'Not specified'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <MapPin size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Hiring location</div>
                                            <div className='text-sm text-gray-500'>{jobData?.location || 'Remote'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <GraduationCap size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Experience</div>
                                            <div className='text-sm text-gray-500'>{jobData?.experience || 'Bachelor Degree'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Star size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Qualification</div>
                                            <div className='text-sm text-gray-500'>{jobData?.qualification || 'Bachelor Degree'}</div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <DollarSignIcon size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Salary</div>
                                            <div className='text-sm text-gray-500'>
                                                {jobData?.salaryType === "fixed" ? <span>
                                                    <Currency amount={jobData?.fixedSalary} from={jobData?.currency} />
                                                </span> : <span>
                                                    <Currency amount={jobData?.minSalary} from={jobData?.currency} /> - <Currency amount={jobData?.maxSalary} from={jobData?.currency} /></span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <Users size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Quantity</div>
                                            <div className='text-sm text-gray-500'>
                                                {jobData?.quantity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='w-10 h-10 bg-[var(--accent-color)] rounded-full flex items-center justify-center'>
                                            <FaLevelUpAlt size={24} className='text-[var(--primary-color)]' />
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-sm font-semibold text-black'>Career Level</div>
                                            <div className='text-sm text-gray-500'>
                                                {jobData?.careerLevel} Level
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className='border-gray-300' />

                            {/* Description & Requirements */}
                            <div className='p-4 space-y-6'>
                                <div>
                                    <h4 className='text-2xl font-medium text-gray-900 mb-4'>Description</h4>
                                    <div className='job-description' dangerouslySetInnerHTML={{ __html: jobData?.description }} />
                                </div>
                            </div>

                            <hr className='border-gray-300' />
                            {/* Skills */}
                            {Array.isArray(jobData?.skills) && jobData?.skills.length > 0 && (
                                <div className='p-4'>
                                    <h2 className='text-lg font-medium text-gray-900 mb-3'>Skills</h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {jobData?.skills.map((skill, idx) => (
                                            <span key={idx} className='px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium'>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='bg-[#ecf2f0] p-6 rounded-2xl border border-gray-300 mb-6 justify-between flex items-center mt-10'>
                            <div>
                                <h4 className='text-2xl font-medium text-gray-900 mb-4'>
                                    Interested in this job?
                                </h4>
                                <div className='text-sm text-gray-600 mb-2'>
                                    {Math.ceil((new Date(jobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                        ? `${Math.ceil((new Date(jobData.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left`
                                        : 'Deadline passed'}
                                </div>
                            </div>

                            <button
                                disabled={userData?.appliedJobs?.includes(id)}
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        setLoginReminder(true);
                                    } else {
                                        setApplyJobModel(true);
                                    }
                                }}
                                className={`primary-btn ${userData?.appliedJobs?.includes(id) && "bg-gray-400 cursor-not-allowed"}`}
                            >
                                {userData?.appliedJobs?.includes(id) ? "Already Applied" : "Apply now"}
                            </button>
                        </div>

                        <div className=' rounded-2xl p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-medium text-gray-900'>Similar jobs</h2>
                                <Link to="/jobs" className='text-[var(--primary-color)] hover:underline'>
                                    View all jobs
                                </Link>
                            </div>

                            {companyJobs?.length > 0 ?
                                companyJobs?.map(job => (
                                    <JobCard e={job} />
                                )) : (
                                    <div className='text-center py-8'>
                                        <div className='text-gray-400 mb-2'>
                                            <Briefcase size={48} className='mx-auto' />
                                        </div>
                                        <h3 className='font-semibold text-gray-600 mb-1'>No similar jobs found</h3>
                                        <p className='text-gray-500 text-sm'>
                                            No other jobs available from {jobData?.company}
                                        </p>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className='lg:col-span-1 w-full'>
                        <div className='w-full sticky top-4'>
                            {/* Apply Section */}
                            <div className='bg-[#ecf2f0] p-6 rounded-2xl border border-gray-300 mb-6 flex flex-col items-center'>
                                <h4 className='text-2xl font-medium text-gray-900 mb-4'>
                                    Interested in this job?
                                </h4>
                                <div className='text-sm text-gray-600 mb-2'>
                                    {Math.ceil((new Date(jobData?.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                        ? `${Math.ceil((new Date(jobData.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24))} day(s) left`
                                        : 'Deadline passed'}
                                </div>
                                <button
                                    disabled={userData?.appliedJobs?.includes(id)}
                                    onClick={() => {
                                        if (!isLoggedIn) {
                                            setLoginReminder(true);
                                        } else {
                                            setApplyJobModel(true);
                                        }
                                    }}
                                    className={`primary-btn w-full ${userData?.appliedJobs?.includes(id) && "bg-gray-400 cursor-not-allowed"}`}
                                >
                                    {userData?.appliedJobs?.includes(id) ? "Already Applied" : "Apply now"}
                                </button>
                            </div>

                            {/* Company Info */}
                            <div className='p-6 bg-white  border border-gray-300 rounded-2xl'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <Img src={jobData?.companyProfile} style='w-12 h-12 rounded-full object-cover' />
                                    <div>
                                        <h4 className='font-medium text-gray-900'>{jobData?.company}</h4>
                                        <Link to={`/company-profile/${jobData?.postedBy?.authId}`} className='text-[var(--primary-color)] font-medium text-md'>
                                            View Company Profile
                                        </Link>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className='flex mb-4 gap-2'>
                                    <button onClick={() => setTab('Overview')} className={`px-4 py-2 text-lg font-medium  ${tab === 'Overview' ? 'border-b-2 border-b-[var(--primary-color)]' : ''}`}>
                                        Overview
                                    </button>
                                    <button onClick={() => setTab('Jobs')} className={`px-4 py-2 text-lg font-medium ${tab === 'Jobs' ? 'border-b-2 border-b-[var(--primary-color)]' : ''}`}>
                                        Jobs <span className='rounded-lg text-[var(--primary-color)] bg-[var(--accent-color)] py-1 px-2 text-sm'>{companyJobs?.length}</span>
                                    </button>
                                </div>

                                {/* Company Details */}
                                <div className='space-y-4'>
                                    {tab === 'Overview' ?
                                        <>
                                            <div>
                                                <p className='text-gray-500 font-medium'>{jobData?.postedBy?.about || " Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officia tempora earum eaque? Repellat quia maxime voluptates voluptatem, delectus iusto fugit voluptas itaque id?"}</p>
                                            </div>

                                            <div>
                                                <div className='text-black'>Category</div>
                                                <div className='font-medium text-sm mt-1 text-[var(--primary-color)]'>{jobData?.postedBy?.category || "Tech Startup"}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Company size</div>
                                                <div className='font-medium text-sm mt-1 '>{jobData?.postedBy?.members || '1'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Founded in</div>
                                                <div className='font-medium text-sm mt-1 '>
                                                    {jobData?.postedBy?.foundedIn}
                                                </div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Location</div>
                                                <div className='font-medium text-sm mt-1 '>{jobData?.postedBy?.city || 'Remote'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Phone</div>
                                                <div className='font-medium text-sm mt-1'>{jobData?.postedBy?.contactNumber || '+1234567890'}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Email</div>
                                                <div className='font-medium text-sm mt-1'>{jobData?.postedBy?.email || "Not Specified"}</div>
                                            </div>

                                            <div>
                                                <div className='text-black'>Website</div>
                                                <a href={jobData?.postedBy?.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className='font-medium text-[var(--primary-color)] hover:underline flex items-center gap-1'>
                                                    Visit {jobData?.postedBy?.website}
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                            <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                onClick={() => window.location.href = `mailto:${jobData?.postedBy?.email}`}
                                            >
                                                <Mail size={16} />
                                                Visit {jobData?.postedBy?.website}
                                            </button>

                                            <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                onClick={() => window.location.href = `mailto:${jobData?.postedBy?.email}`}
                                            >
                                                <Mail size={16} />
                                                Send message
                                            </button>
                                        </>
                                        :
                                        <div className='px-2'>
                                            {companyJobs.map(companyJob => (
                                                <div className='flex flex-col gap-2 py-4 border-b border-gray-300'>
                                                    <h4 className='text-lg font-semibold'>
                                                        {companyJob.title}
                                                    </h4>
                                                    <p className='text-md font-medium text-[var(--primary-color)]'>
                                                        {companyJob.category}
                                                    </p>
                                                </div>
                                            ))}
                                            <button className='secondary-btn flex items-center gap-2 w-full mt-4'
                                                onClick={() => navigate('/find-jobs')}
                                            >
                                                View All Jobs
                                            </button>
                                        </div>
                                    }
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <LoginPortal loginReminder={loginReminder} setLoginReminder={setLoginReminder} />

                <ApplyJobPortal jobData={jobData} applyJobModel={applyJobModel} setApplyJobModel={setApplyJobModel} id={jobData?._id} />
            </main>
        </div>

    )
}

export default JobDetails