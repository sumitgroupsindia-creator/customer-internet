import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function CoveragePage() {
  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas-public'],
    queryFn: () => api.get('/internet/areas').then((r) => r.data).catch(() => []),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-fg">Coverage</h1>
      <p className="text-subtle mt-2">We currently serve the following areas. Not in your locality? <a className="text-brand-700 underline" href="/enquire">Request coverage</a>.</p>

      {isLoading && <div className="mt-8 text-subtle">Loading…</div>}

      {!isLoading && areas?.length > 0 && (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {areas.map((a) => (
            <div key={a._id} className="card py-4">
              <p className="font-semibold text-fg">{a.name}</p>
              <p className="text-sm text-subtle">{[a.city, a.state].filter(Boolean).join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !areas?.length && (
        <div className="mt-8 card text-center text-subtle">
          Coverage list coming soon. Reach out via <a className="text-brand-700 underline" href="/contact">contact us</a>.
        </div>
      )}
    </div>
  );
}
