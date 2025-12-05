import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

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
]; // Will be populated from API

// Skills Selector Component
const SkillsSelector = ({ selectedSkills, onSkillsChange }) => {
    const { backendUrl } = useContext(AppContext);
    const [availableSkills, setAvailableSkills] = useState(AVAILABLE_SKILLS);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = React.useRef(null);

    // Fetch skills list
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/skills`);
                if (data.success) {
                    setAvailableSkills(data.skills.map(s => s.name));
                }
            } catch {
                /* ignore error, fallback to default */
            }
        };
        fetchSkills();
    }, [backendUrl]);

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

    const filteredSkills = availableSkills.filter(skill =>
        !selectedSkills.includes(skill) &&
        skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4" ref={dropdownRef}>
            <div className="space-y-2">

                {/* Input Box (Exact same size as CustomSelect) */}
                <div
                    className="
        w-full 
        px-6 
        py-2.5 
        border border-gray-300 
        rounded-md 
        cursor-text 
        bg-white 
        flex items-center flex-wrap 
        gap-2
        text-sm
      "
                    onClick={() => setIsDropdownOpen(true)}
                >
                    {/* Skill Chips */}
                    {selectedSkills.map((skill, idx) => (
                        <span
                            key={idx}
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
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeSkill(skill);
                                }}
                                className="hover:text-red-600 transition-colors"
                            >
                                ×
                            </button>
                            {skill}
                        </span>
                    ))}

                    {/* Search Input */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={
                            selectedSkills.length === 0 ? `Select Skills` : ""
                        }
                        className="
          flex-1 
          min-w-[120px] 
          outline-none 
          bg-transparent 
          text-gray-700 
          placeholder-gray-400 
          text-sm
        "
                    />
                </div>

                {/* Dropdown Menu (Pixel Perfect Same Size) */}
                {isDropdownOpen && (
                    <div className="relative">
                        <div
                            className="
            absolute 
            z-10 
            mt-1 
            w-full 
            bg-white 
            border border-gray-200 
            rounded-md 
            shadow-lg 
            max-h-60 
            overflow-y-auto
          "
                        >
                            {filteredSkills.length > 0 ? (
                                filteredSkills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => addSkill(skill)}
                                        className="
                  px-4 
                  py-2.5 
                  cursor-pointer 
                  text-sm 
                  text-gray-700 
                  hover:bg-[var(--accent-color)] 
                  hover:text-[var(--primary-color)] 
                  border-b border-gray-100 
                  last:border-b-0
                "
                                    >
                                        {skill}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                                    {searchTerm ? "No skills found" : "All skills selected"}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500">
                Click on the input box to see available skills.
            </p>
        </div>

    );
};

export default SkillsSelector;