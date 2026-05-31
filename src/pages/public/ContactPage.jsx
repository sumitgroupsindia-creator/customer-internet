import SupportButtons from '../../components/SupportButtons';
import { usePublicSettings } from '../../lib/usePublicSettings';

export default function ContactPage() {
  const { supportPhone: phone, supportWhatsApp: wa } = usePublicSettings();
  const waDigits = (wa || '').replace(/[^\d]/g, '');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Contact Us</h1>
      <p className="text-gray-500 mt-2">We're happy to help with new connections, recharges, and any issues.</p>

      <div className="mt-8 card space-y-4">
        {phone && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Call</p>
            <a href={`tel:${phone}`} className="text-xl font-semibold text-brand-700">{phone}</a>
          </div>
        )}
        {waDigits && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">WhatsApp</p>
            <a href={`https://wa.me/${waDigits}`} className="text-xl font-semibold text-brand-700">{wa}</a>
          </div>
        )}
        {!phone && !waDigits && (
          <p className="text-sm text-gray-500">Support contact details will appear here once configured by the admin.</p>
        )}
        <div className="pt-3">
          <SupportButtons />
        </div>
      </div>
    </div>
  );
}
