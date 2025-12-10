import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { MdComputer, MdLoop } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading';
import NotFound404 from '../components/NotFound404';
import "swiper/css";
import Navbar from '../components/Navbar';
import CustomSelect from '../components/CustomSelect';

const CategoryJobs = () => {
  // Auto Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [])
  let { cat } = useParams();

  const { backendUrl } = useContext(AppContext);

  const [categoryJobs, setCategoryJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [filteredJobType, setFilteredJobType] = useState('jobType');
  const [filteredLocationType, setFilteredLocationType] = useState('locationType');
  const [subCategory, setSubCategory] = useState('');

  const gradients = [
    "from-violet-900 to-violet-600",
    "from-indigo-900 to-indigo-600",
    "from-blue-900 to-blue-600",
    "from-cyan-900 to-cyan-600",
    "from-slate-900 to-slate-600",
    "from-emerald-900 to-emerald-600",
    "from-rose-900 to-rose-600",
  ];
  const [randomGradient, setRandomGradient] = useState("");

  const getCategoryJobs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/jobs/getcategoryjobs`, { cat });
      if (data.success) setCategoryJobs(data.approvedCategoryJobs);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/categories`);
      if (data.success) setCategories(data.categories);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    getCategoryJobs();
    getCategories();
    const newGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setRandomGradient(newGradient);
  }, [cat]);

  const filteredJobs = categoryJobs.filter((job) =>
    (filteredLocationType === "locationType" || job.locationType === filteredLocationType) &&
    (filteredJobType === "jobType" || job.jobType === filteredJobType) &&
    (subCategory === '' || job.subCategory === subCategory)
  );

  if (loading || categoriesLoading) return <Loading />;

  const currentCategory = categories.find(cat => cat.name === cat);

  console.log('', currentCategory);


  return (
    <div>
      <Navbar className={"max-w-6xl mx-auto"} />
      <main className='p-6 max-w-6xl mx-auto'>
        <section className={`py-12 rounded-2xl shadow-2xl bg-gradient-to-br ${randomGradient}`}>
          <h1 className="text-3xl font-bold text-center text-white flex flex-col items-center justify-center gap-2">
            <MdComputer size={60} /> {cat}
          </h1>
        </section>

        {/* Subcategories */}
        <section className="p-2 mt-4">
          <Swiper
            spaceBetween={20}
            slidesPerView={5}
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
            }}
          >
            {currentCategory?.subcategories?.map((sub, i) => (
              <SwiperSlide
                key={i}
                className="py-4 my-4 px-6 text-xl font-semibold bg-white rounded-2xl border whitespace-nowrap cursor-pointer shadow hover:shadow-lg transition"
                onClick={() => setSubCategory(sub)}
              >
                {sub}
              </SwiperSlide>
            ))}
          </Swiper>
          {subCategory && (
            <span
              onClick={() => setSubCategory('')}
              className='w-full flex items-center gap-2 cursor-pointer justify-end mt-2'
            >
              <MdLoop size={20} /> Reset
            </span>
          )}
        </section>

        {/* Breadcrumb */}
        <section className='p-2'>
          <h3 className='flex items-center gap-4 font-semibold'>
            <IoHomeOutline size={30} className='text-[var(--primary-color)]' /> / {cat} {subCategory && `/ ${subCategory}`}
          </h3>
        </section>

        {/* Filters */}
        <section className='mt-5 p-2'>
          <div className='flex items-center gap-8'>
            <h2 className='flex items-center gap-4 font-semibold'>
              <FaFilter className='text-[var(--primary-color)]' /> Filter:
            </h2>
            <div className='flex items-center gap-4'>
              <CustomSelect
                value={filteredJobType}
                name={"jobType"}
                onChange={(e) => setFilteredJobType(e.target.value)}
              >
                <option value="jobType">Job Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </CustomSelect>
              <CustomSelect
                value={filteredLocationType}
                name={"locationType"}
                onChange={(e) => setFilteredLocationType(e.target.value)}
              >
                <option value="locationType">Location Type</option>
                <option value="Remote">Remote</option>
                <option value="On Site">On Site</option>
                <option value="Hybrid">Hybrid</option>
              </CustomSelect>
            </div>
          </div>

          <div className='grid my-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredJobs.length !== 0
              ? filteredJobs.map((job, i) => <JobCard key={i} e={job} />)
              : <NotFound404 value={"No Jobs Found"} margin={"my-10"} />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CategoryJobs;
