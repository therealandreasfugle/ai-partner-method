import { brandDNA } from '../config/brand-dna';

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const areas = chunk(brandDNA.serviceAreas, 3);

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function ServiceAreas() {
  // No embed URL means no map column at all: an iframe with a null src
  // renders as a giant blank white box, which looks broken on every build
  // where the factory has no Maps embed for the client.
  const hasMap = !!brandDNA.contact.mapsEmbedUrl;
  return (
    <section id="service-area" className="py-16 bg-navy">
      <div className={`${hasMap ? 'max-w-7xl lg:grid-cols-2' : 'max-w-3xl'} mx-auto px-8 grid grid-cols-1 gap-12 items-center`}>
        {/* Left content */}
        <div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            {brandDNA.copy.serviceAreas.label}
          </p>
          <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-0">
            {brandDNA.copy.serviceAreas.heading}
          </h2>
          <span className="line-gold block w-12 my-5" />
          <p className="text-cool font-body text-sm leading-relaxed mb-8">
            {brandDNA.copy.serviceAreas.body}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {areas.map((row, ri) =>
              row.map((area, ci) => (
                <div key={`${ri}-${ci}`} className="flex items-center gap-1.5">
                  <LocationIcon />
                  <span className="font-heading font-bold text-cool text-[10px] sm:text-xs uppercase leading-tight">{area}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Google Maps embed (only when the factory set a real URL) */}
        {hasMap && (
          <div className="overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)', border: '1px solid rgba(100,116,139,0.25)' }}>
            <iframe
              title={`${brandDNA.company.name} - ${brandDNA.address.full}`}
              src={brandDNA.contact.mapsEmbedUrl}
              width="100%"
              height="280"
              className="sm:!h-[360px]"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  );
}
