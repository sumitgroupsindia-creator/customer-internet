import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatINR } from '../../lib/format';

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
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-brand-100 text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Now connecting your neighborhood
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Internet that just<br />
            <span className="text-amber-300">works.</span>
          </h1>
          <p className="text-brand-100 text-lg md:text-xl max-w-2xl mx-auto mt-6">
            Fiber-fast broadband, unlimited data, friendly local support. Choose a plan or enquire about a new connection in your area.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/plans" className="bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-black/10">
              View Plans
            </Link>
            <Link to="/enquire" className="bg-amber-400 text-amber-900 hover:bg-amber-300 font-semibold px-6 py-3 rounded-xl shadow-lg shadow-black/10">
              Get New Connection
            </Link>
            <Link to="/login" className="text-white/90 hover:text-white font-semibold px-6 py-3">
              Customer Login →
            </Link>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '⚡', title: 'Blazing speeds', desc: 'Up to 100 Mbps real-world throughput.' },
            { icon: '♾️', title: 'Unlimited data', desc: 'No caps. No fair-usage games.' },
            { icon: '🛠️', title: 'Local support', desc: 'Real humans, real fast — call or WhatsApp.' },
            { icon: '💸', title: 'Honest pricing', desc: 'Transparent monthly, half-yearly & yearly plans.' },
          ].map((u) => (
            <div key={u.title} className="card text-center">
              <div className="text-4xl mb-3">{u.icon}</div>
              <h3 className="font-bold text-gray-900">{u.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured plans */}
      {plans?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Popular plans</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p._id} className="card group hover:border-brand-300 transition-colors">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  {p.speedMbps && <span className="badge bg-brand-50 text-brand-700">⚡ {p.speedMbps} Mbps</span>}
                </div>
                <p className="text-3xl font-extrabold text-gray-900 mt-3">₹{formatINR(p.price || p.monthlyPrice)}</p>
                <p className="text-sm text-gray-500">/ {p.durationDays || 30} days</p>
                {p.description && <p className="text-sm text-gray-500 mt-3">{p.description}</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/plans" className="btn-primary">See all plans →</Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-extrabold">Need a new connection?</h2>
          <p className="text-gray-300 mt-2">Tell us your address, we'll check coverage and call you back.</p>
          <Link to="/enquire" className="inline-block mt-6 bg-amber-400 text-amber-900 hover:bg-amber-300 font-semibold px-6 py-3 rounded-xl">
            Request a connection
          </Link>
        </div>
      </section>
    </div>
  );
}
