import { saveJob } from "../controllers/jobsController.js";
import userAuth from "../middlewares/userAuth.js";
import {
  applyJob,
  checkProfileScore,
  fetchApplicants,
  getUserData,
  updateProfile,
  updateProfilePicture,
  updateResume,
  getAllRecruiters,
  getAllUsers,
  followUnfollowAccount,
  getCompanyDetails,
  updateBanner,
  followedAccountsDetails,
  uploadCompanyImages,
  deleteCompanyImage,
  searchCandidate,
  getFollowing,
  getFollowers,
  getCandidate,
  updateCoverImage,  getApplicantDashboardStats,} from "../controllers/userController.js";
import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const userRouter = express.Router();

/* ------------------ 🧩 Cloudinary + Multer Config ------------------ */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isResume = file.fieldname === "resume";
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const baseName = file.originalname.split('.')[0];

    // Add extension ONLY for PDF files
    const finalPublicId = isResume
      ? `${baseName}_${Date.now()}.pdf`
      : `${baseName}_${Date.now()}`;

    return {
      folder: "users",
      resource_type: isResume ? "raw" : "image",

      // No format conversion for raw files
      format: !isResume ? fileExt : "pdf",

      public_id: finalPublicId,

      // Only image transformations
      transformation: !isResume
        ? [{ width: 800, height: 600, crop: "limit" }]
        : undefined,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ------------------ 🔐 Routes ------------------ */

// User data & profile
userRouter.get("/data", userAuth, getUserData);
userRouter.post("/updateprofile", userAuth, updateProfile);
userRouter.get("/checkprofilescore", userAuth, checkProfileScore);
userRouter.get("/dashboard-stats", userAuth, getApplicantDashboardStats);

// Separate upload for resume (using disk storage for manual upload)
const storageResume = multer.diskStorage({});
const uploadResume = multer({
  storage: storageResume,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// File uploads
userRouter.post('/updateresume', userAuth, uploadResume.single('resume'), updateResume);
userRouter.post("/updateprofilepicture", userAuth, upload.single("profilePicture"), updateProfilePicture);
userRouter.post("/updatebanner", userAuth, upload.single("banner"), updateBanner);
userRouter.post("/updatecoverimage", userAuth, upload.single("coverImage"), updateCoverImage);

// Jobs
userRouter.post("/savejob", userAuth, saveJob);
userRouter.post("/applyjob", userAuth, applyJob);
userRouter.get("/fetchapplicants", userAuth, fetchApplicants);
userRouter.get("/getcandidate/:id", getCandidate);

// Users & recruiters
userRouter.get("/allusers", getAllUsers);
userRouter.get("/allrecruiters", getAllRecruiters);

// Social & company
userRouter.patch("/follow-unfollow-acc/:id", userAuth, followUnfollowAccount);
userRouter.get("/getcompanydetails/:slug", getCompanyDetails);
userRouter.get("/followedaccounts", userAuth, followedAccountsDetails);
userRouter.get("/getFollowing", userAuth, getFollowing);
userRouter.get("/getFollowers", userAuth, getFollowers);

// Company images
userRouter.post("/upload-company-images", userAuth, upload.array("companyImages", 10), uploadCompanyImages);
userRouter.post("/delete-company-image", userAuth, deleteCompanyImage);
userRouter.post("/search-candidates", searchCandidate);

export default userRouter;