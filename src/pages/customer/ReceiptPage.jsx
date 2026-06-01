import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { formatDate, formatINR } from '../../lib/format';
import { Icon, Skeleton, EmptyState } from '../../components/ui';

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

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Skeleton className="h-5 w-40" />
        <div className="card mt-4 space-y-3">
          <Skeleton className="h-10 w-10 rounded-full mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!r) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card">
          <EmptyState
            icon="receipt"
            title="Receipt not found"
            description="We couldn't find this receipt. It may have been removed or the link is incorrect."
            action={<Link to="/me/history" className="btn-secondary text-sm"><Icon name="arrowLeft" className="w-4 h-4" /> Back to history</Link>}
          />
        </div>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${r.receiptNo}`;
  const customer = r.customer || r.customerId || {};
  const plan = r.plan || r.planSnapshot || {};
  const address = customer.address || {};
  const hasAddress = address.line1 || address.line2 || address.area || address.city || address.state || address.pincode;

  return (
    <div className="max-w-md mx-auto px-4 py-6 print:p-0">
      <div className="no-print flex items-center justify-between mb-4">
        <Link to="/me/history" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
          <Icon name="arrowLeft" className="w-4 h-4" /> Back to history
        </Link>
        <button onClick={() => window.print()} className="btn-secondary text-sm py-2">
          <Icon name="printer" className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="card print:shadow-none print:border-0">
        <div className="text-center border-b border-line pb-4">
          <img src="/favicon.svg" alt="" className="w-10 h-10 mx-auto" />
          <h2 className="font-display font-extrabold text-lg mt-2 text-fg">SUMIT NET</h2>
          <p className="text-xs text-subtle">Internet Recharge Receipt</p>
          <div className="mt-2 inline-flex">
            <span className={`badge ${r.paymentStatus === 'paid' ? 'badge-success' : r.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
              {r.paymentStatus === 'paid' && <Icon name="checkCircle" className="w-3.5 h-3.5" />}
              {(r.paymentStatus || '').toUpperCase()}
            </span>
          </div>
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

        <div className="mt-4 pt-4 border-t border-line space-y-2 text-sm">
          <Row k="Plan" v={plan.name} />
          <Row k="Speed" v={plan.speedMbps ? `${plan.speedMbps} Mbps` : (plan.speed || '—')} />
          <Row k="Duration" v={`${plan.durationDays || r.planSnapshot?.durationDays || 0} days`} />
          <Row k="Previous expiry" v={formatDate(r.previousExpiry)} />
          <Row k="New expiry" v={<strong className="text-fg">{formatDate(r.newExpiry)}</strong>} />
        </div>

        <div className="mt-4 pt-4 border-t border-line space-y-1 text-sm">
          <Row k="Base price" v={`₹${formatINR(r.basePrice ?? r.amount)}`} />
          {r.gstAmount ? <Row k={`GST (${r.gstPercent}%)`} v={`₹${formatINR(r.gstAmount)}`} /> : null}
          <Row k="Total paid" v={<strong className="text-base text-fg">₹{formatINR(r.amount)}</strong>} />
          <Row k="Payment mode" v={<span className="capitalize">{r.paymentMode}</span>} />
          <Row k="Payment status" v={<span className="capitalize">{r.paymentStatus}</span>} />
          <Row k="Payment ref." v={r.paymentRef} />
          <Row k="Razorpay payment" v={r.razorpayPaymentId} />
          <Row k="Channel" v={<span className="capitalize">{r.channel}</span>} />
        </div>

        {(hasAddress || r.notes) && (
          <div className="mt-4 pt-4 border-t border-line space-y-1 text-sm">
            {hasAddress ? (
              <>
                <div className="text-subtle">Service address</div>
                <div className="text-fg">
                  {[address.line1, address.line2, address.area, address.city, address.state, address.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </>
            ) : null}
            {r.notes ? <Row k="Notes" v={r.notes} /> : null}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-line text-center">
          <img
            alt="Verify QR"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`}
            className="mx-auto rounded-lg"
          />
          <p className="text-[11px] text-subtle mt-1">Thank you for choosing Sumit Net.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-subtle">{k}</span>
      <span className="text-fg text-right">{v || '—'}</span>
    </div>
  );
}
