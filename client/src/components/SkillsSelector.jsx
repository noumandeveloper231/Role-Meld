import React, { useState, useEffect } from 'react';

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

export default SkillsSelector;