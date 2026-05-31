import { Link } from 'react-router-dom';
import { usePublicSettings } from '../lib/usePublicSettings';

export default function Footer() {
  const { brandName: brand, supportPhone, supportWhatsApp } = usePublicSettings();
  const parent = import.meta.env.VITE_PARENT_SITE_URL || 'https://sumitgroups.com';
  const waDigits = (supportWhatsApp || '').replace(/[^\d]/g, '');

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white">
            <img src="/favicon.svg" alt="" className="w-7 h-7" />
            <span>{brand}</span>
          </div>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Fast, reliable, fairly-priced broadband for homes and businesses.
            A <a className="underline hover:text-white" href={parent}>Sumit Groups</a> company.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/plans" className="hover:text-white">Plans</Link></li>
            <li><Link to="/coverage" className="hover:text-white">Coverage</Link></li>
            <li><Link to="/enquire" className="hover:text-white">New Connection</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            {supportPhone && <li>Call: <a className="hover:text-white" href={`tel:${supportPhone}`}>{supportPhone}</a></li>}
            {waDigits && <li>WhatsApp: <a className="hover:text-white" href={`https://wa.me/${waDigits}`}>{supportWhatsApp}</a></li>}
            <li><Link to="/contact" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Customers</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
            <li><Link to="/me" className="hover:text-white">My Dashboard</Link></li>
            <li><Link to="/me/recharge" className="hover:text-white">Recharge</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {brand}. All rights reserved.
      </div>
    </footer>
  );
}
