import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Star,
  Calendar,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  ChevronRight,
  Loader
} from "lucide-react";

const ApplicantDashboard = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {userData?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Following */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">My Following</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.following || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
        </div>

        {/* My Reviews */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">My Reviews</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.reviews || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
            <Star size={24} />
          </div>
        </div>

        {/* Meetings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-medium mb-1">Meetings</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.meetings || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Views Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Your Profile Views</h2>
            <select className="bg-gray-50 border-none text-sm font-medium text-gray-500 rounded-lg px-3 py-1 focus:ring-0 cursor-pointer">
              <option>Last 7 Days</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.profileViews || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                  dataKey="views"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Jobs Side Panel (or Notifications/Recommendations could go here, but sticking to screenshot) */}
        {/* The screenshot shows "Recently Applied" taking up full width below or side? 
           Actually the screenshot description says "My Following", "My Reviews", "Meetings" and "Profile Views".
           And "Recently Applied Jobs".
           I'll put Recent Jobs below the chart.
        */}
      </div>

      {/* Recently Applied Jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recently Applied</h2>
          <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {stats?.recentApplications?.length > 0 ? (
            stats.recentApplications.map((app) => (
              <div key={app._id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start gap-4">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {app.job?.title}
                        </h3>
                        <p className="text-sm text-gray-500">{app.job?.postedBy?.company}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                        ${app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'}`}>
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
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              You haven't applied to any jobs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;