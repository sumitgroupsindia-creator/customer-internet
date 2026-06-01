/**
 * Dependency-free mini bar chart (pure SVG) for small dashboard widgets such
 * as "recent payments". Renders rounded brand-tinted bars with an animated
 * grow-in and accessible labels. `data` = [{ label, value }].
 */
export default function MiniBarChart({ data = [], height = 120, className = '' }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = 100 / (data.length * 1.6);
  const gap = barW * 0.6;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`.trim()}
      style={{ height }}
      role="img"
      aria-label="Recent payments chart"
    >
      {data.map((d, i) => {
        const h = Math.max((d.value / max) * (height - 18), 3);
        const x = i * (barW + gap) + gap / 2;
        const y = height - h - 14;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={Math.min(barW / 2, 3)}
              className="fill-brand-500/80"
              style={{
                transformOrigin: `${x + barW / 2}px ${height - 14}px`,
                animation: `grow-bar .6s ${i * 0.06}s cubic-bezier(.22,1,.36,1) both`,
              }}
            />
            <text
              x={x + barW / 2}
              y={height - 3}
              textAnchor="middle"
              className="fill-current text-subtle"
              style={{ fontSize: 5 }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <style>{`@keyframes grow-bar{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>
    </svg>
  );
}
