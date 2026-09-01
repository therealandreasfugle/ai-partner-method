import { Link } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';

export default function ThankYouPage() {
  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen text-center px-4 bg-grid bg-navy"
    >
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="relative max-w-xl mx-auto" style={{ zIndex: 5 }}>
        {/* Checkmark icon */}
        <div
          className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)', boxShadow: '0 8px 32px rgb(var(--accent) / 0.35)' }}
        >
          <svg className="w-10 h-10 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">MESSAGE RECEIVED</p>

        <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-4">
          THANKS FOR<br />TRUSTING US
        </h1>

        <span className="line-gold block w-12 mx-auto my-4" />

        <p className="text-cool text-base leading-relaxed mb-3">
          Your request is in. We will call you back within 5 minutes during business hours.
        </p>
        <p className="text-steel text-sm mb-8">
          Need to reach us sooner? Call us directly at{' '}
          <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="text-gold font-bold hover:text-white transition-colors">
            {brandDNA.contact.phone}
          </a>
          .
        </p>

        <Link
          to="/"
          className="btn-gold inline-block font-heading font-bold text-sm uppercase px-8 py-3 tracking-widest text-navy"
        >
          BACK TO HOME
        </Link>
      </div>
    </section>
  );
}
