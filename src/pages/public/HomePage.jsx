import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatINR } from '../../lib/format';
import { Icon } from '../../components/ui';

const usps = [
  { icon: 'bolt', title: 'Blazing speeds', desc: 'Up to 100 Mbps real-world throughput.' },
  { icon: 'infinity', title: 'Unlimited data', desc: 'No caps. No fair-usage games.' },
  { icon: 'headset', title: 'Local support', desc: 'Real humans, real fast — call or WhatsApp.' },
  { icon: 'wallet', title: 'Honest pricing', desc: 'Transparent monthly, half-yearly & yearly plans.' },
];

export default function HomePage() {
  const { data: plans } = useQuery({
    queryKey: ['plans-home'],
    queryFn: () => api.get('/internet/plans').then((r) => r.data?.slice(0, 3) || []),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center animate-fade-up">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-brand-50 text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now connecting your neighborhood
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold leading-tight">
            Internet that just
            <br />
            <span className="text-amber-300">works.</span>
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto mt-6">
            Fiber-fast broadband, unlimited data, friendly local support. Choose a plan or enquire about a new connection in your area.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/plans" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-black/10 transition-all active:scale-95 inline-flex items-center gap-2">
              View Plans
            </Link>
            <Link to="/enquire" className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-black/10 transition-all active:scale-95">
              Get New Connection
            </Link>
            <Link to="/login" className="text-white/90 hover:text-white font-semibold px-6 py-3 inline-flex items-center gap-1.5">
              Customer Login <Icon name="arrowRight" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {usps.map((u) => (
            <div key={u.title} className="card-interactive text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <Icon name={u.icon} className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-fg">{u.title}</h3>
              <p className="text-sm text-muted mt-1.5">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured plans */}
      {plans?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-fg text-center mb-8">Popular plans</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p._id} className="card-interactive group flex flex-col">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-fg">{p.name}</h3>
                  {p.speedMbps && (
                    <span className="badge-brand">
                      <Icon name="bolt" className="w-3.5 h-3.5" /> {p.speedMbps} Mbps
                    </span>
                  )}
                </div>
                <p className="text-3xl font-display font-extrabold text-fg mt-3">₹{formatINR(p.price || p.monthlyPrice)}</p>
                <p className="text-sm text-muted">/ {p.durationDays || 30} days</p>
                {p.description && <p className="text-sm text-muted mt-3">{p.description}</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/plans" className="btn-primary">
              See all plans <Icon name="arrowRight" className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-fg text-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-display font-extrabold">Need a new connection?</h2>
          <p className="opacity-70 mt-2">Tell us your address, we'll check coverage and call you back.</p>
          <Link to="/enquire" className="inline-flex items-center gap-2 mt-6 bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold px-6 py-3 rounded-xl transition-all active:scale-95">
            Request a connection <Icon name="arrowRight" className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
