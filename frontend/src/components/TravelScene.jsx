import React from 'react';

/*
 * "Departures" — an animated parallax scene for the 5Star landing page, built
 * entirely from inline SVG + CSS keyframes (no external assets, no libraries).
 *
 * Layers, back to front:
 *   1. Gradient terminal backdrop + soft gold glow
 *   2. Twinkling stars
 *   3. Drifting clouds (slow parallax)
 *   4. Dotted flight arc with a plane tracing it
 *   5. Scrolling city skyline silhouette
 *   6. A moving conveyor belt on the floor
 *   7. Three 5Star items riding the belt: a wheeled trolley (spinning wheels +
 *      swinging luggage tag), a duffel bag (bobbing), and a jerkin on a hanger
 *      (swaying)
 *   8. A small headline lockup so the strip reads as a designed section
 *
 * All colours come from theme variables, so it adapts to every 5Star theme.
 * Fully disabled under `prefers-reduced-motion`.
 */
const TravelScene = () => (
  <div className="travel-scene" aria-hidden="true">
    <style>{`
      .travel-scene {
        position: relative;
        width: 100%;
        height: 320px;
        overflow: hidden;
        background:
          radial-gradient(120% 80% at 50% 118%, rgba(var(--accent-rgb),0.16) 0%, transparent 58%),
          linear-gradient(180deg, var(--black-rich) 0%, var(--black-surface) 62%, #efe4c6 100%);
      }
      @media (max-width: 640px) { .travel-scene { height: 240px; } }

      .ts-layer { position: absolute; inset: 0; z-index: 1; }

      /* ---- glow ---- */
      .ts-glow {
        position: absolute; left: 50%; bottom: -60px; width: 720px; height: 280px;
        transform: translateX(-50%);
        background: radial-gradient(closest-side, rgba(var(--accent-rgb),0.18), transparent 72%);
        animation: tsGlow 6s ease-in-out infinite alternate;
        z-index: 0;
      }

      /* ---- stars ---- */
      .ts-star { position: absolute; color: var(--gold-bright); animation: tsTwinkle 3s ease-in-out infinite; z-index: 1; }
      .ts-star.s2 { animation-delay: .7s; } .ts-star.s3 { animation-delay: 1.4s; }
      .ts-star.s4 { animation-delay: 2.1s; } .ts-star.s5 { animation-delay: .3s; }
      .ts-star.s6 { animation-delay: 1.9s; }

      /* ---- clouds (parallax) ---- */
      .ts-cloud { position: absolute; fill: var(--black-muted); opacity: .5; z-index: 1; }
      .ts-cloud.c1 { top: 34px;  animation: tsDrift 46s linear infinite; }
      .ts-cloud.c2 { top: 92px;  opacity: .32; transform: scale(.7); animation: tsDrift 66s linear infinite; animation-delay: -20s; }
      .ts-cloud.c3 { top: 20px;  opacity: .38; transform: scale(1.15); animation: tsDrift 82s linear infinite; animation-delay: -50s; }

      /* ---- flight arc + plane ---- */
      .ts-arc { fill: none; stroke: var(--gold); stroke-width: 2; stroke-dasharray: 2 8; stroke-linecap: round; opacity: .55; }
      .ts-plane {
        offset-path: path('M -40 150 C 260 40, 620 40, 1000 130');
        offset-rotate: auto;
        animation: tsFly 9s linear infinite;
      }
      .ts-plane svg { display: block; }

      /* ---- skyline ---- */
      .ts-skyline {
        position: absolute; left: 0; bottom: 56px; width: 200%; height: 120px;
        display: flex;
        animation: tsScrollSkyline 40s linear infinite;
        opacity: .4;
        z-index: 2;
      }
      .ts-skyline svg { flex: 0 0 50%; height: 100%; }

      /* ---- conveyor belt ---- */
      .ts-belt {
        position: absolute; left: 0; right: 0; bottom: 0; height: 58px;
        background:
          linear-gradient(180deg, #efe1bd 0%, #e6d5ac 55%, #ddca9c 100%);
        border-top: 3px solid var(--gold);
        box-shadow: 0 -8px 22px -8px rgba(var(--accent-rgb),0.35);
        z-index: 3;
      }
      .ts-belt::before {
        content: ''; position: absolute; left: 0; right: 0; top: 16px; height: 10px;
        background: repeating-linear-gradient(115deg,
          rgba(140,103,8,0.55) 0 7px, transparent 7px 30px);
        animation: tsBelt 1s linear infinite;
      }
      .ts-belt::after {
        content: ''; position: absolute; left: 0; right: 0; bottom: 9px; height: 5px;
        background: repeating-linear-gradient(90deg,
          rgba(140,103,8,0.35) 0 4px, transparent 4px 11px);
      }

      /* ---- riders ---- */
      .ts-rig { position: absolute; bottom: 30px; z-index: 4; }
      .ts-trolley { left: -320px; animation: tsRideA 16s linear infinite; animation-delay: -2s; }
      .ts-duffel  { left: -220px; animation: tsRideB 16s linear infinite; animation-delay: -8s; }
      .ts-jerkin  { left: -200px; animation: tsRideC 16s linear infinite; animation-delay: -13s; }

      .ts-bob    { animation: tsBob .9s ease-in-out infinite alternate; }
      .ts-bob-sm { animation: tsBob 1.1s ease-in-out infinite alternate; }
      .ts-swing  { animation: tsSwing 2s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: top center; }
      .ts-swing-slow { animation: tsSwing 3s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: top center; }
      .ts-wheel  { animation: tsSpin .6s linear infinite; transform-box: fill-box; transform-origin: center; }

      /* ---- headline ---- */
      .ts-headline {
        position: absolute; left: 0; right: 0; top: 30px; text-align: center;
        pointer-events: none; z-index: 4;
      }
      .ts-headline .kicker {
        font-family: var(--font-accent); font-size: .68rem; letter-spacing: .32em;
        text-transform: uppercase; color: var(--gold-dark); opacity: .9;
      }
      .ts-headline .title {
        font-family: var(--font-heading); font-weight: 400;
        font-size: clamp(1.25rem, 3.4vw, 2rem); color: var(--text-primary);
        margin-top: .15rem; letter-spacing: .02em;
      }
      .ts-headline .title b { color: var(--gold-dark); font-weight: 400; }
      @media (max-width: 640px) { .ts-headline { top: 18px; } }

      /* ---- keyframes ---- */
      @keyframes tsRideA { 0% { left: -320px; } 100% { left: calc(100% + 60px); } }
      @keyframes tsRideB { 0% { left: -260px; } 100% { left: calc(100% + 120px); } }
      @keyframes tsRideC { 0% { left: -240px; } 100% { left: calc(100% + 140px); } }
      @keyframes tsBob   { from { transform: translateY(0); } to { transform: translateY(-5px); } }
      @keyframes tsSwing { from { transform: rotate(-8deg); } to { transform: rotate(8deg); } }
      @keyframes tsSpin  { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      @keyframes tsBelt  { from { background-position-x: 0; } to { background-position-x: -44px; } }
      @keyframes tsTwinkle { 0%,100% { opacity: .12; transform: scale(.7); } 50% { opacity: .95; transform: scale(1.15); } }
      @keyframes tsDrift { from { transform: translateX(-30%); } to { transform: translateX(130%); } }
      @keyframes tsFly   { from { offset-distance: 0%; } to { offset-distance: 100%; } }
      @keyframes tsScrollSkyline { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes tsGlow  { from { opacity: .55; } to { opacity: 1; } }

      @media (prefers-reduced-motion: reduce) {
        .ts-glow, .ts-star, .ts-cloud, .ts-plane, .ts-skyline, .ts-belt::before,
        .ts-trolley, .ts-duffel, .ts-jerkin, .ts-bob, .ts-bob-sm, .ts-swing,
        .ts-swing-slow, .ts-wheel { animation: none !important; }
        .ts-trolley { left: 8%; } .ts-duffel { left: 44%; } .ts-jerkin { left: 74%; }
      }
    `}</style>

    <div className="ts-glow" />

    {/* stars */}
    {[
      { c: 's1', top: '20%', left: '12%', s: 16 },
      { c: 's2', top: '30%', left: '30%', s: 11 },
      { c: 's3', top: '15%', left: '52%', s: 13 },
      { c: 's4', top: '38%', left: '70%', s: 10 },
      { c: 's5', top: '22%', left: '86%', s: 14 },
      { c: 's6', top: '46%', left: '44%', s: 9 }
    ].map((st) => (
      <div key={st.c} className={`ts-star ${st.c}`} style={{ top: st.top, left: st.left }}>
        <svg width={st.s} height={st.s} viewBox="0 0 24 24">
          <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" fill="currentColor" />
        </svg>
      </div>
    ))}

    {/* clouds */}
    <svg className="ts-cloud c1" width="150" height="46" viewBox="0 0 150 46">
      <path d="M20 40c-11 0-20-8-20-18S9 4 20 4c4 0 8 1 11 4 3-6 9-8 15-8 10 0 18 8 18 18 8 0 14 6 14 14s-6 14-14 14z" />
    </svg>
    <svg className="ts-cloud c2" width="150" height="46" viewBox="0 0 150 46">
      <path d="M20 40c-11 0-20-8-20-18S9 4 20 4c4 0 8 1 11 4 3-6 9-8 15-8 10 0 18 8 18 18 8 0 14 6 14 14s-6 14-14 14z" />
    </svg>
    <svg className="ts-cloud c3" width="150" height="46" viewBox="0 0 150 46">
      <path d="M20 40c-11 0-20-8-20-18S9 4 20 4c4 0 8 1 11 4 3-6 9-8 15-8 10 0 18 8 18 18 8 0 14 6 14 14s-6 14-14 14z" />
    </svg>

    {/* flight arc + plane */}
    <svg className="ts-layer" preserveAspectRatio="none" viewBox="0 0 1000 340">
      <path className="ts-arc" d="M -40 150 C 260 40, 620 40, 1000 130" />
    </svg>
    <div className="ts-plane">
      <svg width="34" height="34" viewBox="0 0 24 24">
        <path d="M2 12l19-8-4 8 4 8-19-8 6-0z" fill="var(--gold)" stroke="var(--gold-dark)" strokeWidth="0.8" strokeLinejoin="round" />
      </svg>
    </div>

    {/* scrolling skyline */}
    <div className="ts-skyline">
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 600 120" preserveAspectRatio="none">
          <g fill="var(--black-muted)">
            <rect x="0" y="60" width="46" height="60" />
            <rect x="52" y="34" width="34" height="86" />
            <rect x="92" y="72" width="40" height="48" />
            <rect x="138" y="20" width="30" height="100" />
            <rect x="174" y="52" width="52" height="68" />
            <rect x="232" y="40" width="28" height="80" />
            <rect x="266" y="66" width="44" height="54" />
            <rect x="316" y="10" width="26" height="110" />
            <rect x="348" y="48" width="48" height="72" />
            <rect x="402" y="60" width="34" height="60" />
            <rect x="442" y="30" width="30" height="90" />
            <rect x="478" y="70" width="46" height="50" />
            <rect x="530" y="44" width="30" height="76" />
            <rect x="566" y="58" width="34" height="62" />
          </g>
          <g fill="var(--gold-bright)" opacity="0.7">
            <rect x="150" y="30" width="6" height="6" /><rect x="150" y="44" width="6" height="6" />
            <rect x="324" y="20" width="6" height="6" /><rect x="324" y="36" width="6" height="6" />
            <rect x="60" y="44" width="5" height="5" /><rect x="450" y="42" width="5" height="5" />
          </g>
        </svg>
      ))}
    </div>

    {/* headline */}
    <div className="ts-headline">
      <div className="kicker">Now Boarding</div>
      <div className="title">Packed for <b>every journey</b></div>
    </div>

    {/* conveyor belt */}
    <div className="ts-belt" />

    {/* ---- Rider 1: wheeled trolley + swinging tag ---- */}
    <div className="ts-rig ts-trolley">
      <svg width="150" height="140" viewBox="0 0 150 140" className="ts-bob">
        <ellipse cx="72" cy="132" rx="66" ry="7" fill="var(--black-muted)" opacity="0.3" />

        {/* telescopic handle */}
        <rect x="94" y="2" width="8" height="66" rx="4" fill="var(--gold-dark)" />
        <rect x="70" y="2" width="36" height="8" rx="4" fill="var(--gold)" />

        {/* body */}
        <rect x="24" y="40" width="84" height="78" rx="12" fill="var(--gold)" />
        <rect x="24" y="40" width="84" height="78" rx="12" fill="none" stroke="var(--gold-dark)" strokeWidth="2.5" />
        <line x1="44" y1="46" x2="44" y2="112" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.45" />
        <line x1="66" y1="46" x2="66" y2="112" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.45" />
        <line x1="88" y1="46" x2="88" y2="112" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.45" />
        {/* corner guards */}
        <path d="M24 52a12 12 0 0 1 12-12h4v6H24z" fill="var(--gold-dark)" opacity="0.55" />
        <path d="M108 52a12 12 0 0 0-12-12h-4v6h16z" fill="var(--gold-dark)" opacity="0.55" />
        {/* 5 badge */}
        <rect x="52" y="66" width="28" height="26" rx="4" fill="var(--gold-pale)" stroke="var(--gold-dark)" strokeWidth="1.5" />
        <text x="66" y="86" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="18" fill="var(--gold-dark)">5</text>

        {/* wheels */}
        <g className="ts-wheel"><circle cx="42" cy="122" r="10" fill="var(--text-primary)" /><circle cx="42" cy="122" r="4" fill="var(--gold-bright)" /></g>
        <g className="ts-wheel"><circle cx="94" cy="122" r="10" fill="var(--text-primary)" /><circle cx="94" cy="122" r="4" fill="var(--gold-bright)" /></g>

        {/* swinging luggage tag */}
        <g className="ts-swing">
          <line x1="86" y1="8" x2="86" y2="22" stroke="var(--gold-dark)" strokeWidth="2.5" />
          <path d="M74 22 h24 a5 5 0 0 1 5 5 v14 l-17 14 -17 -14 v-14 a5 5 0 0 1 5 -5z" fill="var(--black-card)" stroke="var(--gold)" strokeWidth="2" />
          <circle cx="86" cy="28" r="2.4" fill="var(--gold)" />
          <text x="86" y="44" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="10" fill="var(--gold-dark)">5★</text>
        </g>
      </svg>
    </div>

    {/* ---- Rider 2: duffel bag ---- */}
    <div className="ts-rig ts-duffel">
      <svg width="150" height="110" viewBox="0 0 150 110" className="ts-bob-sm">
        <ellipse cx="75" cy="102" rx="62" ry="6" fill="var(--black-muted)" opacity="0.3" />
        {/* barrel body */}
        <rect x="16" y="44" width="118" height="50" rx="25" fill="var(--gold)" stroke="var(--gold-dark)" strokeWidth="2.5" />
        <path d="M16 69 h118" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.35" />
        {/* end cap */}
        <ellipse cx="30" cy="69" rx="10" ry="25" fill="var(--gold-light)" stroke="var(--gold-dark)" strokeWidth="2" />
        {/* zip */}
        <path d="M40 52 h84" stroke="var(--gold-dark)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
        <circle cx="124" cy="52" r="3" fill="var(--gold-dark)" />
        {/* handles */}
        <path d="M56 44 q19 -20 38 0" fill="none" stroke="var(--gold-dark)" strokeWidth="4" strokeLinecap="round" />
        <rect x="66" y="30" width="18" height="7" rx="3.5" fill="var(--gold-dark)" />
        {/* 5 patch */}
        <rect x="66" y="60" width="20" height="20" rx="3" fill="var(--gold-pale)" stroke="var(--gold-dark)" strokeWidth="1.4" />
        <text x="76" y="75" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="13" fill="var(--gold-dark)">5</text>
      </svg>
    </div>

    {/* ---- Rider 3: jerkin on a hanger ---- */}
    <div className="ts-rig ts-jerkin">
      <svg width="120" height="150" viewBox="0 0 120 150">
        {/* hanger hook fixed to belt-height, jerkin swings from it */}
        <g className="ts-swing-slow">
          {/* hanger */}
          <path d="M60 8 a5 5 0 1 1 4 8" fill="none" stroke="var(--gold-dark)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 34 L60 16 L96 34" fill="none" stroke="var(--gold-dark)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="24" y1="34" x2="96" y2="34" stroke="var(--gold-dark)" strokeWidth="3" strokeLinecap="round" />

          {/* jerkin body */}
          <path d="M22 34
                   L38 24 L46 26
                   Q60 36 74 26 L82 24 L98 34
                   L108 52 L96 62 L92 56
                   L92 128 Q60 140 28 128
                   L28 56 L24 62 L12 52 Z"
                fill="var(--gold)" stroke="var(--gold-dark)" strokeWidth="2.5" strokeLinejoin="round" />
          {/* zip */}
          <line x1="60" y1="30" x2="60" y2="130" stroke="var(--gold-dark)" strokeWidth="2.5" />
          {/* collar */}
          <path d="M46 26 Q60 40 74 26" fill="none" stroke="var(--gold-dark)" strokeWidth="2.5" />
          {/* pockets */}
          <rect x="34" y="92" width="16" height="16" rx="2" fill="none" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.55" />
          <rect x="70" y="92" width="16" height="16" rx="2" fill="none" stroke="var(--gold-dark)" strokeWidth="2" opacity="0.55" />
          {/* 5 star chest badge */}
          <path d="M60 52 l2.1 4.4 4.8.7-3.5 3.4.85 4.8L60 67.7l-4.25 2.3.85-4.8-3.5-3.4 4.8-.7z" fill="var(--gold-pale)" stroke="var(--gold-dark)" strokeWidth="1" />
        </g>
      </svg>
    </div>
  </div>
);

export default TravelScene;
