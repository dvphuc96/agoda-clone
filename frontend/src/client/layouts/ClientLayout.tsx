import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
