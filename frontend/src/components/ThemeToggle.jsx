export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
    </button>
  )
}