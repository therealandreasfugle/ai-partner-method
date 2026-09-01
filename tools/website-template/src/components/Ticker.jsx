import { brandDNA } from '../config/brand-dna';

const items = Array.from({ length: 5 }, () => brandDNA.company.name.toUpperCase());

export default function Ticker() {
  return (
    <div className="py-[12px] overflow-hidden theme-keep-dark bg-navy">
      <div className="flex items-center justify-around gap-[16px] px-[24px]">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-[12px] whitespace-nowrap">
            <span className="w-[7px] h-[7px] rotate-45 flex-shrink-0" style={{ background: 'rgb(var(--accent))' }} aria-hidden="true" />
            <span className="theme-keep-white text-white font-heading font-bold text-sm uppercase tracking-widest">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
