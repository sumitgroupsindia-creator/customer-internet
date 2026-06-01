export default function Card({ as: Comp = 'div', interactive = false, className = '', children, ...props }) {
  const base = interactive ? 'card-interactive' : 'card';
  return (
    <Comp className={`${base} ${className}`.trim()} {...props}>
      {children}
    </Comp>
  );
}
