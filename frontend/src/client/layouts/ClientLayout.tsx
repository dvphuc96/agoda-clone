import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ToastProvider } from '../../shared/components/Toast';

export default function ClientLayout() {
  const location = useLocation();

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-bg">
        <Navbar />
        <main key={location.pathname} className="flex-1 pt-16 lg:pt-[72px] page-animate">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
