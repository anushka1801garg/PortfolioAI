import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { fetchResumes } from "../../../redux/resume/resumeSlice";

import Sidebar from "../../dashboard/components/Sidebar";
import Topbar from "../../dashboard/components/Topbar";
import WorkspaceBackdrop from "../../../components/layout/WorkspaceBackdrop";

import ResumeUpload from "../components/ResumeUpload";
import ResumeList from "../components/ResumeList";

const ResumePage = () => {
  const dispatch = useDispatch();

  const { resumes, loading } = useSelector((state) => state.resume);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-[#0B0E17] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <WorkspaceBackdrop />
        <Topbar />

        <main className="relative z-10 flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8 pb-36">
          <ResumeUpload />

          <ResumeList resumes={resumes} loading={loading} />

          {/* Dashboard Page Footer */}
          <footer className="pt-10 pb-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                P
              </div>
              <p>© 2026 PortfolioAI. All rights reserved.</p>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-indigo-400 transition">
                Dashboard
              </Link>
              <Link to="/portfolio" className="hover:text-indigo-400 transition">
                My Portfolios
              </Link>
              <Link to="/portfolio-generator" className="hover:text-indigo-400 transition">
                AI Generator
              </Link>
              <Link to="/settings" className="hover:text-indigo-400 transition">
                Settings
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ResumePage;
