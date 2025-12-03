import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useContext, useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

import { AppContext } from "./context/AppContext";
import Loading from "./components/Loading";
import CompanyProfile from "./pages/CompanyProfile";
import DashboardLayout from "./components/DashboardLayout";
import AdminDashboardLayout from "./components/AdminDashboardLayout";
import CandidateProfile from "./pages/CandidateProfile";
import NotFoundPage from "./pages/NotFoundPage";
import EmployerLanding from "./pages/EmployerLanding";
import Blogs from "./pages/Blogs";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import ManageJobs from "./pages/dashboard/Jobs/Jobs";
import PostJobPage from "./pages/dashboard/Jobs/PostJob";


// Lazy-loaded components
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ChatBotBubble = lazy(() => import("./components/ChatBotBubble"));
const AboutUs = lazy(() => import("./pages/AboutUs"));

const Home = lazy(() => import("./pages/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const FindJobs = lazy(() => import("./pages/FindJobs"));
const CategoryJobs = lazy(() => import("./pages/CategoryJobs"));
const BlogsDetails = lazy(() => import("./pages/BlogsDetails"));
const EditBlog = lazy(() => import("./pages/EditBlog"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Categories = lazy(() => import("./pages/Categories"));
const CandidatesPage = lazy(() => import("./pages/Candidates"));
const CompaniesPage = lazy(() => import("./pages/Companies"));

// Dashboard pages
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Applicants = lazy(() => import("./pages/dashboard/Applicants"));
const Candidates = lazy(() => import("./pages/dashboard/Candidates"));
const Package = lazy(() => import("./pages/dashboard/Package"));
const Messages = lazy(() => import("./pages/dashboard/Messages"));
const Meetings = lazy(() => import("./pages/dashboard/Meetings"));
const Company = lazy(() => import("./pages/dashboard/Company"));
const DashboardSettings = lazy(() => import("./pages/dashboard/DashboardSettings"));
const MyProfile = lazy(() => import("./components/MyProfile"));
const MyResume = lazy(() => import("./components/MyResume"));
const AppliedJobs = lazy(() => import("./components/AppliedJobs"));
const SavedJobs = lazy(() => import("./components/SavedJobs"));

// Admin dashboard pages
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminJobRequests = lazy(() => import("./pages/admin/AdminJobRequests"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminRecruiters = lazy(() => import("./pages/admin/AdminRecruiters"));
const AdminEmployeeProfileRequests = lazy(() => import("./pages/admin/AdminEmployeeProfileRequests"));
const AdminJobs = lazy(() => import("./pages/admin/AdminJobs"));
const AdminCategoryManager = lazy(() => import("./pages/admin/AdminCategoryManager"));
const AdminAddAssistant = lazy(() => import("./pages/admin/AdminAddAssistant"));
const AdminAllAssistants = lazy(() => import("./pages/admin/AdminAllAssistants"));
const AdminBlogManagement = lazy(() => import("./pages/admin/AdminBlogManagement"));
const AdminAddBlog = lazy(() => import("./pages/admin/AdminAddBlog"));
const AdminPackages = lazy(() => import("./pages/admin/AdminPackages"));

// 🔒 Admin-only route
export const AdminRoute = ({ children }) => {
  const { backendUrl, isLoggedIn } = useContext(AppContext);
  const [isAdmin, setIsAdmin] = useState(null);

  const location = useLocation()

  useEffect(() => {
    if (isLoggedIn) {
      const checkAdmin = async () => {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/auth/check-admin`,
            { withCredentials: true }
          );
          setIsAdmin(data.isAdmin);
        } catch (err) {
          setIsAdmin(false);
          toast.error("Failed to verify admin status");
        }
      };
      checkAdmin();
    }
  }, [isLoggedIn, backendUrl]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === null) {
    return <Loading />;
  }

  if (isAdmin) {
    return children;
  } else {
    toast.error("You are not authorized to access this page");
    return <Navigate to="/dashboard" replace />;
  }
};

// 🔐 Protected route
export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AppContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 🌍 Main App
const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (

    <div className="flex flex-col min-h-screen">
      <ToastContainer
        className="toastify-container"
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/post" element={<PostJobPage />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="package" element={<Package />} />
            <Route path="messages" element={<Messages />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="company" element={<Company />} />
            <Route path="settings" element={<DashboardSettings />} />

            {/* User Dashboard Routes */}
            <Route path="profile" element={<MyProfile />} />
            <Route path="resume" element={<MyResume />} />
            <Route path="applied-jobs" element={<AppliedJobs />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
          </Route>
          <Route path="/jobdetails/:id" element={<JobDetails />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminAnalytics />} />
            <Route path="job-requests" element={<AdminJobRequests />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="employers" element={<AdminRecruiters />} />
            <Route path="employee-profile-requests" element={<AdminEmployeeProfileRequests />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="category-manager" element={<AdminCategoryManager />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="add-assistant" element={<AdminAddAssistant />} />
            <Route path="all-assistant" element={<AdminAllAssistants />} />
            <Route path="blog-management" element={<AdminBlogManagement />} />
            <Route path="add-blog" element={<AdminAddBlog />} />
          </Route>
          <Route
            path="/editblog"
            element={
              <AdminRoute>
                <EditBlog />
              </AdminRoute>
            }
          />

          <Route path="/company-profile/:id" element={<CompanyProfile />} />
          <Route path="/candidate-profile/:id" element={<CandidateProfile />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category-jobs" element={<CategoryJobs />} />
          <Route path="/blogdetails/:slug" element={<BlogsDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/employer-landing" element={<EmployerLanding />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <ChatBotBubble />
      <Footer />
    </div>
  );
};

export default App;