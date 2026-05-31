import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function Navbar() {
  const { isLoggedIn, customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const brand = import.meta.env.VITE_BRAND_NAME || 'Sumit Net';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-gray-700 hover:text-brand-700'
    }`;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-brand-700">
          <img src="/favicon.svg" alt="" className="w-8 h-8" />
          <span className="text-lg tracking-tight">{brand}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/plans" className={linkClass}>Plans</NavLink>
          <NavLink to="/coverage" className={linkClass}>Coverage</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          {isLoggedIn ? (
            <>
              <NavLink to="/me" className={linkClass}>Dashboard</NavLink>
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                <span className="text-sm text-gray-600">{customer?.name || customer?.mobile}</span>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">Logout</button>
              </div>
            </>
          ) : (
            <Link to="/login" className="ml-2 btn-primary text-sm py-2 px-4">Customer Login</Link>
          )}
        </nav>

        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <NavLink onClick={() => setOpen(false)} to="/" end className={linkClass}>Home</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/plans" className={linkClass}>Plans</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/coverage" className={linkClass}>Coverage</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/contact" className={linkClass}>Contact</NavLink>
            {isLoggedIn ? (
              <>
                <NavLink onClick={() => setOpen(false)} to="/me" className={linkClass}>Dashboard</NavLink>
                <button onClick={handleLogout} className="block px-3 py-2 text-sm text-red-600">Logout</button>
              </>
            ) : (
              <Link onClick={() => setOpen(false)} to="/login" className="block px-3 py-2 text-sm font-semibold text-brand-700">Customer Login →</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
