import React, { useContext, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Img from "../components/Image";
import assets from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import CompanyCard from "../components/CompanyCard";
import { Building, ChevronDown, LayoutGrid, List, SearchIcon } from "lucide-react";
import CustomSelect from "../components/CustomSelect";

const Companies = () => {
    const { backendUrl } = useContext(AppContext);

    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [viewMode, setViewMode] = useState("block");
    const [sortOption, setSortOption] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [heroCity, setHeroCity] = useState("");
    const [heroIndustry, setHeroIndustry] = useState("");

    // Filters
    const [filters, setFilters] = useState({
        city: "",
        country: "",
        state: "",
        industry: [],
        members: [],
    });

    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

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
    ];

    const baseCompanies = useMemo(
        () => (companies.length ? companies : sampleCompanies),
        [companies]
    );

    const uniqueExtractor = (key) =>
        [...new Set(baseCompanies.map((c) => c[key]).filter(Boolean))];

    const uniqueCountries = uniqueExtractor("country");
    const uniqueCities = uniqueExtractor("city");
    const uniqueStates = uniqueExtractor("state");
    const uniqueIndustry = uniqueExtractor("industry");
    const uniqueMembers = uniqueExtractor("members");

    // Filtering Logic
    const filteredCompanies = useMemo(() => {
        return baseCompanies.filter((c) => {
            const fullText = `${c.company || ""} ${c.about || ""}`.toLowerCase();
            const normalizedQuery = searchQuery.trim().toLowerCase();

            if (normalizedQuery && !fullText.includes(normalizedQuery)) return false;

            if (heroCity && c.city !== heroCity) return false;

            if (heroIndustry) {
                const industryValue = c.industry || "";
                const matchesIndustry = Array.isArray(industryValue)
                    ? industryValue.includes(heroIndustry)
                    : industryValue === heroIndustry;
                if (!matchesIndustry) return false;
            }

            if (filters.city && c.city !== filters.city) return false;
            if (filters.country && c.country !== filters.country) return false;
            if (filters.state && c.state !== filters.state) return false;

            if (filters.industry.length > 0) {
                const industryValue = c.industry || "";
                const matchesIndustry = Array.isArray(industryValue)
                    ? industryValue.some((value) => filters.industry.includes(value))
                    : filters.industry.includes(industryValue);
                if (!matchesIndustry) return false;
            }

            if (filters.members.length > 0) {
                const membersValue = c.members || "";
                const matchesMembers = Array.isArray(membersValue)
                    ? membersValue.some((value) => filters.members.includes(value))
                    : filters.members.includes(membersValue);
                if (!matchesMembers) return false;
            }

            return true;
        });
    }, [baseCompanies, filters, searchQuery, heroCity, heroIndustry]);

    const sortedCompanies = useMemo(() => {
        return [...filteredCompanies].sort((a, b) =>
            sortOption === "newest"
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
    }, [filteredCompanies, sortOption]);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setHeroCity("");
        setHeroIndustry("");
    };

    const handleLocationSelect = (city) => {
        setHeroCity(city);
        setIsLocationDropdownOpen(false);
    };

    const handleIndustrySelect = (industry) => {
        setHeroIndustry(industry);
        setIsIndustryDropdownOpen(false);
    };

    const getCompanies = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/user/allrecruiters`);
            if (data.success) {
                setCompanies(data.recruiters || []);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCompanies();
    }, []);

    return (
        <div>
            <Navbar />

            <main className="bg-gray-50">
                <div className="h-80 relative flex gap-3 flex-col items-center justify-center">
                    <h1 className="relative z-1 text-4xl text-white">
                        Companies Hiring Internationally
                    </h1>
                    <Img
                        src={assets.find_jobs_banner}
                        style="absolute z-0 top-0 left-0 w-full h-full"
                    />
                    <section className="relative z-99 w-full max-w-4xl mt-8">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-wrap items-center gap-3 rounded-full bg-white shadow-xl px-4 py-3 divide-x divide-gray-200"
                        >
                            <div className="flex items-center gap-3 px-2 py-1 flex-1 min-w-[200px]">
                                <SearchIcon className="text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Company name or keywords"
                                    className="!p-0 !border-none"
                                />
                            </div>

                            <div className="flex flex-1 relative">
                                <button
                                    type="button"
                                    onClick={() => setIsLocationDropdownOpen((prev) => !prev)}
                                    className="flex items-center gap-2 px-4 py-3 w-full text-left"
                                >
                                    <Building size={20} className="text-gray-400" />
                                    <span className="flex-1 text-sm text-gray-700">
                                        {heroCity || "All Cities"}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isLocationDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
                                        <div className="max-h-48 overflow-y-auto py-1">
                                            {uniqueCities.length > 0 ? (
                                                <div>
                                                    <div
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleLocationSelect("")}
                                                    >
                                                        All Cities
                                                    </div>
                                                    {uniqueCities.map((city) => (
                                                        <div
                                                            key={city}
                                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => handleLocationSelect(city)}
                                                        >
                                                            {city}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No locations found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 relative">
                                <button
                                    type="button"
                                    onClick={() => setIsIndustryDropdownOpen((prev) => !prev)}
                                    className="flex items-center gap-2 px-4 py-3 w-full text-left"
                                >
                                    <Building size={20} className="text-gray-400" />
                                    <span className="flex-1 text-sm text-gray-700">
                                        {heroIndustry || "All Industries"}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-400 transition-transform ${isIndustryDropdownOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {isIndustryDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
                                        <div className="max-h-48 overflow-y-auto py-1">
                                            {uniqueIndustry.length > 0 ? (
                                                <div>
                                                    <div
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleIndustrySelect("")}
                                                    >
                                                        All Industries
                                                    </div>
                                                    {uniqueIndustry.map((industry) => (
                                                        <div
                                                            key={industry}
                                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => handleIndustrySelect(industry)}
                                                        >
                                                            {industry}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">
                                                    No industries found
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
                                    className="text-sm text-gray-400 hover:text-gray-600"
                                >
                                    Clear
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-emerald-500"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                <section className="flex gap-20 max-w-7xl py-20 mx-auto">
                    {/* Sidebar Filters */}
                    <div className="border border-gray-300 w-[25%] p-6 space-y-6 rounded-2xl bg-white">
                        <h4 className="text-lg font-semibold">Filter</h4>

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

                        {/* Industries */}
                        <div className="border-t border-gray-200 py-4 space-y-4">
                            <h5 className="text-gray-400 uppercase font-semibold">Industries</h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {uniqueIndustry.map((industry) => (
                                    <label key={industry} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.industry.includes(industry)}
                                            onChange={() => handleCheckbox("industry", industry)}
                                        />
                                        {industry}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 py-4 space-y-4">
                            <h5 className="text-gray-400 uppercase font-semibold">Members</h5>

                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {uniqueMembers.map((member) => (
                                    <label key={member} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={filters.members.includes(member)}
                                            onChange={() => handleCheckbox("members", member)}
                                        />
                                        {member}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Companies */}
                    <div className="w-[70%]">
                        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-4">
                            <h4 className="text-lg font-medium text-gray-800">
                                {sortedCompanies.length} companies
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
                            {sortedCompanies.map((company) => (
                                <CompanyCard company={company} key={company._id} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Companies;
