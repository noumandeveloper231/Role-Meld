import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useLocation, useNavigate } from 'react-router-dom';

// Lucide React Icons for consistency (replacing mixed imports)
import { Heart, MapPin, Crown } from 'lucide-react';
import Img from './Image';
import Currency from './CurrencyCovertor';

const JobCard = ({ e, className }) => {
    const { toggleSaveJob, savedJobs } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation()

    // Check if job is saved or applied
    const isSaved = [...savedJobs].includes(e?._id);
    // --- Main Render ---

    return (
        <li
            className={`
    p-6 cursor-pointer border border-gray-200 bg-white rounded-2xl hover:shadow-lg shadow-black/5 
    transition-all duration-300 flex flex-col justify-between gap-4 
    min-w-full sm:min-w-[250px] md:min-w-[300px] 
  `}
            onClick={() => {
                if (location.pathname !== '/find-jobs') navigate(`/jobs/${e.category}/${e.slug}`)
            }}
        >
            <div className='flex flex-col gap-4'>
                {/* 1. Header: Company Info and Save Button */}
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0'>
                    <div className='flex items-center gap-4'>
                        {e?.companyProfile ? (
                            <Img
                                style='w-14 h-14 rounded-full object-cover border border-gray-100 flex-shrink-0'
                                src={e?.companyProfile}
                            />
                        ) : (
                            <div
                                className='w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center bg-gray-100 text-[var(--primary-color)] font-bold text-xl flex-shrink-0'
                                onClick={(ev) => {
                                    ev.stopPropagation()
                                    navigate('/company-profile/' + e?.postedBy)
                                }}
                            >
                                {e?.company?.slice(0, 1)?.toUpperCase()}
                            </div>
                        )}

                        {/* Company Name & Category */}
                        <div className='flex flex-col'>
                            <h4 className='capitalize font-semibold text-lg text-gray-800 line-clamp-1'>
                                {e?.title || '...'}
                            </h4>
                            <span className='text-md text-gray-500 line-clamp-1'>
                                by <span className='font-semibold'>{e?.company || '...'}</span> in{' '}
                                <span className='font-semibold text-[var(--primary-color)]'>{e?.category || '...'}</span>
                            </span>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        {/* Save Button */}
                        {e?.sponsored && (
                            <Crown className='text-yellow-500' />
                        )}
                        <button
                            onClick={(event) => {
                                event.stopPropagation()
                                toggleSaveJob(e?._id)
                            }}
                            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0
          ${isSaved
                                    ? 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/90 shadow-md'
                                    : 'text-gray-600 hover:text-[var(--primary-color)] hover:bg-gray-200'
                                }`}
                            aria-label={isSaved ? 'Unsave job' : 'Save job'}
                        // disabled={!isLoggedIn}
                        >
                            {isSaved ? <Heart size={24} fill='white' /> : <Heart size={24} />}
                        </button>
                    </div>
                </div>

                {/* 2. Job Info */}
                <div className='flex flex-col gap-2 mt-2'>
                    <div className='flex flex-wrap items-center gap-2 font-semibold text-xs'>
                        <button onClick={(event) => {
                            event.stopPropagation()
                            navigate(`${'/find-jobs?jobtype=' + e?.jobType}`)
                        }} className='capitalize cursor-pointer flex px-3 py-1 rounded-full bg-[#e9e0f2] text-[#6c4cbe]'>
                            {e?.jobType?.replace('-', ' ') || 'N/A'}
                        </button>
                        <button onClick={(event) => {
                            event.stopPropagation()
                            navigate(`${'/find-jobs?location=' + e?.location}`)
                        }} className='capitalize cursor-pointer flex gap-1 items-center px-3 py-1 rounded-full bg-[var(--accent-color)] text-[var(--primary-color)]'>
                            <MapPin size={14} /> {e?.location || 'Remote'}
                        </button>
                        <button className='capitalize cursor-pointer w-max px-3 py-1 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]'>
                            {e?.salaryType === 'fixed' ? (
                                <Currency amount={e?.fixedSalary} from={e?.currency} />
                            ) : (
                                <>
                                    <Currency amount={e?.minSalary} from={e?.currency} /> -{' '}
                                    <Currency amount={e?.maxSalary} from={e?.currency} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 3. Footer */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-3 gap-2 sm:gap-0'>
                    <span>
                        {(() => {
                            const d = new Date(e?.applicationDeadline)
                            const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24))
                            return diff > 0 ? (
                                <div>
                                    <span className='font-semibold text-[var(--primary-color)]'>{diff} </span> days left to apply
                                </div>
                            ) : (
                                'Deadline passed'
                            )
                        })()}
                    </span>
                </div>
            </div>
        </li>
    );
}

export default JobCard;