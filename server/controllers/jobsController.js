import applicationModel from '../models/applicationModel.js';
import jobsModel from '../models/jobsModel.js';
import recruiterProfileModel from '../models/recruiterProfileModel.js';
import userProfileModel from "../models/userProfileModel.js";

export const addJob = async (req, res) => {
    const { jobData } = req.body;
    const userId = req.user._id;

    if (!jobData) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const recruiterProfile = await recruiterProfileModel.findOne({ authId: userId });
        const job = new jobsModel({
            ...jobData,
            postedBy: recruiterProfile._id,
            postedAt: new Date(),
            applicationDeadline: jobData.closingDays
                ? new Date(Date.now() + jobData.closingDays * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        await job.save();

        const recruiter = await recruiterProfileModel.findOne({ authId: userId });

        if (!recruiter) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        if (!recruiter.sentJobs.includes(job._id)) {
            recruiter.sentJobs.push(job._id);
        }
        await recruiter.save();

        return res.status(201).json({ success: true, message: "Job Listed" });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
                errors: Object.keys(error.errors).map((key) => `${key} is required`),
            });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const saveJob = async (req, res) => {
    const { savedJobs } = req.body;
    const userId = req.user._id

    try {
        const user = await userProfileModel.findOne({ authId: userId })

        if (!user) {
            return res.json({ success: false, message: "Profile Not Found" })
        }

        user.savedJobs = savedJobs;
        await user.save()
        return res.json({ success: true, savedJobs: user.savedJobs })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getJobBySlug = async (req, res) => {

    const { slug } = req.params;
    console.log(slug);

    if (!slug) {
        return res.json({ success: false, message: "Job Id Required" });
    }

    try {
        const job = await jobsModel.findOne({ slug: slug }).populate('postedBy', 'name email contactNumber members website foundedIn city country category authId about');

        if (!job) {
            return res.json({ success: false, message: "Job Not Found, Expired" })
        }

        return res.json({ success: true, job });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
export const getJob = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.json({ success: false, message: "Job Id Required" });
    }

    try {
        const job = await jobsModel.findById(id).populate('postedBy', 'name email contactNumber members website foundedDate city country industry authId about');

        if (!job) {
            return res.json({ success: false, message: "Job Not Found, Expired" })
        }

        return res.json({ success: true, job });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}


export const getAllJobs = async (req, res) => {
    try {
        const jobs = await jobsModel.find().populate('postedBy', 'name email phone members website foundedAt about');

        if (!jobs || jobs.length < 0) {
            return res.json({ success: false, message: "No Jobs Found" })
        }

        return res.json({ success: true, jobs })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getCompanyJobs = async (req, res) => {
    const { companyId } = req.params;

    if (!companyId) {
        return res.json({ success: false, message: "No Company Found" });
    }

    try {
        const companyJobs = await jobsModel.find({ postedBy: companyId, isActive: true, approved: "approved" });

        console.log(companyJobs);

        if (!companyJobs || companyJobs.length <= 0) {
            return res.json({ success: false, message: "No Jobs Found" });
        }

        return res.json({ success: true, companyJobs });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getSavedJobs = async (req, res) => {
    const userId = req.user._id

    try {
        const user = await userProfileModel.findOne({ authId: userId })
        const savedJobs = await jobsModel.find({ _id: { $in: user.savedJobs }, isActive: true });

        if (!savedJobs) {
            return res.json({ success: false, message: "No Saved Jobs" })
        }

        return res.json({ success: true, savedJobs })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const updateJobStatus = async (req, res) => {
    const { jobId, status } = req.body;

    if (!jobId || !status) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const job = await jobsModel.findByIdAndUpdate(jobId, { approved: status }, { new: true });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job Not Found" });
        }

        return res.status(200).json({ success: true, message: "Job Status Updated" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getApprovedJobs = async (req, res) => {
    try {
        const jobs = await jobsModel.find({ approved: "approved", isActive: true });

        const categorySet = new Set(jobs.map(job => job.category));

        return res.json({ success: true, jobs, categorySet: [...categorySet] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getPendingJobs = async (req, res) => {
    try {
        const jobs = await jobsModel.find({ approved: "pending" });
        return res.json({ success: true, jobs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getActiveJobs = async (req, res) => {
    try {
        const result = await jobsModel.updateMany(
            { applicationDeadline: { $lt: new Date() } },
            { $set: { isActive: false } }
        );
    } catch (error) {

    }
}

export const searchJob = async (req, res) => {
    try {
        const { search } = req.query;
        const { location } = req.params

        console.log(search, location);

        // Search for approved jobs matching title (case-insensitive)
        let approvedJobs;

        if (!location) {
            approvedJobs = await jobsModel.find({
                title: { $regex: search, $options: "i" },
                approved: "approved",
                isActive: true,
                // sponsored: false
            });
        } else {
            approvedJobs = await jobsModel.find({
                approved: "approved",
                isActive: true,
                sponsored: false,
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { location: { $regex: location, $options: "i" } },
                    { company: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } },
                    { subCategory: { $regex: search, $options: "i" } }
                ]
            });
        }
        return res.json({
            success: true,
            approvedJobs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategoryJobs = async (req, res) => {
    try {
        const { category } = req.body;

        const approvedCategoryJobs = await jobsModel.find({
            category: category,
            approved: "approved",
            isActive: true
        });

        return res.json({
            success: true,
            approvedCategoryJobs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Sponsored Jobs
export const getSponsoredJobs = async (req, res) => {
    try {
        const sponsoredJobs = await jobsModel.find({
            sponsored: true,
            approved: "approved",
            isActive: true
        });

        return res.status(200).json({
            success: true,
            sponsoredJobs
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Remove Jobs
export const removeJob = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "Job ID is required" });
    }
    try {
        const job = await jobsModel.findById(id);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        await jobsModel.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Job removed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getCompanyJobsById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.json({ success: false, message: "No Company Found" });
    }

    try {
        const companyJobs = await jobsModel.find({ postedBy: id });

        console.log(companyJobs);

        if (!companyJobs || companyJobs.length <= 0) {
            return res.json({ success: false, message: "No Jobs Found" });
        }

        return res.json({ success: true, companyJobs });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}