import './App.css'
import Home from './pages/home.jsx';
import { Routes, Route } from "react-router-dom";
import Postjob from './pages/postjob.jsx';
import JobDescription from './pages/JobDescription.jsx';
import ApplicationForm from './pages/ApplicationForm.jsx';
import UserRegister from './pages/UserRegister.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/chat.jsx';
import JobAIForm from './pages/JobAIForm.jsx';
import JobAIHelper from './pages/JobAIHelper.jsx';
import SalaryGuidance from './pages/SalaryGuidance.jsx';
import EditJob from './pages/EditJob.jsx';
import JobListingPage from "./pages/JobListingPage";
import ResumeMatchPDF from './pages/ResumeMatchPDF.jsx';
import RecruiterAnalytics from './pages/RecruiterAnalytics.jsx';

function App() {
  return (
    <>
     <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post-job" element={<Postjob />} />
        <Route path="/job/:id" element={<JobDescription />} />
        <Route path="/apply/:id" element={<ApplicationForm />} /> 
        <Route path="/register" element={<UserRegister />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/chat/:jobId/:receiverId" element={<Chat />} />
        <Route path="/job-ai" element={<JobAIForm />} />
        <Route path="/ai-helper" element={<JobAIHelper />} />
        <Route path="/salary-guidance" element={<SalaryGuidance />} />
        <Route path="/edit-job/:jobId" element={<EditJob />} />
        <Route path="/jobs" element={<JobListingPage />} />
        <Route path="/resume-match" element={<ResumeMatchPDF />} />
        <Route path="/analytics" element={<RecruiterAnalytics />} />
      </Routes>
    </>
  )
}

export default App
