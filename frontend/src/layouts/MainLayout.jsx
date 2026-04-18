import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import { useAuth } from '../contexts/AuthContext';

function MainLayout() {
  const { 
    isLoggedIn, 
    showAuthModal, 
    closeAuthModal, 
    openLogin,
    showSignupModal,
    closeSignupModal
  } = useAuth();
  const location = useLocation();

  const isFullHeightTool = useMemo(() => {
    const isToolsPage = location.pathname === '/tools';
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    // Tools page with calculator tabs
    if (isToolsPage && (tab === 'rental-yield' || tab === 'buying-vs-renting')) return true;
    
    // Direct calculator routes
    const directCalculatorRoutes = [
      '/tools/rental-yield',
      '/tools/buying-vs-renting',
      '/tools/emi-calculator'
    ];
    if (directCalculatorRoutes.includes(location.pathname)) return true;
    
    return false;
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginClick={openLogin}
      />
      <LoginModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={closeSignupModal}
        onLoginClick={openLogin}
      />
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
