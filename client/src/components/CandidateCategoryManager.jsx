import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Plus, Trash2, Search } from "lucide-react";
import slugify from "slugify";

/**
 * CandidateCategoryManager – simple admin UI to manage candidate categories.
 * Features: list, search, add and delete categories (no sub-categories).
 */
const CandidateCategoryManager = () => {
  const { backendUrl } = useContext(AppContext);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/candidate-categories`);
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/candidate-categories`, {
        name,
        slug: slugify(name, { lower: true }),
      });
      if (data.success) {
        toast.success(`Category "${name}" added`);
        setNewCategory("");
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category \"${name}\"?`)) return;
    try {
      const { data } = await axios.delete(`${backendUrl}/api/admin/candidate-categories/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Category Manager</h1>
      </div>

      {/* Add New */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Category</h3>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name..."
          />
          <button
            onClick={handleAddCategory}
            className="primary-btn flex whitespace-nowrap items-center gap-2 justify-center sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add Category
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
            placeholder="Search categories..."
            className="!pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">{categories.length} categories total</div>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="text-left bg-white text-gray-500">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide">Category</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="py-12 text-center text-gray-500">
                  <div className="inline-block w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="mt-3">Loading categories...</p>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-12 text-center text-gray-500">
                  <p>No categories found.</p>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 capitalize font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-2 rounded-full hover:bg-red-50 transition-colors"
                        title={`Delete category \"${cat.name}\"`}
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
  );
};

export default CandidateCategoryManager;
