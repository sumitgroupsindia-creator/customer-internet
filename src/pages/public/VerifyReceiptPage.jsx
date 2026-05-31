import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, formatINR } from '../../lib/format';

export default function VerifyReceiptPage() {
  const { receiptNo } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', receiptNo],
    queryFn: () => api.get(`/internet/verify/${receiptNo}`).then((r) => r.data),
    retry: 0,
  });

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900">Receipt verification</h1>
      <p className="text-gray-500 mt-2 break-all">Receipt: <span className="font-mono">{receiptNo}</span></p>

      <div className="card mt-8">
        {isLoading && <p className="text-gray-500">Verifying…</p>}
        {isError && (
          <div className="text-center">
            <div className="text-5xl">❌</div>
            <p className="font-bold text-red-700 mt-3">Not found or invalid</p>
            <p className="text-sm text-gray-500 mt-1">This receipt could not be verified.</p>
          </div>
        )}
        {data?.valid && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-5xl">✅</div>
              <p className="font-bold text-emerald-700 mt-3">Valid receipt</p>
            </div>
            <div className="divide-y divide-gray-100">
              <Row label="Customer ID" value={data.customerId} />
              <Row label="Plan" value={data.planName} />
              <Row label="Amount" value={`₹${formatINR(data.amount)}`} />
              <Row label="Date" value={formatDate(data.date)} />
              <Row label="Channel" value={data.channel} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value || '—'}</span>
    </div>
  );
}
