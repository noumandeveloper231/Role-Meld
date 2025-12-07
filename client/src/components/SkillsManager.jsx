import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Plus, Trash2, Search } from "lucide-react";
import slugify from "slugify";

const SkillsManager = () => {
  const { backendUrl } = useContext(AppContext);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/skills`);
      if (data.success) {
        setSkills(data.skills);
      } else {
        toast.error(data.message || "Failed to fetch skills");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async () => {
    const name = newSkill.trim();
    if (!name) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/skills`, {
        name,
        slug: slugify(name, { lower: true }),
      });
      if (data.success) {
        toast.success(`Skill "${name}" added`);
        setNewSkill("");
        fetchSkills();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/skills/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchSkills();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Manager</h1>
        </div>

        {/* Add Skill */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Skill</h3>
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill name..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <button
              onClick={handleAddSkill}
              className="primary-btn flex items-center gap-2 justify-center sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills..."
              className="!pl-10"
            />
          </div>
          <div className="text-sm text-gray-500">
            {skills.length} skills total
          </div>
        </div>

        {/* Skills List */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="text-left bg-white text-gray-500">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">Skill</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-gray-500">
                    <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-3">Loading skills...</p>
                  </td>
                </tr>
              ) : filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-gray-500">
                    <p>No skills found.</p>
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => (
                  <tr key={skill._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 capitalize font-medium text-gray-900">{skill.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDeleteSkill(skill._id, skill.name)}
                          className="p-2 rounded-full hover:bg-red-50 transition-colors"
                          title={`Delete skill "${skill.name}"`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
