"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/* ── lerp helper ───────────────────────────────────── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── Robot SVG — realistic 3D metallic ─────────────── */
function Robot({ progress }: { progress: number }) {
  const act = Math.floor(clamp(progress * 5, 0, 4.99));
  const eyeColor = act === 2 ? "#22d3ee" : "#818cf8";
  const eyeGlowR = act === 2 ? 18 : 12;
  const armL = act === 0 ? -15 : act === 2 ? -35 : act === 4 ? -25 : -5;
  const armR = act === 0 ? 15 : act === 2 ? 35 : act === 4 ? 25 : 5;
  const breathe = "animate-[floatSlow_4s_ease-in-out_infinite]";
  return (
    <svg viewBox="0 0 240 280" className={`w-full h-full ${breathe}`} fill="none">
      {/* ── Shadow on ground ── */}
      <ellipse cx="120" cy="268" rx="55" ry="8" fill="#818cf8" opacity="0.08"/>

      {/* ── Antenna ── */}
      <rect x="117" y="18" width="6" height="22" rx="3" fill="url(#metalDark)"/>
      <circle cx="120" cy="14" r="8" fill={eyeColor} opacity="0.9">
        <animate attributeName="r" values="8;6;8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Antenna glow */}
      <circle cx="120" cy="14" r={eyeGlowR} fill={eyeColor} opacity="0.12">
        <animate attributeName="r" values={`${eyeGlowR};${eyeGlowR+6};${eyeGlowR}`} dur="2.5s" repeatCount="indefinite"/>
      </circle>

      {/* ── Head ── */}
      <rect x="68" y="40" width="104" height="78" rx="22" fill="url(#headGrad)" stroke="url(#headStroke)" strokeWidth="2"/>
      {/* Head highlight (3D gloss) */}
      <rect x="74" y="44" width="92" height="30" rx="16" fill="white" opacity="0.06"/>
      {/* Ear panels */}
      <rect x="58" y="58" width="14" height="28" rx="5" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1"/>
      <rect x="168" y="58" width="14" height="28" rx="5" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1"/>
      {/* Ear lights */}
      <circle cx="65" cy="72" r="3" fill={eyeColor} opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="175" cy="72" r="3" fill={eyeColor} opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite"/></circle>
      {/* Face visor */}
      <rect x="82" y="56" width="76" height="38" rx="12" fill="#0f0a2a" stroke="#312e81" strokeWidth="1.5"/>
      <rect x="84" y="58" width="72" height="10" rx="5" fill="white" opacity="0.03"/>

      {/* ── Eyes ── */}
      {/* Left eye */}
      <circle cx="103" cy="74" r="12" fill="#1a1145"/>
      <circle cx="103" cy="74" r="9" fill={eyeColor} opacity="0.15"/>
      <circle cx="103" cy="73" r="6" fill={eyeColor}>
        <animate attributeName="r" values="6;5;6" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="101" cy="71" r="2" fill="white" opacity="0.7"/>
      {/* Right eye */}
      <circle cx="137" cy="74" r="12" fill="#1a1145"/>
      <circle cx="137" cy="74" r="9" fill={eyeColor} opacity="0.15"/>
      <circle cx="137" cy="73" r="6" fill={eyeColor}>
        <animate attributeName="r" values="6;5;6" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="135" cy="71" r="2" fill="white" opacity="0.7"/>
      {/* Eye glow */}
      <circle cx="103" cy="74" r="16" fill={eyeColor} opacity="0.06"><animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="137" cy="74" r="16" fill={eyeColor} opacity="0.06"><animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite"/></circle>

      {/* ── Mouth ── */}
      {act === 4
        ? <path d="M104 96 Q120 108 136 96" stroke="#f472b6" strokeWidth="3" fill="none" strokeLinecap="round"/>
        : <>
            <rect x="104" y="96" width="32" height="5" rx="2.5" fill="#312e81"/>
            <rect x="108" y="97" width="6" height="3" rx="1" fill={eyeColor} opacity="0.3"/>
            <rect x="117" y="97" width="6" height="3" rx="1" fill={eyeColor} opacity="0.3"/>
            <rect x="126" y="97" width="6" height="3" rx="1" fill={eyeColor} opacity="0.3"/>
          </>
      }

      {/* ── Neck ── */}
      <rect x="106" y="118" width="28" height="14" rx="4" fill="url(#metalDark)" stroke="#3730a3" strokeWidth="1"/>
      <rect x="112" y="122" width="16" height="3" rx="1" fill="#312e81"/>

      {/* ── Body ── */}
      <rect x="72" y="132" width="96" height="72" rx="16" fill="url(#bodyGrad)" stroke="url(#bodyStroke)" strokeWidth="2"/>
      {/* Body highlight */}
      <rect x="78" y="136" width="84" height="24" rx="10" fill="white" opacity="0.04"/>
      {/* Panel lines */}
      <line x1="120" y1="136" x2="120" y2="200" stroke="#312e81" strokeWidth="1" opacity="0.5"/>
      {/* Screws */}
      <circle cx="84" cy="142" r="3" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      <circle cx="156" cy="142" r="3" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      <circle cx="84" cy="194" r="3" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      <circle cx="156" cy="194" r="3" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>

      {/* ── Chest reactor/screen ── */}
      <rect x="93" y="148" width="54" height="36" rx="8" fill="#0a0520" stroke="#312e81" strokeWidth="1.5"/>
      {/* Screen gloss */}
      <rect x="95" y="150" width="50" height="8" rx="4" fill="white" opacity="0.03"/>
      {act === 2 ? <>
        <rect x="99" y="155" width="20" height="3" rx="1" fill="#34d399"><animate attributeName="width" values="10;42;10" dur="1.5s" repeatCount="indefinite"/></rect>
        <rect x="99" y="161" width="35" height="3" rx="1" fill="#818cf8"><animate attributeName="width" values="35;15;35" dur="2s" repeatCount="indefinite"/></rect>
        <rect x="99" y="167" width="15" height="3" rx="1" fill="#f472b6"><animate attributeName="width" values="15;30;15" dur="1.8s" repeatCount="indefinite"/></rect>
        <rect x="99" y="173" width="25" height="3" rx="1" fill="#fbbf24"><animate attributeName="width" values="25;10;25" dur="1.3s" repeatCount="indefinite"/></rect>
      </> : <>
        <rect x="99" y="156" width="28" height="3" rx="1" fill="#34d399"/>
        <rect x="99" y="162" width="42" height="3" rx="1" fill="#818cf8"/>
        <rect x="99" y="168" width="20" height="3" rx="1" fill="#f472b6"/>
        <rect x="99" y="174" width="34" height="3" rx="1" fill="#4ade80" opacity="0.4"/>
      </>}
      {/* Reactor glow behind screen */}
      {act === 2 && <circle cx="120" cy="168" r="30" fill="#22d3ee" opacity="0.06"><animate attributeName="r" values="28;36;28" dur="1.5s" repeatCount="indefinite"/></circle>}

      {/* ── Arms ── */}
      {/* Left arm */}
      <g transform={`rotate(${armL},72,148)`}>
        <rect x="38" y="140" width="36" height="16" rx="8" fill="url(#armGrad)" stroke="#4338ca" strokeWidth="1.5"/>
        <circle cx="40" cy="148" r="4" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1"/>
        {/* Hand */}
        <circle cx="32" cy="148" r="7" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1.5"/>
        <circle cx="32" cy="148" r="3" fill={eyeColor} opacity="0.3"/>
      </g>
      {/* Right arm */}
      <g transform={`rotate(${armR},168,148)`}>
        <rect x="166" y="140" width="36" height="16" rx="8" fill="url(#armGrad)" stroke="#4338ca" strokeWidth="1.5"/>
        <circle cx="200" cy="148" r="4" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1"/>
        {/* Hand */}
        <circle cx="208" cy="148" r="7" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1.5"/>
        <circle cx="208" cy="148" r="3" fill={eyeColor} opacity="0.3"/>
      </g>

      {/* ── Legs ── */}
      <rect x="92" y="204" width="18" height="30" rx="8" fill="url(#armGrad)" stroke="#4338ca" strokeWidth="1.5"/>
      <rect x="130" y="204" width="18" height="30" rx="8" fill="url(#armGrad)" stroke="#4338ca" strokeWidth="1.5"/>
      {/* Joints */}
      <circle cx="101" cy="206" r="4" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      <circle cx="139" cy="206" r="4" fill="#1e1b4b" stroke="#312e81" strokeWidth="1"/>
      {/* Feet */}
      <rect x="86" y="232" width="28" height="10" rx="5" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1"/>
      <rect x="126" y="232" width="28" height="10" rx="5" fill="url(#metalDark)" stroke="#4338ca" strokeWidth="1"/>

      {/* ── Overall glow ── */}
      {act === 2 && <circle cx="120" cy="150" r="90" fill={eyeColor} opacity="0.04"><animate attributeName="opacity" values="0.04;0.08;0.04" dur="2s" repeatCount="indefinite"/></circle>}

      {/* ── Defs ── */}
      <defs>
        <linearGradient id="headGrad" x1="68" y1="40" x2="172" y2="118"><stop stopColor="#4338ca"/><stop offset="0.5" stopColor="#4f46e5"/><stop offset="1" stopColor="#3730a3"/></linearGradient>
        <linearGradient id="headStroke" x1="68" y1="40" x2="172" y2="118"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#4338ca"/></linearGradient>
        <linearGradient id="bodyGrad" x1="72" y1="132" x2="168" y2="204"><stop stopColor="#3730a3"/><stop offset="0.4" stopColor="#4338ca"/><stop offset="1" stopColor="#312e81"/></linearGradient>
        <linearGradient id="bodyStroke" x1="72" y1="132" x2="168" y2="204"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#3730a3"/></linearGradient>
        <linearGradient id="metalDark" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3730a3"/><stop offset="1" stopColor="#1e1b4b"/></linearGradient>
        <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#4f46e5"/><stop offset="1" stopColor="#3730a3"/></linearGradient>
      </defs>
    </svg>
  );
}

