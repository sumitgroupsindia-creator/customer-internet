import { Link } from 'react-router-dom';
import { daysLeft } from '../lib/format';
import { Icon } from './ui';

function Banner({ tone, title, message, cta = 'Recharge now', pulse = false }) {
  const tones = {
    red: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300',
  };
  const btn = {
    red: 'bg-red-600 hover:bg-red-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    amber: 'btn-secondary',
  };
  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${tones[tone]} ${pulse ? 'animate-pulse' : ''}`}>
      <div className="flex items-start gap-3">
        <Icon name="alert" className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
      <Link to="/me/recharge" className={`btn text-sm shrink-0 ${btn[tone]}`}>
        {cta}
      </Link>
    </div>
  );
}

export default function ExpiryBanner({ expiryDate, status }) {
  const days = daysLeft(expiryDate);

  if (status === 'suspended' || status === 'terminated') {
    return <Banner tone="red" title="Service paused" message="Recharge to resume your connection." />;
  }

  if (days === null) return null;

  if (days < 0) {
    return (
      <Banner
        tone="red"
        pulse
        title={`Plan expired ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} ago`}
        message="Recharge to restore your internet service."
      />
    );
  }

  if (days === 0) {
    return <Banner tone="orange" title="Your plan expires today" message="Recharge now to avoid disconnection." />;
  }

  if (days <= 2) {
    return (
      <Banner
        tone="orange"
        title={`Only ${days} day${days > 1 ? 's' : ''} left!`}
        message="Recharge now to keep your service active."
      />
    );
  }

  if (days <= 7) {
    return (
      <Banner tone="amber" title={`Plan expires in ${days} days`} message="Recharge early to avoid any downtime." cta="Recharge" />
    );
  }

  return null;
}
