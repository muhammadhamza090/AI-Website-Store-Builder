import type { GeneratedWebsite } from "@/lib/site-schema";

export type ThemeVariant =
  | "editorial"
  | "boutique"
  | "modern"
  | "minimal"
  | "campaign"
  | "retro"
  | "brutalist"
  | "organic";

export type ThemeProfile = {
  variant: ThemeVariant;
  frameClass: string;
  shellClass: string;
  contentWidthClass: string;
  pagePaddingClass: string;
  sectionGapClass: string;
  navClass: string;
  navInnerClass: string;
  navLinkClass: string;
  navUtilityClass: string;
  promoBarClass: string;
  footerClass: string;
  footerGridClass: string;
  heroClass: string;
  heroInnerClass: string;
  heroVisualClass: string;
  heroSupportClass: string;
  panelClass: string;
  softPanelClass: string;
  categoryCardClass: string;
  categoryAccentClass: string;
  buttonPrimaryClass: string;
  buttonSecondaryClass: string;
  productCardClass: string;
  productCardInteractiveClass: string;
  productContentClass: string;
  productMetaClass: string;
  productImageClass: string;
  productAspectClass: string;
  productButtonClass: string;
  titleClass: string;
  chipClass: string;
};

export function getThemeVariant(website: GeneratedWebsite): ThemeVariant {
  const fingerprint = [
    website.site.layoutStyle,
    website.meta?.generationStyle ?? "",
    website.meta?.notes ?? "",
    website.site.typography.style
  ]
    .join(" ")
    .toLowerCase();

  if (/(brutalist|industrial|raw|disruptive|monolith)/.test(fingerprint)) return "brutalist";
  if (/(retro|nostalgic|playful|character-rich|expressive|vibrant)/.test(fingerprint)) return "retro";
  if (/(campaign|promotional|retail|sale|conversion-led|energetic|urgency)/.test(fingerprint)) return "campaign";
  if (/(organic|artisan|grounded|botanical|earthy|natural|handmade)/.test(fingerprint)) return "organic";
  if (/(editorial|luxury|magazine|story|serif-led|immersive|premium narrative)/.test(fingerprint)) return "editorial";
  if (/(boutique|warm|soft|lifestyle|welcoming|refined|curated)/.test(fingerprint)) return "boutique";
  if (/(tech|modern|grid|futur|catalog|structured|precise|clean ui)/.test(fingerprint)) return "modern";
  return "minimal";
}

export function getThemeProfile(website: GeneratedWebsite): ThemeProfile {
  return getThemeProfileByVariant(getThemeVariant(website));
}

