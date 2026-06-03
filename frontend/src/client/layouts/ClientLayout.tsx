import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BookingProgressBar from '../components/common/BookingProgressBar';
import ChatWidget from '../components/chat/ChatWidget';
import { ToastProvider } from '../../shared/components/Toast';

export default function ClientLayout() {
  const location = useLocation();
  const isBookingFlow = ['/hotel/', '/booking/', '/payment/', '/bookings/'].some(
    (p) => location.pathname.startsWith(p)
  );

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-bg">
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        <Navbar />
        {isBookingFlow && <BookingProgressBar />}
        <main id="main-content" key={location.pathname} className={`flex-1 page-animate ${isBookingFlow ? 'pt-[104px] lg:pt-[120px]' : 'pt-16 lg:pt-[72px]'}`}>
          <Outlet />
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </ToastProvider>
  );
}
