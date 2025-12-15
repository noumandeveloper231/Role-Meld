import React, { useContext } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import Img from './Image'
import { Link } from 'react-router-dom'
import FollowButton from './FollowButton'

const CandidateCards = ({ candidate }) => {
    const { userData, followUnfollow } = useContext(AppContext)
    return (
        <Link to={`/candidates/${candidate.category}/${candidate.slug}`} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg shadow-gray-200 transition-all cursor-pointer max-w-5xl w-full">
            <header className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Img
                        src={candidate.profilePicture}
                        style="border border-gray-200 bg-[var(--accent-color)] h-16 w-16 rounded-full object-cover"
                    />
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-md font-semibold text-gray-900">{candidate.name}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="text-[var(--primary-color,#1dbf73)] font-medium">{candidate.category || "Not Specified"}</span>
                            <span className="flex items-center gap-1">
                                <MapPin size={16} className="text-gray-400" />
                                {candidate.city || "Not Specified"}
                            </span>
                        </div>
                    </div>
                </div>
                <FollowButton company={candidate} />
            </header>

            <p className="mt-4 text-gray-600 text-lg leading-relaxed">{candidate.about}</p>

            <div className='flex items-center gap-4 justify-between'>
                <div className="mt-4 flex flex-wrap gap-3">
                    {candidate.skills.map((skill) => (
                        <span
                            key={skill}
                            className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-medium text-[var(--primary-color)] "
                        >
                            {skill}
                        </span>
                    ))}
                </div>
                <div className="mt-5 flex items-center gap-2 justify-end">
                    <span className="text-2xl text-[var(--primary-color)] font-semibold">{candidate.offeredSalary}$/{candidate.salaryType || '  '}</span>
                </div>
            </div>
        </Link>
    )
}

export default CandidateCards