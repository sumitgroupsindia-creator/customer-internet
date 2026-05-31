import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, formatINR } from '../../lib/format';

export default function ReceiptPage() {
  const { id } = useParams();
  const { data: r, isLoading } = useQuery({
    queryKey: ['me-receipt', id],
    queryFn: () => api.get(`/internet/me/recharges/${id}`).then((res) => res.data),
  });

  useEffect(() => {
    // Auto-open print dialog once data is loaded
    if (r) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [r]);

  if (isLoading) return <div className="max-w-md mx-auto px-4 py-12 text-gray-500">Loading…</div>;
  if (!r) return <div className="max-w-md mx-auto px-4 py-12 text-gray-500">Receipt not found.</div>;

  const verifyUrl = `${window.location.origin}/verify/${r.receiptNo}`;
  const customer = r.customer || r.customerId || {};
  const plan = r.plan || r.planSnapshot || {};
  const address = customer.address || {};
  const hasAddress = address.line1 || address.line2 || address.area || address.city || address.state || address.pincode;

  return (
    <div className="max-w-md mx-auto px-4 py-6 print:p-0">
      <div className="no-print flex items-center justify-between mb-4">
        <Link to="/me/history" className="text-sm text-brand-700">← Back to history</Link>
        <button onClick={() => window.print()} className="btn-secondary text-sm">🖨 Print</button>
      </div>

      <div className="card print:shadow-none print:border-0">
        <div className="text-center border-b border-gray-200 pb-4">
          <img src="/favicon.svg" alt="" className="w-10 h-10 mx-auto" />
          <h2 className="font-extrabold text-lg mt-2">SUMIT NET</h2>
          <p className="text-xs text-gray-500">Internet Recharge Receipt</p>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row k="Receipt no." v={<span className="font-mono">{r.receiptNo}</span>} />
          <Row k="Date" v={formatDate(r.createdAt)} />
          <Row k="Customer" v={customer.name} />
          <Row k="Customer ID" v={<span className="font-mono">{customer.customerId || r.customerId?.customerId}</span>} />
          <Row k="Mobile" v={customer.mobile} />
          <Row k="Alternate mobile" v={customer.alternateMobile} />
          <Row k="Email" v={customer.email} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
          <Row k="Plan" v={plan.name} />
          <Row k="Speed" v={plan.speedMbps ? `${plan.speedMbps} Mbps` : (plan.speed || '—')} />
          <Row k="Duration" v={`${plan.durationDays || r.planSnapshot?.durationDays || 0} days`} />
          <Row k="Previous expiry" v={formatDate(r.previousExpiry)} />
          <Row k="New expiry" v={<strong>{formatDate(r.newExpiry)}</strong>} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
          <Row k="Base price" v={`₹${formatINR(r.basePrice ?? r.amount)}`} />
          {r.gstAmount ? <Row k={`GST (${r.gstPercent}%)`} v={`₹${formatINR(r.gstAmount)}`} /> : null}
          <Row k="Total paid" v={<strong className="text-base">₹{formatINR(r.amount)}</strong>} />
          <Row k="Payment mode" v={<span className="capitalize">{r.paymentMode}</span>} />
          <Row k="Payment status" v={<span className="capitalize">{r.paymentStatus}</span>} />
          <Row k="Payment ref." v={r.paymentRef} />
          <Row k="Razorpay payment" v={r.razorpayPaymentId} />
          <Row k="Channel" v={<span className="capitalize">{r.channel}</span>} />
        </div>

        {(hasAddress || r.notes) && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
            {hasAddress ? (
              <>
                <div className="text-gray-500">Service address</div>
                <div className="text-gray-900">
                  {[address.line1, address.line2, address.area, address.city, address.state, address.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </>
            ) : null}
            {r.notes ? <Row k="Notes" v={r.notes} /> : null}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <img
            alt="Verify QR"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`}
            className="mx-auto"
          />
          <p className="text-[11px] text-gray-400 mt-1">Thank you for choosing Sumit Net.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-900 text-right">{v || '—'}</span>
    </div>
  );
}