/* ── Scroll Progress Bar ───────────────────────────── */
function ScrollBar({ progress }: { progress: number }) {
  return <div className="fixed top-0 left-0 right-0 z-[100] h-0.5"><div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" style={{ width: `${progress * 100}%` }}/></div>;
}

/* ── Particles (static positions to avoid hydration mismatch) ── */
const PARTICLES = [
  {l:5,t:12,d:18,dl:1},{l:15,t:45,d:22,dl:3},{l:25,t:78,d:14,dl:5},{l:35,t:23,d:20,dl:2},
  {l:45,t:56,d:16,dl:7},{l:55,t:89,d:24,dl:0},{l:65,t:34,d:12,dl:4},{l:75,t:67,d:19,dl:6},
  {l:85,t:11,d:21,dl:1},{l:95,t:44,d:15,dl:3},{l:10,t:90,d:23,dl:5},{l:20,t:55,d:17,dl:2},
  {l:40,t:80,d:13,dl:7},{l:60,t:15,d:25,dl:0},{l:80,t:50,d:11,dl:4},{l:92,t:72,d:20,dl:6},
];
function Particles() {
  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {PARTICLES.map((p, i) => <div key={i} className="absolute h-1 w-1 rounded-full bg-indigo-400/20" style={{ left: `${p.l}%`, top: `${p.t}%`, animation: `particle ${p.d}s linear ${p.dl}s infinite` }}/>)}
  </div>;
}

