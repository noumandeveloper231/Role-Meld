import Navbar from '../components/Navbar'
import Img from '../components/Image'
import { DollarSign, File, MapPin, Plus } from 'lucide-react'
import { FaPaperPlane } from 'react-icons/fa'

const CandidateProfile = () => {
    const skills = [
        "Communication Skills",
        "Content Editor",
        "Figma Design",
        "Product Manager",
        "Technical Writing",
        "UI/UX Design"
    ];
    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='p-8 bg-gray-50 flex-1'>
                <div className='max-w-7xl mx-auto'>
                    {/* Navigation Link */}
                    <div className='mb-4 text-gray-400'>
                        Home {" > "} Candidates {" > "} Designer {" > "} Candidate
                    </div>
                    <section className='flex gap-8'>
                        <div className='w-[60%]'>
                            <div className=' bg-white rounded-2xl p-8'>
                                {/* Top Section: Profile Info */}
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
                                        {/* Replace with an actual image component or use an SVG/icon */}
                                        <Img src={"https://picsum"} />
                                    </div>
                                    <div className="flex-grow">
                                        <h2 className="text-2xl font-semibold text-gray-800">Candidate</h2>

                                        {/* Details Row */}
                                        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                                            {/* Role */}
                                            <span className="text-[var(--primary-color)] font-medium">UI/UX Designer</span>

                                            {/* Separator Dot/Circle (using text-xs for a small dot) */}
                                            <span className="text-xs">•</span>

                                            {/* Location */}
                                            <div className="flex items-center space-x-1">
                                                <MapPin />
                                                <span>Chicago</span>
                                            </div>

                                            {/* Separator Dot/Circle */}
                                            <span className="text-xs">•</span>

                                            {/* Rate */}
                                            <div className="flex items-center space-x-1">
                                                <DollarSign />
                                                <span>$30/day</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: Actions */}
                                <div className="flex space-x-3 mt-8">

                                    {/* Follow Button */}
                                    <button  className="secondary-btn flex items-center gap-2">
                                        <Plus />
                                        <span>Follow</span>
                                    </button>

                                    {/* Save to PDF Button */}
                                    <button className="secondary-btn flex items-center gap-2">
                                        <File size={20} />
                                        <span>Save to PDF</span>
                                    </button>

                                    {/* Invite Button (using a placeholder icon for the "sprout" or "invite" icon) */}
                                    <button className="secondary-btn flex items-center gap-2">
                                        <span className="text-lg mr-1">🌱</span>
                                        <span>Invite</span>
                                    </button>

                                    {/* Message Button (Solid Green) */}
                                    <button className="primary-btn flex items-center gap-2">
                                        {/* Paper plane icon - using a placeholder */}
                                        <FaPaperPlane />
                                        <span>Message</span>
                                    </button>

                                </div>
                                <hr className='border-gray-200 my-8' />

                                <div>
                                    <h2 className='mb-3 font-semibold'>
                                        About Me
                                    </h2>
                                    <p>
                                        I’m a Creative Director and Designer based in New York, and have spent the last thirteen years helping to bring brands to life through strategic design.
                                        I don’t like fluff or clutter; I aim to make things that resonate with people using an executional style which is honest and direct. In a digital context that means working to overcome the default distance, half-life, and impersonal nature of interactions, in order to create things that are able to sit comfortably in their digital skin whilst still being able to connect deeply with their audience. The result is something that often leans minimal in appearance, but is filled with nuance and care in all the right places.
                                    </p>
                                </div>
                            </div>
                            <div className="p-8 bg-white rounded-2xl mt-10">

                                {/* Title */}
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Skills
                                </h2>

                                {/* Skills Tags Container */}
                                {/* We use flex-wrap to allow the tags to wrap to the next line */}
                                <div className="flex flex-wrap gap-3">
                                    {skills.map((skill, index) => (
                                        // Individual Skill Tag
                                        <span
                                            key={index}
                                            className="
                                            px-4 py-2 
                                            text-sm font-medium 
                                            text-[var(--primary-color)] 
                                            bg-[var(--accent-color)]
                                            rounded-full 
                                            whitespace-nowrap 
                                            transition duration-150
                                            hover:bg-green-100
                                            "
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='w-[30%] bg-white rounded-2xl'>

                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default CandidateProfile