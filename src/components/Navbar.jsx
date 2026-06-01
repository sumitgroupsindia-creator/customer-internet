import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Icon, ThemeToggle } from './ui';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/plans', label: 'Plans' },
  { to: '/coverage', label: 'Coverage' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { isLoggedIn, customer, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const brand = import.meta.env.VITE_BRAND_NAME || 'Sumit Net';

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive ? 'text-brand-700 dark:text-brand-300 bg-brand-500/10' : 'text-muted hover:text-fg hover:bg-surface-2'
    }`;

  const initial = (customer?.name || customer?.mobile || 'U').charAt(0).toUpperCase();

  return (
    <header className="surface-glass sticky top-0 z-40 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm shadow-brand-600/30 transition-transform group-hover:scale-105">
            <Icon name="wifi" className="w-5 h-5 text-white" />
          </span>
          <span className="text-lg font-display font-extrabold tracking-tight text-fg">{brand}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {isLoggedIn && (
            <NavLink to="/me" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-surface-2 transition-colors"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center text-sm font-bold">
                  {initial}
                </span>
                <span className="text-sm font-medium text-fg max-w-[120px] truncate">{customer?.name || customer?.mobile}</span>
                <Icon name="chevronDown" className={`w-4 h-4 text-subtle transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-line bg-surface shadow-card-hover p-1.5 animate-scale-in" role="menu">
                  <div className="px-3 py-2.5 border-b border-line mb-1">
                    <p className="text-sm font-semibold text-fg truncate">{customer?.name}</p>
                    <p className="text-xs text-subtle font-mono">{customer?.customerId || customer?.mobile}</p>
                  </div>
                  <MenuItem to="/me" icon="user" onClick={() => setMenuOpen(false)}>Dashboard</MenuItem>
                  <MenuItem to="/me/recharge" icon="wallet" onClick={() => setMenuOpen(false)}>Recharge</MenuItem>
                  <MenuItem to="/me/history" icon="clock" onClick={() => setMenuOpen(false)}>History</MenuItem>
                  <MenuItem to="/me/profile" icon="user" onClick={() => setMenuOpen(false)}>Profile</MenuItem>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                    role="menuitem"
                  >
                    <Icon name="logout" className="w-[18px] h-[18px]" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4">
              Customer Login
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 text-muted hover:text-fg rounded-lg"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="w-6 h-6" />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-surface animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} onClick={() => setOpen(false)} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {isLoggedIn ? (
              <>
                <NavLink onClick={() => setOpen(false)} to="/me" className={linkClass}>Dashboard</NavLink>
                <NavLink onClick={() => setOpen(false)} to="/me/recharge" className={linkClass}>Recharge</NavLink>
                <NavLink onClick={() => setOpen(false)} to="/me/profile" className={linkClass}>Profile</NavLink>
                <button onClick={handleLogout} className="block w-full text-left px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <Link onClick={() => setOpen(false)} to="/login" className="btn-primary w-full mt-2">
                Customer Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-fg hover:bg-surface-2 transition-colors"
      role="menuitem"
    >
      <Icon name={icon} className="w-[18px] h-[18px]" />
      {children}
    </Link>
  );
}
