/**
 * Shared submit path for every enquiry form on the site.
 *
 * Both the hero form and the CTA banner form use this, so the two forms can
 * never drift into behaving differently, and there is exactly one place that
 * decides what "the send failed" looks like to a visitor.
 *
 * Returns { ok: true } or { ok: false, message } where message is safe to show
 * on the page. It never throws and it never reports success it did not get:
 * a lead the owner will not receive must not see a thank-you page.
 */
export async function submitLead(formEl) {
  const data = Object.fromEntries(new FormData(formEl).entries());
  data.page = typeof window !== 'undefined' ? window.location.pathname : '';

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    let payload = {};
    try { payload = await res.json(); } catch (e) { /* non-JSON error page */ }

    if (res.ok && payload.ok) return { ok: true };

    return {
      ok: false,
      message: payload.message || payload.error
        || 'We could not send that just now. Please call us and we will help right away.',
    };
  } catch (e) {
    return {
      ok: false,
      message: 'That did not send, your connection may have dropped. Please try again or call us.',
    };
  }
}
