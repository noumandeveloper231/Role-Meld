import React, { useContext, useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Img from "../components/Image";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import CandidateCards from "../components/CandidateCards";
import { Building, ChevronDown, LayoutGrid, List, SearchIcon, Crosshair, FolderClosed, ChevronRight } from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import { useLocation, useNavigate } from "react-router-dom";

const Candidates = () => {
    const searchParam = useLocation().search;
    const search = new URLSearchParams(searchParam);
    const category = search.get("category");
    console.log(category);
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [viewMode, setViewMode] = useState("block");
    const [sortOption, setSortOption] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [heroCity, setHeroCity] = useState("");
    const [heroCategory, setHeroCategory] = useState(category || "");

    // Filters
    const [filters, setFilters] = useState({
        city: "",
        country: "",
        state: "",
        experience: [],
        gender: [],
        qualification: [],
        skills: [],
    });

    const handleCheckbox = (category, value) => {
        setFilters((prev) => {
            const exists = prev[category].includes(value);
            return {
                ...prev,
                [category]: exists
                    ? prev[category].filter((item) => item !== value)
                    : [...prev[category], value],
            };
        });
    };

    const getCandidates = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/allusers`);
            if (data.success) {
                setCandidates(data.users);
            } else {
                setCandidates([]);
            }
        } catch {
            setCandidates([]);
        }
    }

    useEffect(() => {
        getCandidates();
    }, []);

    const baseCandidates = useMemo(
        () => (candidates.length ? candidates : []),
        [candidates]
    );

    const uniqueExtractor = (key) =>
        [...new Set(baseCandidates.map((c) => c[key]).filter(Boolean))];

    const uniqueCountries = uniqueExtractor("country");
    const uniqueCities = uniqueExtractor("city");
    const uniqueStates = uniqueExtractor("state");
    const uniqueExperience = uniqueExtractor("experience");
    const uniqueGender = uniqueExtractor("gender");
    const uniqueQualification = uniqueExtractor("qualification");
    const uniqueSkills = [
        ...new Set(baseCandidates.flatMap((c) => c.skills || [])),
    ];

    // Filtering Logic
    const filteredCandidates = useMemo(() => {
        return baseCandidates.filter((c) => {
            const fullText = `${c.name || ""} ${c.role || ""} ${c.about || ""}`.toLowerCase();
            const normalizedQuery = searchQuery.trim().toLowerCase();

            if (normalizedQuery && !fullText.includes(normalizedQuery)) return false;

            if (heroCity && c.city !== heroCity) return false;

            if (heroCategory && !(c.skills || []).includes(heroCategory)) return false;

            if (filters.city && c.city !== filters.city) return false;
            if (filters.country && c.country !== filters.country) return false;
            if (filters.state && c.state !== filters.state) return false;

            if (filters.experience.length > 0 && !filters.experience.includes(c.experience))
                return false;

            if (filters.gender.length > 0 && !filters.gender.includes(c.gender))
                return false;

            if (
                filters.qualification.length > 0 &&
                !filters.qualification.includes(c.qualification)
            )
                return false;

            if (filters.skills.length > 0) {
                const matches = c.skills.some((skill) =>
                    filters.skills.includes(skill)
                );
                if (!matches) return false;
            }

            return true;
        });
    }, [baseCandidates, filters, searchQuery, heroCity, heroCategory]);

    const sortedCandidates = useMemo(() => {
        return [...filteredCandidates].sort((a, b) =>
            sortOption === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [filteredCandidates, sortOption]);

    const handleHeroSearch = (e) => {
        e.preventDefault();
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setHeroCity("");
        setHeroCategory("");
    };

    const handleLocationSelect = (city) => {
        setHeroCity(city);
        setIsLocationDropdownOpen(false);
        setLocationSearchTerm('');
    };

    const handleLocationBlur = () => {
        setTimeout(() => setIsLocationDropdownOpen(false), 150);
    };

    const handleLocationSearchChange = (e) => {
        setLocationSearchTerm(e.target.value);
    };

    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSkillSelect = (skill) => {
        setHeroCategory(skill);
        setIsSkillDropdownOpen(false);
    };

    const handleSkillBlur = () => {
        setTimeout(() => setIsSkillDropdownOpen(false), 150);
    };

    const handleSkillSearchChange = (e) => {
        setLocationSearchTerm(e.target.value);
    };

    return (
        <div>
            <Navbar />

            <main className="bg-gray-50">
                <div className="h-80 p-10 relative flex gap-3 flex-col items-center justify-center">
                    <h1 className="relative z-1 text-4xl text-white">
                        Hire people for your business
                    </h1>
                    <Img
                        src={assets.find_jobs_banner}
                        style="absolute z-0 top-0 left-0 w-full h-full"
                    />
                    <section className="relative z-997 w-full  max-w-4xl mt-8">
                        <form
                            onSubmit={handleHeroSearch}
                            className="flex flex-col md:flex-row items-center gap-3 rounded-full bg-white shadow-xl px-4 py-3 divide-x divide-gray-200"
                        >
                            <div className="w-full flex items-center gap-3 px-2 py-1 flex-1 min-w-[200px]">
                                <SearchIcon className="text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Candidate title or keywords"
                                    className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                                />
                            </div>

                            <div className="w-full flex flex-1 relative">
                                <div className="flex items-center gap-2 px-4 py-3 w-full">
                                    <Building size={20} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={"All Cities"}
                                        value={heroCity}
                                        onChange={(e) => setHeroCity(e.target.value)}
                                        onFocus={() => setIsLocationDropdownOpen(true)}
                                        onBlur={handleLocationBlur}
                                        className="w-full text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none text-sm flex-1"
                                    />
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform cursor-pointer ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                                        onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                                    />
                                </div>

                                {/* Dropdown Menu */}
                                {isLocationDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
                                        <div className="max-h-48 overflow-y-auto py-1">
                                            {uniqueCities.length > 0 ? (
                                                uniqueCities.map((city) => (
                                                    <div
                                                        key={city}
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleLocationSelect(city)}
                                                    >
                                                        {city}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No locations found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full flex flex-1 relative">
                                <div className="flex items-center gap-2 px-4 py-3 w-full">
                                    <Building size={20} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={"All Skills"}
                                        value={heroCategory}
                                        onChange={(e) => setHeroCategory(e.target.value)}
                                        onFocus={() => setIsSkillDropdownOpen(true)}
                                        onBlur={handleSkillBlur}
                                        className="w-full text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none text-sm flex-1"
                                    />
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform cursor-pointer ${isSkillDropdownOpen ? 'rotate-180' : ''}`}
                                        onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                                    />
                                </div>

                                {/* Dropdown Menu */}
                                {isSkillDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
                                        <div className="max-h-48 overflow-y-auto py-1">
                                            {uniqueSkills.length > 0 ? (
                                                uniqueSkills.map((skill) => (
                                                    <div
                                                        key={skill}
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleSkillSelect(skill)}
                                                    >
                                                        {skill}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No locations found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 px-2 py-1">
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="text-sm text-gray-400 hover:text-gray-600 w-full"

                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-emerald-500 w-full "
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                <div className="px-4 md:hidden mt-6">
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(prev => !prev)}
                        className="text-[var(--primary-color)] underline underline-offset-4 text-lg font-semibold cursor-pointer flex items-center gap-2"
                    >
                        <span className="text-lg font-semibold">Filter</span>
                        <ChevronRight
                            size={18}
                            className={`text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {isFilterOpen && (
                    <div className="fixed inset-0 bg-black/40 z-998 md:hidden" onClick={() => setIsFilterOpen(false)} />
                )}

                <section className="px-5 md:ox-2 lg:ox-0 flex flex-col md:flex-row gap-6 md:gap-20 max-w-7xl my-10 mx-auto">
                    {/* Sidebar Filters */}
                    <div className={`border border-gray-300 md:relative md:w-[25%] w-[80%] p-6 space-y-6 rounded-2xl bg-white md:block fixed left-0 top-0 h-screen overflow-y-auto z-999 transform transition-transform duration-300 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Filter</h4>
                            <button
                                type="button"
                                className="md:hidden text-gray-500"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        {/* Location */}
                        <div className="border-t border-gray-200 py-4 space-y-4">
                            <h5 className="text-gray-400 uppercase font-semibold">
                                Location
                            </h5>

                            <CustomSelect
                                name="country"
                                value={filters.country}
                                onChange={(e) =>
                                    setFilters({ ...filters, country: e.target.value })
                                }
                            >
                                <option value="">Select Country</option>
                                {uniqueCountries.map((c) => (
                                    <option value={c} key={c}>{c}</option>
                                ))}
                            </CustomSelect>

                            <CustomSelect
                                name="state"
                                value={filters.state}
                                onChange={(e) =>
                                    setFilters({ ...filters, state: e.target.value })
                                }
                            >
                                <option value="">Select State</option>
                                {uniqueStates.map((s) => (
                                    <option value={s} key={s}>{s}</option>
                                ))}
                            </CustomSelect>

                            <CustomSelect
                                name="city"
                                value={filters.city}
                                onChange={(e) =>
                                    setFilters({ ...filters, city: e.target.value })
                                }
                            >
                                <option value="">Select City</option>
                                {uniqueCities.map((c) => (
                                    <option value={c} key={c}>{c}</option>
                                ))}
                            </CustomSelect>
                        </div>

                        {/* Skills */}
                        <div className="border-t border-gray-200 py-4 space-y-4">
                            <h5 className="text-gray-400 uppercase font-semibold">Skills</h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {uniqueSkills.map((skill) => (
                                    <label key={skill} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.skills.includes(skill)}
                                            onChange={() => handleCheckbox("skills", skill)}
                                        />
                                        {skill}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="border-t border-gray-200 py-4 space-y-2">
                            <h5 className="text-gray-400 uppercase font-semibold">
                                Experience
                            </h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {uniqueExperience.map((exp) => (
                                    <label key={exp} className="flex items-center gap-2 capitalize">
                                        <input
                                            type="checkbox"
                                            checked={filters.experience.includes(exp)}
                                            onChange={() => handleCheckbox("experience", exp)}
                                        />
                                        {exp}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Qualification */}
                        <div className="border-t border-gray-200 py-4 space-y-2">
                            <h5 className="text-gray-400 uppercase font-semibold">
                                Qualification
                            </h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2 capitalize">
                                {uniqueQualification.map((q) => (
                                    <label key={q} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.qualification.includes(q)}
                                            onChange={() => handleCheckbox("qualification", q)}
                                        />
                                        {q}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="border-t border-gray-200 py-4 space-y-2">
                            <h5 className="text-gray-400 uppercase font-semibold">Gender</h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {uniqueGender.map((g) => (
                                    <label key={g} className="flex items-center gap-2 capitalize">
                                        <input
                                            type="checkbox"
                                            checked={filters.gender.includes(g)}
                                            onChange={() => handleCheckbox("gender", g)}
                                        />
                                        {g}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Candidates */}
                    <div className="w-full md:w-[70%]">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-4">
                            <h4 className="text-lg font-medium text-gray-800">
                                {sortedCandidates.length} candidates
                            </h4>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1 bg-white">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-full ${viewMode === "grid"
                                            ? "text-[var(--primary-color)] bg-emerald-50"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        <LayoutGrid size={16} />
                                    </button>

                                    <button
                                        onClick={() => setViewMode("block")}
                                        className={`p-2 rounded-full ${viewMode === "block"
                                            ? "text-[var(--primary-color)] bg-emerald-50"
                                            : "text-gray-500"
                                            }`}
                                    >
                                        <List size={16} />
                                    </button>
                                </div>

                                <CustomSelect
                                    value={sortOption}
                                    name="sort"
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </CustomSelect>
                            </div>
                        </div>

                        {/* Cards */}
                        <div
                            className={`${viewMode === "grid"
                                ? "grid grid-cols-2 gap-6"
                                : "flex flex-col gap-6"
                                }`}
                        >
                            {sortedCandidates.map((candidate) => (
                                <div onClick={() => navigate(`/candidate-profile/${candidate._id}`)} className="w-full" key={candidate._id}>
                                    <CandidateCards candidate={candidate} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Candidates;
