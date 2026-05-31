import { usePublicSettings } from '../lib/usePublicSettings';

export default function SupportButtons() {
  const { supportPhone: phone, supportWhatsApp } = usePublicSettings();
  const wa = (supportWhatsApp || '').replace(/[^\d]/g, '');
  return (
    <div className="flex flex-wrap gap-3">
      {phone && (
        <a href={`tel:${phone}`} className="btn-secondary text-sm flex items-center gap-2">
          📞 Call support
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
           className="text-sm font-semibold inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
          💬 WhatsApp
        </a>
      )}
    </div>
  );
}
