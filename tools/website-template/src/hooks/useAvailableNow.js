import { useEffect, useState } from 'react';
import { brandDNA } from '../config/brand-dna';

/**
 * Returns the current time-state in the configured business timezone.
 *
 * Single source of truth for the available-now indicator used in TopBar,
 * Navbar, MobileCtaBar, AvailableDot, and Hero.
 *
 * Output:
 *   {
 *     available: boolean,           // within open/close window today
 *     label: string,                // brand copy when available
 *     nextOpenLabel: string,        // short label for closed state
 *   }
 *
 * Closed-state label is intentionally short ("Available Mon 8:30 AM ET")
 * so it fits in the same surface area as the available-now pill.
 */
function getBusinessState() {
  const tz = brandDNA.businessHours?.tz;
  const open = brandDNA.businessHours?.open; // "HH:MM"
  const close = brandDNA.businessHours?.close; // "HH:MM"
  if (!tz || !open || !close) {
    return { available: true, hour: 0, minute: 0, weekday: 'Mon' };
  }

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false,
    }).formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === 'hour')?.value);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value);
    const weekday = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      return { available: true, hour: 0, minute: 0, weekday };
    }
    const nowMin = hour * 60 + minute;
    const [oh, om] = open.split(':').map(Number);
    const [ch, cm] = close.split(':').map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';
    const available = !isWeekend && nowMin >= openMin && nowMin < closeMin;
    return { available, hour, minute, weekday };
  } catch (e) {
    return { available: true, hour: 0, minute: 0, weekday: 'Mon' };
  }
}

/**
 * Build a short "next open" label. Always reads brandDNA.businessHours.open.
 * Returns e.g. "Available Mon 8:30 AM ET".
 */
function buildNextOpenLabel(weekday) {
  const tz = brandDNA.businessHours?.tz || 'America/New_York';
  const open = brandDNA.businessHours?.open || '08:30';
  const [oh, om] = open.split(':').map(Number);
  const period = oh >= 12 ? 'PM' : 'AM';
  const hour12 = oh === 0 ? 12 : oh > 12 ? oh - 12 : oh;
  const minStr = String(om).padStart(2, '0');
  const tzAbbr = tz === 'America/New_York' ? 'ET'
    : tz === 'America/Chicago' ? 'CT'
    : tz === 'America/Denver' ? 'MT'
    : tz === 'America/Los_Angeles' ? 'PT'
    : 'local';
  // Approximate "next open day". When closed mid-week we just say tomorrow's
  // weekday in the user's spoken language ("Mon", "Tue", etc).
  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const idx = order.indexOf(weekday);
  let nextIdx = (idx + 1) % 7;
  // Skip weekends.
  if (order[nextIdx] === 'Sat') nextIdx = (nextIdx + 2) % 7;
  if (order[nextIdx] === 'Sun') nextIdx = (nextIdx + 1) % 7;
  return `Available ${order[nextIdx]} ${hour12}:${minStr} ${period} ${tzAbbr}`;
}

/**
 * useAvailableNow returns the timezone-aware availability flag, the locked
 * display label, and the closed-state next-open label.
 *
 * Returns: { available: boolean, label: string, nextOpenLabel: string }
 */
export default function useAvailableNow() {
  // Default to "available" on first render so SSR/initial paint matches the
  // simpler layout. useEffect swaps to the real value after hydration.
  const [state, setState] = useState({ available: true, weekday: 'Mon' });

  useEffect(() => {
    const update = () => {
      const s = getBusinessState();
      setState({ available: s.available, weekday: s.weekday });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return {
    available: state.available,
    label: brandDNA.copy?.availableNow || "Available now",
    nextOpenLabel: buildNextOpenLabel(state.weekday),
  };
}