export function getThemeProfileByVariant(variant: ThemeVariant): ThemeProfile {

  switch (variant) {
    case "editorial":
      return {
        variant,
        frameClass: "rounded-[34px] border-stone-200 shadow-[0_30px_90px_rgba(28,25,23,0.11)]",
        shellClass: "bg-[radial-gradient(circle_at_top,_rgba(120,113,108,0.14),_transparent_44%),linear-gradient(180deg,_#fafaf9_0%,_#f5f5f4_100%)]",
        contentWidthClass: "max-w-7xl",
        pagePaddingClass: "px-4 py-12 md:px-8 md:py-14",
        sectionGapClass: "space-y-12 md:space-y-16",
        navClass: "border-stone-200 bg-white/70",
        navInnerClass: "gap-8 py-4",
        navLinkClass: "text-[13px] tracking-[0.14em] uppercase text-stone-700 hover:text-stone-950",
        navUtilityClass: "rounded-full border-stone-200 bg-white/90",
        promoBarClass: "border-b border-stone-200/80 bg-stone-100/80 text-stone-700",
        footerClass: "border-stone-200 bg-stone-50/85",
        footerGridClass: "md:grid-cols-[1.3fr_.7fr_.7fr_1fr]",
        heroClass: "rounded-[36px] border-stone-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(245,245,244,0.88))]",
        heroInnerClass: "md:grid-cols-[1.1fr_.9fr] p-8 md:p-12",
        heroVisualClass: "rounded-[28px] border-stone-200 bg-white/80 p-6 md:p-7",
        heroSupportClass: "rounded-[22px] border-stone-200 bg-stone-50/85 p-4",
        panelClass: "border-stone-200 bg-white/92 rounded-[28px]",
        softPanelClass: "border-stone-200 bg-stone-50/84 rounded-[24px]",
        categoryCardClass: "rounded-[24px] border-stone-200 bg-white/92",
        categoryAccentClass: "bg-stone-100 text-stone-700",
        buttonPrimaryClass: "rounded-full bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-full border-stone-200 bg-white text-zinc-900",
        productCardClass: "rounded-[28px] border-stone-200 bg-white/92",
        productCardInteractiveClass: "hover:-translate-y-1.5 hover:shadow-[0_26px_56px_rgba(41,37,36,0.14)]",
        productContentClass: "p-5 md:p-6",
        productMetaClass: "text-stone-600",
        productImageClass: "from-stone-100 via-white to-stone-50",
        productAspectClass: "aspect-[4/4.8]",
        productButtonClass: "rounded-full",
        titleClass: "tracking-tight",
        chipClass: "rounded-full border-black/5 bg-white/70"
      };
    case "boutique":
      return {
        variant,
        frameClass: "rounded-[30px] border-rose-100 shadow-[0_30px_80px_rgba(136,19,55,0.11)]",
        shellClass: "bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.16),_transparent_38%),linear-gradient(180deg,_#fffafc_0%,_#fff1f2_100%)]",
        contentWidthClass: "max-w-6xl",
        pagePaddingClass: "px-4 py-10 md:px-6 md:py-12",
        sectionGapClass: "space-y-10 md:space-y-14",
        navClass: "border-rose-100 bg-white/82",
        navInnerClass: "gap-6 py-4",
        navLinkClass: "text-sm text-rose-900/80 hover:text-rose-950",
        navUtilityClass: "rounded-full border-rose-100 bg-white",
        promoBarClass: "border-b border-rose-100/80 bg-rose-50/90 text-rose-900/70",
        footerClass: "border-rose-100 bg-rose-50/72",
        footerGridClass: "md:grid-cols-[1.2fr_.8fr_.8fr_1fr]",
        heroClass: "rounded-[30px] border-rose-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(255,241,242,0.9))]",
        heroInnerClass: "md:grid-cols-[1fr_.95fr] p-8 md:p-10",
        heroVisualClass: "rounded-[24px] border-rose-100 bg-white/90 p-6",
        heroSupportClass: "rounded-[18px] border-rose-100 bg-rose-50/92 p-4",
        panelClass: "border-rose-100 bg-white/92 rounded-[24px]",
        softPanelClass: "border-rose-100 bg-rose-50/76 rounded-[22px]",
        categoryCardClass: "rounded-[22px] border-rose-100 bg-white/92",
        categoryAccentClass: "bg-rose-100 text-rose-700",
        buttonPrimaryClass: "rounded-full bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-full border-rose-100 bg-white text-zinc-900",
        productCardClass: "rounded-[24px] border-rose-100 bg-white/92",
        productCardInteractiveClass: "hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(190,24,93,0.16)]",
        productContentClass: "p-5",
        productMetaClass: "text-rose-900/70",
        productImageClass: "from-rose-50 via-white to-amber-50",
        productAspectClass: "aspect-[4/4.6]",
        productButtonClass: "rounded-full",
        titleClass: "tracking-tight",
        chipClass: "rounded-full border-white/40 bg-white/78"
      };
    case "modern":
      return {
        variant,
        frameClass: "rounded-[24px] border-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.14)]",
        shellClass: "bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]",
        contentWidthClass: "max-w-6xl",
        pagePaddingClass: "px-4 py-10 md:px-6 md:py-12",
        sectionGapClass: "space-y-9 md:space-y-12",
        navClass: "border-slate-200 bg-slate-50/84",
        navInnerClass: "gap-5 py-3.5",
        navLinkClass: "text-[13px] font-medium uppercase tracking-[0.12em] text-slate-700 hover:text-slate-950",
        navUtilityClass: "rounded-xl border-slate-200 bg-white/90",
        promoBarClass: "border-b border-slate-200 bg-slate-100/80 text-slate-700",
        footerClass: "border-slate-200 bg-slate-50/92",
        footerGridClass: "md:grid-cols-[1.4fr_.8fr_.8fr_1fr]",
        heroClass: "rounded-[22px] border-slate-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(224,231,255,0.86))]",
        heroInnerClass: "md:grid-cols-[1.05fr_.95fr] p-7 md:p-9",
        heroVisualClass: "rounded-[18px] border-slate-200 bg-white/92 p-5",
        heroSupportClass: "rounded-[16px] border-slate-200 bg-slate-50/96 p-4",
        panelClass: "border-slate-200 bg-white/96 rounded-[18px]",
        softPanelClass: "border-slate-200 bg-slate-50/94 rounded-[18px]",
        categoryCardClass: "rounded-[18px] border-slate-200 bg-white/96",
        categoryAccentClass: "bg-slate-100 text-slate-700",
        buttonPrimaryClass: "rounded-xl bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-xl border-slate-200 bg-white text-zinc-900",
        productCardClass: "rounded-[18px] border-slate-200 bg-white",
        productCardInteractiveClass: "hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(37,99,235,0.14)]",
        productContentClass: "p-4",
        productMetaClass: "text-slate-600",
        productImageClass: "from-slate-100 via-indigo-50 to-cyan-50",
        productAspectClass: "aspect-[4/4.2]",
        productButtonClass: "rounded-xl",
        titleClass: "tracking-tight uppercase",
        chipClass: "rounded-xl border-slate-200 bg-white/80"
      };
    case "campaign":
      return {
        variant,
        frameClass: "rounded-[20px] border-orange-200 shadow-[0_34px_90px_rgba(234,88,12,0.12)]",
        shellClass: "bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_36%),linear-gradient(180deg,_#fff7ed_0%,_#fff1f2_100%)]",
        contentWidthClass: "max-w-7xl",
        pagePaddingClass: "px-4 py-8 md:px-6 md:py-10",
        sectionGapClass: "space-y-8 md:space-y-10",
        navClass: "border-orange-200 bg-white/88",
        navInnerClass: "gap-5 py-3",
        navLinkClass: "text-[12px] font-semibold uppercase tracking-[0.18em] text-orange-950/80 hover:text-orange-950",
        navUtilityClass: "rounded-md border-orange-200 bg-white",
        promoBarClass: "border-b border-orange-200 bg-orange-100/90 text-orange-950",
        footerClass: "border-orange-200 bg-orange-50/75",
        footerGridClass: "md:grid-cols-[1.2fr_.8fr_.8fr_1fr]",
        heroClass: "rounded-[20px] border-orange-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.94),_rgba(254,215,170,0.85))]",
        heroInnerClass: "md:grid-cols-[1fr_1fr] p-7 md:p-8",
        heroVisualClass: "rounded-[16px] border-orange-200 bg-white/92 p-5",
        heroSupportClass: "rounded-[12px] border-orange-200 bg-orange-50/92 p-4",
        panelClass: "border-orange-200 bg-white/95 rounded-[18px]",
        softPanelClass: "border-orange-200 bg-orange-50/78 rounded-[18px]",
        categoryCardClass: "rounded-[18px] border-orange-200 bg-white/95",
        categoryAccentClass: "bg-orange-100 text-orange-700",
        buttonPrimaryClass: "rounded-md bg-[var(--site-primary,#4f46e5)] text-white uppercase tracking-[0.12em]",
        buttonSecondaryClass: "rounded-md border-orange-200 bg-white text-zinc-900 uppercase tracking-[0.12em]",
        productCardClass: "rounded-[18px] border-orange-200 bg-white",
        productCardInteractiveClass: "hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(234,88,12,0.18)]",
        productContentClass: "p-4",
        productMetaClass: "text-orange-950/70",
        productImageClass: "from-amber-100 via-white to-rose-100",
        productAspectClass: "aspect-[4/4]",
        productButtonClass: "rounded-md uppercase tracking-[0.1em]",
        titleClass: "tracking-[-0.04em] uppercase",
        chipClass: "rounded-md border-orange-200 bg-white/84 uppercase tracking-[0.14em]"
      };
    case "retro":
      return {
        variant,
        frameClass: "rounded-[36px] border-violet-200 shadow-[0_32px_80px_rgba(124,58,237,0.14)]",
        shellClass: "bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.12),_transparent_34%),linear-gradient(180deg,_#fffdf7_0%,_#fef3c7_100%)]",
        contentWidthClass: "max-w-6xl",
        pagePaddingClass: "px-4 py-10 md:px-7 md:py-12",
        sectionGapClass: "space-y-10 md:space-y-14",
        navClass: "border-violet-200 bg-white/84",
        navInnerClass: "gap-5 py-4",
        navLinkClass: "text-sm font-semibold text-violet-950/75 hover:text-violet-950",
        navUtilityClass: "rounded-[14px] border-violet-200 bg-white",
        promoBarClass: "border-b border-violet-200 bg-amber-100/70 text-violet-950",
        footerClass: "border-violet-200 bg-amber-50/74",
        footerGridClass: "md:grid-cols-[1.2fr_.8fr_.8fr_1fr]",
        heroClass: "rounded-[36px] border-violet-200 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(243,232,255,0.88))]",
        heroInnerClass: "md:grid-cols-[1fr_.95fr] p-8 md:p-10",
        heroVisualClass: "rounded-[28px] border-violet-200 bg-white/92 p-6",
        heroSupportClass: "rounded-[22px] border-violet-200 bg-violet-50/90 p-4",
        panelClass: "border-violet-200 bg-white/95 rounded-[30px]",
        softPanelClass: "border-violet-200 bg-violet-50/76 rounded-[26px]",
        categoryCardClass: "rounded-[28px] border-violet-200 bg-white/95",
        categoryAccentClass: "bg-violet-100 text-violet-700",
        buttonPrimaryClass: "rounded-[18px] bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-[18px] border-violet-200 bg-white text-zinc-900",
        productCardClass: "rounded-[28px] border-violet-200 bg-white/94",
        productCardInteractiveClass: "hover:-translate-y-1.5 hover:rotate-[-1deg] hover:shadow-[0_24px_46px_rgba(109,40,217,0.18)]",
        productContentClass: "p-5",
        productMetaClass: "text-violet-950/70",
        productImageClass: "from-violet-100 via-amber-50 to-orange-100",
        productAspectClass: "aspect-[4/4.4]",
        productButtonClass: "rounded-[18px]",
        titleClass: "tracking-[-0.03em]",
        chipClass: "rounded-[18px] border-violet-200 bg-white/78"
      };
    case "brutalist":
      return {
        variant,
        frameClass: "rounded-none border-black shadow-[14px_14px_0_rgba(0,0,0,0.08)]",
        shellClass: "bg-[linear-gradient(180deg,_#ffffff_0%,_#f4f4f5_100%)]",
        contentWidthClass: "max-w-7xl",
        pagePaddingClass: "px-4 py-7 md:px-6 md:py-9",
        sectionGapClass: "space-y-7 md:space-y-9",
        navClass: "border-black bg-white",
        navInnerClass: "gap-6 py-3",
        navLinkClass: "text-[12px] font-bold uppercase tracking-[0.2em] text-black",
        navUtilityClass: "rounded-none border-black bg-white",
        promoBarClass: "border-b border-black bg-lime-200 text-black",
        footerClass: "border-black bg-zinc-100",
        footerGridClass: "md:grid-cols-[1.3fr_.7fr_.7fr_1fr]",
        heroClass: "rounded-none border-black bg-white",
        heroInnerClass: "md:grid-cols-[1fr_1fr] p-6 md:p-8",
        heroVisualClass: "rounded-none border-black bg-zinc-100 p-5",
        heroSupportClass: "rounded-none border-black bg-white p-4",
        panelClass: "border-black bg-white rounded-none",
        softPanelClass: "border-black bg-zinc-100 rounded-none",
        categoryCardClass: "rounded-none border-black bg-white",
        categoryAccentClass: "bg-lime-200 text-black",
        buttonPrimaryClass: "rounded-none bg-black text-white uppercase tracking-[0.16em]",
        buttonSecondaryClass: "rounded-none border-black bg-white text-black uppercase tracking-[0.16em]",
        productCardClass: "rounded-none border-black bg-white",
        productCardInteractiveClass: "hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.08)]",
        productContentClass: "p-4",
        productMetaClass: "text-zinc-700",
        productImageClass: "from-zinc-200 via-white to-zinc-100",
        productAspectClass: "aspect-square",
        productButtonClass: "rounded-none uppercase tracking-[0.14em]",
        titleClass: "tracking-[-0.06em] uppercase",
        chipClass: "rounded-none border-black bg-white uppercase tracking-[0.16em]"
      };
    case "organic":
      return {
        variant,
        frameClass: "rounded-[34px] border-emerald-100 shadow-[0_30px_80px_rgba(16,185,129,0.10)]",
        shellClass: "bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_38%),linear-gradient(180deg,_#f8fffb_0%,_#f0fdf4_100%)]",
        contentWidthClass: "max-w-6xl",
        pagePaddingClass: "px-4 py-10 md:px-6 md:py-12",
        sectionGapClass: "space-y-10 md:space-y-14",
        navClass: "border-emerald-100 bg-white/80",
        navInnerClass: "gap-6 py-4",
        navLinkClass: "text-sm text-emerald-950/80 hover:text-emerald-950",
        navUtilityClass: "rounded-full border-emerald-100 bg-white",
        promoBarClass: "border-b border-emerald-100 bg-emerald-100/80 text-emerald-950",
        footerClass: "border-emerald-100 bg-emerald-50/74",
        footerGridClass: "md:grid-cols-[1.2fr_.8fr_.8fr_1fr]",
        heroClass: "rounded-[34px] border-emerald-100 bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(220,252,231,0.86))]",
        heroInnerClass: "md:grid-cols-[1fr_.95fr] p-8 md:p-10",
        heroVisualClass: "rounded-[28px] border-emerald-100 bg-white/92 p-6",
        heroSupportClass: "rounded-[22px] border-emerald-100 bg-emerald-50/92 p-4",
        panelClass: "border-emerald-100 bg-white/95 rounded-[26px]",
        softPanelClass: "border-emerald-100 bg-emerald-50/78 rounded-[24px]",
        categoryCardClass: "rounded-[26px] border-emerald-100 bg-white/95",
        categoryAccentClass: "bg-emerald-100 text-emerald-700",
        buttonPrimaryClass: "rounded-full bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-full border-emerald-100 bg-white text-zinc-900",
        productCardClass: "rounded-[26px] border-emerald-100 bg-white/95",
        productCardInteractiveClass: "hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(5,150,105,0.14)]",
        productContentClass: "p-5",
        productMetaClass: "text-emerald-950/75",
        productImageClass: "from-emerald-50 via-lime-50 to-white",
        productAspectClass: "aspect-[4/4.5]",
        productButtonClass: "rounded-full",
        titleClass: "tracking-tight",
        chipClass: "rounded-full border-emerald-100 bg-white/80"
      };
    case "minimal":
    default:
      return {
        variant: "minimal",
        frameClass: "rounded-[18px] border-zinc-200 shadow-sm",
        shellClass: "bg-white",
        contentWidthClass: "max-w-5xl",
        pagePaddingClass: "px-4 py-8 md:px-6 md:py-10",
        sectionGapClass: "space-y-8 md:space-y-10",
        navClass: "border-zinc-200 bg-white/80",
        navInnerClass: "gap-5 py-3",
        navLinkClass: "text-sm text-zinc-700 hover:text-zinc-900",
        navUtilityClass: "rounded-md border-zinc-200 bg-white",
        promoBarClass: "border-b border-zinc-200 bg-zinc-50 text-zinc-700",
        footerClass: "border-zinc-200 bg-white",
        footerGridClass: "md:grid-cols-[1.4fr_.7fr_.7fr_1fr]",
        heroClass: "rounded-2xl border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",
        heroInnerClass: "md:grid-cols-[1fr_.92fr] p-7 md:p-8",
        heroVisualClass: "rounded-xl border-zinc-200 bg-white p-5",
        heroSupportClass: "rounded-xl border-zinc-200 bg-zinc-50 p-4",
        panelClass: "border-zinc-200 bg-white rounded-2xl",
        softPanelClass: "border-zinc-200 bg-zinc-50 rounded-xl",
        categoryCardClass: "rounded-xl border-zinc-200 bg-white",
        categoryAccentClass: "bg-zinc-100 text-zinc-700",
        buttonPrimaryClass: "rounded-full bg-[var(--site-primary,#4f46e5)] text-white",
        buttonSecondaryClass: "rounded-full border-zinc-200 bg-white text-zinc-900",
        productCardClass: "rounded-xl border-zinc-200 bg-white",
        productCardInteractiveClass: "hover:-translate-y-0.5 hover:shadow-md",
        productContentClass: "p-4",
        productMetaClass: "text-zinc-600",
        productImageClass: "from-zinc-50 to-zinc-100",
        productAspectClass: "aspect-[4/4.2]",
        productButtonClass: "rounded-full",
        titleClass: "tracking-tight",
        chipClass: "rounded-full border-black/5 bg-white/70"
      };
  }
}

