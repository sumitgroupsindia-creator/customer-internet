import { usePublicSettings } from '../lib/usePublicSettings';
import { Icon } from './ui';

export default function SupportButtons() {
  const { supportPhone: phone, supportWhatsApp } = usePublicSettings();
  const wa = (supportWhatsApp || '').replace(/[^\d]/g, '');
  return (
    <div className="flex flex-wrap gap-3">
      {phone && (
        <a href={`tel:${phone}`} className="btn-secondary text-sm">
          <Icon name="phone" className="w-4 h-4" /> Call support
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
           className="btn text-sm bg-green-600 text-white hover:bg-green-700">
          <Icon name="headset" className="w-4 h-4" /> WhatsApp
        </a>
      )}
    </div>
  );
}
