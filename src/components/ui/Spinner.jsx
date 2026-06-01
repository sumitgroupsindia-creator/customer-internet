export default function Spinner({ className = 'w-6 h-6', label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span className={`${className} rounded-full border-2 border-brand-500/25 border-t-brand-600 animate-spin`} />
    </span>
  );
}
