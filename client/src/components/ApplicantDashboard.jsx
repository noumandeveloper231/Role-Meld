import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Users,
  Star,
  Calendar,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Loader,
  Phone,
  FileText,
  Tag,
  Globe,
  Home,
  Hash,
  Award,
  GraduationCap,
  Zap,
  DollarSign,
  Camera,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Folder,
  Trophy,
  TrendingUp
} from "lucide-react";
import CustomSelect from "./CustomSelect";
import Loading from "./Loading";

const ApplicantDashboard = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // page views chart state
  const [viewPeriod, setViewPeriod] = useState("7");
  const [viewsData, setViewsData] = useState([]);

  // Get profile recommendations
  const getProfileRecommendations = (user) => {
    if (!user) return [];
    const recommendations = [];

    // Basic Info
    if (!user.phone || user.phone.trim() === "") {
      recommendations.push({ field: 'phone', label: 'Add Phone Number', icon: Phone, score: 3, tab: 'basic', focusField: 'phone', bgColor: 'bg-[#b7e4cb]' });
    }
    if (!user.currentPosition || user.currentPosition.trim() === "") {
      recommendations.push({ field: 'currentPosition', label: 'Add Current Position', icon: Briefcase, score: 3, tab: 'basic', focusField: 'currentPosition', bgColor: 'bg-[#cabffd]' });
    }
    if (!user.description || user.description.trim() === "") {
      recommendations.push({ field: 'description', label: 'Add Description', icon: FileText, score: 5, tab: 'basic', focusField: 'description', bgColor: 'bg-[#ffd6a5]' });
    }
    if (!user.dob) {
      recommendations.push({ field: 'dob', label: 'Add Date of Birth', icon: Calendar, score: 3, tab: 'basic', focusField: 'dob', bgColor: 'bg-[#ffadad]' });
    }
    if (!user.category || user.category.trim() === "") {
      recommendations.push({ field: 'category', label: 'Add Job Category', icon: Tag, score: 3, tab: 'basic', focusField: 'category', bgColor: 'bg-[#caffbf]' });
    }
    if (!user.languages || user.languages.length === 0) {
      recommendations.push({ field: 'languages', label: 'Add Languages', icon: Globe, score: 3, tab: 'basic', focusField: 'languages', bgColor: 'bg-[#9bf6ff]' });
    }

    // Location
    if (!user.country || user.country.trim() === "") {
      recommendations.push({ field: 'country', label: 'Add Country', icon: MapPin, score: 3, tab: 'basic', focusField: 'country', bgColor: 'bg-[#bdb2ff]' });
    }
    if (!user.city || user.city.trim() === "") {
      recommendations.push({ field: 'city', label: 'Add City', icon: MapPin, score: 3, tab: 'basic', focusField: 'city', bgColor: 'bg-[#ffc6ff]' });
    }
    if (!user.address || user.address.trim() === "") {
      recommendations.push({ field: 'address', label: 'Add Address', icon: Home, score: 3, tab: 'basic', focusField: 'address', bgColor: 'bg-[#fdffb6]' });
    }

    // Professional
    if (!user.headline || user.headline.trim() === "") {
      recommendations.push({ field: 'headline', label: 'Add Headline', icon: Award, score: 5, tab: 'basic', focusField: 'headline', bgColor: 'bg-[#a0c4ff]' });
    }
    if (!user.qualification || user.qualification.trim() === "") {
      recommendations.push({ field: 'qualification', label: 'Add Qualification', icon: GraduationCap, score: 5, tab: 'basic', focusField: 'qualification', bgColor: 'bg-[#b7e4cb]' });
    }
    if (!user.experienceYears || user.experienceYears.trim() === "") {
      recommendations.push({ field: 'experienceYears', label: 'Add Experience Years', icon: Clock, score: 5, tab: 'basic', focusField: 'experienceYears', bgColor: 'bg-[#cabffd]' });
    }
    if (!user.skills || user.skills.length < 3) {
      recommendations.push({ field: 'skills', label: 'Add Skills (min 3)', icon: Zap, score: 5, tab: 'skills', focusField: 'skills', bgColor: 'bg-[#ffd6a5]' });
    }
    if (!user.offeredSalary || user.offeredSalary <= 0) {
      recommendations.push({ field: 'offeredSalary', label: 'Add Expected Salary', icon: DollarSign, score: 5, tab: 'basic', focusField: 'offeredSalary', bgColor: 'bg-[#ffadad]' });
    }

    // Media
    if (!user.profilePicture || user.profilePicture.trim() === "") {
      recommendations.push({ field: 'profilePicture', label: 'Add Profile Picture', icon: Camera, score: 4, tab: 'basic', focusField: 'profilePicture', bgColor: 'bg-[#caffbf]' });
    }
    if (!user.coverImage || user.coverImage.trim() === "") {
      recommendations.push({ field: 'coverImage', label: 'Add Cover Image', icon: ImageIcon, score: 3, tab: 'basic', focusField: 'coverImage', bgColor: 'bg-[#9bf6ff]' });
    }
    if (!user.resume || user.resume.trim() === "") {
      recommendations.push({ field: 'resume', label: 'Add Resume', icon: FileText, score: 4, tab: 'basic', focusField: 'resume', bgColor: 'bg-[#bdb2ff]' });
    }
    if (!user.portfolio || user.portfolio.trim() === "") {
      recommendations.push({ field: 'portfolio', label: 'Add Portfolio Link', icon: LinkIcon, score: 2, tab: 'basic', focusField: 'portfolio', bgColor: 'bg-[#ffc6ff]' });
    }
    if (!user.videoUrl || user.videoUrl.trim() === "") {
      recommendations.push({ field: 'videoUrl', label: 'Add Video Introduction', icon: Video, score: 2, tab: 'basic', focusField: 'videoUrl', bgColor: 'bg-[#fdffb6]' });
    }

    // Experience & Education
    if (!user.education || user.education.length === 0) {
      recommendations.push({ field: 'education', label: 'Add Education', icon: GraduationCap, score: 5, tab: 'education', focusField: 'education', bgColor: 'bg-[#a0c4ff]' });
    }
    if (!user.experience || user.experience.length === 0) {
      recommendations.push({ field: 'experience', label: 'Add Work Experience', icon: Briefcase, score: 5, tab: 'experience', focusField: 'experience', bgColor: 'bg-[#b7e4cb]' });
    }

    // Projects & Awards
    if (!user.projects || user.projects.length === 0) {
      recommendations.push({ field: 'projects', label: 'Add Projects', icon: Folder, score: 3, tab: 'projects', focusField: 'projects', bgColor: 'bg-[#cabffd]' });
    }
    if (!user.awards || user.awards.length === 0) {
      recommendations.push({ field: 'awards', label: 'Add Awards', icon: Trophy, score: 2, tab: 'awards', focusField: 'awards', bgColor: 'bg-[#ffd6a5]' });
    }

    // Social Links (recommend if less than 2)
    let socialCount = 0;
    if (user.linkedin && user.linkedin.trim() !== "") socialCount++;
    if (user.twitter && user.twitter.trim() !== "") socialCount++;
    if (user.facebook && user.facebook.trim() !== "") socialCount++;
    if (user.instagram && user.instagram.trim() !== "") socialCount++;
    if (user.youtube && user.youtube.trim() !== "") socialCount++;
    if (user.tiktok && user.tiktok.trim() !== "") socialCount++;
    if (user.github && user.github.trim() !== "") socialCount++;
    if (user.customSocialNetworks && user.customSocialNetworks.length > 0) {
      socialCount += user.customSocialNetworks.filter(s => s.url && s.url.trim() !== "").length;
    }

    if (socialCount < 2) {
      recommendations.push({ field: 'social', label: 'Add Social Links (min 2)', icon: Users, score: 5, tab: 'basic', focusField: 'linkedin', bgColor: 'bg-[#ffadad]' });
    }

    return recommendations;
  };

  const recommendations = getProfileRecommendations(userData);
  const totalPotentialScore = recommendations.reduce((sum, rec) => sum + rec.score, 0);

  const handleRecommendationClick = (recommendation) => {
    navigate('/dashboard/profile?tab=' + recommendation.tab + '&focusField=' + recommendation.focusField);
  };

  const fetchViewsData = async (period) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/profile/views/last-${period}-days`);
      if (data.success) {
        const counts = data.views;
        const days = parseInt(period, 10);
        const today = new Date();
        const formatted = Array.from({ length: days }).map((_, idx) => {
          const d = new Date();
          d.setDate(today.getDate() - (days - 1 - idx));
          const key = d.toISOString().split("T")[0];
          const found = counts.find((v) => v._id === key);
          return { date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), views: found ? found.count : 0 };
        });
        setViewsData(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/dashboard-stats`);
        if (data.success) {
          setStats(data.stats);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchViewsData(viewPeriod);
  }, [backendUrl, viewPeriod]);

  useEffect(() => {
    fetchViewsData(viewPeriod);
  }, [viewPeriod]);

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg border border-gray-300" >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium text-gray-900">Welcome back, {userData?.name}!</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        {/* My Following */}
        <div className="flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MY FOLLOWING</span>
            <div className="text-5xl text-black font-semibold">{stats?.following || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#b7e4cb] flex items-center justify-center">
            <Users size={28} />
          </div>
        </div>

        {/* My Reviews */}
        <div className="flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MY REVIEWS</span>
            <div className="text-5xl text-black font-semibold">{stats?.reviews || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#cabffd] flex items-center justify-center">
            <Star size={28} />
          </div>
        </div>

        {/* Meetings */}
        <div className="flex justify-between p-6 border border-gray-300 rounded-md items-center">
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-semibold">MEETINGS</span>
            <div className="text-5xl text-black font-semibold">{stats?.meetings || 0}</div>
          </div>
          <div className="p-3 rounded-full h-15 w-15 bg-[#b3e5fb] flex items-center justify-center">
            <Calendar size={28} />
          </div>
        </div>
      </div>


      {/* Page Views & Recently Applied */}
      <section className="w-full mt-4 flex gap-4">
        {/* Page Views Chart */}
        <div className="w-[65%] border border-gray-300 rounded-md p-6 h-[500px] bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Page views</h2>
            <CustomSelect value={viewPeriod} onChange={(e) => setViewPeriod(e.target.value)}>
              <option value="7">7 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
            </CustomSelect>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line type="linear" dataKey="views" stroke="#047857" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recently Applied Jobs */}
        <div className="w-[35%] border border-gray-300 rounded-md p-6 bg-white">
          <h2 className="font-medium">Recently applied</h2>
          {stats?.recentApplications?.length > 0 ? (
            <ul className="mt-4 space-y-6">
              {stats.recentApplications.slice(0, 3).map((app) => (
                <li key={app._id} className="border-b last:border-0 border-gray-100 pb-4">
                  <div className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {app.job?.postedBy?.profilePicture ? (
                          <img
                            src={app.job.postedBy.profilePicture}
                            alt={app.job.postedBy.company}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building2 size={24} />
                          </div>
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {app.job?.title}
                            </h3>
                            <p className="text-sm text-gray-500">{app.job?.postedBy?.company}</p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                            ${app.status === "shortlisted"
                                ? "bg-green-100 text-green-700"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                          >
                            {app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span>{app.job?.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={14} />
                            <span>{app.job?.jobType}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">You haven't applied to any jobs yet.</div>
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="w-full mt-6">
          <div className="border border-gray-300 rounded-md p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Boost Your Profile</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Complete these sections to increase your profile score by
                  <span className="font-semibold text-green-600 ml-1">+{totalPotentialScore} points</span>
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Improve Score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {recommendations.map((rec) => {
                const IconComponent = rec.icon;
                return (
                  <div
                    key={rec.field}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-[var(--primary-color)]"
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2.5 rounded-lg ${rec.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent size={20} className="text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 text-sm group-hover:text-[var(--primary-color)] transition-colors">
                            {rec.label}
                          </h3>
                          <p className="text-xs text-green-600 font-semibold mt-1">+{rec.score} points</p>
                        </div>
                      </div>
                    </div>
                    <button className="mt-3 w-full py-1.5 text-sm font-medium text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md hover:bg-[var(--primary-color)] hover:text-white transition-colors">
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


    </div>
  );
};

export default ApplicantDashboard;
