import { useEffect, useRef, useState } from 'react';
import { brandDNA } from '../config/brand-dna';

// AI chat widget. Ships on every build and is meant to be NOTICED:
// - Launcher wears the brand accent (.btn-gold vars) with a "Chat with us"
//   label on desktop, pops in after a beat, and pulses gently until opened.
// - A proactive teaser bubble appears once per session after a few seconds;
//   dismissing it (or opening chat) keeps it away for the session.
// Friction rules: no name/email gate, tap-to-ask quick questions instead of
// typing, permanent one-tap Call + Free quote actions, conversation persists
// across page navigations (sessionStorage), and if no AI key is configured
// (501 / dev server) the panel degrades to Call + quote so it never dead-ends.
// Disable per client with `chatbot: { enabled: false }` in brand-dna.js.
const STORE_KEY = 'chat-thread';
const TEASER_KEY = 'chat-teaser-done';

export default function ChatWidget() {
  const enabled = !brandDNA.chatbot || brandDNA.chatbot.enabled !== false;
  const shortName = (brandDNA.company && brandDNA.company.shortName) || 'our team';
  const phone = brandDNA.contact && brandDNA.contact.phone;
  const telLink = (brandDNA.contact && brandDNA.contact.phoneTelLink) || (phone ? `tel:${phone}` : null);
  const assistantName = (brandDNA.chatbot && brandDNA.chatbot.assistantName) || 'Alex';
  const greeting =
    (brandDNA.chatbot && brandDNA.chatbot.greeting) ||
    `Hi, I'm ${assistantName} from ${shortName}. Ask me anything, or tap a question below.`;
  const teaserLine =
    (brandDNA.chatbot && brandDNA.chatbot.teaser) ||
    'Questions, or want a fast price? Ask me, I answer in seconds.';

  // teaser avatar: the owner photo every build ships; override via
  // chatbot.avatar, fall back to a brand-accent initial if the file is absent
  const avatarSrc = (brandDNA.chatbot && brandDNA.chatbot.avatar) || '/owner.webp';

  const [open, setOpen] = useState(false);
  const [view, setView] = useState('home');
  const [entered, setEntered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [avatarOk, setAvatarOk] = useState(true);
  const [seen, setSeen] = useState(() => {
    try { return !!sessionStorage.getItem('chat-opened'); } catch (e) { return false; }
  });
  // Starts EMPTY on a fresh session: the greeting "types in" on first open so
  // it feels like a person picked up, not a pre-printed screen.
  const [msgs, setMsgs] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (e) { /* fresh thread */ }
    return [];
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [booting, setBooting] = useState(false);
  const [offline, setOffline] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;

  // entrance, one label-flash, then the proactive teaser (each once per session)
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t1 = setTimeout(() => setEntered(true), 900);
    const timers = [t1];
    let teaserDone = false;
    try { teaserDone = !!sessionStorage.getItem(TEASER_KEY); } catch (e) { /* show it */ }
    if (!teaserDone && !reduce) {
      if (window.innerWidth >= 1024) timers.push(setTimeout(() => { if (!openRef.current) setExpanded(true); }, 1600));
      timers.push(setTimeout(() => setExpanded(false), 4400));
    }
    if (!teaserDone) {
      timers.push(setTimeout(() => { if (!openRef.current) setTeaser(true); }, 5200));
      // Phones: auto-dismiss after ~11s on screen so the popup never lingers
      // over content. Desktop keeps it until the visitor acts.
      if (window.innerWidth < 1024) {
        timers.push(setTimeout(() => {
          setTeaser(false);
          try { sessionStorage.setItem(TEASER_KEY, '1'); } catch (e) { /* fine */ }
        }, 16500));
      }
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-24))); } catch (e) { /* fine */ }
  }, [msgs]);

  useEffect(() => {
    // keep the greeting + starter chips fully in view; autoscroll only once a
    // real conversation is running
    if (logRef.current && msgs.length > 1) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [msgs, open, sending, booting]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  if (!enabled) return null;

  const dismissTeaser = () => {
    setTeaser(false);
    try { sessionStorage.setItem(TEASER_KEY, '1'); } catch (e) { /* fine */ }
  };

  const bootGreeting = () => {
    // typing beat, then the greeting arrives. Own flag so a fast visitor can
    // send immediately; greeting lands BEFORE any message they fired, never over it.
    setBooting(true);
    setTimeout(() => {
      setMsgs((m) => (m.some((x) => x.greet) ? m : [{ role: 'assistant', content: greeting, greet: true }, ...m]));
      setBooting(false);
    }, 650);
  };

  const openChat = (target) => {
    dismissTeaser();
    setSeen(true);
    try { sessionStorage.setItem('chat-opened', '1'); } catch (e) { /* fine */ }
    setOpen(true);
    setView(target || (msgs.length ? 'chat' : 'home'));
    if ((target || (msgs.length ? 'chat' : 'home')) === 'chat' && !msgs.length) bootGreeting();
  };

  const enterChat = () => {
    setView('chat');
    if (!msgs.length) bootGreeting();
  };

  const askQuestion = (q) => {
    enterChat();
    send(q);
  };

  const scrollToForm = () => {
    setOpen(false);
    const el = document.getElementById('quote') || document.getElementById('cta-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  // Long answers arrive as two bubbles, like a person sending a message and
  // then a follow-up, instead of one instant wall of text.
  const splitReply = (t) => {
    t = String(t).trim();
    if (t.length < 140) return [t];
    const m = t.match(/^([\s\S]{40,180}?[.!?])\s+([\s\S]+)$/);
    if (!m) return [t];
    // never split mid-name ("Summit Roofing Co.") or mid-abbreviation, and only
    // where a real new sentence starts, or the second bubble reads glitched
    const abbrev = /(?:\b(?:Co|Inc|Ltd|LLC|Mr|Mrs|Ms|Dr|St|No|vs|etc|approx)\.)$/i;
    if (abbrev.test(m[1]) || !/^[A-Z0-9"']/.test(m[2])) return [t];
    return [m[1], m[2]];
  };

  const send = async (preset) => {
    const text = String(preset != null ? preset : input).trim().slice(0, 1000);
    if (!text || sending) return;
    const next = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setSending(true);
    const t0 = Date.now();
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // greeting stays client-side; the server builds its own system prompt
        body: JSON.stringify({ messages: next.filter((m) => !m.greet) }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 501) {
        setOffline(true);
      } else if (r.ok && data.reply) {
        // Human pacing: hold the answer behind the typing dots for a beat
        // scaled to its length. The model answers in ~1s; a real assistant
        // would still be typing.
        const parts = splitReply(data.reply);
        const firstBeat = Math.min(1400, 550 + parts[0].length * 6);
        const elapsed = Date.now() - t0;
        if (elapsed < firstBeat) await sleep(firstBeat - elapsed);
        setMsgs((m) => [...m, { role: 'assistant', content: parts[0] }]);
        if (parts[1]) {
          await sleep(Math.min(1100, 400 + parts[1].length * 5));
          setMsgs((m) => [...m, { role: 'assistant', content: parts[1] }]);
        }
      } else {
        await sleep(600);
        setMsgs((m) => [...m, { role: 'assistant', content: data.error || 'Sorry, I dropped that one. Try again?' }]);
      }
    } catch (e) {
      setOffline(true);
    }
    setSending(false);
  };

  // short labels so all four fit beside the greeting; the sent question is fuller
  const starters = [
    { label: 'Get a free quote', q: 'How do I get a free quote?' },
    { label: 'Your services?', q: 'What services do you offer?' },
    { label: 'My area covered?', q: 'Do you cover my area?' },
    { label: 'Urgent help', q: 'I need help urgently, what should I do?' },
  ];

  const avatar = avatarOk ? (
    <img
      src={avatarSrc}
      alt=""
      onError={() => setAvatarOk(false)}
      style={{ objectPosition: '50% 25%' }}
      className="w-[40px] h-[40px] rounded-full object-cover flex-shrink-0"
    />
  ) : (
    <span
      className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 font-body font-semibold theme-keep-white text-white text-base"
      style={{ background: 'rgb(var(--accent))' }}
    >
      {shortName.charAt(0)}
    </span>
  );

  return (
    <>
      {/* One fixed column owns the corner: teaser stacks above the launcher by
          layout, so the two can never overlap at any viewport or text size. */}
      <div className="fixed right-[16px] bottom-[16px] lg:right-[24px] lg:bottom-[24px] z-50 flex flex-col items-end gap-[12px]">
      {/* teaser: reads as an incoming message from a person */}
      {teaser && !open && (
        <div
          className="chat-pop relative w-[210px] lg:w-[272px] rounded-2xl cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 3px 10px rgba(0,0,0,0.15)' }}
          onClick={() => openChat('chat')}
          role="button"
          aria-label="Open chat"
        >
          <button
            type="button"
            aria-label="Dismiss"
            onClick={(e) => { e.stopPropagation(); dismissTeaser(); }}
            className="absolute top-[8px] right-[8px] lg:top-[10px] lg:right-[10px] w-[22px] h-[22px] lg:w-[24px] lg:h-[24px] rounded-full flex items-center justify-center text-navy/35 hover:text-navy/70 hover:bg-navy/5 z-10 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-[13px] h-[13px] lg:w-[14px] lg:h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="flex items-start gap-[9px] lg:gap-[10px] p-[11px] pr-[28px] lg:p-[14px] lg:pr-[32px]">
            {avatar}
            <div className="min-w-0">
              <div className="flex items-center gap-[6px]">
                <span className="font-body font-semibold text-navy text-[12.5px] lg:text-[13px] leading-tight">{shortName}</span>
                <span className="w-[6px] h-[6px] rounded-full bg-green-500 flex-shrink-0" aria-hidden="true" />
              </div>
              <p className="teaser-clamp text-navy/75 text-[12px] lg:text-[13px] font-body leading-snug mt-[2px]">{teaserLine}</p>
              <span className="inline-block mt-[4px] lg:mt-[6px] text-[11.5px] lg:text-[12px] font-body font-semibold" style={{ color: 'rgb(var(--accent-dark))' }}>
                Reply
              </span>
            </div>
          </div>
        </div>
      )}

      {/* launcher: the owner's face so visitors instantly see a person to talk
          to; accent chat badge says what it is; flashes a labelled pill once. */}
      <button
        type="button"
        aria-label={open ? 'Close chat' : `Chat with ${shortName}`}
        onClick={() => (open ? setOpen(false) : openChat())}
        className={`chat-launcher relative flex items-center rounded-full text-white transition-all duration-300 ${entered ? 'opacity-100' : 'opacity-0'} ${open ? '' : 'chat-pulse'}`}
        style={{ height: 56, paddingLeft: 4, paddingRight: expanded && !open ? 16 : 4 }}
      >
        <span className="relative flex-shrink-0 w-[48px] h-[48px] rounded-full overflow-hidden" style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.35)' }}>
          {avatarOk ? (
            <img src={avatarSrc} alt="" onError={() => setAvatarOk(false)} style={{ objectPosition: '50% 25%' }} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center font-body font-semibold theme-keep-white text-white text-[18px]">{shortName.charAt(0)}</span>
          )}
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'rgba(10,15,26,0.55)' }}>
            <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </span>
        <span className="overflow-hidden transition-all duration-300 whitespace-nowrap font-body font-semibold theme-keep-white text-white text-[13.5px]" style={{ maxWidth: expanded && !open ? 120 : 0, marginLeft: expanded && !open ? 10 : 0 }}>
          Chat with us
        </span>
        {!open && (
          <span className="absolute -bottom-[2px] -right-[2px] w-[20px] h-[20px] rounded-full flex items-center justify-center ring-2 ring-white theme-keep-white text-white" style={{ background: 'rgb(var(--accent))' }} aria-hidden="true">
            <svg viewBox="0 0 24 24" className="w-[11px] h-[11px]" fill="currentColor" stroke="none"><path d="M12 3C6.9 3 3 6.5 3 11c0 2.2 1 4.2 2.7 5.6-.1 1-.5 2.1-1.4 3.1-.2.2 0 .6.3.6 1.9-.1 3.4-.8 4.4-1.5.9.2 1.9.4 3 .4 5.1 0 9-3.5 9-8s-3.9-8.2-9-8.2z" /></svg>
          </span>
        )}
        {!open && !seen && (
          <span className="absolute -top-[2px] -right-[2px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-red-500 theme-keep-white text-white text-[10.5px] font-body font-bold flex items-center justify-center ring-2 ring-white" aria-hidden="true">1</span>
        )}
      </button>
      </div>

      {open && (
        <div
          className="chat-panel-in fixed right-[16px] bottom-[16px] lg:right-[24px] lg:bottom-[88px] z-50 w-[calc(100vw-2rem)] max-w-[384px] rounded-2xl overflow-hidden flex flex-col bg-white"
          style={{ height: 'min(660px, 82vh)', boxShadow: '0 12px 60px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.12)' }}
          role="dialog"
          aria-label={`Chat with ${shortName}`}
        >
          {view === 'home' ? (
            <>
              {/* brand hero: gradient canvas, identity, big greeting */}
              <div className="relative px-[20px] pt-[16px] pb-[48px] flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(150deg, rgb(var(--primary-dark)) 0%, rgb(var(--primary)) 55%, rgb(var(--primary-slate)) 130%)' }}>
                <span aria-hidden="true" className="absolute -top-[48px] -right-[40px] w-[176px] h-[176px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)' }} />
                <span aria-hidden="true" className="absolute top-[56px] -left-[64px] w-[160px] h-[160px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)' }} />
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-[10px]">
                    {avatarOk ? (
                      <img src={avatarSrc} alt="" onError={() => setAvatarOk(false)} style={{ objectPosition: '50% 25%' }} className="w-[32px] h-[32px] rounded-full object-cover ring-2 ring-white/30" />
                    ) : (
                      <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center font-body font-semibold theme-keep-white text-white text-[13px] ring-2 ring-white/30" style={{ background: 'rgb(var(--accent))' }}>{shortName.charAt(0)}</span>
                    )}
                    <span className="font-body font-semibold text-white/90 text-[14px]">{shortName}</span>
                  </div>
                  <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
                <div className="relative mt-[16px]">
                  <div className="font-body font-bold theme-keep-white text-white text-[22px] leading-tight">Hi there.</div>
                  <div className="font-body font-bold text-white/55 text-[22px] leading-tight">How can we help?</div>
                </div>
              </div>

              {/* cards overlap the gradient, Intercom-style */}
              <div className="relative flex-1 overflow-y-auto px-[14px] -mt-[36px] pb-[10px] flex flex-col gap-[10px]">
                <button type="button" onClick={enterChat} className="w-full text-left bg-white rounded-2xl px-[16px] py-[14px] flex items-center gap-[12px] transition-all hover:-translate-y-0.5" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08), 0 10px 32px rgba(15,23,42,0.10)', border: '1px solid rgba(15,23,42,0.04)' }}>
                  <div className="flex -space-x-[8px] flex-shrink-0">
                    {avatarOk ? (
                      <img src={avatarSrc} alt="" style={{ objectPosition: '50% 25%' }} className="w-[32px] h-[32px] rounded-full object-cover ring-2 ring-white" />
                    ) : (
                      <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center ring-2 ring-white theme-keep-white text-white text-[12px] font-body font-semibold" style={{ background: 'rgb(var(--primary))' }}>{shortName.charAt(0)}</span>
                    )}
                    <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center ring-2 ring-white theme-keep-white text-white text-[12px] font-body font-semibold" style={{ background: 'rgb(var(--accent))' }}>{assistantName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-body font-semibold text-navy text-[14px] block">Send us a message</span>
                    <span className="font-body text-navy/55 text-[12.5px] block mt-[2px]">{assistantName} typically replies in seconds</span>
                  </div>
                  <span className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0" style={{ color: 'rgb(var(--accent))' }}>
                    <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="currentColor" stroke="none"><path d="M3.4 20.4l17.4-7.5c.8-.35.8-1.45 0-1.8L3.4 3.6c-.65-.3-1.4.2-1.4.9v5.1c0 .5.35.9.85 1l11.6 1.4-11.6 1.4c-.5.06-.85.5-.85 1v5.1c0 .7.75 1.2 1.4.9z" /></svg>
                  </span>
                </button>

                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08), 0 10px 32px rgba(15,23,42,0.10)', border: '1px solid rgba(15,23,42,0.04)' }}>
                  <div className="px-[16px] pt-[12px] pb-[4px] font-body font-semibold text-navy/45 text-[12px]">Popular questions</div>
                  {starters.map((s, i) => (
                    <button key={s.label} type="button" onClick={() => askQuestion(s.q)} className="w-full text-left px-[16px] py-[10px] flex items-center justify-between gap-[12px] hover:bg-navy/[0.03] transition-colors" style={i ? { borderTop: '1px solid rgba(15,23,42,0.06)' } : {}}>
                      <span className="font-body text-navy/85 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis">{s.label}</span>
                      <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] flex-shrink-0 text-navy/30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.08), 0 10px 32px rgba(15,23,42,0.10)', border: '1px solid rgba(15,23,42,0.04)' }}>
                  <button type="button" onClick={scrollToForm} className="w-full text-left px-[16px] py-[12px] flex items-center justify-between gap-[12px] hover:bg-navy/[0.03] transition-colors">
                    <span className="font-body font-semibold text-navy text-[13.5px]">Get a free quote</span>
                    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] flex-shrink-0" fill="none" stroke="rgb(var(--accent))" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                  {telLink && (
                    <a href={telLink} className="w-full text-left px-[16px] py-[12px] flex items-center justify-between gap-[12px] hover:bg-navy/[0.03] transition-colors block" style={{ borderTop: '1px solid rgba(15,23,42,0.06)' }}>
                      <span className="font-body font-semibold text-navy text-[13.5px]">{phone ? `Call ${phone}` : 'Call us'}</span>
                      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] flex-shrink-0" fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3.5l1.8 4.5-2.3 1.6a11 11 0 005 5l1.6-2.3L19 15.5V19a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" /></svg>
                    </a>
                  )}
                </div>
              </div>

              {/* bottom nav */}
              <div className="flex-shrink-0 flex bg-white" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
                <button type="button" className="flex-1 py-[8px] flex flex-col items-center gap-[2px]" style={{ color: 'rgb(var(--accent))' }}>
                  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
                  <span className="font-body font-semibold text-[11px]">Home</span>
                </button>
                <button type="button" onClick={enterChat} className="flex-1 py-[8px] flex flex-col items-center gap-[2px] text-navy/45 hover:text-navy/70 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 01-11.6 7.1L4 21l1.9-4.6A8 8 0 1121 12z" /></svg>
                  <span className="font-body font-medium text-[11px]">Messages</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* conversation header: back + identity */}
              <div className="flex-shrink-0 px-[8px] py-[10px] flex items-center gap-[4px] bg-white" style={{ borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
                <button type="button" aria-label="Back" onClick={() => setView('home')} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-navy/50 hover:text-navy hover:bg-navy/5 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
                </button>
                {avatarOk ? (
                  <img src={avatarSrc} alt="" onError={() => setAvatarOk(false)} style={{ objectPosition: '50% 25%' }} className="w-[34px] h-[34px] rounded-full object-cover flex-shrink-0" />
                ) : (
                  <span className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 font-body font-semibold theme-keep-white text-white text-sm" style={{ background: 'rgb(var(--accent))' }}>{shortName.charAt(0)}</span>
                )}
                <div className="min-w-0 flex-1 pl-[8px]">
                  <span className="font-body font-semibold text-navy text-[14px] block leading-tight truncate">{assistantName}</span>
                  <span className="text-navy/50 text-[11.5px] font-body flex items-center gap-[6px] mt-px whitespace-nowrap">
                    <span className="w-[6px] h-[6px] rounded-full bg-green-500 inline-block flex-shrink-0" />
                    {shortName} live chat
                  </span>
                </div>
                <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="w-[36px] h-[36px] rounded-full flex items-center justify-center text-navy/50 hover:text-navy hover:bg-navy/5 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>

              {offline ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-[12px] px-[24px] text-center bg-white">
                  <p className="text-navy/70 text-sm font-body">Live chat is warming up. Reach us right now instead:</p>
                  {telLink && (
                    <a href={telLink} className="w-full py-[12px] rounded-xl font-body font-semibold text-sm theme-keep-white text-white text-center" style={{ background: 'rgb(var(--accent))' }}>
                      {phone ? `Call ${phone}` : 'Call now'}
                    </a>
                  )}
                  <button type="button" onClick={scrollToForm} className="w-full py-[12px] rounded-xl font-body font-semibold text-sm text-navy text-center bg-white" style={{ border: '1px solid rgba(15,23,42,0.14)' }}>
                    Get a fast quote
                  </button>
                </div>
              ) : (
                <>
                  <div ref={logRef} className="flex-1 overflow-y-auto px-[14px] py-[14px] flex flex-col gap-[6px] bg-white">
                    <div className="flex-1" aria-hidden="true" />
                    {msgs.map((m, i) => {
                      const isUser = m.role === 'user';
                      const lastOfRun = !isUser && (i === msgs.length - 1 || msgs[i + 1].role === 'user');
                      return (
                        <div key={i} className={`flex items-end gap-[6px] ${isUser ? 'justify-end' : ''}`}>
                          {!isUser && (lastOfRun && !sending && !booting ? (
                            avatarOk ? (
                              <img src={avatarSrc} alt="" style={{ objectPosition: '50% 25%' }} className="w-[24px] h-[24px] rounded-full object-cover flex-shrink-0 mb-[2px]" />
                            ) : (
                              <span className="w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0 mb-[2px] theme-keep-white text-white text-[11px] font-body font-semibold" style={{ background: 'rgb(var(--accent))' }}>{shortName.charAt(0)}</span>
                            )
                          ) : (
                            <span className="w-[24px] flex-shrink-0" aria-hidden="true" />
                          ))}
                          <div
                            className={`max-w-[80%] px-[14px] py-[8px] text-[13.5px] font-body leading-snug ${isUser ? 'theme-keep-white text-white rounded-[18px] rounded-br-[5px]' : 'text-navy/90 rounded-[18px] rounded-bl-[5px]'}`}
                            style={isUser ? { background: 'rgb(var(--primary))' } : { background: 'rgba(15,23,42,0.06)' }}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                    {(sending || booting) && (
                      <div className="flex items-end gap-[6px]">
                        {avatarOk ? (
                          <img src={avatarSrc} alt="" style={{ objectPosition: '50% 25%' }} className="w-[24px] h-[24px] rounded-full object-cover flex-shrink-0 mb-[2px]" />
                        ) : (
                          <span className="w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0 mb-[2px] theme-keep-white text-white text-[11px] font-body font-semibold" style={{ background: 'rgb(var(--accent))' }}>{shortName.charAt(0)}</span>
                        )}
                        <div className="px-[14px] py-[10px] rounded-[18px] rounded-bl-[5px]" style={{ background: 'rgba(15,23,42,0.06)' }}>
                          <span className="inline-flex gap-[4px] items-center" aria-label="Assistant is typing">
                            <span className="w-[6px] h-[6px] rounded-full bg-navy/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-[6px] h-[6px] rounded-full bg-navy/30 animate-bounce" style={{ animationDelay: '120ms' }} />
                            <span className="w-[6px] h-[6px] rounded-full bg-navy/30 animate-bounce" style={{ animationDelay: '240ms' }} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 px-[14px] pt-[8px] pb-[4px] flex items-center gap-[6px] bg-white" style={{ borderTop: '1px solid rgba(15,23,42,0.08)' }}>
                    <button type="button" onClick={scrollToForm} className="flex-1 py-[8px] rounded-full font-body font-semibold text-[12.5px] theme-keep-white text-white text-center transition-opacity hover:opacity-90" style={{ background: 'rgb(var(--accent))' }}>
                      Get a free quote
                    </button>
                    {telLink && (
                      <a href={telLink} aria-label={phone ? `Call ${phone}` : 'Call now'} className="inline-flex items-center gap-[6px] px-3.5 py-[8px] rounded-full font-body font-semibold text-[12.5px] text-navy/60 hover:text-navy hover:bg-navy/5 transition-colors">
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3.5l1.8 4.5-2.3 1.6a11 11 0 005 5l1.6-2.3L19 15.5V19a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" /></svg>
                        Call
                      </a>
                    )}
                  </div>

                  <div className="flex-shrink-0 pl-[16px] pr-[8px] py-[4px] bg-white flex items-center gap-[4px]">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      maxLength={1000}
                      placeholder="Message..."
                      aria-label="Your message"
                      className="flex-1 py-[12px] text-[14px] font-body text-navy placeholder-navy/35 outline-none bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => send()}
                      disabled={sending || !input.trim()}
                      aria-label="Send message"
                      className="w-[36px] h-[36px] rounded-full flex items-center justify-center disabled:opacity-25 hover:bg-navy/5 transition-all flex-shrink-0"
                      style={{ color: 'rgb(var(--accent))' }}
                    >
                      <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="currentColor" stroke="none"><path d="M3.4 20.4l17.4-7.5c.8-.35.8-1.45 0-1.8L3.4 3.6c-.65-.3-1.4.2-1.4.9v5.1c0 .5.35.9.85 1l11.6 1.4-11.6 1.4c-.5.06-.85.5-.85 1v5.1c0 .7.75 1.2 1.4.9z" /></svg>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