export function getFontStacks(website: GeneratedWebsite) {
  const fingerprint = `${website.site.typography.headingFont} ${website.site.typography.style}`.toLowerCase();

  if (/(serif|editorial|classic|elegant|luxury)/.test(fingerprint)) {
    return {
      heading: "Georgia, 'Times New Roman', serif",
      body: "ui-sans-serif, system-ui, sans-serif"
    };
  }

  if (/(mono|tech|industrial|brutalist)/.test(fingerprint)) {
    return {
      heading: "'Courier New', monospace",
      body: "ui-sans-serif, system-ui, sans-serif"
    };
  }

  if (/(humanist|soft|friendly|organic)/.test(fingerprint)) {
    return {
      heading: "'Trebuchet MS', 'Segoe UI', sans-serif",
      body: "'Segoe UI', system-ui, sans-serif"
    };
  }

  if (/(retro|playful|display)/.test(fingerprint)) {
    return {
      heading: "'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif",
      body: "'Segoe UI', system-ui, sans-serif"
    };
  }

  return {
    heading: "'Arial Narrow', Arial, sans-serif",
    body: "ui-sans-serif, system-ui, sans-serif"
  };
}

export function getSectionLayoutClass(layout?: string | null, variant?: ThemeVariant) {
  const normalized = (layout ?? "").toLowerCase();

  if (/(split|asymmetric|editorial)/.test(normalized)) return "md:grid-cols-[1.2fr_.8fr]";
  if (/(showcase|gallery|masonry)/.test(normalized)) return "sm:grid-cols-2 lg:grid-cols-3";
  if (/(dense|catalog|grid-heavy)/.test(normalized)) return "sm:grid-cols-2 lg:grid-cols-4";
  if (/(minimal|stack|single-column)/.test(normalized)) return "grid-cols-1";
  if (variant === "campaign") return "sm:grid-cols-2 lg:grid-cols-4";
  if (variant === "retro") return "sm:grid-cols-2 lg:grid-cols-3";
  if (variant === "brutalist") return "sm:grid-cols-2 lg:grid-cols-4";
  if (variant === "organic") return "sm:grid-cols-2 md:grid-cols-3";
  if (variant === "editorial") return "sm:grid-cols-2 lg:grid-cols-3";
  if (variant === "modern") return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 md:grid-cols-4";
}
