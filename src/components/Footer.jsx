import { Link } from 'react-router-dom';
import { usePublicSettings } from '../lib/usePublicSettings';
import { Icon } from './ui';

export default function Footer() {
  const { brandName: brand, supportPhone, supportWhatsApp } = usePublicSettings();
  const parent = import.meta.env.VITE_PARENT_SITE_URL || 'https://sumitgroups.com';
  const waDigits = (supportWhatsApp || '').replace(/[^\d]/g, '');

  return (
    <footer className="mt-20 border-t border-line bg-surface-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
              <Icon name="wifi" className="w-5 h-5 text-white" />
            </span>
            <span className="font-display font-extrabold text-fg">{brand}</span>
          </div>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            Fast, reliable, fairly-priced broadband for homes and businesses. A{' '}
            <a className="text-brand-600 dark:text-brand-400 hover:underline" href={parent}>
              Sumit Groups
            </a>{' '}
            company.
          </p>
        </div>

        <FooterCol title="Services">
          <FooterLink to="/plans">Plans</FooterLink>
          <FooterLink to="/coverage">Coverage</FooterLink>
          <FooterLink to="/enquire">New Connection</FooterLink>
        </FooterCol>

        <FooterCol title="Support">
          {supportPhone && (
            <li>
              <a className="text-muted hover:text-fg transition-colors" href={`tel:${supportPhone}`}>
                Call: {supportPhone}
              </a>
            </li>
          )}
          {waDigits && (
            <li>
              <a className="text-muted hover:text-fg transition-colors" href={`https://wa.me/${waDigits}`}>
                WhatsApp: {supportWhatsApp}
              </a>
            </li>
          )}
          <FooterLink to="/contact">Contact us</FooterLink>
        </FooterCol>

        <FooterCol title="Customers">
          <FooterLink to="/login">Login</FooterLink>
          <FooterLink to="/me">My Dashboard</FooterLink>
          <FooterLink to="/me/recharge">Recharge</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-subtle">
        © {new Date().getFullYear()} {brand}. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-subtle mb-4">{title}</h4>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="text-muted hover:text-fg transition-colors">
        {children}
      </Link>
    </li>
  );
}
