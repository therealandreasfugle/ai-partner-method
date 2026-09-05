import { brandDNA } from '../config/brand-dna';

/**
 * Shared shell for the legal pages (privacy, terms).
 *
 * These pages are deliberately plain. Nobody arrives here to be sold to, they
 * arrive because they want an answer, and a hard-to-read policy is worse than
 * no policy at all.
 */
export default function LegalPage({ label, heading, updated, children }) {
  return (
    <section className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          {label}
        </p>
        <h1 className="font-heading font-bold text-navy uppercase leading-none text-4xl sm:text-5xl mb-4">
          {heading}
        </h1>
        <p className="font-body text-steel text-sm mb-12">Last updated {updated}</p>

        <div className="legal-prose font-body text-navy/90 text-[15px] leading-relaxed">
          {children}
        </div>

        <p className="font-body text-steel text-sm mt-14 pt-8 border-t border-navy/10">
          Questions about anything on this page? Email{' '}
          <a className="underline hover:text-navy" href={`mailto:${brandDNA.contact.email}`}>
            {brandDNA.contact.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}

export function LegalHeading({ children }) {
  return (
    <h2 className="font-heading font-bold text-navy uppercase text-xl mt-10 mb-3 first:mt-0">
      {children}
    </h2>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
