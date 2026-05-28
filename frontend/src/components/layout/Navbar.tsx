import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-navy text-white px-8 py-3.5 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold tracking-tight">
        Viet<span className="text-gold-light">Stay</span>
      </Link>
      <div className="hidden md:flex items-center gap-6 text-sm">
        <Link to="/search" className="hover:text-gold-light transition-colors">Khach san</Link>
        {isAuthenticated ? (
          <>
            <Link to="/bookings" className="hover:text-gold-light transition-colors">Dat phong cua toi</Link>
            <span className="text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="bg-tab text-text-primary px-4 py-1.5 rounded-lg font-medium text-xs">
              Dang xuat
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-gold text-white px-4 py-1.5 rounded-lg font-semibold text-xs">
            Dang nhap
          </Link>
        )}
      </div>
      {/* Mobile menu button */}
      <button className="md:hidden text-white" onClick={() => {
        const menu = document.getElementById('mobile-menu');
        menu?.classList.toggle('hidden');
      }}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div id="mobile-menu" className="hidden md:hidden absolute top-14 left-0 right-0 bg-navy p-4 flex flex-col gap-3 text-sm z-50">
        <Link to="/search" className="hover:text-gold-light transition-colors">Khach san</Link>
        {isAuthenticated ? (
          <>
            <Link to="/bookings" className="hover:text-gold-light transition-colors">Dat phong cua toi</Link>
            <button onClick={handleLogout} className="bg-tab text-text-primary px-4 py-1.5 rounded-lg font-medium text-xs w-fit">
              Dang xuat
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-gold text-white px-4 py-1.5 rounded-lg font-semibold text-xs w-fit">
            Dang nhap
          </Link>
        )}
      </div>
    </nav>
  );
}
