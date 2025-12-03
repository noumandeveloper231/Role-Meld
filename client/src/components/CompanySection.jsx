import React, { useContext, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { MdWork } from "react-icons/md";
import CompanyCard from "./CompanyCard";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const CompanySection = () => {
    const [latestJobs, setLatestJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const {backendUrl} = useContext(AppContext)

    // const getLatestJobs = async () => {
    //     setLoading(true);
    //     try {
    //         const { data } = await axios.get(`${backendUrl}/api/jobs/getalljobs`);
    //         if (data.success) {
    //             // Sort by creation date and get the latest 20 jobs (for 5 slides of 4 jobs each)
    //             const sortedJobs = data.jobs
    //                 .filter(job => job.applicationDeadline > new Date())
    //                 .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
    //                 .slice(0, 20);
    //             setLatestJobs(sortedJobs);
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (error) {
    //         toast.error(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     getLatestJobs();
    // }, []);

    // Helper function to group jobs into slides of 4


    // Static data for 5 job cards
    
    const [companies, setCompanies] = useState([])
    const getCompanies = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/allrecruiters`);
            console.log('data', data)
            if (data.success) {
                setCompanies(data.recruiters);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getCompanies();
    }, []);
    
    const sampleCompanies = [
        {
            _id: "sample-1",
            company: "Jordan Banks",
            about: "Multidisciplinary designer with 10+ years building intuitive enterprise experiences.",
            industry: "UI/UX Design",
            members: "3",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
            city: "New York",
            country: "USA",
            state: "NY",
        },
        {
            _id: "sample-2",
            company: "Amelia Chen",
            about: "Strategist focused on crafting compelling narratives for SaaS brands.",
            city: "New York",
            country: "USA",
            state: "NY",
            industry: "Content Strategy",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
        {
            _id: "sample-3",
            company: "Mateo Alvarez",
            about: "Full-stack engineer specializing in React, Node, and cloud architectures.",
            city: "Austin",
            state: "Texas",
            country: "USA",
            industry: "Full-Stack Development",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
        {
            _id: "sample-4",
            company: "Jordan Banks",
            about: "Multidisciplinary designer with 10+ years building intuitive enterprise experiences.",
            industry: "UI/UX Design",
            members: "3",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
            city: "New York",
            country: "USA",
            state: "NY",
        },
        {
            _id: "sample-5",
            company: "Amelia Chen",
            about: "Strategist focused on crafting compelling narratives for SaaS brands.",
            city: "New York",
            country: "USA",
            state: "NY",
            industry: "Content Strategy",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
        {
            _id: "sample-6",
            company: "Mateo Alvarez",
            about: "Full-stack engineer specializing in React, Node, and cloud architectures.",
            city: "Austin",
            state: "Texas",
            country: "USA",
            industry: "Full-Stack Development",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
        {
            _id: "sample-7",
            company: "Jordan Banks",
            about: "Multidisciplinary designer with 10+ years building intuitive enterprise experiences.",
            industry: "UI/UX Design",
            members: "3",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
            city: "New York",
            country: "USA",
            state: "NY",
        },
        {
            _id: "sample-8",
            company: "Amelia Chen",
            about: "Strategist focused on crafting compelling narratives for SaaS brands.",
            city: "New York",
            country: "USA",
            state: "NY",
            industry: "Content Strategy",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
        {
            _id: "sample-9",
            company: "Mateo Alvarez",
            about: "Full-stack engineer specializing in React, Node, and cloud architectures.",
            city: "Austin",
            state: "Texas",
            country: "USA",
            industry: "Full-Stack Development",
            members: "10",
            sentJobs: ["5", "10", "15"],
            createdAt: new Date().toISOString(),
        },
    ];

    // if (loading) {
    //     return (
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //             {[1, 2, 3, 4].map(i => (
    //                 <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
    //                     <div className="flex items-start gap-4">
    //                         <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    //                         <div className="flex-1">
    //                             <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    //                             <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
    //                             <div className="flex gap-2 mb-4">
    //                                 <div className="h-6 bg-gray-200 rounded w-16"></div>
    //                                 <div className="h-6 bg-gray-200 rounded w-20"></div>
    //                             </div>
    //                             <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // }

    console.log('companies', companies)

    if (companies.length < 0) {
        return (
            <>
                <div className="flex flex-col justify-center w-full items-center mb-8">
                    <h2 className="font-semibold text-black flex items-center gap-2">
                        New Companies
                    </h2>
                </div>
                <div className="text-center py-16">
                    <div className="text-gray-400 mb-4">
                        <MdWork size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">Check back later for new opportunities.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="relative">
                <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    spaceBetween={24}
                    slidesPerView={3} // default
                    breakpoints={{
                        768: { // md
                            slidesPerView: 3, // still 1 slide per view
                        },
                    }}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next-custom',
                        prevEl: '.swiper-button-prev-custom',
                    }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination-custom',
                        bulletClass: 'swiper-pagination-bullet-custom',
                        bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                    }}
                    className="pb-16"
                >
                    {companies.map((company, index) => (
                        <SwiperSlide key={index}>
                            <CompanyCard company={company} />
                        </SwiperSlide>
                    ))}
                </Swiper>


                {/* Custom Pagination Dots */}
                <div className="swiper-pagination-custom flex justify-center gap-2 mt-6"></div>
            </div>
        </>
    );
};

export default CompanySection;
