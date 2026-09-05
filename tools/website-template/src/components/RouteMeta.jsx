import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';

/**
 * Per-page <title>, meta description and canonical.
 *
 * Without this every route served the homepage title, which meant Google saw
 * fourteen pages with one name and the browser tab said the same thing
 * everywhere. Service and location pages are the ones that rank locally, so
 * they are the ones that most needed their own.
 *
 * Deliberately no react-helmet: one dependency-free component, one place to
 * change, and nothing for a per-client build to remember to wire up.
 *
 * ⚠️ This runs in the browser. Google renders JavaScript so it sees these,
 * but a crawler that does not will still read index.html's static tags. The
 * homepage tags in index.html are therefore still worth setting properly.
 */

const COMPANY = brandDNA.company?.name || '';
const SHORT = brandDNA.company?.shortName || COMPANY;
const CITY = brandDNA.address?.city || brandDNA.company?.serviceRegion || '';
const REGION = brandDNA.company?.serviceRegion || CITY;
const HOME_TITLE = brandDNA.meta?.title || COMPANY;
const HOME_DESC = brandDNA.meta?.description || brandDNA.company?.description || '';

const suffix = (s) => (COMPANY ? `${s} | ${COMPANY}` : s);
const inPlace = (s) => (CITY ? `${s} in ${CITY}` : s);

function findBySlug(list, slug) {
  return (Array.isArray(list) ? list : []).find((x) => x && x.slug === slug) || null;
}

/** Returns { title, description, noindex } for a pathname. */
export function metaForPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const seg = path.split('/').filter(Boolean);

  if (path === '/') {
    return { title: HOME_TITLE, description: HOME_DESC };
  }

  if (seg[0] === 'services' && seg[1]) {
    const svc = findBySlug(brandDNA.services, seg[1]);
    const name = svc?.name || seg[1].replace(/-/g, ' ');
    return {
      title: suffix(inPlace(name)),
      description:
        svc?.metaDescription ||
        svc?.short ||
        `${name} from ${COMPANY}${CITY ? `, covering ${CITY} and the surrounding area` : ''}. Get in touch for a quote.`,
    };
  }

  if (seg[0] === 'service-area' && seg[1]) {
    const loc = findBySlug(brandDNA.location_pages, seg[1]);
    const city = loc?.city || seg[1].replace(/-/g, ' ');
    return {
      title: suffix(`${SHORT} in ${city}`),
      description:
        loc?.metaDescription ||
        `${COMPANY} covers ${city}. ${brandDNA.company?.tagline || 'Get in touch for a quote.'}`,
    };
  }

  if (seg[0] === 'blog' && seg[1]) {
    const post = findBySlug(brandDNA.blog_posts, seg[1]);
    const title = post?.title || post?.heading || seg[1].replace(/-/g, ' ');
    return {
      title: suffix(title),
      description: post?.excerpt || post?.summary || post?.metaDescription || HOME_DESC,
    };
  }

  const fixed = {
    '/about': {
      title: suffix(`About ${SHORT}`),
      description: `Who we are, how we work and why ${REGION ? `people in ${REGION} ` : ''}use us.`,
    },
    '/services': {
      title: suffix('Our Services'),
      description: `Everything ${COMPANY} does${CITY ? `, across ${CITY} and the surrounding area` : ''}.`,
    },
    '/gallery': {
      title: suffix('Our Work'),
      description: `Recent jobs from ${COMPANY}. Real photos of real work.`,
    },
    '/service-areas': {
      title: suffix('Areas We Cover'),
      description: `The towns and areas ${COMPANY} covers. If you are nearby and not listed, ask.`,
    },
    '/blog': {
      title: suffix('News and Advice'),
      description: `Advice and updates from ${COMPANY}.`,
    },
    '/financing': {
      title: suffix('Finance Options'),
      description: `Ways to spread the cost of your work with ${COMPANY}.`,
    },
    '/contact': {
      title: suffix('Contact Us'),
      description: `Get in touch with ${COMPANY}${brandDNA.contact?.phone ? ` on ${brandDNA.contact.phone}` : ''}, or send an enquiry and we will come back to you.`,
    },
    '/privacy': {
      title: suffix('Privacy Policy'),
      description: `What ${COMPANY} does with your information.`,
      noindex: true,
    },
    '/terms': {
      title: suffix('Terms of Use'),
      description: `The terms covering use of the ${COMPANY} website.`,
      noindex: true,
    },
    '/thank-you': {
      title: suffix('Thank You'),
      description: 'Your message has been received.',
      noindex: true,
    },
  };

  return fixed[path] || { title: HOME_TITLE, description: HOME_DESC };
}

function setTag(selector, create, value) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  if (el.tagName === 'LINK') el.setAttribute('href', value);
  else el.setAttribute('content', value);
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description, noindex } = metaForPath(pathname);

    if (title) document.title = title;

    if (description) {
      setTag('meta[name="description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      }, description);

      setTag('meta[property="og:description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:description');
        return m;
      }, description);
    }

    if (title) {
      setTag('meta[property="og:title"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:title');
        return m;
      }, title);
    }

    const base = (brandDNA.company?.url || '').replace(/\/+$/, '');
    if (base) {
      setTag('link[rel="canonical"]', () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      }, `${base}${pathname === '/' ? '/' : pathname}`);
    }

    // Keep pages like the thank-you and the legal pages out of the index
    // without hiding them from anybody who wants to read them.
    const robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      setTag('meta[name="robots"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'robots');
        return m;
      }, 'noindex, follow');
    } else if (robots) {
      robots.setAttribute('content', 'index, follow');
    }
  }, [pathname]);

  return null;
}
