import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/Authcontext";

// --- COMPONENTS ---
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import ChatBot from "./components/ChatBot";
import AIGuard from "./pages/AIGuard";

// --- LAYOUTS ---
import PatientLayout      from "./layouts/PatientLayout";
import NutritionistLayout from "./layouts/NutritionistLayout";

// --- PATIENT PAGES ---
import ProfileInfoPage     from "./pages/patient/Profileinfopage";
import ProfileChatPage     from "./pages/patient/Profilechatpage";
import ProfileProgressPage from "./pages/patient/ProgressPage";
import ProfileNotifsPage   from "./pages/patient/NotifsPage";
import MoodPage            from "./pages/patient/MoodPage";

// --- NUTRITION PAGES ---
import OverviewPage         from "./pages/nutrition/OverviewPage";
import PatientsPage         from "./pages/nutrition/PatientsPage";
import NutritionPlansPage   from "./pages/nutrition/PlansPage";
import ConsultationsPage    from "./pages/nutrition/ConsultationsPage";
import ChatPage             from "./pages/nutrition/ChatPage";
import NutritionProfilePage from "./pages/nutrition/ProfilePage";
import PostsPage            from "./pages/nutrition/CreatePostPage";

// --- PUBLIC PAGES ---
import Login            from "./pages/Login";
import SignupPage       from "./pages/SignupPage";
import BlogsPage        from "./pages/BlogsPage";
import AboutPage        from "./pages/AboutPage";
import PrivacyPage      from "./pages/PrivacyPag";
import Specialists      from "./pages/Specialists";
import OurSpecialists   from "./pages/OurSpecialists";
import AIPremiumPage    from "./pages/AIPremiumPage";
import StripeSuccess    from "./pages/StripeSuccess";
import PatientSetup     from "./pages/Patientsetup";
import CreateResumePage from "./pages/CreateResumePage";
import MobileScan       from "./pages/MobileScan";
import CaloriesAI       from "./pages/CaloriesAI";
import Payment          from "./pages/Payment";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ================= PUBLIC ================= */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HeroSection />
                <Footer />
                <ChatBot />
              </>
            }
          />

          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/blogs"       element={<><Header /><BlogsPage /><Footer /></>} />
          <Route path="/about"       element={<><AboutPage /><Footer /></>} />
          <Route path="/privacy"     element={<><Header /><PrivacyPage /><Footer /></>} />
          <Route path="/specialists" element={<><Header /><Specialists /><Footer /></>} />
          <Route path="/our-sprcs"   element={<><Header /><OurSpecialists /><Footer /></>} />
          <Route path="/ai-premium"  element={<><Header /><AIPremiumPage /><Footer /></>} />

          {/* ================= SETUP ================= */}
          <Route path="/patient-setup"  element={<PatientSetup />} />
          <Route path="/stripe/success" element={<StripeSuccess />} />
          <Route path="/resume/create"  element={<CreateResumePage />} />

          {/* ================= PATIENT ================= */}
          <Route element={<PatientLayout />}>
            <Route path="/profile"          element={<ProfileInfoPage />} />
            <Route path="/profile/chat"     element={<ProfileChatPage />} />
            <Route path="/profile/progress" element={<ProfileProgressPage />} />
            <Route path="/profile/notifs"   element={<ProfileNotifsPage />} />
            <Route path="/profile/mood"     element={<MoodPage />} />
            <Route path="/scan"             element={<MobileScan />} />
            <Route path="/payment"          element={<Payment />} />
            <Route
              path="/calories"
              element={
                <AIGuard>
                  <CaloriesAI />
                </AIGuard>
              }
            />
          </Route>

          {/* ================= NUTRITIONIST ================= */}
          <Route path="/resume" element={<NutritionistLayout />}>
            <Route index                element={<OverviewPage />} />
            <Route path="patients"      element={<PatientsPage />} />
            <Route path="plans"         element={<NutritionPlansPage />} />
            <Route path="consultations" element={<ConsultationsPage />} />
            <Route path="chat"          element={<ChatPage />} />
            <Route path="profile"       element={<NutritionProfilePage />} />
            <Route path="notifs"        element={<ProfileNotifsPage />} />
            <Route path="posts"         element={<PostsPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;