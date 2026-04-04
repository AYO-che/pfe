
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Header from "./Header";
import HeroSection from "./HeroSection";
import BlogsPage from "./BlogsPage";

import Footer from "./Footer";
import AboutPage from "./AboutPage";
import PrivacyPage from "./PrivacyPag";
import CaloriesAI from "./CaloriesAI";
import Specialists from "./Specialists";
import ProfilePage from "./ProfilePage";
import PlansPage from "./Planspage";
import ConsultationPayment from "./Consultationpayment";
import PatientSetup from "./Patientsetup";
import NutritionistSetup from "./Nutritionistsetup";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<><Header /><HeroSection /><Footer /></>} />
          <Route path="/blogs" element={<BlogsPage />} />


          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/calories" element={<CaloriesAI />} />
          <Route path="/specialists" element={<Specialists />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/consultation-payment" element={<ConsultationPayment />} />
          <Route path="/patient-setup" element={<PatientSetup />} />
          <Route path="/nutritionist-setup" element={<NutritionistSetup />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;