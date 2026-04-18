import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LocationProvider } from '../contexts/LocationContext';
import { PropertyProvider } from '../contexts/PropertyContext';
import { DashboardProvider } from '../contexts/DashboardContext';
import ScrollToTop from '../components/ScrollToTop';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import OTPVerify from '../pages/OTPVerify';
import Signup from '../pages/Signup';
import Properties from '../pages/Properties';
import PropertyDetails from '../pages/PropertyDetails';
import SellProperty from '../pages/SellProperty';
import Tools from '../pages/Tools';
import EMICalculator from '../pages/EMICalculator';
import HomeLoanAssistance from '../pages/HomeLoanAssistance';
import PropertyAgreement from '../pages/PropertyAgreement';
import RentalYield from '../pages/RentalYield';
import BuyingVsRenting from '../pages/BuyingVsRenting';
import Dashboard from '../pages/Dashboard';
import DashboardProperties from '../pages/DashboardProperties';
import DashboardSaved from '../pages/DashboardSaved';
import DashboardEnquiries from '../pages/DashboardEnquiries';
import DashboardSettings from '../pages/DashboardSettings';
import AdminDashboard from '../pages/AdminDashboard';
import Subscription from '../pages/Subscription';
import PropertySubscription from '../pages/PropertySubscription';
import Checkout from '../pages/Checkout';
import AuthDemo from '../pages/AuthDemo';
import BecomeBuilder from '../pages/BecomeBuilder';


function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <LocationProvider>
          <PropertyProvider>
            <DashboardProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:id" element={<PropertyDetails />} />
            <Route path="sell" element={<SellProperty />} />
            <Route path="tools" element={<Tools />} />
            <Route path="tools/emi-calculator" element={<EMICalculator />} />
            <Route path="tools/home-loan" element={<HomeLoanAssistance />} />
            <Route path="tools/property-agreement" element={<PropertyAgreement />} />
            <Route path="tools/rental-yield" element={<RentalYield />} />
            <Route path="tools/buying-vs-renting" element={<BuyingVsRenting />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="property-subscription" element={<PropertySubscription />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="auth-demo" element={<AuthDemo />} />
            <Route path="become-builder" element={<BecomeBuilder />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/otp-verify" element={<OTPVerify />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<DashboardProperties />} />
            <Route path="saved" element={<DashboardSaved />} />
            <Route path="enquiries" element={<DashboardEnquiries />} />
            <Route path="settings" element={<DashboardSettings />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
            </DashboardProvider>
          </PropertyProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
