import { Group, MapPin, Plus } from 'lucide-react'
import Img from './Image'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import FollowButton from './FollowButton'

const HorizontalCompanyCard = ({ company }) => {
    const { userData, followUnfollow } = useContext(AppContext);
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/company-profile/${company._id}`)}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg shadow-gray-200 transition-all cursor-pointer w-full max-w-5xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4 sm:w-auto">
                    <Img
                        src={company?.profilePicture || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=facearea&w=120&h=120&q=80"}
                        style="h-16 w-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-md font-semibold text-gray-900 whitespace-nowrap">{company?.company}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1 text-[var(--primary-color,#1dbf73)] font-medium">
                                <MapPin size={18} className="text-gray-400" />
                                {company?.country || "Not Specified"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Group size={18} className="text-gray-400" />
                                {company?.members}
                            </span>
                        </div>
                    </div>
                </div>
                <FollowButton company={company} />
            </header>

            {/* About */}
            <div dangerouslySetInnerHTML={{ __html: company?.about }} className="line-clamp-3 mt-4 text-gray-600 text-base sm:text-lg leading-relaxed" />

            {/* Footer: Tags + Jobs */}
            <div className="mt-4 flex flex-wrap justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-medium text-[var(--primary-color)]">
                        {company?.category || "Not Specified"}
                    </span>
                </div>
                <div className="text-[var(--primary-color)] font-semibold whitespace-nowrap">
                    {company?.sentJobs?.length} job{company?.sentJobs?.length > 1 && "s"} available
                </div>
            </div>
        </div>

    )
}

const VerticalCompanyCard = ({ company }) => {
    const { userData, followUnfollow } = useContext(AppContext);
    const navigate = useNavigate()
    return (
        <div
            onClick={() => navigate(`/company-profile/${company._id}`)}
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg shadow-gray-200 transition-all cursor-pointer w-full max-w-5xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-wrap items-start gap-4 sm:w-auto">
                    <div className='flex w-full items-center justify-between'>
                        <Img
                            src={company?.profilePicture || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=facearea&w=120&h=120&q=80"}
                            style="h-16 w-16 rounded-full object-cover flex-shrink-0"
                        />
                        <FollowButton company={company} />
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <h3 className="text-md font-semibold text-gray-900 whitespace-nowrap">{company?.company || "Not Specified"}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1 text-[var(--primary-color,#1dbf73)] font-medium">
                                <MapPin size={18} className="text-gray-400" />
                                {company?.country || "Not Specified"}
                            </span>
                            <span className="flex items-center gap-1">
                                <Group size={18} className="text-gray-400" />
                                {company?.members}
                            </span>
                        </div>
                    </div>
                </div>

            </header>

            {/* About */}
            <div dangerouslySetInnerHTML={{ __html: company?.about || "<p>Not Specified</>" }} className="line-clamp-3 mt-4 text-gray-600 text-base sm:text-lg leading-relaxed" />


            {/* Footer: Tags + Jobs */}
            <div className="mt-4 flex flex-col  gap-4">
                <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-medium text-[var(--primary-color)]">
                        {company?.categpry || "Not Specified"}
                    </span>
                </div>
                <div className="self-end text-[var(--primary-color)] font-semibold whitespace-nowrap">
                    {company?.sentJobs?.length} job{company?.sentJobs?.length > 1 && "s"} available
                </div>
            </div>
        </div>

    )
}

const CompanyCard = ({ company, type = "horizontal" }) => {
    if (type === "horizontal") {
        return <HorizontalCompanyCard company={company} />
    } else {
        return <VerticalCompanyCard company={company} />
    }
}

export default CompanyCard