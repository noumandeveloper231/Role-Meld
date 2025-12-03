import React, { useContext, useRef, useState } from 'react';
import slugify from 'slugify';
import { FaBloggerB } from "react-icons/fa";
import { MdNavigateNext } from "react-icons/md";
import { IoChevronBack } from "react-icons/io5";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import JoditEditor from "jodit-react";
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import BlogCard from './BlogCard';
import { MdOutlinePreview } from "react-icons/md";
import Img from './Image';

const AdminBlog = ({ setActiveTab }) => {
  const { backendUrl } = useContext(AppContext);
  const [blogSteps, setBlogSteps] = useState(0);
  const [formData, setFormData] = useState({});
  const [Tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  const editor = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData({
        ...formData,
        title: value,
        slug: slugify(value, { replacement: "_", lower: true }),
        tags: Tags,
      });
    } else {
      setFormData({ ...formData, [name]: value, tags: Tags });
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && tag.trim() !== "") {
      e.preventDefault();
      const newTags = [...Tags, tag.trim()];
      setTags(newTags);
      setFormData({ ...formData, tags: newTags });
      setTag("");
    }
  };

  const removeTag = (index) => {
    const newTags = Tags.filter((_, i) => i !== index);
    setTags(newTags);
    setFormData({ ...formData, tags: newTags });
  };

  const [blogPostLoading, setBlogPostLoading] = useState(false)
  const createBlog = async (e) => {
    e.preventDefault();
    setBlogPostLoading(true)
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags") fd.append("tags", JSON.stringify(value));
        else fd.append(key, value);
      });

      const { data } = await axios.post(`${backendUrl}/api/blog/createblog`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success(data.message);
        setFormData({});
        setTags([]);
        setActiveTab("listed-blogs")
        setBlogSteps(0);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }finally{
      setBlogPostLoading(false)
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <main className="w-full rounded-xl flex-col border border-gray-200 bg-white grid grid-cols-3 gap-4 p-6 overflow-x-hidden overflow-y-auto min-h-screen">
      <div className='col-span-2 p-4'>
        <h1 className="font-bold flex items-center gap-4">
          <FaBloggerB className='text-[var(--primary-color)]' /> Add New Blog
        </h1>
        <section className="mt-10 rounded-md">
          <form onSubmit={createBlog} className="flex flex-col gap-4 py-8 px-12 min-h-[50vh]">
            <button
              disabled={blogSteps === 0}
              className="w-9 h-9 bg-[var(--primary-color)] text-white p-2 rounded-md"
              type="button"
              onClick={() => setBlogSteps(blogSteps - 1)}
            >
              <IoChevronBack />
            </button>

            <AnimatePresence mode="wait">
              {blogSteps === 0 && (
                <motion.div
                  key="step0"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <h2 className="font-semibold">Add Title of the Blog</h2>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData?.title || ""}
                      onChange={handleChange}
                      placeholder="Title"
                      className="px-4 py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="slug">Slug</label>
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={formData?.slug || ""}
                      onChange={handleChange}
                      placeholder="Slug"
                      className="px-4 py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData?.title || !formData?.slug) {
                          toast.error("Please fill all the fields");
                          return;
                        }
                        setBlogSteps(blogSteps + 1);
                      }}
                    >
                      Next <MdNavigateNext />
                    </button>
                  </div>
                </motion.div>
              )}

              {blogSteps === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <h2 className="font-semibold">Choose Category</h2>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="py-2 px-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Select Category --</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Business Development">Sales & Business Development</option>
                    <option value="Engineering & Architecture">Engineering & Architecture</option>
                  </select>
                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData?.category) {
                          toast.error("Please fill all the fields");
                          return;
                        }
                        setBlogSteps(blogSteps + 1);
                      }}
                    >
                      Next <MdNavigateNext />
                    </button>
                  </div>
                </motion.div>
              )}

              {blogSteps === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <h2 className="font-semibold">Enter Main Content Here</h2>
                  <JoditEditor
                    ref={editor}
                    defaultValue={formData?.content || ""}
                    config={{
                      readonly: false,
                      height: 400,
                      uploader: { insertImageAsBase64URI: true },
                      buttons: ["bold", "italic", "|", "paragraph", "|", "link", "image", "blockquote"],
                      toolbarAdaptive: false,
                    }}
                    onBlur={(newContent) =>
                      setFormData((prev) => ({ ...prev, content: newContent }))
                    }
                  />
                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData?.content) {
                          toast.error("Please fill all the fields");
                          return;
                        }
                        setBlogSteps(blogSteps + 1);
                      }}
                    >
                      Next <MdNavigateNext />
                    </button>
                  </div>
                </motion.div>
              )}

              {blogSteps === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <h2 className="font-semibold">Enter Related Tags</h2>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Type a tag and press Enter"
                      className="w-full p-2 border-2 border-[var(--primary-color)] rounded-md"
                    />
                    <div className="flex flex-wrap gap-2  border border-gray-300 rounded-md p-2 min-h-[20vh]">
                      {Tags.map((t, i) => (
                        <span
                          key={i}
                          className="bg-gray-300 h-8 px-2 py-1 rounded cursor-pointer"
                          onClick={() => removeTag(i)}
                        >
                          {t} &times;
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (formData?.tags?.length < 3) {
                          toast.error("Add at least 3 tags");
                          return;
                        }
                        setBlogSteps(blogSteps + 1);
                      }}
                    >
                      Next <MdNavigateNext />
                    </button>
                  </div>
                </motion.div>
              )}

              {blogSteps === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  <h2 className="font-semibold">Add Cover / Featured Image</h2>
                  <div className="relative w-full h-[300px] border-2 border-[var(--primary-color)] rounded-2xl overflow-hidden bg-gray-50 flex justify-center items-center">
                    {formData?.coverImage ? (
                      <Img
                        src={URL.createObjectURL(formData.coverImage)}
                        style="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-400">No image selected</p>
                    )}
                    <input
                      type="file"
                      name="coverImage"
                      onChange={(e) =>
                        setFormData({ ...formData, coverImage: e.target.files[0] })
                      }
                      className="absolute bottom-2 left-0 w-full px-4 py-2 focus:outline-3 outline-[var(--primary-color)] hover:shadow-md transition-all outline-offset-2 border-2 focus:border-[var(--primary-color)] rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end mt-5">
                    <button
                      type="submit"
                      disabled={blogPostLoading}
                    >
                      {blogPostLoading? "Posting...": "Post"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </section>
      </div>
      <div className='p-2 hidden md:block'>
        <h2 className='font-semibold my-2 flex gap-3 items-center'>
          <MdOutlinePreview className='text-[var(--primary-color)]' /> Preview
        </h2>
        <div className='sticky top-0 pointer-events-none'>
          <BlogCard blog={formData} />
        </div>
      </div>
    </main>
  );
};

export default AdminBlog;