/* ── Counter ───────────────────────────────────────── */
function Counter({ target, suffix, visible }: { target: number; suffix: string; visible: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const d = 2000, s = performance.now();
    let f: number;
    const t = (n: number) => { const p = Math.min((n-s)/d, 1); setV(Math.floor(p*target)); if (p<1) f = requestAnimationFrame(t); };
    f = requestAnimationFrame(t);
    return () => cancelAnimationFrame(f);
  }, [visible, target]);
  return <>{v.toLocaleString()}{suffix}</>;
}

/* ═══════ MAIN PAGE ═══════════════════════════════════ */
export default function LandingPage() {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state for robot
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ mx: 0, my: 0 });

  useEffect(() => {
    const handler = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setDragOffset({ x: e.clientX - dragStart.current.mx, y: e.clientY - dragStart.current.my });
    };
    const onUp = () => {
      setDragging(false);
      setDragOffset({ x: 0, y: 0 });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const act = Math.floor(clamp(progress * 5, 0, 4.99));
  // Robot X: alternating sides each act, center for CTA (hidden)
  const robotX = [22, 78, 22, 78, 50][act];
  const robotY = act === 4 ? 400 : 0;
  const robotScale = act === 2 ? 1.2 : act === 4 ? 0.3 : 1;
  const robotRotate = 0;
  const robotOpacity = act === 4 ? 0 : 1;
  const bgHue = progress * 30;

  // Opacity helper: wider window so content stays visible longer
  const actOpacity = (actIdx: number) => {
    const s = actIdx * 0.2, e = s + 0.2;
    const fadeIn = actIdx === 0 ? 1 : clamp((progress - s) * 5, 0, 1);
    const fadeOut = actIdx === 4 ? 1 : clamp((e - progress) * 5, 0, 1);
    return fadeIn * fadeOut;
  };

  const actLabels = ["Welcome", "Describe", "Generate", "Ready", "Launch"];
  const speechBubbles = [
    "Hey! I build websites! 👋",
    "Tell me about your business...",
    "Generating your store... ⚡",
    "Your store is ready! 🎉",
    "Let's go live! 🚀"
  ];

  return (
    <div ref={containerRef} className="relative min-h-[500vh] bg-zinc-950 text-white" style={{ background: `linear-gradient(180deg, hsl(${240+bgHue} 15% 5%) 0%, hsl(${260+bgHue} 20% 4%) 100%)` }}>
      <ScrollBar progress={progress}/>
      <Particles/>

      {/* ── Navbar ──────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            </div>
            <span className="font-bold">StoreForge<span className="text-indigo-400">.ai</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 hidden md:flex items-center gap-1.5">
              {actLabels.map((l, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === act ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"}`} title={l}/>)}
            </div>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition px-3 py-2">Sign In</Link>
            <Link href="/login" className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── STICKY ROBOT (draggable!) ── */}
      <div
        className={`fixed z-30 hidden md:block ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          top: "50%", left: `${robotX}%`,
          transform: `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${robotY + dragOffset.y}px)) scale(${robotScale})`,
          transition: dragging ? "none" : "left 1s cubic-bezier(.4,0,.2,1), transform 0.6s cubic-bezier(.34,1.56,.64,1), opacity 0.8s ease",
          width: "220px", height: "250px",
          opacity: robotOpacity,
          userSelect: "none",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
          dragStart.current = { mx: e.clientX, my: e.clientY };
        }}
      >
        <Robot progress={progress}/>
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur shadow-xl transition-all duration-700">
          {dragging ? "Hey put me down! 😅" : speechBubbles[act]}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-zinc-900/90"/>
        </div>
        {act === 2 && <>
          <div className="absolute inset-[-30px] rounded-full border border-cyan-500/20 animate-[spin_8s_linear_infinite]"/>
          <div className="absolute inset-[-55px] rounded-full border border-purple-500/10 animate-[spin_12s_linear_infinite_reverse]"/>
        </>}
      </div>

      {/* ── Act 1: Hero ── */}
      <section className="relative flex min-h-screen items-center pt-14 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="ml-auto max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"/><span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"/></span>
              AI-Powered eCommerce Platform
            </div>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">We Build<br/><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Digital Empires</span></h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-md">Tell our AI what you need. It designs, codes, and deploys a complete eCommerce store — unique every time, ready to sell.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login" className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-4 font-bold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all">Start Building <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></Link>
              <Link href="/s/indure" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-4 font-medium text-zinc-300 hover:bg-white/10 transition">👁️ Live Demo</Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 text-xs animate-bounce"><span>Scroll to explore</span><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"/></svg></div>
      </section>

      {/* ── Act 2: Describe ── */}
      <section className="relative flex min-h-screen items-center border-t border-white/5" style={{background:'linear-gradient(180deg, rgba(88,28,135,0.06) 0%, rgba(15,15,30,1) 100%)'}}>
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="max-w-lg">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400 mb-4">Step 01 — Your Input</div>
            <h2 className="text-4xl font-black md:text-5xl">Tell Us Your <span className="text-purple-400">Vision</span></h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed">Enter your business name, select your industry, and pick a design style. Our AI handles everything else — colors, layouts, products, and content.</p>
            <div className="mt-8 space-y-3">
              {[{l:"Business Name",v:"Luxe Fashion Store"},{l:"Industry",v:"Fashion & Apparel"},{l:"Design Style",v:"Modern Premium Dark"}].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{item.l}</div>
                  <div className="text-sm text-zinc-300">{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 3: Generate ── */}
      <section className="relative flex min-h-screen items-center border-t border-white/5" style={{background:'linear-gradient(180deg, rgba(8,145,178,0.06) 0%, rgba(15,15,30,1) 100%)'}}>
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="ml-auto max-w-lg">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4">Step 02 — AI Magic</div>
            <h2 className="text-4xl font-black md:text-5xl">AI <span className="text-cyan-400">Generates</span> Everything</h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed">Our AI creates 7 fully functional pages with unique design, real products, working navigation, and responsive layouts.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["🏠 Home","🛍️ Shop","📦 Product","🛒 Cart","💳 Checkout","ℹ️ About","📧 Contact"].map((p, i) => (
                <div key={i} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-sm font-medium text-cyan-300" style={{ animation: `floatCard 4s ease-in-out ${i*0.3}s infinite` }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 4: Ready ── */}
      <section className="relative flex min-h-screen items-center border-t border-white/5" style={{background:'linear-gradient(180deg, rgba(5,150,105,0.06) 0%, rgba(15,15,30,1) 100%)'}}>
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="max-w-lg">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-4">Step 03 — Customize &amp; Launch</div>
            <h2 className="text-4xl font-black md:text-5xl">Store <span className="text-emerald-400">Ready</span></h2>
            <p className="mt-4 text-zinc-400 text-lg leading-relaxed">Use the CMS to edit pages, manage products, customize colors &amp; fonts, and export as HTML. Full control over your store.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[{n:2500,s:"+",l:"Stores Built"},{n:7,s:" Pages",l:"Per Store"},{n:30,s:"s",l:"Gen Time"},{n:99,s:"%",l:"Uptime"}].map((stat, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur text-center">
                  <div className="text-2xl font-black text-white"><Counter target={stat.n} suffix={stat.s} visible={act >= 3}/></div>
                  <div className="mt-1 text-xs text-zinc-500">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 5: CTA ── */}
      <section className="relative flex min-h-screen items-center">
        <div className="mx-auto max-w-6xl px-6 w-full">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-black md:text-6xl">Ready to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Launch</span>?</h2>
            <p className="mt-6 text-lg text-zinc-300 max-w-md mx-auto">Your AI-powered eCommerce store is just one click away. No design skills needed.</p>
            <Link href="/login" className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-black text-zinc-900 shadow-2xl shadow-white/10 hover:scale-110 hover:shadow-white/20 transition-all" style={{ animation: act === 4 ? "pulseGlow 2s ease-in-out infinite" : "none" }}>
              Start Now — Free
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm text-zinc-600">StoreForge.ai — AI eCommerce Builder</span>
          <span className="text-xs text-zinc-700">© 2026</span>
        </div>
      </footer>
    </div>
  );
}
