import { Link } from 'react-router-dom';
import { daysLeft } from '../lib/format';

export default function ExpiryBanner({ expiryDate, status }) {
  const days = daysLeft(expiryDate);

  if (status === 'suspended' || status === 'terminated') {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-red-800">Service paused</p>
          <p className="text-sm text-red-700">Recharge to resume your connection.</p>
        </div>
        <Link to="/me/recharge" className="btn-primary bg-red-600 hover:bg-red-700 text-sm">Recharge now</Link>
      </div>
    );
  }

  if (days === null) return null;

  if (days < 0) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between gap-4 animate-pulse">
        <div>
          <p className="font-bold text-red-800">Plan expired {Math.abs(days)} day{Math.abs(days) > 1 ? 's' : ''} ago</p>
          <p className="text-sm text-red-700">Recharge to restore your internet service.</p>
        </div>
        <Link to="/me/recharge" className="btn-primary bg-red-600 hover:bg-red-700 text-sm">Recharge now</Link>
      </div>
    );
  }

  if (days === 0) {
    return (
      <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-orange-800">Your plan expires today</p>
          <p className="text-sm text-orange-700">Recharge now to avoid disconnection.</p>
        </div>
        <Link to="/me/recharge" className="btn-primary bg-orange-600 hover:bg-orange-700 text-sm">Recharge now</Link>
      </div>
    );
  }

  if (days <= 2) {
    return (
      <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-orange-800">Only {days} day{days > 1 ? 's' : ''} left!</p>
          <p className="text-sm text-orange-700">Recharge now to keep your service active.</p>
        </div>
        <Link to="/me/recharge" className="btn-primary bg-orange-600 hover:bg-orange-700 text-sm">Recharge now</Link>
      </div>
    );
  }

  if (days <= 7) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-amber-800">Plan expires in {days} days</p>
          <p className="text-sm text-amber-700">Recharge early to avoid any downtime.</p>
        </div>
        <Link to="/me/recharge" className="btn-secondary text-sm">Recharge</Link>
      </div>
    );
  }

  return null;
}
