import useAvailableNow from '../hooks/useAvailableNow';

/**
 * Rule 56 (refresh): the available-now indicator ALWAYS renders next to the
 * phone number on Nav, TopBar, Footer, and MobileCtaBar surfaces. It changes
 * state, it does not disappear:
 *   - within business hours: green dot + animate-ping + brand label
 *   - outside business hours: grey dot, no ping, short next-open label
 *
 * Driven by the shared useAvailableNow() hook so every CTA surface stays in
 * sync (timezone-aware via brandDNA.businessHours.tz).
 *
 * Props:
 *   size:      "sm" (default) | "md"
 *   label:     boolean (default true). When false renders just the dot.
 *   className: extra classes applied to the outer span.
 *   variant:   "light" (default, for dark backgrounds) | "dark" (for white
 *              backgrounds, e.g. MobileCtaBar light half).
 */
export default function AvailableDot({
  size = 'sm',
  label = true,
  className = '',
  variant = 'light',
}) {
  const { available, label: openLabel, nextOpenLabel } = useAvailableNow();

  const dotSize = size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2';
  const dotBg = available ? 'bg-green-500' : 'bg-gray-400';
  const pingBg = 'bg-green-400';

  // Text colour swaps with variant so the label reads against both dark
  // (navy) and light (white) backgrounds.
  const textColor = available
    ? (variant === 'dark' ? 'text-green-700' : 'text-green-300')
    : (variant === 'dark' ? 'text-gray-600' : 'text-cool');

  const shownLabel = available ? openLabel : nextOpenLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label={shownLabel}
      title={shownLabel}
    >
      <span className={`relative inline-flex ${dotSize}`}>
        {available && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${pingBg} opacity-75 animate-ping`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${dotBg}`} />
      </span>
      {label && (
        <span className={`font-body font-semibold text-xs uppercase tracking-wider whitespace-nowrap ${textColor}`}>
          {shownLabel}
        </span>
      )}
    </span>
  );
}
