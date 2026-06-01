import { useTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl text-muted hover:text-fg hover:bg-surface-2 border border-transparent hover:border-line transition-colors ${className}`.trim()}
    >
      <Icon name={isDark ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
    </button>
  );
}
