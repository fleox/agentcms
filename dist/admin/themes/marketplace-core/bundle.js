import { jsx as d, jsxs as f, Fragment as ci } from "react/jsx-runtime";
import { i18n as K, pickPublicLocale as le, canonicalUrl as di, pickFormat as ae, FontSelect as bn, MediaPicker as pi, pickMediaUrl as St, getCurrentPublishContext as ui } from "@agent-cms/runtime";
import O, { forwardRef as qt, createElement as lt, useState as fe, createRef as hi, memo as fi, createContext as Xn, version as yn, useContext as mi, useRef as gi, useEffect as xn, useMemo as bi } from "react";
import { useTranslation as ee } from "react-i18next";
import yi, { flushSync as xi } from "react-dom";
const vn = `/* Marketplace Core — hand-written theme stylesheet (no Tailwind
   build for the external scaffold to keep \`npm install\` light). All
   rules use CSS variables for the Material 3 palette, so the
   Theme Settings → Style tab can swap them at upload time via
   compileCss. */
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

:root {
  --color-background: 249 249 255;
  --color-surface: 249 249 255;
  --color-surface-container-lowest: 255 255 255;
  --color-surface-container-low: 241 243 255;
  --color-surface-container: 233 237 255;
  --color-surface-container-high: 227 232 249;
  --color-surface-container-highest: 221 226 243;
  --color-on-surface: 22 28 40;
  --color-on-surface-variant: 67 70 85;
  --color-outline: 116 118 134;
  --color-outline-variant: 196 197 215;
  --color-primary: 0 55 176;
  --color-on-primary: 255 255 255;
  --color-primary-container: 29 78 216;
  --color-on-primary-container: 202 211 255;
  --color-secondary: 70 72 212;
  --color-on-secondary: 255 255 255;
  --color-tertiary: 101 0 174;
  --color-on-tertiary: 255 255 255;
  --color-success: 46 125 50;
  --color-success-container: 232 245 233;
  --font-headline: "Hanken Grotesk";
  --font-body: "Inter";
}

/* ───── Reset / base ───── */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: rgb(var(--color-background));
  color: rgb(var(--color-on-surface));
  font-family: var(--font-body), Inter, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; height: auto; }
button {
  font-family: inherit;
  cursor: pointer;
  border: 0;
  background: transparent;
  padding: 0;
}

/* ───── Material Symbols ───── */
.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  vertical-align: middle;
  line-height: 1;
  font-size: 24px;
}

/* ───── Typography helpers ───── */
.font-headline {
  font-family: var(--font-headline), "Hanken Grotesk", system-ui, sans-serif;
}
.text-display-lg {
  font-size: 48px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em;
}
.text-headline-lg { font-size: 32px; line-height: 1.2; font-weight: 700; letter-spacing: -0.01em; }
.text-headline-md { font-size: 24px; line-height: 1.3; font-weight: 600; }
.text-body-lg { font-size: 18px; line-height: 1.6; }
.text-body-md { font-size: 16px; line-height: 1.5; }
.text-label-md { font-size: 14px; font-weight: 600; line-height: 1; letter-spacing: 0.02em; }
@media (max-width: 768px) {
  .text-display-lg { font-size: 36px; }
  .text-headline-lg { font-size: 28px; }
}

/* ───── Layout shell ───── */
.mp-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.mp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(var(--color-surface));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  /* Scroll-hide: the inline script in BaseLayout toggles
     \`.is-hidden\` based on scroll direction (down → hide, up or
     near top → show). We use translateY rather than display so
     the transition runs smoothly. \`will-change\` hints the
     browser to keep this on a compositing layer. */
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
.mp-header.is-hidden {
  transform: translateY(-100%);
  box-shadow: none;
}
.mp-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 24px;
}
.mp-brand {
  font-family: var(--font-headline);
  font-size: 28px;
  font-weight: 800;
  color: rgb(var(--color-primary));
  letter-spacing: -0.01em;
}
.mp-header__nav {
  display: none;
  align-items: center;
  gap: 24px;
}
.mp-nav-link {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--color-on-surface-variant));
  padding: 8px 12px;
  border-radius: 9999px;
  transition: background 0.2s, color 0.2s;
}
.mp-nav-link:hover { background: rgb(var(--color-surface-container)); color: rgb(var(--color-on-surface)); }
.mp-nav-link.is-active { background: rgb(var(--color-primary)); color: rgb(var(--color-on-primary)); }
.mp-header__langswitch {
  /* Sits between the nav and the search input. Collapsed when
     the multilang plugin hasn't injected entries yet (empty
     attribute) so it doesn't push spacing around. */
  --cms-langswitch-on: rgb(var(--color-on-primary));
  color: rgb(var(--color-on-surface-variant));
  margin-left: 8px;
}
.mp-header__langswitch[data-cms-langswitch-empty] { display: none; }
.mp-header__langswitch .cms-langswitch__current { background: rgb(var(--color-primary)); }
.mp-footer__langswitch {
  --cms-langswitch-on: rgb(var(--color-on-primary));
  color: rgb(var(--color-on-surface-variant));
  margin-right: 12px;
}
.mp-footer__langswitch[data-cms-langswitch-empty] { display: none; }
.mp-footer__langswitch .cms-langswitch__current { background: rgb(var(--color-primary)); }

.mp-header__search {
  flex: 1;
  max-width: 480px;
  display: none;
}
.mp-search-input {
  width: 100%;
  background: rgb(var(--color-surface-container));
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  color: rgb(var(--color-on-surface));
  outline: none;
  cursor: pointer;
  text-overflow: ellipsis;
}
.mp-search-input:hover {
  background: rgb(var(--color-surface-container-high));
}
.mp-search-input:focus {
  border-color: rgb(var(--color-primary));
  background: rgb(var(--color-surface-container-lowest));
}
@media (min-width: 768px) {
  .mp-header__nav { display: flex; }
  .mp-header__search { display: block; }
}

.mp-layout {
  display: flex;
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  gap: 24px;
}
@media (min-width: 768px) {
  .mp-layout { padding: 0 24px; }
}

.mp-sidebar {
  display: none;
  width: 280px;
  flex-shrink: 0;
  padding-top: 24px;
}
@media (min-width: 1024px) {
  .mp-sidebar {
    display: block;
    position: sticky;
    top: 88px;
    height: calc(100vh - 88px);
    overflow-y: auto;
  }
}
.mp-sidebar__heading {
  font-family: var(--font-headline);
  font-size: 24px;
  font-weight: 700;
  color: rgb(var(--color-on-surface));
  margin: 0 0 16px 8px;
}
.mp-sidebar__group { margin-bottom: 24px; }
.mp-sidebar__label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--color-on-surface-variant));
  padding: 0 12px;
  margin-bottom: 8px;
}
.mp-sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--color-on-surface-variant));
  transition: background 0.15s, color 0.15s;
}
.mp-sidebar__link:hover { background: rgb(var(--color-surface-container)); color: rgb(var(--color-on-surface)); }
.mp-sidebar__link.is-active { background: rgb(var(--color-primary-container)); color: rgb(var(--color-on-primary-container)); }
.mp-sidebar__link .material-symbols-outlined { font-size: 20px; }

.mp-main {
  flex: 1;
  min-width: 0;
  padding: 24px 0 64px;
}

/* ───── Cards (product card — Level 1 elevation) ───── */
.mp-card {
  background: rgb(var(--color-surface-container-lowest));
  border-radius: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: block;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.mp-card:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}
.mp-card__image {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: rgb(var(--color-surface-container));
  object-fit: cover;
}
.mp-card__body { padding: 20px 24px 24px; }
.mp-card__category {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--color-primary));
  margin-bottom: 6px;
}
.mp-card__title {
  font-family: var(--font-headline);
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--color-on-surface));
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}
.mp-card__excerpt {
  font-size: 14px;
  color: rgb(var(--color-on-surface-variant));
  margin: 0 0 16px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mp-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.mp-card__author {
  font-size: 13px;
  color: rgb(var(--color-on-surface-variant));
  display: flex;
  align-items: center;
  gap: 8px;
}
.mp-badge-free {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--color-success));
  background: rgb(var(--color-success-container));
  padding: 4px 10px;
  border-radius: 9999px;
}

/* ───── Grid layouts ───── */
.mp-grid { display: grid; gap: 24px; }
.mp-grid--3 { grid-template-columns: 1fr; }
@media (min-width: 640px) { .mp-grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .mp-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.mp-grid--2 { grid-template-columns: 1fr; }
@media (min-width: 768px) { .mp-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.mp-section { margin-bottom: 64px; }
.mp-section__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.mp-section__heading h2 {
  font-family: var(--font-headline);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.mp-section__see-all {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--color-primary));
}

/* ───── Hero banner ───── */
.mp-hero {
  position: relative;
  background: linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-tertiary)) 100%);
  border-radius: 32px;
  overflow: hidden;
  padding: 56px 48px;
  color: rgb(var(--color-on-primary));
  margin-bottom: 64px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.mp-hero__eyebrow {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.85;
  margin-bottom: 12px;
}
.mp-hero h1 {
  font-family: var(--font-headline);
  font-size: 36px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
  max-width: 680px;
}
@media (min-width: 768px) {
  .mp-hero h1 { font-size: 48px; }
}
.mp-hero p {
  font-size: 18px;
  line-height: 1.6;
  max-width: 580px;
  opacity: 0.95;
  margin: 0 0 24px;
}

/* ───── Buttons ───── */
.mp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 14px 28px;
  transition: opacity 0.15s, transform 0.1s, box-shadow 0.2s;
  min-height: 48px;
}
.mp-btn:active { transform: scale(0.98); }
a.mp-btn { text-decoration: none; }
.mp-btn.mp-btn--primary {
  background: rgb(var(--color-primary));
  color: rgb(var(--color-on-primary));
  box-shadow: 0 6px 20px rgba(0, 55, 176, 0.25);
}
.mp-btn.mp-btn--primary:hover { opacity: 0.92; color: rgb(var(--color-on-primary)); }
.mp-btn.mp-btn--secondary {
  background: rgb(var(--color-surface-container));
  color: rgb(var(--color-primary));
  border: 1px solid rgb(var(--color-outline-variant));
}
.mp-btn.mp-btn--secondary:hover { background: rgb(var(--color-surface-container-high)); }
.mp-btn.mp-btn--ghost {
  background: rgb(var(--color-surface));
  color: rgb(var(--color-on-surface));
}
.mp-btn.mp-btn--ghost:hover { background: rgb(var(--color-surface-container)); }

/* ───── Single page ───── */
.mp-product {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 64px;
}
@media (min-width: 1024px) {
  .mp-product { grid-template-columns: 7fr 5fr; }
}
.mp-product__gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mp-product__hero-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: rgb(var(--color-surface-container));
  border-radius: 24px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.mp-product__thumbs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.mp-product__thumb {
  aspect-ratio: 1 / 1;
  background: rgb(var(--color-surface-container));
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.mp-product__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mp-product__thumb:hover, .mp-product__thumb.is-active { border-color: rgb(var(--color-primary)); }
.mp-product__hero-image { cursor: zoom-in; }

.mp-product__info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mp-product__category {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--color-primary));
}
.mp-product__title {
  font-family: var(--font-headline);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}
.mp-product__author {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgb(var(--color-on-surface-variant));
  font-size: 14px;
}
.mp-product__author img {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  object-fit: cover;
  background: rgb(var(--color-surface-container));
}
.mp-product__excerpt {
  font-size: 18px;
  line-height: 1.6;
  color: rgb(var(--color-on-surface-variant));
}
.mp-product__cta-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.mp-product__cta-row .mp-btn { flex: 1; }

/* ───── Sections inside single (description, body prose) ───── */
.mp-section-heading {
  font-family: var(--font-headline);
  font-size: 24px;
  font-weight: 700;
  border-bottom: 1px solid rgb(var(--color-outline-variant));
  padding-bottom: 16px;
  margin: 48px 0 24px;
}
.mp-prose {
  font-size: 16px;
  line-height: 1.7;
  color: rgb(var(--color-on-surface));
  max-width: 720px;
}
.mp-prose p { margin: 0 0 16px; }
.mp-prose h2 {
  font-family: var(--font-headline);
  font-size: 24px;
  font-weight: 700;
  margin: 32px 0 16px;
}
.mp-prose h3 {
  font-family: var(--font-headline);
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px;
}
.mp-prose ul, .mp-prose ol { padding-left: 24px; margin: 0 0 16px; }
.mp-prose ul { list-style: disc; }
.mp-prose ol { list-style: decimal; }
.mp-prose li { margin-bottom: 6px; }
.mp-prose a {
  color: rgb(var(--color-primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}
.mp-prose img {
  border-radius: 16px;
  margin: 24px 0;
}
.mp-prose code {
  background: rgb(var(--color-surface-container));
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: ui-monospace, Menlo, monospace;
}
.mp-prose pre {
  background: rgb(var(--color-surface-container));
  padding: 16px;
  border-radius: 12px;
  overflow-x: auto;
  margin: 16px 0;
}

/* ───── Specs block ───── */
.mp-specs {
  background: rgb(var(--color-surface-container-lowest));
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.mp-specs__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 32px;
}
@media (max-width: 640px) {
  .mp-specs__grid { grid-template-columns: 1fr; }
}
.mp-specs__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mp-specs__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--color-on-surface-variant));
}
.mp-specs__value {
  font-size: 16px;
  color: rgb(var(--color-on-surface));
  font-weight: 500;
}

/* ───── Features bento ───── */
.mp-features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .mp-features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.mp-features__item {
  background: rgb(var(--color-surface-container-lowest));
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mp-features__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgb(var(--color-primary-container));
  color: rgb(var(--color-on-primary-container));
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-features__icon .material-symbols-outlined { font-size: 28px; color: rgb(var(--color-on-primary));}
.mp-features__title {
  font-family: var(--font-headline);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

/* ───── Author profile card ───── */
.mp-author-card {
  background: rgb(var(--color-surface-container-lowest));
  border-radius: 32px;
  padding: 32px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-bottom: 48px;
}
@media (min-width: 768px) {
  .mp-author-card { flex-direction: row; align-items: flex-start; }
}
.mp-author-card__avatar {
  width: 120px;
  height: 120px;
  border-radius: 9999px;
  background: rgb(var(--color-surface-container));
  object-fit: cover;
  flex-shrink: 0;
}
.mp-author-card__info { flex: 1; text-align: center; }
@media (min-width: 768px) { .mp-author-card__info { text-align: left; } }
.mp-author-card__name {
  font-family: var(--font-headline);
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}
.mp-author-card__title {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--color-primary));
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.mp-author-card__bio { color: rgb(var(--color-on-surface-variant)); margin: 0; }

/* ───── Breadcrumb ───── */
.mp-breadcrumb {
  font-size: 13px;
  color: rgb(var(--color-on-surface-variant));
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mp-breadcrumb a:hover { color: rgb(var(--color-primary)); }
.mp-breadcrumb__sep { opacity: 0.6; }

/* ───── Footer ───── */
.mp-footer {
  background: rgb(var(--color-surface));
  padding: 48px 24px 32px;
  border-top: 1px solid rgb(var(--color-outline-variant));
}
.mp-footer__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 768px) {
  .mp-footer__inner { flex-direction: row; align-items: center; justify-content: space-between; }
}
.mp-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.mp-footer__nav a {
  font-size: 14px;
  color: rgb(var(--color-on-surface-variant));
}
.mp-footer__nav a:hover { color: rgb(var(--color-primary)); }
.mp-footer__copyright {
  font-size: 13px;
  color: rgb(var(--color-on-surface-variant));
}

/* ───── Mobile bottom nav ───── */
.mp-bottom-nav {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgb(var(--color-surface));
  border-top: 1px solid rgb(var(--color-outline-variant));
  z-index: 40;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  /* Scroll-hide: paired with \`.mp-header\` via the same script.
     Slides off the bottom of the viewport when the user scrolls
     down, slides back when they reverse or land near the top. */
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}
.mp-bottom-nav.is-hidden {
  transform: translateY(100%);
}
@media (min-width: 1024px) { .mp-bottom-nav { display: none; } }
.mp-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--color-on-surface-variant));
  padding: 8px 4px;
}
.mp-bottom-nav__item.is-active { color: rgb(var(--color-primary)); }
.mp-bottom-nav__item .material-symbols-outlined { font-size: 24px; }

/* Add bottom padding on mobile main canvas so content doesn't sit
   under the bottom nav. */
@media (max-width: 1023px) {
  .mp-app { padding-bottom: 72px; }
}

/* ───── Filter tabs ───── */
.mp-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgb(var(--color-outline-variant));
  overflow-x: auto;
}
.mp-tabs__tab {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--color-on-surface-variant));
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.mp-tabs__tab.is-active {
  color: rgb(var(--color-primary));
  border-bottom-color: rgb(var(--color-primary));
}

/* ───── 404 ───── */
.mp-404 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 96px 24px;
  gap: 16px;
}
.mp-404 .material-symbols-outlined {
  font-size: 80px;
  color: rgb(var(--color-primary));
}
.mp-404 h1 {
  font-family: var(--font-headline);
  font-size: 48px;
  font-weight: 800;
  margin: 0;
}

/* ───── Static page body ───── */
.mp-page-body {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 0;
}
.mp-page-body h1 {
  font-family: var(--font-headline);
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 32px;
}

/* ───── Lightbox (gallery zoom) ───── */
.mp-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.92);
  padding: 24px;
  animation: mp-lightbox-fade 0.18s ease-out;
}
.mp-lightbox[hidden] { display: none; }
@keyframes mp-lightbox-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.mp-lightbox__stage {
  position: relative;
  max-width: min(1200px, 100%);
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-lightbox__image {
  max-width: 100%;
  max-height: calc(100vh - 96px);
  width: auto;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
  object-fit: contain;
  user-select: none;
}
.mp-lightbox__close,
.mp-lightbox__prev,
.mp-lightbox__next {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s, transform 0.15s;
  backdrop-filter: blur(8px);
}
.mp-lightbox__close:hover,
.mp-lightbox__prev:hover,
.mp-lightbox__next:hover {
  background: rgba(255, 255, 255, 0.22);
}
.mp-lightbox__close:active,
.mp-lightbox__prev:active,
.mp-lightbox__next:active {
  transform: scale(0.94);
}
.mp-lightbox__close {
  top: 20px;
  right: 20px;
}
.mp-lightbox__prev {
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
}
.mp-lightbox__next {
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}
.mp-lightbox__prev:active { transform: translateY(-50%) scale(0.94); }
.mp-lightbox__next:active { transform: translateY(-50%) scale(0.94); }
.mp-lightbox__prev .material-symbols-outlined,
.mp-lightbox__next .material-symbols-outlined,
.mp-lightbox__close .material-symbols-outlined {
  font-size: 28px;
}
.mp-lightbox__counter {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}
@media (max-width: 640px) {
  .mp-lightbox { padding: 12px; }
  .mp-lightbox__close,
  .mp-lightbox__prev,
  .mp-lightbox__next {
    width: 40px;
    height: 40px;
  }
  .mp-lightbox__close { top: 12px; right: 12px; }
  .mp-lightbox__prev { left: 12px; }
  .mp-lightbox__next { right: 12px; }
  .mp-lightbox__image { max-height: calc(100vh - 72px); }
}

/* ─────────────────────────────────────────────────────────────────
   Landing surfaces (v1.3.0) — used by the marketplace home page.
   All blocks: full-width sections, max-width inner column, generous
   vertical padding that breathes on desktop and condenses on mobile.
   ────────────────────────────────────────────────────────────────── */

/* Shared section primitives */
.mp-section-heading {
  font-family: var(--font-headline);
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: rgb(var(--color-on-surface));
  margin: 0 0 12px;
  text-align: center;
}
.mp-section-sub {
  font-size: 16px;
  color: rgb(var(--color-on-surface-variant));
  margin: 0 auto 40px;
  text-align: center;
  max-width: 640px;
  line-height: 1.55;
}

/* ── Landing hero ───────────────────────────────────────────────── */
/* Single-column on every viewport: copy on top, visual below.
   padding-top: 0 keeps the hero flush against the header so the
   first thing the visitor sees is the headline, not whitespace. */
.mp-hero-x {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: center;
  padding: 0 0 56px;
  margin-bottom: 24px;
}
@media (min-width: 900px) {
  .mp-hero-x {
    gap: 48px;
    padding: 0 0 96px;
  }
}
.mp-hero-x__eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: rgb(var(--color-primary));
  margin: 0 0 16px;
}
.mp-hero-x__headline {
  font-family: var(--font-headline);
  font-size: clamp(36px, 5vw, 56px);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--color-on-surface));
  margin: 0 0 20px;
}
.mp-hero-x__sub {
  font-size: clamp(16px, 1.2vw, 19px);
  color: rgb(var(--color-on-surface-variant));
  line-height: 1.55;
  margin: 0 0 28px;
  max-width: 540px;
}
.mp-hero-x__ctas {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.mp-hero-x__visual {
  border-radius: 20px;
  overflow: hidden;
  box-shadow:
    0 30px 60px -20px rgb(0 0 0 / 25%),
    0 0 0 1px rgb(var(--color-surface-container));
  background: rgb(var(--color-surface-container));
}
.mp-hero-x__visual img {
  display: block;
  width: 100%;
  height: auto;
}

/* ── Stats bar ──────────────────────────────────────────────────── */
.mp-stats {
  padding: 24px 0;
  margin: 8px 0 16px;
}
.mp-stats__row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 28px 32px;
  background: rgb(var(--color-surface-container-low));
  border: 1px solid rgb(var(--color-surface-container));
  border-radius: 16px;
}
@media (min-width: 720px) {
  .mp-stats__row {
    grid-template-columns: repeat(4, 1fr);
  }
}
.mp-stats__cell { text-align: center; }
.mp-stats__value {
  font-family: var(--font-headline);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--color-on-surface));
  margin: 0 0 4px;
}
.mp-stats__label {
  font-size: 13px;
  color: rgb(var(--color-on-surface-variant));
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Feature grid (3-col cards) ─────────────────────────────────── */
.mp-grid-feat {
  padding: 64px 0;
}
.mp-grid-feat__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 720px) {
  .mp-grid-feat__row { grid-template-columns: repeat(3, 1fr); }
}
.mp-grid-feat__card {
  padding: 28px;
  background: rgb(var(--color-surface-container-low));
  border: 1px solid rgb(var(--color-surface-container));
  border-radius: 16px;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
}
.mp-grid-feat__card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px -16px rgb(0 0 0 / 30%);
  border-color: rgb(var(--color-primary) / 30%);
}
.mp-grid-feat__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgb(var(--color-primary) / 12%);
  color: rgb(var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.mp-grid-feat__icon .material-symbols-outlined {
  font-size: 28px;
}
.mp-grid-feat__title {
  font-family: var(--font-headline);
  font-size: 19px;
  font-weight: 700;
  color: rgb(var(--color-on-surface));
  margin: 0 0 8px;
}
.mp-grid-feat__body {
  font-size: 15px;
  color: rgb(var(--color-on-surface-variant));
  margin: 0;
  line-height: 1.55;
}

/* ── Feature row (text on top, image below) ────────────────────── */
/* Stacked single-column on every viewport. The DOM has the image
   first for legacy reasons (kept for backward compat with v1.3.0
   exports); CSS \`order\` flips it so the copy always reads above
   the visual — matches the mobile-style flow the design specifies
   even on desktop. The \`imagePosition\` attribute is preserved on
   the wrapper for any future visual treatment but doesn't affect
   layout anymore. */
.mp-row-feat {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: stretch;
  padding: 56px 0;
}
.mp-row-feat__copy { order: 0; }
.mp-row-feat__visual { order: 1; }
.mp-row-feat__eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: rgb(var(--color-primary));
  margin: 0 0 14px;
}
.mp-row-feat__headline {
  font-family: var(--font-headline);
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgb(var(--color-on-surface));
  margin: 0 0 16px;
}
.mp-row-feat__body {
  font-size: 16px;
  color: rgb(var(--color-on-surface-variant));
  line-height: 1.6;
  margin: 0 0 20px;
}
.mp-row-feat__bullets {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
}
.mp-row-feat__bullets li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
  font-size: 15px;
  color: rgb(var(--color-on-surface));
}
.mp-row-feat__bullets .material-symbols-outlined {
  color: rgb(var(--color-primary));
  font-size: 20px;
  margin-top: 2px;
  flex-shrink: 0;
}
.mp-row-feat__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgb(var(--color-primary));
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
}
.mp-row-feat__cta:hover { opacity: 0.85; text-decoration: none; }
/* Belt-and-braces — explicitly suppress underline on every landing-
   block button. \`a.mp-btn\` already declares \`text-decoration: none\`
   globally, but some user-agent stylesheets (Safari mainly) re-add
   it on hover or focus, so we pin it here per surface. */
.mp-hero-x .mp-btn,
.mp-hero-x .mp-btn:hover,
.mp-hero-x .mp-btn:focus,
.mp-row-feat__cta,
.mp-row-feat__cta:hover,
.mp-row-feat__cta:focus,
.mp-cta-banner .mp-btn,
.mp-cta-banner .mp-btn:hover,
.mp-cta-banner .mp-btn:focus { text-decoration: none; }
.mp-row-feat__visual {
  border-radius: 16px;
  overflow: hidden;
  box-shadow:
    0 20px 50px -20px rgb(0 0 0 / 20%),
    0 0 0 1px rgb(var(--color-surface-container));
  background: rgb(var(--color-surface-container));
}
.mp-row-feat__visual img {
  display: block;
  width: 100%;
  height: auto;
}

/* ── CTA banner ─────────────────────────────────────────────────── */
.mp-cta-banner {
  padding: 56px 0;
}
.mp-cta-banner__inner {
  padding: 56px 32px;
  background:
    linear-gradient(135deg,
      rgb(var(--color-primary) / 92%),
      rgb(var(--color-primary-container) / 75%));
  border-radius: 24px;
  text-align: center;
  color: rgb(var(--color-on-primary));
}
.mp-cta-banner__headline {
  font-family: var(--font-headline);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
  color: rgb(var(--color-on-primary));
}
.mp-cta-banner__body {
  font-size: 16px;
  opacity: 0.92;
  margin: 0 auto 28px;
  max-width: 560px;
  line-height: 1.55;
}
.mp-cta-banner__ctas {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.mp-cta-banner .mp-btn--primary {
  background: rgb(var(--color-on-primary));
  color: rgb(var(--color-primary));
}
.mp-cta-banner .mp-btn--primary:hover { opacity: 0.92; }
.mp-cta-banner .mp-btn--ghost {
  background: transparent;
  color: rgb(var(--color-on-primary));
  border: 1px solid rgb(var(--color-on-primary) / 50%);
}
.mp-cta-banner .mp-btn--ghost:hover {
  background: rgb(var(--color-on-primary) / 12%);
}

/* ─────────────────────────────────────────────────────────────────
 * No-image card variant — used by ProductCard when card.hero is
 * absent (typical for imported docs). Drops the 16:10 image slot,
 * adds top padding to compensate, hides the Free-badge footer.
 * The category line becomes more prominent so the card still feels
 * intentional rather than a stripped-down product card.
 * ───────────────────────────────────────────────────────────────── */
.mp-card--no-image .mp-card__image { display: none; }
.mp-card--no-image .mp-card__body { padding: 28px 24px; }
.mp-card--no-image .mp-card__category {
  font-size: 12px;
  margin-bottom: 10px;
}
.mp-card--no-image .mp-card__title {
  font-size: 20px;
  margin-bottom: 8px;
}
.mp-card--no-image .mp-card__excerpt {
  -webkit-line-clamp: 3;
  margin: 0;
}
.mp-card--no-image .mp-card__footer { display: none; }

/* ─────────────────────────────────────────────────────────────────
 * Documentation single-post layout — used when the post has no
 * hero image. Centered reading column, no product chrome (no
 * download/CTA slot, no gallery, no Free badge). Includes a
 * breadcrumb at the top and prev/next sibling navigation at the
 * bottom.
 * ───────────────────────────────────────────────────────────────── */
.mp-doc {
  max-width: 760px;
  margin: 0 auto;
  padding: 8px 0 64px;
}
.mp-doc__header {
  margin: 24px 0 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgb(var(--color-outline-variant));
}
.mp-doc__title {
  font-family: var(--font-headline);
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: rgb(var(--color-on-surface));
  margin: 0 0 12px;
}
.mp-doc__excerpt {
  font-size: 17px;
  line-height: 1.55;
  color: rgb(var(--color-on-surface-variant));
  margin: 0;
}
.mp-doc__body { margin-top: 8px; }

/* Prev / Next sibling pager at the bottom of a doc page. Two-cell
 * grid on desktop; stacks on mobile. The non-existing side (e.g.
 * "no previous post on the first page") gets a placeholder <span/>
 * so the grid stays balanced and the next button keeps its right
 * alignment. */
.mp-doc__pagerow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid rgb(var(--color-outline-variant));
}
.mp-doc__pager {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 22px;
  border-radius: 16px;
  background: rgb(var(--color-surface-container-lowest));
  border: 1px solid rgb(var(--color-outline-variant));
  text-decoration: none;
  color: rgb(var(--color-on-surface));
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.mp-doc__pager:hover {
  background: rgb(var(--color-surface-container-low));
  border-color: rgb(var(--color-primary) / 40%);
  transform: translateY(-1px);
}
.mp-doc__pager--next {
  text-align: right;
  align-items: flex-end;
}
.mp-doc__pager-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--color-primary));
}
.mp-doc__pager-title {
  font-family: var(--font-headline);
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--color-on-surface));
  line-height: 1.35;
}
@media (max-width: 600px) {
  .mp-doc__pagerow {
    grid-template-columns: 1fr;
  }
  .mp-doc__pager--next { text-align: left; align-items: flex-start; }
}

/* ─────────────────────────────────────────────────────────────────
 * Documentation prose enhancements — applied to .mp-prose content
 * inside .mp-doc (the no-hero doc layout). Three pieces:
 *   - Admonition boxes (rewritten from blockquote-with-strong)
 *   - Code blocks (chrome + dark background + copy button)
 *   - Tables (proper borders, header bg, zebra rows)
 * ───────────────────────────────────────────────────────────────── */

/* ── Admonitions ──────────────────────────────────────────────── */
.mp-admonition {
  margin: 24px 0;
  border-radius: 12px;
  padding: 16px 18px;
  border-left: 4px solid;
  background: rgb(var(--color-surface-container-low));
  color: rgb(var(--color-on-surface));
  display: block;
}
.mp-admonition__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 8px;
  letter-spacing: -0.005em;
}
.mp-admonition__icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
  opacity: 0.18;
  position: relative;
}
.mp-admonition__icon::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: currentColor;
  opacity: 1;
  transform: scale(0.35);
}
.mp-admonition__body {
  font-size: 15px;
  line-height: 1.6;
}
.mp-admonition__body > :first-child { margin-top: 0; }
.mp-admonition__body > :last-child { margin-bottom: 0; }

/* Per-kind colors. Borders + title color shift; body stays neutral
 * so the box doesn't fight for attention with the surrounding prose. */
.mp-admonition--info {
  border-left-color: rgb(60 130 246);
  background: rgb(60 130 246 / 6%);
}
.mp-admonition--info .mp-admonition__title { color: rgb(30 80 200); }
.mp-admonition--tip {
  border-left-color: rgb(34 156 99);
  background: rgb(34 156 99 / 6%);
}
.mp-admonition--tip .mp-admonition__title { color: rgb(22 110 70); }
.mp-admonition--warning {
  border-left-color: rgb(217 134 23);
  background: rgb(217 134 23 / 8%);
}
.mp-admonition--warning .mp-admonition__title { color: rgb(160 92 0); }
.mp-admonition--danger {
  border-left-color: rgb(225 67 67);
  background: rgb(225 67 67 / 7%);
}
.mp-admonition--danger .mp-admonition__title { color: rgb(166 38 38); }
.mp-admonition--note {
  border-left-color: rgb(110 90 200);
  background: rgb(110 90 200 / 6%);
}
.mp-admonition--note .mp-admonition__title { color: rgb(80 60 175); }

/* Dark-mode adjustments: lift the title color toward the lighter
 * end of the swatch so contrast against the dark background stays
 * comfortable. Backgrounds keep their tinted look. */
@media (prefers-color-scheme: dark) {
  .mp-admonition { background: rgb(255 255 255 / 4%); }
  .mp-admonition--info .mp-admonition__title { color: rgb(140 175 255); }
  .mp-admonition--tip .mp-admonition__title { color: rgb(120 200 160); }
  .mp-admonition--warning .mp-admonition__title { color: rgb(245 190 100); }
  .mp-admonition--danger .mp-admonition__title { color: rgb(250 140 140); }
  .mp-admonition--note .mp-admonition__title { color: rgb(180 165 245); }
}

/* ── Code blocks ──────────────────────────────────────────────── */
.mp-codeblock {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  background: rgb(20 23 32);
  border: 1px solid rgb(36 40 52);
}
.mp-codeblock__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: rgb(28 32 44);
  border-bottom: 1px solid rgb(40 44 60);
}
.mp-codeblock__lang {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgb(160 168 190);
  text-transform: uppercase;
}
.mp-codeblock__copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid rgb(60 65 82);
  color: rgb(200 205 220);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.mp-codeblock__copy:hover {
  background: rgb(40 44 60);
  border-color: rgb(90 95 115);
}
.mp-codeblock__copy:active { transform: translateY(1px); }
.mp-codeblock__copy.is-copied {
  background: rgb(34 156 99 / 18%);
  border-color: rgb(34 156 99);
  color: rgb(160 220 195);
}
.mp-codeblock__copy-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.7;
  position: relative;
}
.mp-codeblock__copy-icon::before {
  content: "";
  position: absolute;
  inset: -3px -3px 3px 3px;
  border: 1.5px solid currentColor;
  border-radius: 2px;
  background: transparent;
  opacity: 0.5;
}
.mp-codeblock > pre {
  margin: 0;
  padding: 16px 18px;
  background: transparent;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, "Cascadia Code", monospace;
  font-size: 13.5px;
  line-height: 1.55;
  color: rgb(225 228 240);
}
.mp-codeblock > pre > code {
  background: transparent;
  padding: 0;
  font-family: inherit;
  color: inherit;
}

/* Inline code (NOT inside pre) — kept light + neutral so it pops
 * against the body text without competing with the code-block chrome. */
.mp-prose :not(pre) > code,
.mp-prose code:not(pre code) {
  background: rgb(0 0 0 / 6%);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92em;
  color: rgb(180 60 110);
}
@media (prefers-color-scheme: dark) {
  .mp-prose :not(pre) > code,
  .mp-prose code:not(pre code) {
    background: rgb(255 255 255 / 8%);
    color: rgb(245 145 185);
  }
}

/* ── Tables ───────────────────────────────────────────────────── */
.mp-prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 14.5px;
  background: rgb(var(--color-surface-container-lowest));
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgb(var(--color-outline-variant));
}
.mp-prose thead {
  background: rgb(var(--color-surface-container-low));
}
.mp-prose thead th {
  text-align: left;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.02em;
  padding: 12px 14px;
  color: rgb(var(--color-on-surface));
  border-bottom: 1px solid rgb(var(--color-outline-variant));
}
.mp-prose tbody td {
  padding: 11px 14px;
  vertical-align: top;
  color: rgb(var(--color-on-surface));
  border-bottom: 1px solid rgb(var(--color-outline-variant));
}
.mp-prose tbody tr:last-child td { border-bottom: 0; }
.mp-prose tbody tr:nth-child(even) {
  background: rgb(var(--color-surface-container-low) / 50%);
}
.mp-prose tbody tr:hover {
  background: rgb(var(--color-primary) / 4%);
}
.mp-prose table code {
  font-size: 0.88em;
}

/* Responsive overflow — narrow viewports get a horizontal scroll
 * around the table instead of mangled wrapping. The .mp-prose
 * wrapper already has overflow:auto on small screens via the
 * existing rule, but we add a safety here for direct table
 * children too. */
@media (max-width: 720px) {
  .mp-prose table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  .mp-prose tbody td { white-space: normal; }
}
`;
function Wt(r) {
  if (!r) return "";
  const e = r.replace(/^\/+/, "").replace(/\/?index\.html?$/i, "");
  return e ? `/${e}` : "";
}
function vi(r, e) {
  return r || e || "en";
}
function Qn(r, e) {
  if (!e || !r.labels) return r.label;
  if (r.labels[e]) return r.labels[e];
  const t = e.includes("-") ? e.split("-")[0] : null;
  return t && r.labels[t] ? r.labels[t] : r.label;
}
function wi({
  site: r,
  currentPath: e,
  currentLocale: t
}) {
  var u;
  const { settings: n, resolvedMenus: i } = r, o = K.getFixedT(
    le(t || n.language),
    "theme-marketplace-core"
  ), a = r.themeConfig, s = ((u = a == null ? void 0 : a.brand.wordmark) == null ? void 0 : u.trim()) || n.title, l = i.header.slice(0, 5), c = r.homePath ?? "/index.html";
  function p(h) {
    if (!e) return !1;
    const m = ("/" + e).replace(/\/index\.html$/, "/"), b = h.replace(/\/index\.html$/, "/");
    return m === b;
  }
  return /* @__PURE__ */ d("header", { className: "mp-header", children: /* @__PURE__ */ f("div", { className: "mp-header__inner", children: [
    /* @__PURE__ */ d("a", { className: "mp-brand font-headline", href: c, children: s }),
    /* @__PURE__ */ d("nav", { className: "mp-header__nav", "aria-label": "Primary", children: l.map((h) => /* @__PURE__ */ d(
      "a",
      {
        className: `mp-nav-link${p(h.href) ? " is-active" : ""}`,
        href: h.href,
        children: Qn(h, t)
      },
      h.id
    )) }),
    /* @__PURE__ */ d(
      "div",
      {
        className: "mp-header__langswitch",
        "data-cms-langswitch": "header",
        "data-cms-langswitch-empty": !0
      }
    ),
    /* @__PURE__ */ d("div", { className: "mp-header__search", children: /* @__PURE__ */ d(
      "input",
      {
        type: "search",
        className: "mp-search-input",
        placeholder: o("publicBaked.nav.themes") + " · " + o("publicBaked.nav.plugins"),
        "aria-label": "Search",
        "data-cms-search": !0,
        readOnly: !0,
        role: "button"
      }
    ) })
  ] }) });
}
function ki({
  site: r,
  currentLocale: e
}) {
  var s, l;
  const { settings: t, resolvedMenus: n } = r, i = r.themeConfig, o = ((s = i == null ? void 0 : i.footer.copyright) == null ? void 0 : s.trim()) || `© ${(/* @__PURE__ */ new Date()).getFullYear()} ${t.title}.`, a = r.homePath ?? "/index.html";
  return /* @__PURE__ */ d("footer", { className: "mp-footer", children: /* @__PURE__ */ f("div", { className: "mp-footer__inner", children: [
    /* @__PURE__ */ d("a", { className: "mp-brand font-headline", href: a, children: ((l = i == null ? void 0 : i.brand.wordmark) == null ? void 0 : l.trim()) || t.title }),
    /* @__PURE__ */ d("nav", { className: "mp-footer__nav", "aria-label": "Footer", children: n.footer.map((c) => /* @__PURE__ */ d("a", { href: c.href, children: Qn(c, e) }, c.id)) }),
    /* @__PURE__ */ d(
      "div",
      {
        className: "mp-footer__langswitch",
        "data-cms-langswitch": "footer",
        "data-cms-langswitch-empty": !0
      }
    ),
    /* @__PURE__ */ d("p", { className: "mp-footer__copyright", children: o })
  ] }) });
}
const Zn = {
  heroEyebrow: "AGENTCMS MARKETPLACE",
  heroHeadline: "Modern assets for professional creators.",
  heroIntro: "Curated themes and plugins for your AgentCMS site. Free, open-source, and ready to install.",
  featuredCategorySlug: "plugins",
  featuredHeading: "Featured Plugins",
  featuredCount: 2,
  newCategorySlug: "themes",
  newHeading: "New Themes",
  newCount: 6,
  showRecentlyUpdated: !1,
  recentlyUpdatedHeading: "Recently Updated",
  recentlyUpdatedCount: 6
}, _i = {
  descriptionLabel: "Description",
  specificationsLabel: "Specifications",
  featuresLabel: "Key Features",
  downloadLabel: "Download",
  previewLabel: "Live Preview",
  freeBadgeLabel: "Free",
  showSpecs: !0,
  showFeatures: !0
}, er = {
  heading: "Discover",
  headingTranslations: {
    fr: {
      heading: "Découvrir",
      categoriesHeading: "Catégories",
      docsHeading: "Documentation"
    }
  },
  topItems: [
    { icon: "auto_awesome", label: "Featured", href: "/index.html" },
    { icon: "fiber_new", label: "New", href: "/new.html" },
    { icon: "trending_up", label: "Top Rated", href: "/top.html" }
  ],
  categoriesHeading: "Categories",
  categoriesItems: [
    {
      icon: "palette",
      label: "Themes",
      href: "/themes/index.html",
      translations: { fr: { label: "Thèmes" } }
    },
    { icon: "extension", label: "Plugins", href: "/plugins/index.html" },
    { icon: "shopping_bag", label: "E-commerce", href: "/e-commerce/index.html" },
    { icon: "analytics", label: "Analytics", href: "/analytics/index.html" },
    { icon: "lock", label: "Authentication", href: "/authentication/index.html" }
  ],
  docsHeading: "Documentation",
  docsItems: [
    {
      icon: "rocket_launch",
      label: "Get Started",
      href: "/get-started/index.html",
      translations: { fr: { label: "Démarrer", href: "/demarrer/index.html" } }
    },
    {
      icon: "download",
      label: "Install",
      href: "/install/index.html",
      translations: { fr: { label: "Installer", href: "/installer/index.html" } }
    },
    {
      icon: "edit_note",
      label: "Use",
      href: "/use/index.html",
      translations: { fr: { label: "Utiliser", href: "/utiliser/index.html" } }
    },
    {
      icon: "code",
      label: "Develop",
      href: "/develop/index.html",
      translations: { fr: { label: "Développer", href: "/developper/index.html" } }
    },
    {
      icon: "extension",
      label: "Extend",
      href: "/extend/index.html",
      translations: { fr: { label: "Étendre", href: "/etendre/index.html" } }
    }
  ]
}, Ni = {
  copyright: ""
}, Si = {
  wordmark: ""
}, X = {
  vars: {},
  fontHeadline: "Hanken Grotesk",
  fontBody: "Inter"
}, ie = {
  home: Zn,
  single: _i,
  sidebar: er,
  footer: Ni,
  brand: Si,
  style: X
};
function Ci({
  site: r,
  currentPath: e,
  currentLocale: t
}) {
  var u;
  const n = r.themeConfig, i = { ...er, ...(n == null ? void 0 : n.sidebar) ?? {} }, o = Wt(r.homePath), a = t ?? "", s = a ? (u = i.headingTranslations) == null ? void 0 : u[a] : void 0;
  function l(h) {
    var b;
    const m = a ? (b = h.translations) == null ? void 0 : b[a] : void 0;
    return {
      label: (m == null ? void 0 : m.label) ?? h.label,
      href: (m == null ? void 0 : m.href) ?? h.href
    };
  }
  function c(h) {
    return !h || /^[a-z]+:/i.test(h) || !h.startsWith("/") ? h : o ? `${o}${h}` : h;
  }
  function p(h) {
    if (!e) return !1;
    const m = ("/" + e).replace(/\/index\.html$/, "/"), b = h.replace(/\/index\.html$/, "/");
    return m === b;
  }
  return /* @__PURE__ */ f("aside", { className: "mp-sidebar", "aria-label": "Sidebar", children: [
    /* @__PURE__ */ d("h2", { className: "mp-sidebar__heading font-headline", children: (s == null ? void 0 : s.heading) ?? i.heading }),
    i.topItems.length > 0 && /* @__PURE__ */ d("div", { className: "mp-sidebar__group", children: i.topItems.map((h, m) => {
      const { label: b, href: g } = l(h), y = c(g);
      return /* @__PURE__ */ f(
        "a",
        {
          className: `mp-sidebar__link${p(y) ? " is-active" : ""}`,
          href: y,
          children: [
            h.icon && /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: h.icon }),
            /* @__PURE__ */ d("span", { children: b })
          ]
        },
        `top-${m}`
      );
    }) }),
    i.categoriesItems.length > 0 && /* @__PURE__ */ f("div", { className: "mp-sidebar__group", children: [
      /* @__PURE__ */ d("span", { className: "mp-sidebar__label", children: (s == null ? void 0 : s.categoriesHeading) ?? i.categoriesHeading }),
      i.categoriesItems.map((h, m) => {
        const { label: b, href: g } = l(h), y = c(g);
        return /* @__PURE__ */ f(
          "a",
          {
            className: `mp-sidebar__link${p(y) ? " is-active" : ""}`,
            href: y,
            children: [
              h.icon && /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: h.icon }),
              /* @__PURE__ */ d("span", { children: b })
            ]
          },
          `cat-${m}`
        );
      })
    ] }),
    i.docsItems && i.docsItems.length > 0 && /* @__PURE__ */ f("div", { className: "mp-sidebar__group", children: [
      /* @__PURE__ */ d("span", { className: "mp-sidebar__label", children: (s == null ? void 0 : s.docsHeading) ?? i.docsHeading }),
      i.docsItems.map((h, m) => {
        const { label: b, href: g } = l(h), y = c(g);
        return /* @__PURE__ */ f(
          "a",
          {
            className: `mp-sidebar__link${p(y) ? " is-active" : ""}`,
            href: y,
            children: [
              h.icon && /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: h.icon }),
              /* @__PURE__ */ d("span", { children: b })
            ]
          },
          `doc-${m}`
        );
      })
    ] })
  ] });
}
function Ei({
  site: r,
  currentPath: e,
  currentLocale: t
}) {
  const n = K.getFixedT(
    le(t || r.settings.language),
    "theme-marketplace-core"
  ), i = Wt(r.homePath), o = [
    { icon: "home", label: n("publicBaked.nav.home"), href: `${i}/index.html` },
    { icon: "palette", label: n("publicBaked.nav.themes"), href: `${i}/themes/index.html` },
    { icon: "extension", label: n("publicBaked.nav.plugins"), href: `${i}/plugins/index.html` }
  ];
  function a(s) {
    if (!e) return !1;
    const l = ("/" + e).replace(/\/index\.html$/, "/"), c = s.replace(/\/index\.html$/, "/");
    return l === c || s === `${i}/index.html` && l === `${i || ""}/`;
  }
  return /* @__PURE__ */ d("nav", { className: "mp-bottom-nav", "aria-label": "Mobile navigation", children: o.map((s) => /* @__PURE__ */ f(
    "a",
    {
      className: `mp-bottom-nav__item${a(s.href) ? " is-active" : ""}`,
      href: s.href,
      children: [
        /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: s.icon }),
        /* @__PURE__ */ d("span", { children: s.label })
      ]
    },
    s.href
  )) });
}
function Ai({
  site: r,
  pageTitle: e,
  pageDescription: t,
  ogImage: n,
  currentPath: i,
  currentLocale: o,
  children: a
}) {
  const s = `/${r.themeCssPath}`, l = vi(o, r.settings.language), c = r.settings.baseUrl && i ? di(r.settings.baseUrl, i) : void 0, p = r.settings.title || "", u = !!e && !!p && e.includes(p), h = e ? u ? e : `${e} — ${p}` : p;
  return /* @__PURE__ */ f("html", { lang: l, children: [
    /* @__PURE__ */ f("head", { children: [
      /* @__PURE__ */ d("meta", { charSet: "UTF-8" }),
      /* @__PURE__ */ d("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ d("title", { children: h }),
      t && /* @__PURE__ */ d("meta", { name: "description", content: t }),
      c && /* @__PURE__ */ d("link", { rel: "canonical", href: c }),
      /* @__PURE__ */ d("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ d("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
      /* @__PURE__ */ d("link", { rel: "stylesheet", href: s }),
      /* @__PURE__ */ d("meta", { property: "og:title", content: h }),
      t && /* @__PURE__ */ d("meta", { property: "og:description", content: t }),
      n && /* @__PURE__ */ d("meta", { property: "og:image", content: n }),
      c && /* @__PURE__ */ d("meta", { property: "og:url", content: c }),
      /* @__PURE__ */ d("meta", { property: "og:type", content: "website" }),
      /* @__PURE__ */ d("meta", { name: "x-cms-head-extra" })
    ] }),
    /* @__PURE__ */ f("body", { children: [
      /* @__PURE__ */ f("div", { className: "mp-app", children: [
        /* @__PURE__ */ d(wi, { site: r, currentPath: i, currentLocale: l }),
        /* @__PURE__ */ f("div", { className: "mp-layout", children: [
          /* @__PURE__ */ d(Ci, { site: r, currentPath: i, currentLocale: l }),
          /* @__PURE__ */ d("main", { className: "mp-main", children: a })
        ] }),
        /* @__PURE__ */ d(ki, { site: r, currentLocale: l })
      ] }),
      /* @__PURE__ */ d(Ei, { site: r, currentPath: i, currentLocale: l }),
      /* @__PURE__ */ d(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: "(function(){var h=document.querySelector('.mp-header'),n=document.querySelector('.mp-bottom-nav');if(!h&&!n)return;var lastY=window.scrollY,ticking=false;function update(){var y=window.scrollY,d=y-lastY;if(y<80){if(h)h.classList.remove('is-hidden');if(n)n.classList.remove('is-hidden');}else if(d>6){if(h)h.classList.add('is-hidden');if(n)n.classList.add('is-hidden');}else if(d<-6){if(h)h.classList.remove('is-hidden');if(n)n.classList.remove('is-hidden');}lastY=y;ticking=false;}window.addEventListener('scroll',function(){if(!ticking){window.requestAnimationFrame(update);ticking=true;}},{passive:true});})();"
          }
        }
      ),
      /* @__PURE__ */ d(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: "(function(){document.addEventListener('click',function(e){var btn=e.target&&e.target.closest&&e.target.closest('[data-cms-copy]');if(!btn)return;var block=btn.closest('.mp-codeblock');var code=block&&block.querySelector('pre code');if(!code)return;var text=code.textContent||'';var label=btn.querySelector('[data-cms-copy-label]');var defaultLabel=btn.getAttribute('data-cms-copy-label-default')||'Copy';var doneLabel=btn.getAttribute('data-cms-copy-label-done')||'Copied';function done(){btn.classList.add('is-copied');if(label)label.textContent=doneLabel;setTimeout(function(){btn.classList.remove('is-copied');if(label)label.textContent=defaultLabel;},1500);}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done).catch(function(){fallback();});}else{fallback();}function fallback(){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done();}catch(_){}document.body.removeChild(ta);}});})();"
          }
        }
      ),
      /* @__PURE__ */ d("script", { type: "application/x-cms-body-end" })
    ] })
  ] });
}
function Re({ card: r, site: e }) {
  var l;
  const t = K.getFixedT(le(e.settings.language), "theme-marketplace-core"), n = !!r.hero, i = n ? ae(r.hero, "large") || ae(r.hero, "medium") || ae(r.hero) : "", o = ((l = r.hero) == null ? void 0 : l.alt) ?? r.title, a = r.url.startsWith("/") ? r.url : `/${r.url}`;
  return /* @__PURE__ */ f("a", { className: n ? "mp-card" : "mp-card mp-card--no-image", href: a, children: [
    n && /* @__PURE__ */ d("img", { className: "mp-card__image", src: i, alt: o, loading: "lazy" }),
    /* @__PURE__ */ f("div", { className: "mp-card__body", children: [
      r.category && /* @__PURE__ */ d("span", { className: "mp-card__category", children: r.category.name }),
      /* @__PURE__ */ d("h3", { className: "mp-card__title", children: r.title }),
      r.excerpt && /* @__PURE__ */ d("p", { className: "mp-card__excerpt", children: r.excerpt }),
      n && /* @__PURE__ */ d("div", { className: "mp-card__footer", children: /* @__PURE__ */ d("span", { className: "mp-badge-free", children: t("publicBaked.free") }) })
    ] })
  ] });
}
function Mi({
  posts: r,
  staticPage: e,
  site: t
}) {
  const n = K.getFixedT(
    le(t.settings.language),
    "theme-marketplace-core"
  ), i = t.themeConfig, o = { ...Zn, ...(i == null ? void 0 : i.home) ?? {} }, a = Wt(t.homePath);
  if (e)
    return /* @__PURE__ */ d("article", { className: "mp-page-body", children: /* @__PURE__ */ d(
      "div",
      {
        className: "mp-prose",
        dangerouslySetInnerHTML: { __html: e.bodyHtml }
      }
    ) });
  function s(u, h) {
    return !u || h <= 0 ? [] : r.filter((m) => m.category ? m.category.url.replace(/^\/+/, "").split("/")[0] === u : !1).slice(0, h);
  }
  const l = s(o.featuredCategorySlug, o.featuredCount), c = s(o.newCategorySlug, o.newCount), p = o.showRecentlyUpdated ? r.slice(0, o.recentlyUpdatedCount) : [];
  return /* @__PURE__ */ f("div", { children: [
    (o.heroHeadline || o.heroIntro) && /* @__PURE__ */ f("section", { className: "mp-hero", children: [
      o.heroEyebrow && /* @__PURE__ */ d("p", { className: "mp-hero__eyebrow", children: o.heroEyebrow }),
      o.heroHeadline && /* @__PURE__ */ d("h1", { children: o.heroHeadline }),
      o.heroIntro && /* @__PURE__ */ d("p", { children: o.heroIntro })
    ] }),
    l.length > 0 && /* @__PURE__ */ f("section", { className: "mp-section", children: [
      /* @__PURE__ */ f("div", { className: "mp-section__heading", children: [
        /* @__PURE__ */ d("h2", { children: o.featuredHeading }),
        o.featuredCategorySlug && /* @__PURE__ */ f(
          "a",
          {
            className: "mp-section__see-all",
            href: `${a}/${o.featuredCategorySlug}/index.html`,
            children: [
              n("publicBaked.seeAll"),
              " →"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "mp-grid mp-grid--2", children: l.map((u) => /* @__PURE__ */ d(Re, { card: u, site: t }, u.id)) })
    ] }),
    c.length > 0 && /* @__PURE__ */ f("section", { className: "mp-section", children: [
      /* @__PURE__ */ f("div", { className: "mp-section__heading", children: [
        /* @__PURE__ */ d("h2", { children: o.newHeading }),
        o.newCategorySlug && /* @__PURE__ */ f(
          "a",
          {
            className: "mp-section__see-all",
            href: `${a}/${o.newCategorySlug}/index.html`,
            children: [
              n("publicBaked.seeAll"),
              " →"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ d("div", { className: "mp-grid mp-grid--3", children: c.map((u) => /* @__PURE__ */ d(Re, { card: u, site: t }, u.id)) })
    ] }),
    p.length > 0 && /* @__PURE__ */ f("section", { className: "mp-section", children: [
      /* @__PURE__ */ d("div", { className: "mp-section__heading", children: /* @__PURE__ */ d("h2", { children: o.recentlyUpdatedHeading }) }),
      /* @__PURE__ */ d("div", { className: "mp-grid mp-grid--3", children: p.map((u) => /* @__PURE__ */ d(Re, { card: u, site: t }, u.id)) })
    ] })
  ] });
}
function Ii({
  post: r,
  bodyHtml: e,
  hero: t,
  primaryTerm: n,
  site: i,
  docSiblings: o
}) {
  if (r.type === "page")
    return /* @__PURE__ */ f("article", { className: "mp-page-body", children: [
      /* @__PURE__ */ d("h1", { children: r.title }),
      /* @__PURE__ */ d("div", { className: "mp-prose", dangerouslySetInnerHTML: { __html: e } })
    ] });
  if (!t)
    return /* @__PURE__ */ d(
      Ti,
      {
        post: r,
        bodyHtml: e,
        primaryTerm: n,
        site: i,
        siblings: o ?? []
      }
    );
  const s = ae(t, "large") || ae(t, "medium") || ae(t);
  return /* @__PURE__ */ f("article", { children: [
    /* @__PURE__ */ f("section", { className: "mp-product", children: [
      /* @__PURE__ */ f("div", { className: "mp-product__gallery", children: [
        /* @__PURE__ */ d("img", { className: "mp-product__hero-image", src: s, alt: t.alt ?? r.title }),
        /* @__PURE__ */ d("div", { className: "mp-product__thumbs", "data-cms-mp-thumbs": !0, hidden: !0 })
      ] }),
      /* @__PURE__ */ f("div", { className: "mp-product__info", children: [
        n && /* @__PURE__ */ d("span", { className: "mp-product__category", children: n.name }),
        /* @__PURE__ */ d("h1", { className: "mp-product__title", children: r.title }),
        /* @__PURE__ */ d("div", { "data-cms-mp-byline-slot": !0 }),
        r.excerpt && /* @__PURE__ */ d("p", { className: "mp-product__excerpt", children: r.excerpt }),
        /* @__PURE__ */ d("div", { "data-cms-mp-cta-slot": !0 })
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "mp-prose", dangerouslySetInnerHTML: { __html: e } })
  ] });
}
function Ti({
  post: r,
  bodyHtml: e,
  primaryTerm: t,
  site: n,
  siblings: i
}) {
  const o = K.getFixedT(
    le(n.settings.language),
    "theme-marketplace-core"
  ), a = n.homePath ?? "/index.html", s = i.findIndex((p) => p.id === r.id), l = s > 0 ? i[s - 1] : null, c = s >= 0 && s < i.length - 1 ? i[s + 1] : null;
  return /* @__PURE__ */ f("article", { className: "mp-doc", children: [
    /* @__PURE__ */ f("nav", { className: "mp-breadcrumb", "aria-label": "Breadcrumb", children: [
      /* @__PURE__ */ d("a", { href: a, children: o("publicBaked.home") }),
      t && /* @__PURE__ */ f(ci, { children: [
        /* @__PURE__ */ d("span", { className: "mp-breadcrumb__sep", children: "/" }),
        /* @__PURE__ */ d("a", { href: Ct(`${t.slug}/index.html`), children: t.name })
      ] }),
      /* @__PURE__ */ d("span", { className: "mp-breadcrumb__sep", children: "/" }),
      /* @__PURE__ */ d("span", { children: r.title })
    ] }),
    /* @__PURE__ */ f("header", { className: "mp-doc__header", children: [
      /* @__PURE__ */ d("h1", { className: "mp-doc__title", children: r.title }),
      r.excerpt && /* @__PURE__ */ d("p", { className: "mp-doc__excerpt", children: r.excerpt })
    ] }),
    /* @__PURE__ */ d("div", { className: "mp-doc__body mp-prose", dangerouslySetInnerHTML: { __html: e } }),
    (l || c) && /* @__PURE__ */ f("nav", { className: "mp-doc__pagerow", "aria-label": o("publicBaked.docPager.aria"), children: [
      l ? /* @__PURE__ */ f("a", { className: "mp-doc__pager mp-doc__pager--prev", href: Ct(l.url), children: [
        /* @__PURE__ */ f("span", { className: "mp-doc__pager-label", children: [
          "← ",
          o("publicBaked.docPager.prev")
        ] }),
        /* @__PURE__ */ d("span", { className: "mp-doc__pager-title", children: l.title })
      ] }) : /* @__PURE__ */ d("span", {}),
      c ? /* @__PURE__ */ f("a", { className: "mp-doc__pager mp-doc__pager--next", href: Ct(c.url), children: [
        /* @__PURE__ */ f("span", { className: "mp-doc__pager-label", children: [
          o("publicBaked.docPager.next"),
          " →"
        ] }),
        /* @__PURE__ */ d("span", { className: "mp-doc__pager-title", children: c.title })
      ] }) : /* @__PURE__ */ d("span", {})
    ] })
  ] });
}
function Ct(r) {
  return r ? r.startsWith("/") ? r : `/${r}` : "/";
}
function Ri({
  term: r,
  posts: e,
  site: t
}) {
  const n = K.getFixedT(
    le(t.settings.language),
    "theme-marketplace-core"
  ), i = t.homePath ?? "/index.html";
  return /* @__PURE__ */ f("article", { children: [
    /* @__PURE__ */ f("nav", { className: "mp-breadcrumb", "aria-label": "Breadcrumb", children: [
      /* @__PURE__ */ d("a", { href: i, children: n("publicBaked.home") }),
      /* @__PURE__ */ d("span", { className: "mp-breadcrumb__sep", children: "/" }),
      /* @__PURE__ */ d("span", { children: r.name })
    ] }),
    /* @__PURE__ */ f("header", { className: "mp-section", children: [
      /* @__PURE__ */ d("h1", { className: "text-display-lg font-headline", children: r.name }),
      r.description && /* @__PURE__ */ d("p", { className: "text-body-lg", style: { color: "rgb(var(--color-on-surface-variant))", maxWidth: "640px", marginTop: 8 }, children: r.description })
    ] }),
    /* @__PURE__ */ d("section", { className: "mp-section", children: /* @__PURE__ */ d("div", { className: "mp-grid mp-grid--3", children: e.map((o) => /* @__PURE__ */ d(Re, { card: o, site: t }, o.id)) }) })
  ] });
}
function Oi({
  author: r,
  posts: e,
  site: t
}) {
  const n = K.getFixedT(le(t.settings.language), "theme-marketplace-core"), i = r.avatar ? ae(r.avatar, "medium") || ae(r.avatar) : "", o = /* @__PURE__ */ new Map();
  return e.forEach((a) => {
    if (!a.category) return;
    const s = a.category.url.replace(/^\/+/, "").split("/")[0];
    s && !o.has(s) && o.set(s, a.category.name);
  }), /* @__PURE__ */ f("article", { children: [
    /* @__PURE__ */ f("section", { className: "mp-author-card", children: [
      i ? /* @__PURE__ */ d("img", { className: "mp-author-card__avatar", src: i, alt: r.displayName }) : /* @__PURE__ */ d("div", { className: "mp-author-card__avatar" }),
      /* @__PURE__ */ f("div", { className: "mp-author-card__info", children: [
        /* @__PURE__ */ d("h1", { className: "mp-author-card__name", children: r.displayName }),
        r.title && /* @__PURE__ */ d("p", { className: "mp-author-card__title", children: r.title }),
        r.bio && /* @__PURE__ */ d("p", { className: "mp-author-card__bio", children: r.bio })
      ] })
    ] }),
    o.size > 1 && /* @__PURE__ */ f("div", { className: "mp-tabs", "data-cms-author-tabs": !0, role: "tablist", children: [
      /* @__PURE__ */ d("button", { type: "button", className: "mp-tabs__tab is-active", "data-cms-author-tab": "*", children: n("publicBaked.seeAll") }),
      Array.from(o.entries()).map(([a, s]) => /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "mp-tabs__tab",
          "data-cms-author-tab": a,
          children: s
        },
        a
      ))
    ] }),
    /* @__PURE__ */ d("div", { className: "mp-grid mp-grid--3", children: e.map((a) => {
      const s = a.category ? a.category.url.replace(/^\/+/, "").split("/")[0] : "";
      return /* @__PURE__ */ d("div", { "data-cms-author-card": s, children: /* @__PURE__ */ d(Re, { card: a, site: t }) }, a.id);
    }) }),
    /* @__PURE__ */ d(
      "script",
      {
        dangerouslySetInnerHTML: {
          __html: "(function(){var t=document.querySelector('[data-cms-author-tabs]');if(!t)return;t.addEventListener('click',function(e){var b=e.target.closest('[data-cms-author-tab]');if(!b)return;var s=b.getAttribute('data-cms-author-tab');t.querySelectorAll('[data-cms-author-tab]').forEach(function(x){x.classList.toggle('is-active',x===b)});document.querySelectorAll('[data-cms-author-card]').forEach(function(c){var ok=s==='*'||c.getAttribute('data-cms-author-card')===s;c.style.display=ok?'':'none'})});})();"
        }
      }
    )
  ] });
}
function $i({ site: r }) {
  const e = K.getFixedT(le(r.settings.language), "theme-marketplace-core"), t = r.homePath ?? "/index.html";
  return /* @__PURE__ */ f("div", { className: "mp-404", children: [
    /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: "search_off" }),
    /* @__PURE__ */ d("h1", { children: "404" }),
    /* @__PURE__ */ d("p", { className: "text-body-lg", style: { color: "rgb(var(--color-on-surface-variant))" }, children: e("publicBaked.notFound") }),
    /* @__PURE__ */ d("a", { href: t, className: "mp-btn mp-btn--primary", children: e("publicBaked.backHome") })
  ] });
}
const Ce = {
  title: "Theme settings",
  settings: {
    description: "Marketplace Core — app-store style theme for listing your themes and plugins. Wide cards, soft shadows, big rounded corners.",
    tabs: {
      home: "Home",
      single: "Product page",
      sidebar: "Sidebar",
      footer: "Footer",
      style: "Style & branding"
    },
    buttons: {
      save: "Save & apply",
      saving: "Saving…",
      saved: "Saved"
    }
  },
  publicBaked: {
    free: "Free",
    download: "Download",
    livePreview: "Live Preview",
    description: "Description",
    specifications: "Specifications",
    keyFeatures: "Key Features",
    nav: {
      home: "Home",
      themes: "Themes",
      plugins: "Plugins",
      authors: "Authors"
    },
    seeAll: "See all",
    by: "by",
    notFound: "Page not found",
    backHome: "Back to home",
    home: "Home",
    docPager: {
      aria: "Documentation navigation",
      prev: "Previous",
      next: "Next"
    },
    codeBlock: {
      copy: "Copy",
      copied: "Copied"
    }
  },
  blocks: {
    headerButtons: { title: "Download / Preview buttons", untitled: "(no URLs)" },
    gallery: { title: "Screenshot gallery", count: "{{n}} images" },
    specs: { title: "Specifications table", untitled: "Empty specs" },
    features: { title: "Key features bento", count: "{{n}} features" },
    landingHero: { title: "Landing hero", empty: "(no headline)" },
    featureGrid: { title: "Feature grid", count: "{{n}} items" },
    featureRow: { title: "Feature row", empty: "(no headline)" },
    statsBar: { title: "Stats bar", count: "{{n}} stats" },
    ctaBanner: { title: "CTA banner", empty: "(no headline)" }
  }
}, Li = {
  title: "Réglages du thème",
  settings: {
    description: "Marketplace Core — thème app-store pour répertorier vos thèmes et plugins. Cartes larges, ombres douces, coins arrondis XL.",
    tabs: {
      home: "Accueil",
      single: "Page produit",
      sidebar: "Sidebar",
      footer: "Pied de page",
      style: "Style & branding"
    },
    buttons: {
      save: "Enregistrer et appliquer",
      saving: "Enregistrement…",
      saved: "Enregistré"
    }
  },
  publicBaked: {
    free: "Gratuit",
    download: "Télécharger",
    livePreview: "Démo en ligne",
    description: "Description",
    specifications: "Spécifications",
    keyFeatures: "Fonctionnalités clés",
    nav: {
      home: "Accueil",
      themes: "Thèmes",
      plugins: "Plugins",
      authors: "Auteurs"
    },
    seeAll: "Voir tout",
    by: "par",
    notFound: "Page introuvable",
    backHome: "Retour à l'accueil",
    home: "Accueil",
    docPager: {
      aria: "Navigation dans la documentation",
      prev: "Précédent",
      next: "Suivant"
    },
    codeBlock: {
      copy: "Copier",
      copied: "Copié"
    }
  },
  blocks: {
    headerButtons: { title: "Boutons Télécharger / Démo", untitled: "(aucune URL)" },
    gallery: { title: "Galerie captures d'écran", count: "{{n}} images" },
    specs: { title: "Tableau de spécifications", untitled: "Vide" },
    features: { title: "Fonctionnalités clés", count: "{{n}} fonctionnalités" },
    landingHero: { title: "Hero landing", empty: "(aucun titre)" },
    featureGrid: { title: "Grille de fonctionnalités", count: "{{n}} éléments" },
    featureRow: { title: "Bandeau fonctionnalité", empty: "(aucun titre)" },
    statsBar: { title: "Barre de stats", count: "{{n}} stats" },
    ctaBanner: { title: "Bandeau CTA", empty: "(aucun titre)" }
  }
}, Bi = Ce, zi = Ce, Fi = Ce, Pi = Ce, Di = Ce, Hi = "marketplace-core";
function Me(r) {
  if (r == null) return "";
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(r))));
  } catch {
    return "";
  }
}
function Y(r, e) {
  if (!r || typeof r != "string") return e;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(r))));
  } catch {
    return e;
  }
}
function q(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function k(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function tr(r) {
  return `marketplace${r.charAt(0).toUpperCase()}${r.slice(1)}`;
}
const Xe = {
  downloadUrl: "",
  previewUrl: "",
  downloadLabel: "Download",
  previewLabel: "Live Preview",
  freeLabel: "Free",
  creator: "",
  creatorPrefix: "by"
};
function Ui(r) {
  var u;
  const e = !!(r.downloadUrl || r.previewUrl), t = !!((u = r.creator) != null && u.trim());
  if (!e && !t) return "";
  const n = t ? `<div class="mp-product__author"><span>${k(r.creatorPrefix || "by")} <strong>${k(r.creator)}</strong></span></div>` : "", i = e ? `<span class="mp-badge-free">${k(r.freeLabel)}</span>` : "", o = r.downloadUrl ? `<a class="mp-btn mp-btn--primary" href="${q(r.downloadUrl)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">download</span>${k(r.downloadLabel)}</a>` : "", a = r.previewUrl ? `<a class="mp-btn mp-btn--secondary" href="${q(r.previewUrl)}" target="_blank" rel="noopener noreferrer"><span class="material-symbols-outlined">open_in_new</span>${k(r.previewLabel)}</a>` : "", s = e ? `${i}<div class="mp-product__cta-row">${o}${a}</div>` : "", l = n ? `<template data-cms-mp-headerbuttons-byline>${n}</template>` : "", c = s ? `<template data-cms-mp-headerbuttons-cta>${s}</template>` : "";
  return `${l}${c}<script>(function(){
function move(srcSel, dstSel){
  var tpl = document.querySelector(srcSel);
  if (!tpl) return;
  var dst = document.querySelector(dstSel);
  if (!dst) return;
  while (tpl.content.firstChild) dst.appendChild(tpl.content.firstChild);
  tpl.remove();
}
move('[data-cms-mp-headerbuttons-byline]','[data-cms-mp-byline-slot]');
move('[data-cms-mp-headerbuttons-cta]','[data-cms-mp-cta-slot]');
})();<\/script>`;
}
const ji = /<div\s+([^>]*data-cms-block="marketplace-core\/header-buttons"[^>]*)>\s*<\/div>/g;
function Vi(r) {
  return r.replace(ji, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, Xe);
    return Ui(o) || "";
  });
}
const Qe = { images: [] };
function Ji(r) {
  const e = (r.images ?? []).filter((i) => i && i.url);
  return e.length === 0 ? "" : `<template data-cms-mp-gallery>${JSON.stringify({ images: e }).replace(/</g, "\\u003c")}</template>` + `<script>(function(){
var tpl = document.querySelector('[data-cms-mp-gallery]');
if (!tpl) return;
var data; try { data = JSON.parse(tpl.innerHTML); } catch(e) { return; }
var galleryImgs = (data.images || []).filter(function(i){return i && i.url;});
if (galleryImgs.length === 0) return;

var hero = document.querySelector('.mp-product__hero-image');
var thumbsHost = document.querySelector('[data-cms-mp-thumbs]');

// Combine hero (slide 0) + gallery images (slides 1..n) for the
// lightbox slider. Allows clicking the hero to also open the
// zoom view.
var all = [];
if (hero && hero.src) all.push({ url: hero.src, alt: hero.alt || '' });
galleryImgs.forEach(function(g){ all.push({ url: g.url, alt: g.alt || '' }); });

// Populate the thumb strip — one per gallery image (the hero
// is its own visible image, no need to thumbnail it).
if (thumbsHost) {
  thumbsHost.removeAttribute('hidden');
  thumbsHost.innerHTML = '';
  galleryImgs.forEach(function(img, i){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mp-product__thumb';
    b.setAttribute('data-mp-lightbox-index', String(i + 1));
    var im = document.createElement('img');
    im.src = img.url;
    im.alt = img.alt;
    im.loading = 'lazy';
    b.appendChild(im);
    thumbsHost.appendChild(b);
  });
}

// Build the lightbox markup once and append to body. Idempotent —
// if a previous run already injected it (e.g. script re-evaluated
// in dev), we reuse the existing nodes.
var box = document.querySelector('.mp-lightbox');
if (!box) {
  box = document.createElement('div');
  box.className = 'mp-lightbox';
  box.setAttribute('hidden', '');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<button class="mp-lightbox__close" aria-label="Close">' +
    '<span class="material-symbols-outlined">close</span></button>' +
    '<button class="mp-lightbox__prev" aria-label="Previous">' +
    '<span class="material-symbols-outlined">chevron_left</span></button>' +
    '<button class="mp-lightbox__next" aria-label="Next">' +
    '<span class="material-symbols-outlined">chevron_right</span></button>' +
    '<div class="mp-lightbox__stage"><img class="mp-lightbox__image" alt=""/></div>' +
    '<div class="mp-lightbox__counter"></div>';
  document.body.appendChild(box);
}

var lbImg = box.querySelector('.mp-lightbox__image');
var lbCounter = box.querySelector('.mp-lightbox__counter');
var current = 0;

function show(i){
  if (i < 0) i = all.length - 1;
  if (i >= all.length) i = 0;
  current = i;
  lbImg.src = all[i].url;
  lbImg.alt = all[i].alt || '';
  lbCounter.textContent = (i + 1) + ' / ' + all.length;
}
function open(i){
  show(i);
  box.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}
function close(){
  box.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

box.addEventListener('click', function(e){
  if (e.target === box) close();
});
box.querySelector('.mp-lightbox__close').addEventListener('click', close);
box.querySelector('.mp-lightbox__prev').addEventListener('click', function(){ show(current - 1); });
box.querySelector('.mp-lightbox__next').addEventListener('click', function(){ show(current + 1); });

document.addEventListener('keydown', function(e){
  if (box.hasAttribute('hidden')) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowLeft') show(current - 1);
  else if (e.key === 'ArrowRight') show(current + 1);
});

// Wire openers — hero image + every thumb.
if (hero) {
  hero.style.cursor = 'zoom-in';
  hero.addEventListener('click', function(){ open(0); });
}
if (thumbsHost) {
  thumbsHost.addEventListener('click', function(e){
    var btn = e.target.closest('[data-mp-lightbox-index]');
    if (!btn) return;
    var i = parseInt(btn.getAttribute('data-mp-lightbox-index'), 10);
    if (!isNaN(i)) open(i);
  });
}
})();<\/script>`;
}
const qi = /<div\s+([^>]*data-cms-block="marketplace-core\/gallery"[^>]*)>\s*<\/div>/g;
function Wi(r) {
  return r.replace(qi, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, Qe);
    return Ji(o) || "";
  });
}
const Ze = {
  heading: "Specifications",
  rows: [
    { label: "Version", value: "1.0.0" },
    { label: "License", value: "MIT" },
    { label: "Last Updated", value: "" },
    { label: "Requires AgentCMS", value: "≥ 1.0.0" }
  ]
};
function Gi(r) {
  const e = (r.rows ?? []).filter((i) => i.label || i.value);
  if (e.length === 0) return "";
  const t = e.map(
    (i) => `<div class="mp-specs__row"><span class="mp-specs__label">${k(i.label)}</span><span class="mp-specs__value">${k(i.value)}</span></div>`
  ).join("");
  return `${r.heading ? `<h3 class="mp-section-heading">${k(r.heading)}</h3>` : ""}<section class="mp-specs"><div class="mp-specs__grid">${t}</div></section>`;
}
const Ki = /<div\s+([^>]*data-cms-block="marketplace-core\/specs"[^>]*)>\s*<\/div>/g;
function Yi(r) {
  return r.replace(Ki, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, Ze);
    return Gi(o) || "";
  });
}
const et = {
  heading: "Key Features",
  items: []
};
function Xi(r) {
  const e = (r.items ?? []).filter((i) => i.title);
  if (e.length === 0) return "";
  const t = e.map(
    (i) => `<div class="mp-features__item"><div class="mp-features__icon"><span class="material-symbols-outlined">${k(i.icon || "bolt")}</span></div><h4 class="mp-features__title">${k(i.title)}</h4></div>`
  ).join("");
  return `${r.heading ? `<h3 class="mp-section-heading">${k(r.heading)}</h3>` : ""}<div class="mp-features">${t}</div>`;
}
const Qi = /<div\s+([^>]*data-cms-block="marketplace-core\/features"[^>]*)>\s*<\/div>/g;
function Zi(r) {
  return r.replace(Qi, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, et);
    return Xi(o) || "";
  });
}
const yt = {
  eyebrow: "",
  headline: "",
  subhead: "",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  imageUrl: "",
  imageAlt: ""
};
function eo(r) {
  var a, s, l, c, p, u, h, m;
  if (!((a = r.headline) != null && a.trim())) return "";
  const e = (s = r.eyebrow) != null && s.trim() ? `<p class="mp-hero-x__eyebrow">${k(r.eyebrow)}</p>` : "", t = (l = r.subhead) != null && l.trim() ? `<p class="mp-hero-x__sub">${k(r.subhead)}</p>` : "", n = [
    (c = r.primaryCta) != null && c.label && ((p = r.primaryCta) != null && p.href) ? `<a class="mp-btn mp-btn--primary" href="${q(r.primaryCta.href)}">${k(r.primaryCta.label)}</a>` : "",
    (u = r.secondaryCta) != null && u.label && ((h = r.secondaryCta) != null && h.href) ? `<a class="mp-btn mp-btn--secondary" href="${q(r.secondaryCta.href)}">${k(r.secondaryCta.label)}</a>` : ""
  ].filter(Boolean).join(""), i = n ? `<div class="mp-hero-x__ctas">${n}</div>` : "", o = (m = r.imageUrl) != null && m.trim() ? `<div class="mp-hero-x__visual"><img src="${q(r.imageUrl)}" alt="${q(r.imageAlt || r.headline)}" loading="eager"/></div>` : "";
  return `<section class="mp-hero-x">
  <div class="mp-hero-x__copy">
    ${e}
    <h1 class="mp-hero-x__headline">${k(r.headline)}</h1>
    ${t}
    ${i}
  </div>
  ${o}
</section>`;
}
const to = /<div\s+([^>]*data-cms-block="marketplace-core\/landing-hero"[^>]*)>\s*<\/div>/g;
function no(r) {
  return r.replace(to, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, yt);
    return eo(o) || "";
  });
}
const xt = {
  heading: "",
  subhead: "",
  items: []
};
function ro(r) {
  var o, a;
  const e = (r.items ?? []).filter((s) => s.title);
  if (e.length === 0) return "";
  const t = e.map(
    (s) => `<div class="mp-grid-feat__card">
      <div class="mp-grid-feat__icon"><span class="material-symbols-outlined">${k(s.icon || "bolt")}</span></div>
      <h3 class="mp-grid-feat__title">${k(s.title)}</h3>
      ${s.body ? `<p class="mp-grid-feat__body">${k(s.body)}</p>` : ""}
    </div>`
  ).join(""), n = (o = r.heading) != null && o.trim() ? `<h2 class="mp-section-heading">${k(r.heading)}</h2>` : "", i = (a = r.subhead) != null && a.trim() ? `<p class="mp-section-sub">${k(r.subhead)}</p>` : "";
  return `<section class="mp-grid-feat">
  ${n}
  ${i}
  <div class="mp-grid-feat__row">${t}</div>
</section>`;
}
const io = /<div\s+([^>]*data-cms-block="marketplace-core\/feature-grid"[^>]*)>\s*<\/div>/g;
function oo(r) {
  return r.replace(io, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, xt);
    return ro(o) || "";
  });
}
const vt = {
  imagePosition: "right",
  eyebrow: "",
  headline: "",
  body: "",
  bullets: [],
  ctaLabel: "",
  ctaHref: "",
  imageUrl: "",
  imageAlt: ""
};
function ao(r) {
  var l, c, p, u, h, m;
  if (!((l = r.headline) != null && l.trim())) return "";
  const e = (c = r.eyebrow) != null && c.trim() ? `<p class="mp-row-feat__eyebrow">${k(r.eyebrow)}</p>` : "", t = (p = r.body) != null && p.trim() ? `<p class="mp-row-feat__body">${k(r.body)}</p>` : "", n = (r.bullets ?? []).filter((b) => b == null ? void 0 : b.trim()), i = n.length > 0 ? `<ul class="mp-row-feat__bullets">${n.map((b) => `<li><span class="material-symbols-outlined">check_circle</span>${k(b)}</li>`).join("")}</ul>` : "", o = (u = r.ctaLabel) != null && u.trim() && ((h = r.ctaHref) != null && h.trim()) ? `<a class="mp-row-feat__cta" href="${q(r.ctaHref)}">${k(r.ctaLabel)} <span aria-hidden="true">→</span></a>` : "", a = (m = r.imageUrl) != null && m.trim() ? `<div class="mp-row-feat__visual"><img src="${q(r.imageUrl)}" alt="${q(r.imageAlt || r.headline)}" loading="lazy"/></div>` : "";
  return `<section class="mp-row-feat ${r.imagePosition === "left" ? "mp-row-feat--image-left" : "mp-row-feat--image-right"}">
  ${a}
  <div class="mp-row-feat__copy">
    ${e}
    <h2 class="mp-row-feat__headline">${k(r.headline)}</h2>
    ${t}
    ${i}
    ${o}
  </div>
</section>`;
}
const so = /<div\s+([^>]*data-cms-block="marketplace-core\/feature-row"[^>]*)>\s*<\/div>/g;
function lo(r) {
  return r.replace(so, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, vt);
    return ao(o) || "";
  });
}
const wt = {
  items: []
};
function co(r) {
  const e = (r.items ?? []).filter((n) => n.value || n.label);
  return e.length === 0 ? "" : `<section class="mp-stats"><div class="mp-stats__row">${e.map(
    (n) => `<div class="mp-stats__cell">
      <p class="mp-stats__value">${k(n.value)}</p>
      <p class="mp-stats__label">${k(n.label)}</p>
    </div>`
  ).join("")}</div></section>`;
}
const po = /<div\s+([^>]*data-cms-block="marketplace-core\/stats-bar"[^>]*)>\s*<\/div>/g;
function uo(r) {
  return r.replace(po, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, wt);
    return co(o) || "";
  });
}
const kt = {
  headline: "",
  body: "",
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" }
};
function ho(r) {
  var i, o, a, s, l, c;
  if (!((i = r.headline) != null && i.trim())) return "";
  const e = (o = r.body) != null && o.trim() ? `<p class="mp-cta-banner__body">${k(r.body)}</p>` : "", t = [
    (a = r.primaryCta) != null && a.label && ((s = r.primaryCta) != null && s.href) ? `<a class="mp-btn mp-btn--primary" href="${q(r.primaryCta.href)}">${k(r.primaryCta.label)}</a>` : "",
    (l = r.secondaryCta) != null && l.label && ((c = r.secondaryCta) != null && c.href) ? `<a class="mp-btn mp-btn--ghost" href="${q(r.secondaryCta.href)}">${k(r.secondaryCta.label)}</a>` : ""
  ].filter(Boolean).join(""), n = t ? `<div class="mp-cta-banner__ctas">${t}</div>` : "";
  return `<section class="mp-cta-banner">
  <div class="mp-cta-banner__inner">
    <h2 class="mp-cta-banner__headline">${k(r.headline)}</h2>
    ${e}
    ${n}
  </div>
</section>`;
}
const fo = /<div\s+([^>]*data-cms-block="marketplace-core\/cta-banner"[^>]*)>\s*<\/div>/g;
function mo(r) {
  return r.replace(fo, (e, t) => {
    const n = t.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/), i = n ? n[1] ?? n[2] ?? n[3] ?? "" : "", o = Y(i, kt);
    return ho(o) || "";
  });
}
const go = /<blockquote>\s*<p><strong>([^<]+)<\/strong><\/p>\s*([\s\S]*?)<\/blockquote>/g;
function bo(r) {
  const e = r.toLowerCase();
  return /(danger|critical|important)/.test(e) ? "danger" : /(warning|caution|attention|gotcha)/.test(e) ? "warning" : /(tip|astuce)/.test(e) ? "tip" : /(note|remarque)/.test(e) ? "note" : "info";
}
function yo(r) {
  return r.replace(go, (e, t, n) => {
    const i = bo(t), o = n.trim();
    return `<aside class="mp-admonition mp-admonition--${i}" role="note"><div class="mp-admonition__title"><span class="mp-admonition__icon" aria-hidden="true"></span><span>${oe(t)}</span></div><div class="mp-admonition__body">${o}</div></aside>`;
  });
}
function oe(r) {
  return r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const xo = /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;
function vo(r, e, t) {
  return r.replace(xo, (n, i, o) => {
    const a = i ? i.toUpperCase() : "";
    return `<div class="mp-codeblock"${i ? ` data-lang="${oe(i)}"` : ""}><div class="mp-codeblock__bar"><span class="mp-codeblock__lang">${oe(a)}</span><button type="button" class="mp-codeblock__copy" data-cms-copy data-cms-copy-label-default="${oe(e)}" data-cms-copy-label-done="${oe(t)}" aria-label="${oe(e)}"><span class="mp-codeblock__copy-icon" aria-hidden="true"></span><span class="mp-codeblock__copy-label" data-cms-copy-label>${oe(e)}</span></button></div><pre><code${i ? ` class="language-${oe(i)}"` : ""}>${o}</code></pre></div>`;
  });
}
function wo(r, e = "Copy", t = "Copied") {
  let n = r;
  return n = yo(n), n = vo(n, e, t), n;
}
function ko(r, e, t) {
  let n = r;
  return n = Vi(n), n = Wi(n), n = Yi(n), n = Zi(n), n = no(n), n = oo(n), n = lo(n), n = uo(n), n = mo(n), n = wo(n, e, t), n;
}
function _o(r) {
  const e = r.trim(), t = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(e);
  if (!t) return e;
  const n = t[1];
  if (n.length === 3) {
    const s = parseInt(n[0] + n[0], 16), l = parseInt(n[1] + n[1], 16), c = parseInt(n[2] + n[2], 16);
    return `${s} ${l} ${c}`;
  }
  const i = parseInt(n.slice(0, 2), 16), o = parseInt(n.slice(2, 4), 16), a = parseInt(n.slice(4, 6), 16);
  return `${i} ${o} ${a}`;
}
function wn(r) {
  return `"${r.replace(/"/g, '\\"')}"`;
}
const se = {
  sans: {
    "Hanken Grotesk": "Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400",
    Inter: "Inter:wght@400;500;600;700",
    Manrope: "Manrope:wght@400;500;600;700",
    "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
    Outfit: "Outfit:wght@400;500;600;700",
    "Space Grotesk": "Space+Grotesk:wght@400;500;600;700",
    "DM Sans": "DM+Sans:wght@400;500;600;700",
    "Work Sans": "Work+Sans:wght@400;500;600;700",
    "Bricolage Grotesque": "Bricolage+Grotesque:wght@400;500;600;700",
    Oswald: "Oswald:wght@400;500;600;700",
    "Barlow Condensed": "Barlow+Condensed:wght@400;500;600;700",
    "Big Shoulders Display": "Big+Shoulders+Display:wght@400;500;600;700",
    Anton: "Anton",
    "Archivo Black": "Archivo+Black",
    "Bowlby One": "Bowlby+One",
    Unbounded: "Unbounded:wght@400;500;600;700"
  },
  serif: {
    Newsreader: "Newsreader:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700",
    Lora: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "Playfair Display": "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "EB Garamond": "EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "Source Serif 4": "Source+Serif+4:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "Crimson Pro": "Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    Spectral: "Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700",
    "DM Serif Display": "DM+Serif+Display:ital,wght@0,400;1,400"
  }
};
function kn(r, e) {
  const t = {
    ...se.sans,
    ...se.serif
  };
  return t[r] ?? t[e];
}
function No(r, e) {
  const t = kn(r, "Hanken Grotesk"), n = kn(e, "Inter");
  return t === n ? `https://fonts.googleapis.com/css2?family=${t}&display=swap` : `https://fonts.googleapis.com/css2?family=${t}&family=${n}&display=swap`;
}
function So() {
  return `https://fonts.googleapis.com/css2?${[
    ...Object.keys(se.sans),
    ...Object.keys(se.serif)
  ].map((t) => `family=${t.replace(/ /g, "+")}`).join("&")}&display=swap`;
}
function Co(r, e) {
  const t = {
    vars: { ...X.vars, ...e.vars },
    fontHeadline: e.fontHeadline || X.fontHeadline,
    fontBody: e.fontBody || X.fontBody
  }, n = t.fontHeadline !== X.fontHeadline || t.fontBody !== X.fontBody, i = Object.entries(t.vars).filter(([, l]) => l && l.trim());
  if (!n && i.length === 0) return r;
  let o = r;
  if (n) {
    const l = No(t.fontHeadline, t.fontBody);
    o = o.replace(
      /@import\s+url\(\s*"https:\/\/fonts\.googleapis\.com\/css2[^"]*"\s*\)\s*;/,
      `@import url("${l}");`
    );
  }
  const a = i.map(([l, c]) => {
    const p = l.startsWith("--color-");
    return `${l}:${p ? _o(c) : c};`;
  }).join(""), s = n ? `--font-headline:${wn(t.fontHeadline)};--font-body:${wn(t.fontBody)};` : "";
  return o += `
:root{${s}${a}}
`, o;
}
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Eo = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), nr = (...r) => r.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Ao = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mo = qt(
  ({
    color: r = "currentColor",
    size: e = 24,
    strokeWidth: t = 2,
    absoluteStrokeWidth: n,
    className: i = "",
    children: o,
    iconNode: a,
    ...s
  }, l) => lt(
    "svg",
    {
      ref: l,
      ...Ao,
      width: e,
      height: e,
      stroke: r,
      strokeWidth: n ? Number(t) * 24 / Number(e) : t,
      className: nr("lucide", i),
      ...s
    },
    [
      ...a.map(([c, p]) => lt(c, p)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const B = (r, e) => {
  const t = qt(
    ({ className: n, ...i }, o) => lt(Mo, {
      ref: o,
      iconNode: e,
      className: nr(`lucide-${Eo(r)}`, n),
      ...i
    })
  );
  return t.displayName = `${r}`, t;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Io = B("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const To = B("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rr = B("ChartColumn", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ir = B("Download", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
  ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gt = B("ImagePlus", [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const or = B("LayoutGrid", [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ar = B("ListChecks", [
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["path", { d: "m3 7 2 2 4-4", key: "1obspn" }],
  ["path", { d: "M13 6h8", key: "15sg57" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 18h8", key: "oe0vm4" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ro = B("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const sr = B("Megaphone", [
  ["path", { d: "m3 11 18-5v12L3 14v-3z", key: "n962bs" }],
  ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6", key: "1yl0tm" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ee = B("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lr = B("Rocket", [
  [
    "path",
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      key: "m3kijz"
    }
  ],
  [
    "path",
    {
      d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
      key: "1fmvmk"
    }
  ],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", key: "1f8sc4" }],
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const cr = B("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oo = B("Save", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dr = B("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pr = B("SquareSplitVertical", [
  ["path", { d: "M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3", key: "1pi83i" }],
  ["path", { d: "M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3", key: "ido5k7" }],
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xe = B("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
function $o({
  config: r,
  save: e
}) {
  const t = {
    ...ie,
    ...r,
    home: { ...ie.home, ...r.home ?? {} },
    single: { ...ie.single, ...r.single ?? {} },
    sidebar: { ...ie.sidebar, ...r.sidebar ?? {} },
    footer: { ...ie.footer, ...r.footer ?? {} },
    brand: { ...ie.brand, ...r.brand ?? {} },
    style: { ...ie.style, ...r.style ?? {} }
  }, [n, i] = fe(t), [o, a] = fe("home"), [s, l] = fe(!1);
  async function c() {
    l(!0);
    try {
      await e(n);
    } finally {
      l(!1);
    }
  }
  return /* @__PURE__ */ f("div", { className: "space-y-6", children: [
    /* @__PURE__ */ d("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: "Marketplace Core — app-store style theme for listing your themes and plugins." }),
    /* @__PURE__ */ d(
      "nav",
      {
        className: "flex flex-wrap gap-1 border-b border-surface-200 dark:border-surface-800",
        "aria-label": "Marketplace settings tabs",
        children: [
          { id: "home", label: "Home" },
          { id: "single", label: "Product page" },
          { id: "sidebar", label: "Sidebar" },
          { id: "footer", label: "Footer" },
          { id: "style", label: "Style" }
        ].map((u) => /* @__PURE__ */ d(
          Do,
          {
            active: o === u.id,
            onClick: () => a(u.id),
            label: u.label
          },
          u.id
        ))
      }
    ),
    o === "home" && /* @__PURE__ */ d(Lo, { home: n.home, onChange: (u) => i({ ...n, home: u }) }),
    o === "single" && /* @__PURE__ */ d(
      Bo,
      {
        single: n.single,
        onChange: (u) => i({ ...n, single: u })
      }
    ),
    o === "sidebar" && /* @__PURE__ */ d(
      zo,
      {
        sidebar: n.sidebar,
        onChange: (u) => i({ ...n, sidebar: u })
      }
    ),
    o === "footer" && /* @__PURE__ */ d(
      Fo,
      {
        copyright: n.footer.copyright,
        wordmark: n.brand.wordmark,
        onChange: (u, h) => i({
          ...n,
          footer: { ...n.footer, ...u },
          brand: { ...n.brand, ...h }
        })
      }
    ),
    o === "style" && /* @__PURE__ */ d(Po, { style: n.style, onChange: (u) => i({ ...n, style: u }) }),
    /* @__PURE__ */ f("div", { className: "card p-4 flex flex-wrap gap-3 justify-end", children: [
      o === "style" && (() => {
        const u = n.style.fontHeadline !== X.fontHeadline || n.style.fontBody !== X.fontBody || Object.keys(n.style.vars ?? {}).length > 0;
        return /* @__PURE__ */ f(
          "button",
          {
            type: "button",
            onClick: () => i({ ...n, style: { ...X } }),
            disabled: !u,
            className: "btn-ghost disabled:opacity-40 disabled:cursor-not-allowed",
            title: "Reset fonts and palette to their defaults",
            children: [
              /* @__PURE__ */ d(cr, { className: "h-4 w-4" }),
              "Reset to defaults"
            ]
          }
        );
      })(),
      /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          onClick: c,
          disabled: s,
          className: "btn-primary disabled:opacity-60 disabled:cursor-wait",
          children: /* @__PURE__ */ f("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ d(Ro, { className: s ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ d(Oo, { className: s ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ d("span", { children: s ? "Saving…" : "Save & apply" })
          ] })
        }
      )
    ] })
  ] });
}
function Lo({
  home: r,
  onChange: e
}) {
  return /* @__PURE__ */ f("div", { className: "space-y-4", children: [
    /* @__PURE__ */ f(D, { title: "Hero", children: [
      /* @__PURE__ */ d(C, { label: "Eyebrow", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.heroEyebrow,
          onChange: (t) => e({ ...r, heroEyebrow: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Headline", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.heroHeadline,
          onChange: (t) => e({ ...r, heroHeadline: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Intro", children: /* @__PURE__ */ d(
        "textarea",
        {
          className: "input",
          rows: 3,
          value: r.heroIntro,
          onChange: (t) => e({ ...r, heroIntro: t.target.value })
        }
      ) })
    ] }),
    /* @__PURE__ */ d(D, { title: "Featured section", children: /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ d(C, { label: "Category slug", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.featuredCategorySlug,
          onChange: (t) => e({ ...r, featuredCategorySlug: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.featuredHeading,
          onChange: (t) => e({ ...r, featuredHeading: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Item count", children: /* @__PURE__ */ d(
        "input",
        {
          type: "number",
          min: 0,
          className: "input",
          value: r.featuredCount,
          onChange: (t) => e({ ...r, featuredCount: parseInt(t.target.value, 10) || 0 })
        }
      ) })
    ] }) }),
    /* @__PURE__ */ d(D, { title: "New section", children: /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ d(C, { label: "Category slug", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.newCategorySlug,
          onChange: (t) => e({ ...r, newCategorySlug: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.newHeading,
          onChange: (t) => e({ ...r, newHeading: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Item count", children: /* @__PURE__ */ d(
        "input",
        {
          type: "number",
          min: 0,
          className: "input",
          value: r.newCount,
          onChange: (t) => e({ ...r, newCount: parseInt(t.target.value, 10) || 0 })
        }
      ) })
    ] }) }),
    /* @__PURE__ */ f(D, { title: "Recently Updated", children: [
      /* @__PURE__ */ d(
        Dt,
        {
          label: "Show this section",
          value: r.showRecentlyUpdated,
          onChange: (t) => e({ ...r, showRecentlyUpdated: t })
        }
      ),
      /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
          "input",
          {
            className: "input",
            value: r.recentlyUpdatedHeading,
            onChange: (t) => e({ ...r, recentlyUpdatedHeading: t.target.value })
          }
        ) }),
        /* @__PURE__ */ d(C, { label: "Item count", children: /* @__PURE__ */ d(
          "input",
          {
            type: "number",
            min: 0,
            className: "input",
            value: r.recentlyUpdatedCount,
            onChange: (t) => e({ ...r, recentlyUpdatedCount: parseInt(t.target.value, 10) || 0 })
          }
        ) })
      ] })
    ] })
  ] });
}
function Bo({
  single: r,
  onChange: e
}) {
  return /* @__PURE__ */ f("div", { className: "space-y-4", children: [
    /* @__PURE__ */ d(D, { title: "Section labels", children: /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ d(C, { label: "Description", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.descriptionLabel,
          onChange: (t) => e({ ...r, descriptionLabel: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Specifications", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.specificationsLabel,
          onChange: (t) => e({ ...r, specificationsLabel: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Features", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.featuresLabel,
          onChange: (t) => e({ ...r, featuresLabel: t.target.value })
        }
      ) })
    ] }) }),
    /* @__PURE__ */ d(D, { title: "Call-to-action labels", children: /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ d(C, { label: "Download button", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.downloadLabel,
          onChange: (t) => e({ ...r, downloadLabel: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Preview button", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.previewLabel,
          onChange: (t) => e({ ...r, previewLabel: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Free badge", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.freeBadgeLabel,
          onChange: (t) => e({ ...r, freeBadgeLabel: t.target.value })
        }
      ) })
    ] }) }),
    /* @__PURE__ */ f(D, { title: "Block visibility", children: [
      /* @__PURE__ */ d(
        Dt,
        {
          label: "Show specs block when present in body",
          value: r.showSpecs,
          onChange: (t) => e({ ...r, showSpecs: t })
        }
      ),
      /* @__PURE__ */ d(
        Dt,
        {
          label: "Show features block when present in body",
          value: r.showFeatures,
          onChange: (t) => e({ ...r, showFeatures: t })
        }
      )
    ] })
  ] });
}
function zo({
  sidebar: r,
  onChange: e
}) {
  return /* @__PURE__ */ f("div", { className: "space-y-4", children: [
    /* @__PURE__ */ f(D, { title: "Top section", children: [
      /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.heading,
          onChange: (t) => e({ ...r, heading: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(
        Et,
        {
          items: r.topItems,
          onChange: (t) => e({ ...r, topItems: t })
        }
      )
    ] }),
    /* @__PURE__ */ f(D, { title: "Categories", children: [
      /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.categoriesHeading,
          onChange: (t) => e({ ...r, categoriesHeading: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(
        Et,
        {
          items: r.categoriesItems,
          onChange: (t) => e({ ...r, categoriesItems: t })
        }
      )
    ] }),
    /* @__PURE__ */ f(D, { title: "Documentation", children: [
      /* @__PURE__ */ d(C, { label: "Heading", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r.docsHeading ?? "",
          onChange: (t) => e({ ...r, docsHeading: t.target.value })
        }
      ) }),
      /* @__PURE__ */ d(
        Et,
        {
          items: r.docsItems ?? [],
          onChange: (t) => e({ ...r, docsItems: t })
        }
      )
    ] })
  ] });
}
function Fo({
  copyright: r,
  wordmark: e,
  onChange: t
}) {
  return /* @__PURE__ */ f("div", { className: "space-y-4", children: [
    /* @__PURE__ */ d(D, { title: "Brand", children: /* @__PURE__ */ f(C, { label: "Wordmark", children: [
      /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: e,
          onChange: (n) => t({ copyright: r }, { wordmark: n.target.value })
        }
      ),
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 mt-1", children: "Leave empty to fall back to the site title." })
    ] }) }),
    /* @__PURE__ */ d(D, { title: "Footer", children: /* @__PURE__ */ f(C, { label: "Copyright line", children: [
      /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: r,
          onChange: (n) => t({ copyright: n.target.value }, { wordmark: e })
        }
      ),
      /* @__PURE__ */ f("p", { className: "text-xs text-surface-500 mt-1", children: [
        "Empty falls back to ",
        /* @__PURE__ */ d("code", { children: "© <year> <site title>." })
      ] })
    ] }) })
  ] });
}
function Po({
  style: r,
  onChange: e
}) {
  const t = [
    { name: "--color-primary", label: "Primary (action color)" },
    { name: "--color-secondary", label: "Secondary" },
    { name: "--color-tertiary", label: "Tertiary" },
    { name: "--color-background", label: "Background" },
    { name: "--color-on-surface", label: "Text" }
  ], n = [
    ...Object.keys(se.sans).map((a) => ({
      name: a,
      fallback: "sans-serif"
    })),
    ...Object.keys(se.serif).map((a) => ({
      name: a,
      fallback: "serif"
    }))
  ];
  function i(a, s) {
    const l = { ...r.vars };
    s && s.trim() ? l[a] = s : delete l[a], e({ ...r, vars: l });
  }
  function o(a) {
    const s = { ...r.vars };
    delete s[a], e({ ...r, vars: s });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-4", children: [
    /* @__PURE__ */ d("link", { rel: "stylesheet", href: So() }),
    /* @__PURE__ */ d(D, { title: "Typography", children: /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ d(C, { label: "Headline font", children: /* @__PURE__ */ d(
        bn,
        {
          options: n,
          value: r.fontHeadline,
          onChange: (a) => e({ ...r, fontHeadline: a }),
          ariaLabel: "Headline font"
        }
      ) }),
      /* @__PURE__ */ d(C, { label: "Body font", children: /* @__PURE__ */ d(
        bn,
        {
          options: n,
          value: r.fontBody,
          onChange: (a) => e({ ...r, fontBody: a }),
          ariaLabel: "Body font"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ f(D, { title: "Palette overrides", children: [
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500", children: "Leave a field empty to keep the bundled default. Click ↺ to clear an override." }),
      /* @__PURE__ */ d("div", { className: "space-y-2", children: t.map((a) => /* @__PURE__ */ d(
        Ho,
        {
          label: a.label,
          value: r.vars[a.name] ?? "",
          onChange: (s) => i(a.name, s),
          onClear: () => o(a.name)
        },
        a.name
      )) })
    ] })
  ] });
}
function Do({
  active: r,
  onClick: e,
  label: t
}) {
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      onClick: e,
      className: r ? "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-blue-600 text-surface-900 dark:text-surface-50" : "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-transparent text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100",
      children: t
    }
  );
}
function D({ title: r, children: e }) {
  return /* @__PURE__ */ f("section", { className: "card p-4 space-y-3", children: [
    /* @__PURE__ */ d("h3", { className: "text-sm font-semibold text-surface-900 dark:text-surface-50", children: r }),
    e
  ] });
}
function C({ label: r, children: e }) {
  return /* @__PURE__ */ f("div", { children: [
    /* @__PURE__ */ d("label", { className: "label", children: r }),
    e
  ] });
}
function Dt({
  label: r,
  value: e,
  onChange: t
}) {
  return /* @__PURE__ */ f("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300 cursor-pointer", children: [
    /* @__PURE__ */ d(
      "input",
      {
        type: "checkbox",
        checked: e,
        onChange: (n) => t(n.target.checked),
        className: "h-4 w-4 rounded border-surface-300 text-blue-600 focus:ring-blue-500"
      }
    ),
    /* @__PURE__ */ d("span", { children: r })
  ] });
}
function Ho({
  label: r,
  value: e,
  onChange: t,
  onClear: n
}) {
  const i = !!e;
  return /* @__PURE__ */ f("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ d(
      "input",
      {
        type: "color",
        value: /^#/.test(e) ? e : "#0037b0",
        onChange: (o) => t(o.target.value),
        className: "h-8 w-10 rounded border border-surface-300 dark:border-surface-700 cursor-pointer shrink-0"
      }
    ),
    /* @__PURE__ */ d("span", { className: "flex-1 text-sm text-surface-700 dark:text-surface-300", children: r }),
    /* @__PURE__ */ d("code", { className: "text-xs text-surface-500 tabular-nums", children: e || "default" }),
    /* @__PURE__ */ d(
      "button",
      {
        type: "button",
        onClick: n,
        disabled: !i,
        className: "p-1 rounded text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed",
        title: "Clear override",
        "aria-label": "Clear override",
        children: /* @__PURE__ */ d(cr, { className: "h-3.5 w-3.5" })
      }
    )
  ] });
}
function Et({
  items: r,
  onChange: e
}) {
  const [t, n] = fe(/* @__PURE__ */ new Set());
  function i(c, p) {
    const u = [...r];
    u[c] = { ...u[c], ...p }, e(u);
  }
  function o(c, p, u) {
    var A;
    const h = r[c], b = { ...((A = h.translations) == null ? void 0 : A[p]) ?? {}, ...u }, g = {};
    b.label && b.label.trim() !== "" && (g.label = b.label), b.href && b.href.trim() !== "" && (g.href = b.href);
    const y = { ...h.translations ?? {} };
    Object.keys(g).length === 0 ? delete y[p] : y[p] = g;
    const v = [...r];
    v[c] = {
      ...h,
      translations: Object.keys(y).length === 0 ? void 0 : y
    }, e(v);
  }
  function a(c) {
    e(r.filter((p, u) => u !== c)), n((p) => {
      const u = /* @__PURE__ */ new Set();
      for (const h of p)
        h < c ? u.add(h) : h > c && u.add(h - 1);
      return u;
    });
  }
  function s() {
    e([...r, { icon: "", label: "", href: "" }]);
  }
  function l(c) {
    n((p) => {
      const u = new Set(p);
      return u.has(c) ? u.delete(c) : u.add(c), u;
    });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-2", children: [
    r.length === 0 && /* @__PURE__ */ d("p", { className: "text-xs text-surface-500", children: "No items yet." }),
    r.map((c, p) => {
      var b;
      const u = t.has(p), h = (b = c.translations) == null ? void 0 : b.fr, m = !!(h != null && h.label || h != null && h.href);
      return /* @__PURE__ */ f(
        "div",
        {
          className: "p-2 rounded border border-surface-200 dark:border-surface-800 space-y-2",
          children: [
            /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_2fr_3fr_auto_auto] gap-2 items-center", children: [
              /* @__PURE__ */ d(
                "input",
                {
                  className: "input text-xs",
                  placeholder: "Icon",
                  value: c.icon,
                  onChange: (g) => i(p, { icon: g.target.value })
                }
              ),
              /* @__PURE__ */ d(
                "input",
                {
                  className: "input text-xs",
                  placeholder: "Label",
                  value: c.label,
                  onChange: (g) => i(p, { label: g.target.value })
                }
              ),
              /* @__PURE__ */ d(
                "input",
                {
                  className: "input text-xs",
                  placeholder: "/path/to/page.html",
                  value: c.href,
                  onChange: (g) => i(p, { href: g.target.value })
                }
              ),
              /* @__PURE__ */ d(
                "button",
                {
                  type: "button",
                  onClick: () => l(p),
                  className: "px-2 py-1 rounded text-[10px] font-semibold tracking-wider uppercase border " + (m ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300" : "border-surface-300 text-surface-500 dark:border-surface-700 dark:text-surface-400"),
                  "aria-label": m ? "Edit FR translation" : "Add FR translation",
                  title: m ? "FR translation present — click to edit" : "Add FR translation",
                  children: "FR"
                }
              ),
              /* @__PURE__ */ d(
                "button",
                {
                  type: "button",
                  onClick: () => a(p),
                  className: "p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30",
                  "aria-label": "Remove item",
                  title: "Remove item",
                  children: /* @__PURE__ */ d(xe, { className: "h-3.5 w-3.5" })
                }
              )
            ] }),
            u && /* @__PURE__ */ f("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_2fr_3fr] gap-2 pt-2 border-t border-surface-200 dark:border-surface-800", children: [
              /* @__PURE__ */ d("span", { className: "text-[10px] font-semibold tracking-wider uppercase text-surface-500 self-center", children: "FR" }),
              /* @__PURE__ */ d(
                "input",
                {
                  className: "input text-xs",
                  placeholder: `Label FR (default: ${c.label || "—"})`,
                  value: (h == null ? void 0 : h.label) ?? "",
                  onChange: (g) => o(p, "fr", { label: g.target.value })
                }
              ),
              /* @__PURE__ */ d(
                "input",
                {
                  className: "input text-xs",
                  placeholder: `Href FR (default: ${c.href || "—"})`,
                  value: (h == null ? void 0 : h.href) ?? "",
                  onChange: (g) => o(p, "fr", { href: g.target.value })
                }
              )
            ] })
          ]
        },
        p
      );
    }),
    /* @__PURE__ */ f(
      "button",
      {
        type: "button",
        onClick: s,
        className: "btn-secondary text-xs",
        children: [
          /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
          "Add item"
        ]
      }
    )
  ] });
}
const _n = [...Object.keys(se.sans), ...Object.keys(se.serif)], At = "array of { icon, label, href, translations? }: icon = Material Symbols name (empty = no icon), href = root-absolute path (prefixed with /<lang> on secondary-language pages) or absolute URL, translations = optional { <lang>: { label?, href? } } overrides keyed by 2-letter language code (multilang).", Uo = {
  // ─── Home ───
  "home.heroEyebrow": { description: "Small uppercase line above the home hero headline. Empty hides it." },
  "home.heroHeadline": { description: "Home hero headline. The hero shows when the headline or the intro is set." },
  "home.heroIntro": { description: "Home hero intro paragraph. The hero shows when the headline or the intro is set." },
  "home.featuredCategorySlug": {
    description: "Category whose posts feed the first home section ('Featured Plugins'), linked to /<slug>/index.html. Empty or a 0 count hides the section.",
    format: "category slug (top-level URL segment)"
  },
  "home.featuredHeading": { description: "Heading of the featured section." },
  "home.featuredCount": { description: "Number of cards in the featured section. 0 hides it.", min: 0 },
  "home.newCategorySlug": {
    description: "Category whose posts feed the second home section ('New Themes'), linked to /<slug>/index.html. Empty or a 0 count hides the section.",
    format: "category slug (top-level URL segment)"
  },
  "home.newHeading": { description: "Heading of the second home section." },
  "home.newCount": { description: "Number of cards in the second home section. 0 hides it.", min: 0 },
  "home.showRecentlyUpdated": { description: "Show a third home section with the latest posts across all categories." },
  "home.recentlyUpdatedHeading": { description: "Heading of the recently updated section." },
  "home.recentlyUpdatedCount": { description: "Number of cards in the recently updated section.", min: 0 },
  // ─── Single ───
  "single.descriptionLabel": { description: "'Description' section label. Not read by the templates yet." },
  "single.specificationsLabel": { description: "'Specifications' section label. Not read by the templates yet (the specs block carries its own title)." },
  "single.featuresLabel": { description: "'Key Features' section label. Not read by the templates yet (the features block carries its own title)." },
  "single.downloadLabel": { description: "'Download' button label. Not read by the templates yet (the header-buttons block carries its own labels)." },
  "single.previewLabel": { description: "'Live Preview' button label. Not read by the templates yet (the header-buttons block carries its own labels)." },
  "single.freeBadgeLabel": { description: "'Free' badge label. Not read by the templates yet." },
  "single.showSpecs": { description: "Specifications block toggle. Not read by the templates yet." },
  "single.showFeatures": { description: "Key features block toggle. Not read by the templates yet." },
  // ─── Sidebar (desktop left navigation) ───
  "sidebar.heading": { description: "Heading of the sidebar's top group ('Discover')." },
  "sidebar.topItems": { description: `Links of the sidebar's top group: ${At} Empty array hides the group.`, format: "array of objects" },
  "sidebar.categoriesHeading": { description: "Heading of the sidebar's categories group." },
  "sidebar.categoriesItems": { description: `Links of the sidebar's categories group: ${At} Empty array hides the group.`, format: "array of objects" },
  "sidebar.docsHeading": { description: "Heading of the sidebar's documentation group." },
  "sidebar.docsItems": { description: `Links of the sidebar's documentation group: ${At} Empty array hides the group.`, format: "array of objects" },
  "sidebar.headingTranslations": {
    description: "Per-language sidebar headings: { <lang>: { heading?, categoriesHeading?, docsHeading? } } keyed by 2-letter language code; missing entries fall back to the primary headings.",
    format: "map of language code → headings"
  },
  // ─── Footer / brand ───
  "footer.copyright": { description: "Footer copyright line. Empty = '© <year> <site title>.'" },
  "brand.wordmark": { description: "Wordmark text in the header and footer. Empty = the site title." },
  // ─── Style ───
  "style.vars": {
    description: "CSS variable overrides keyed by variable name (the settings page edits --color-primary, --color-secondary, --color-tertiary, --color-background, --color-on-surface; any --color-* variable of theme.css works). --color-* values are hex colors (converted to RGB triplets); other variables are written verbatim. Empty or missing = theme default. Live once theme-assets/marketplace-core.css is re-uploaded.",
    format: "map of CSS variable name → hex color"
  },
  "style.fontHeadline": {
    description: "Headline font, loaded from Google Fonts. Any preset name works in either slot.",
    values: _n
  },
  "style.fontBody": {
    description: "Body font, loaded from Google Fonts. Any preset name works in either slot.",
    values: _n
  }
};
function R(r) {
  this.content = r;
}
R.prototype = {
  constructor: R,
  find: function(r) {
    for (var e = 0; e < this.content.length; e += 2)
      if (this.content[e] === r) return e;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(r) {
    var e = this.find(r);
    return e == -1 ? void 0 : this.content[e + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(r, e, t) {
    var n = t && t != r ? this.remove(t) : this, i = n.find(r), o = n.content.slice();
    return i == -1 ? o.push(t || r, e) : (o[i + 1] = e, t && (o[i] = t)), new R(o);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(r) {
    var e = this.find(r);
    if (e == -1) return this;
    var t = this.content.slice();
    return t.splice(e, 2), new R(t);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(r, e) {
    return new R([r, e].concat(this.remove(r).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(r, e) {
    var t = this.remove(r).content.slice();
    return t.push(r, e), new R(t);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(r, e, t) {
    var n = this.remove(e), i = n.content.slice(), o = n.find(r);
    return i.splice(o == -1 ? i.length : o, 0, e, t), new R(i);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(r) {
    for (var e = 0; e < this.content.length; e += 2)
      r(this.content[e], this.content[e + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(r) {
    return r = R.from(r), r.size ? new R(r.content.concat(this.subtract(r).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(r) {
    return r = R.from(r), r.size ? new R(this.subtract(r).content.concat(r.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(r) {
    var e = this;
    r = R.from(r);
    for (var t = 0; t < r.content.length; t += 2)
      e = e.remove(r.content[t]);
    return e;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var r = {};
    return this.forEach(function(e, t) {
      r[e] = t;
    }), r;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
R.from = function(r) {
  if (r instanceof R) return r;
  var e = [];
  if (r) for (var t in r) e.push(t, r[t]);
  return new R(e);
};
function ur(r, e, t) {
  for (let n = 0; ; n++) {
    if (n == r.childCount || n == e.childCount)
      return r.childCount == e.childCount ? null : t;
    let i = r.child(n), o = e.child(n);
    if (i == o) {
      t += i.nodeSize;
      continue;
    }
    if (!i.sameMarkup(o))
      return t;
    if (i.isText && i.text != o.text) {
      for (let a = 0; i.text[a] == o.text[a]; a++)
        t++;
      return t;
    }
    if (i.content.size || o.content.size) {
      let a = ur(i.content, o.content, t + 1);
      if (a != null)
        return a;
    }
    t += i.nodeSize;
  }
}
function hr(r, e, t, n) {
  for (let i = r.childCount, o = e.childCount; ; ) {
    if (i == 0 || o == 0)
      return i == o ? null : { a: t, b: n };
    let a = r.child(--i), s = e.child(--o), l = a.nodeSize;
    if (a == s) {
      t -= l, n -= l;
      continue;
    }
    if (!a.sameMarkup(s))
      return { a: t, b: n };
    if (a.isText && a.text != s.text) {
      let c = 0, p = Math.min(a.text.length, s.text.length);
      for (; c < p && a.text[a.text.length - c - 1] == s.text[s.text.length - c - 1]; )
        c++, t--, n--;
      return { a: t, b: n };
    }
    if (a.content.size || s.content.size) {
      let c = hr(a.content, s.content, t - 1, n - 1);
      if (c)
        return c;
    }
    t -= l, n -= l;
  }
}
class x {
  /**
  @internal
  */
  constructor(e, t) {
    if (this.content = e, this.size = t || 0, t == null)
      for (let n = 0; n < e.length; n++)
        this.size += e[n].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, t, n, i = 0, o) {
    for (let a = 0, s = 0; s < t; a++) {
      let l = this.content[a], c = s + l.nodeSize;
      if (c > e && n(l, i + s, o || null, a) !== !1 && l.content.size) {
        let p = s + 1;
        l.nodesBetween(Math.max(0, e - p), Math.min(l.content.size, t - p), n, i + p);
      }
      s = c;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(e) {
    this.nodesBetween(0, this.size, e);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(e, t, n, i) {
    let o = "", a = !0;
    return this.nodesBetween(e, t, (s, l) => {
      let c = s.isText ? s.text.slice(Math.max(e, l) - l, t - l) : s.isLeaf ? i ? typeof i == "function" ? i(s) : i : s.type.spec.leafText ? s.type.spec.leafText(s) : "" : "";
      s.isBlock && (s.isLeaf && c || s.isTextblock) && n && (a ? a = !1 : o += n), o += c;
    }, 0), o;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(e) {
    if (!e.size)
      return this;
    if (!this.size)
      return e;
    let t = this.lastChild, n = e.firstChild, i = this.content.slice(), o = 0;
    for (t.isText && t.sameMarkup(n) && (i[i.length - 1] = t.withText(t.text + n.text), o = 1); o < e.content.length; o++)
      i.push(e.content[o]);
    return new x(i, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let n = [], i = 0;
    if (t > e)
      for (let o = 0, a = 0; a < t; o++) {
        let s = this.content[o], l = a + s.nodeSize;
        l > e && ((a < e || l > t) && (s.isText ? s = s.cut(Math.max(0, e - a), Math.min(s.text.length, t - a)) : s = s.cut(Math.max(0, e - a - 1), Math.min(s.content.size, t - a - 1))), n.push(s), i += s.nodeSize), a = l;
      }
    return new x(n, i);
  }
  /**
  @internal
  */
  cutByIndex(e, t) {
    return e == t ? x.empty : e == 0 && t == this.content.length ? this : new x(this.content.slice(e, t));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(e, t) {
    let n = this.content[e];
    if (n == t)
      return this;
    let i = this.content.slice(), o = this.size + t.nodeSize - n.nodeSize;
    return i[e] = t, new x(i, o);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(e) {
    return new x([e].concat(this.content), this.size + e.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(e) {
    return new x(this.content.concat(e), this.size + e.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(e) {
    if (this.content.length != e.content.length)
      return !1;
    for (let t = 0; t < this.content.length; t++)
      if (!this.content[t].eq(e.content[t]))
        return !1;
    return !0;
  }
  /**
  The first child of the fragment, or `null` if it is empty.
  */
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  /**
  The last child of the fragment, or `null` if it is empty.
  */
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  /**
  The number of child nodes in this fragment.
  */
  get childCount() {
    return this.content.length;
  }
  /**
  Get the child node at the given index. Raise an error when the
  index is out of range.
  */
  child(e) {
    let t = this.content[e];
    if (!t)
      throw new RangeError("Index " + e + " out of range for " + this);
    return t;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content[e] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    for (let t = 0, n = 0; t < this.content.length; t++) {
      let i = this.content[t];
      e(i, n, t), n += i.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, t = 0) {
    return ur(this, e, t);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, t = this.size, n = e.size) {
    return hr(this, e, t, n);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return tt(0, e);
    if (e == this.size)
      return tt(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, n = 0; ; t++) {
      let i = this.child(t), o = n + i.nodeSize;
      if (o >= e)
        return o == e ? tt(t + 1, o) : tt(t, n);
      n = o;
    }
  }
  /**
  Return a debugging string that describes this fragment.
  */
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  /**
  @internal
  */
  toStringInner() {
    return this.content.join(", ");
  }
  /**
  Create a JSON-serializeable representation of this fragment.
  */
  toJSON() {
    return this.content.length ? this.content.map((e) => e.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return x.empty;
    if (!Array.isArray(t))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new x(t.map(e.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(e) {
    if (!e.length)
      return x.empty;
    let t, n = 0;
    for (let i = 0; i < e.length; i++) {
      let o = e[i];
      n += o.nodeSize, i && o.isText && e[i - 1].sameMarkup(o) ? (t || (t = e.slice(0, i)), t[t.length - 1] = o.withText(t[t.length - 1].text + o.text)) : t && t.push(o);
    }
    return new x(t || e, n);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(e) {
    if (!e)
      return x.empty;
    if (e instanceof x)
      return e;
    if (Array.isArray(e))
      return this.fromArray(e);
    if (e.attrs)
      return new x([e], e.nodeSize);
    throw new RangeError("Can not convert " + e + " to a Fragment" + (e.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
x.empty = new x([], 0);
const Mt = { index: 0, offset: 0 };
function tt(r, e) {
  return Mt.index = r, Mt.offset = e, Mt;
}
function ct(r, e) {
  if (r === e)
    return !0;
  if (!(r && typeof r == "object") || !(e && typeof e == "object"))
    return !1;
  let t = Array.isArray(r);
  if (Array.isArray(e) != t)
    return !1;
  if (t) {
    if (r.length != e.length)
      return !1;
    for (let n = 0; n < r.length; n++)
      if (!ct(r[n], e[n]))
        return !1;
  } else {
    for (let n in r)
      if (!(n in e) || !ct(r[n], e[n]))
        return !1;
    for (let n in e)
      if (!(n in r))
        return !1;
  }
  return !0;
}
class S {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.attrs = t;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(e) {
    let t, n = !1;
    for (let i = 0; i < e.length; i++) {
      let o = e[i];
      if (this.eq(o))
        return e;
      if (this.type.excludes(o.type))
        t || (t = e.slice(0, i));
      else {
        if (o.type.excludes(this.type))
          return e;
        !n && o.type.rank > this.type.rank && (t || (t = e.slice(0, i)), t.push(this), n = !0), t && t.push(o);
      }
    }
    return t || (t = e.slice()), n || t.push(this), t;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return e.slice(0, t).concat(e.slice(t + 1));
    return e;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(e) {
    return this == e || this.type == e.type && ct(this.attrs, e.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return e;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let n = e.marks[t.type];
    if (!n)
      throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let i = n.create(t.attrs);
    return n.checkAttrs(i.attrs), i;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, t) {
    if (e == t)
      return !0;
    if (e.length != t.length)
      return !1;
    for (let n = 0; n < e.length; n++)
      if (!e[n].eq(t[n]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return S.none;
    if (e instanceof S)
      return [e];
    let t = e.slice();
    return t.sort((n, i) => n.type.rank - i.type.rank), t;
  }
}
S.none = [];
class dt extends Error {
}
class w {
  /**
  Create a slice. When specifying a non-zero open depth, you must
  make sure that there are nodes of at least that depth at the
  appropriate side of the fragment—i.e. if the fragment is an
  empty paragraph node, `openStart` and `openEnd` can't be greater
  than 1.
  
  It is not necessary for the content of open nodes to conform to
  the schema's content constraints, though it should be a valid
  start/end/middle for such a node, depending on which sides are
  open.
  */
  constructor(e, t, n) {
    this.content = e, this.openStart = t, this.openEnd = n;
  }
  /**
  The size this slice would add when inserted into a document.
  */
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  /**
  @internal
  */
  insertAt(e, t) {
    let n = mr(this.content, e + this.openStart, t);
    return n && new w(n, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, t) {
    return new w(fr(this.content, e + this.openStart, t + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(e) {
    return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
  }
  /**
  @internal
  */
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  /**
  Convert a slice to a JSON-serializable representation.
  */
  toJSON() {
    if (!this.content.size)
      return null;
    let e = { content: this.content.toJSON() };
    return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return w.empty;
    let n = t.openStart || 0, i = t.openEnd || 0;
    if (typeof n != "number" || typeof i != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new w(x.fromJSON(e, t.content), n, i);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let n = 0, i = 0;
    for (let o = e.firstChild; o && !o.isLeaf && (t || !o.type.spec.isolating); o = o.firstChild)
      n++;
    for (let o = e.lastChild; o && !o.isLeaf && (t || !o.type.spec.isolating); o = o.lastChild)
      i++;
    return new w(e, n, i);
  }
}
w.empty = new w(x.empty, 0, 0);
function fr(r, e, t) {
  let { index: n, offset: i } = r.findIndex(e), o = r.maybeChild(n), { index: a, offset: s } = r.findIndex(t);
  if (i == e || o.isText) {
    if (s != t && !r.child(a).isText)
      throw new RangeError("Removing non-flat range");
    return r.cut(0, e).append(r.cut(t));
  }
  if (n != a)
    throw new RangeError("Removing non-flat range");
  return r.replaceChild(n, o.copy(fr(o.content, e - i - 1, t - i - 1)));
}
function mr(r, e, t, n) {
  let { index: i, offset: o } = r.findIndex(e), a = r.maybeChild(i);
  if (o == e || a.isText)
    return n && !n.canReplace(i, i, t) ? null : r.cut(0, e).append(t).append(r.cut(e));
  let s = mr(a.content, e - o - 1, t, a);
  return s && r.replaceChild(i, a.copy(s));
}
function jo(r, e, t) {
  if (t.openStart > r.depth)
    throw new dt("Inserted content deeper than insertion position");
  if (r.depth - t.openStart != e.depth - t.openEnd)
    throw new dt("Inconsistent open depths");
  return gr(r, e, t, 0);
}
function gr(r, e, t, n) {
  let i = r.index(n), o = r.node(n);
  if (i == e.index(n) && n < r.depth - t.openStart) {
    let a = gr(r, e, t, n + 1);
    return o.copy(o.content.replaceChild(i, a));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && r.depth == n && e.depth == n) {
      let a = r.parent, s = a.content;
      return ge(a, s.cut(0, r.parentOffset).append(t.content).append(s.cut(e.parentOffset)));
    } else {
      let { start: a, end: s } = Vo(t, r);
      return ge(o, yr(r, a, s, e, n));
    }
  else return ge(o, pt(r, e, n));
}
function br(r, e) {
  if (!e.type.compatibleContent(r.type))
    throw new dt("Cannot join " + e.type.name + " onto " + r.type.name);
}
function Ht(r, e, t) {
  let n = r.node(t);
  return br(n, e.node(t)), n;
}
function me(r, e) {
  let t = e.length - 1;
  t >= 0 && r.isText && r.sameMarkup(e[t]) ? e[t] = r.withText(e[t].text + r.text) : e.push(r);
}
function Oe(r, e, t, n) {
  let i = (e || r).node(t), o = 0, a = e ? e.index(t) : i.childCount;
  r && (o = r.index(t), r.depth > t ? o++ : r.textOffset && (me(r.nodeAfter, n), o++));
  for (let s = o; s < a; s++)
    me(i.child(s), n);
  e && e.depth == t && e.textOffset && me(e.nodeBefore, n);
}
function ge(r, e) {
  return r.type.checkContent(e), r.copy(e);
}
function yr(r, e, t, n, i) {
  let o = r.depth > i && Ht(r, e, i + 1), a = n.depth > i && Ht(t, n, i + 1), s = [];
  return Oe(null, r, i, s), o && a && e.index(i) == t.index(i) ? (br(o, a), me(ge(o, yr(r, e, t, n, i + 1)), s)) : (o && me(ge(o, pt(r, e, i + 1)), s), Oe(e, t, i, s), a && me(ge(a, pt(t, n, i + 1)), s)), Oe(n, null, i, s), new x(s);
}
function pt(r, e, t) {
  let n = [];
  if (Oe(null, r, t, n), r.depth > t) {
    let i = Ht(r, e, t + 1);
    me(ge(i, pt(r, e, t + 1)), n);
  }
  return Oe(e, null, t, n), new x(n);
}
function Vo(r, e) {
  let t = e.depth - r.openStart, i = e.node(t).copy(r.content);
  for (let o = t - 1; o >= 0; o--)
    i = e.node(o).copy(x.from(i));
  return {
    start: i.resolveNoCache(r.openStart + t),
    end: i.resolveNoCache(i.content.size - r.openEnd - t)
  };
}
class Je {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.pos = e, this.path = t, this.parentOffset = n, this.depth = t.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(e) {
    return e == null ? this.depth : e < 0 ? this.depth + e : e;
  }
  /**
  The parent node that the position points into. Note that even if
  a position points into a text node, that node is not considered
  the parent—text nodes are ‘flat’ in this model, and have no content.
  */
  get parent() {
    return this.node(this.depth);
  }
  /**
  The root node in which the position was resolved.
  */
  get doc() {
    return this.node(0);
  }
  /**
  The ancestor node at the given level. `p.node(p.depth)` is the
  same as `p.parent`.
  */
  node(e) {
    return this.path[this.resolveDepth(e) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(e) {
    return this.path[this.resolveDepth(e) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(e) {
    return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(e) {
    return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(e) {
    return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position before the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position after the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
  }
  /**
  When this position points into a text node, this returns the
  distance between the position and the start of the text node.
  Will be zero for positions that point between nodes.
  */
  get textOffset() {
    return this.pos - this.path[this.path.length - 1];
  }
  /**
  Get the node directly after the position, if any. If the position
  points into a text node, only the part of that node after the
  position is returned.
  */
  get nodeAfter() {
    let e = this.parent, t = this.index(this.depth);
    if (t == e.childCount)
      return null;
    let n = this.pos - this.path[this.path.length - 1], i = e.child(t);
    return n ? e.child(t).cut(n) : i;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
    return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(e, t) {
    t = this.resolveDepth(t);
    let n = this.path[t * 3], i = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let o = 0; o < e; o++)
      i += n.child(o).nodeSize;
    return i;
  }
  /**
  Get the marks at this position, factoring in the surrounding
  marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
  position is at the start of a non-empty node, the marks of the
  node after it (if any) are returned.
  */
  marks() {
    let e = this.parent, t = this.index();
    if (e.content.size == 0)
      return S.none;
    if (this.textOffset)
      return e.child(t).marks;
    let n = e.maybeChild(t - 1), i = e.maybeChild(t);
    if (!n) {
      let s = n;
      n = i, i = s;
    }
    let o = n.marks;
    for (var a = 0; a < o.length; a++)
      o[a].type.spec.inclusive === !1 && (!i || !o[a].isInSet(i.marks)) && (o = o[a--].removeFromSet(o));
    return o;
  }
  /**
  Get the marks after the current position, if any, except those
  that are non-inclusive and not present at position `$end`. This
  is mostly useful for getting the set of marks to preserve after a
  deletion. Will return `null` if this position is at the end of
  its parent node or its parent node isn't a textblock (in which
  case no marks should be preserved).
  */
  marksAcross(e) {
    let t = this.parent.maybeChild(this.index());
    if (!t || !t.isInline)
      return null;
    let n = t.marks, i = e.parent.maybeChild(e.index());
    for (var o = 0; o < n.length; o++)
      n[o].type.spec.inclusive === !1 && (!i || !n[o].isInSet(i.marks)) && (n = n[o--].removeFromSet(n));
    return n;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(e) {
    for (let t = this.depth; t > 0; t--)
      if (this.start(t) <= e && this.end(t) >= e)
        return t;
    return 0;
  }
  /**
  Returns a range based on the place where this position and the
  given position diverge around block content. If both point into
  the same textblock, for example, a range around that textblock
  will be returned. If they point into different blocks, the range
  around those blocks in their shared ancestor is returned. You can
  pass in an optional predicate that will be called with a parent
  node to see if a range into that parent is acceptable.
  */
  blockRange(e = this, t) {
    if (e.pos < this.pos)
      return e.blockRange(this);
    for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--)
      if (e.pos <= this.end(n) && (!t || t(this.node(n))))
        return new ut(this, e, n);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(e) {
    return this.pos - this.parentOffset == e.pos - e.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(e) {
    return e.pos > this.pos ? e : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(e) {
    return e.pos < this.pos ? e : this;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 1; t <= this.depth; t++)
      e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
    return e + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(e, t) {
    if (!(t >= 0 && t <= e.content.size))
      throw new RangeError("Position " + t + " out of range");
    let n = [], i = 0, o = t;
    for (let a = e; ; ) {
      let { index: s, offset: l } = a.content.findIndex(o), c = o - l;
      if (n.push(a, s, i + l), !c || (a = a.child(s), a.isText))
        break;
      o = c - 1, i += l + 1;
    }
    return new Je(t, n, o);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let n = Nn.get(e);
    if (n)
      for (let o = 0; o < n.elts.length; o++) {
        let a = n.elts[o];
        if (a.pos == t)
          return a;
      }
    else
      Nn.set(e, n = new Jo());
    let i = n.elts[n.i] = Je.resolve(e, t);
    return n.i = (n.i + 1) % qo, i;
  }
}
class Jo {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const qo = 12, Nn = /* @__PURE__ */ new WeakMap();
class ut {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, t, n) {
    this.$from = e, this.$to = t, this.depth = n;
  }
  /**
  The position at the start of the range.
  */
  get start() {
    return this.$from.before(this.depth + 1);
  }
  /**
  The position at the end of the range.
  */
  get end() {
    return this.$to.after(this.depth + 1);
  }
  /**
  The parent node that the range points into.
  */
  get parent() {
    return this.$from.node(this.depth);
  }
  /**
  The start index of the range in the parent node.
  */
  get startIndex() {
    return this.$from.index(this.depth);
  }
  /**
  The end index of the range in the parent node.
  */
  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const Wo = /* @__PURE__ */ Object.create(null);
let be = class Ut {
  /**
  @internal
  */
  constructor(e, t, n, i = S.none) {
    this.type = e, this.attrs = t, this.marks = i, this.content = n || x.empty;
  }
  /**
  The array of this node's child nodes.
  */
  get children() {
    return this.content.content;
  }
  /**
  The size of this node, as defined by the integer-based [indexing
  scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
  amount of characters. For other leaf nodes, it is one. For
  non-leaf nodes, it is the size of the content plus two (the
  start and end token).
  */
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  /**
  The number of children that the node has.
  */
  get childCount() {
    return this.content.childCount;
  }
  /**
  Get the child node at the given index. Raises an error when the
  index is out of range.
  */
  child(e) {
    return this.content.child(e);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content.maybeChild(e);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    this.content.forEach(e);
  }
  /**
  Invoke a callback for all descendant nodes recursively between
  the given two positions that are relative to start of this
  node's content. The callback is invoked with the node, its
  position relative to the original node (method receiver),
  its parent node, and its child index. When the callback returns
  false for a given node, that node's children will not be
  recursed over. The last parameter can be used to specify a
  starting position to count from.
  */
  nodesBetween(e, t, n, i = 0) {
    this.content.nodesBetween(e, t, n, i, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(e) {
    this.nodesBetween(0, this.content.size, e);
  }
  /**
  Concatenates all the text nodes found in this fragment and its
  children.
  */
  get textContent() {
    return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
  }
  /**
  Get all text between positions `from` and `to`. When
  `blockSeparator` is given, it will be inserted to separate text
  from different block nodes. If `leafText` is given, it'll be
  inserted for every non-text leaf node encountered, otherwise
  [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
  */
  textBetween(e, t, n, i) {
    return this.content.textBetween(e, t, n, i);
  }
  /**
  Returns this node's first child, or `null` if there are no
  children.
  */
  get firstChild() {
    return this.content.firstChild;
  }
  /**
  Returns this node's last child, or `null` if there are no
  children.
  */
  get lastChild() {
    return this.content.lastChild;
  }
  /**
  Test whether two nodes represent the same piece of document.
  */
  eq(e) {
    return this == e || this.sameMarkup(e) && this.content.eq(e.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(e) {
    return this.hasMarkup(e.type, e.attrs, e.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(e, t, n) {
    return this.type == e && ct(this.attrs, t || e.defaultAttrs || Wo) && S.sameSet(this.marks, n || S.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new Ut(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new Ut(this.type, this.attrs, this.content, e);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(e, t = this.content.size) {
    return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(e, t = this.content.size, n = !1) {
    if (e == t)
      return w.empty;
    let i = this.resolve(e), o = this.resolve(t), a = n ? 0 : i.sharedDepth(t), s = i.start(a), c = i.node(a).content.cut(i.pos - s, o.pos - s);
    return new w(c, i.depth - a, o.depth - a);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, t, n) {
    return jo(this.resolve(e), this.resolve(t), n);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: n, offset: i } = t.content.findIndex(e);
      if (t = t.maybeChild(n), !t)
        return null;
      if (i == e || t.isText)
        return t;
      e -= i + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: t, offset: n } = this.content.findIndex(e);
    return { node: this.content.maybeChild(t), index: t, offset: n };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: t, offset: n } = this.content.findIndex(e);
    if (n < e)
      return { node: this.content.child(t), index: t, offset: n };
    let i = this.content.child(t - 1);
    return { node: i, index: t - 1, offset: n - i.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return Je.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return Je.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, n) {
    let i = !1;
    return t > e && this.nodesBetween(e, t, (o) => (n.isInSet(o.marks) && (i = !0), !i)), i;
  }
  /**
  True when this is a block (non-inline node)
  */
  get isBlock() {
    return this.type.isBlock;
  }
  /**
  True when this is a textblock node, a block node with inline
  content.
  */
  get isTextblock() {
    return this.type.isTextblock;
  }
  /**
  True when this node allows inline content.
  */
  get inlineContent() {
    return this.type.inlineContent;
  }
  /**
  True when this is an inline node (a text node or a node that can
  appear among text).
  */
  get isInline() {
    return this.type.isInline;
  }
  /**
  True when this is a text node.
  */
  get isText() {
    return this.type.isText;
  }
  /**
  True when this is a leaf node.
  */
  get isLeaf() {
    return this.type.isLeaf;
  }
  /**
  True when this is an atom, i.e. when it does not have directly
  editable content. This is usually the same as `isLeaf`, but can
  be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
  on a node's spec (typically used when the node is displayed as
  an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
  */
  get isAtom() {
    return this.type.isAtom;
  }
  /**
  Return a string representation of this node for debugging
  purposes.
  */
  toString() {
    if (this.type.spec.toDebugString)
      return this.type.spec.toDebugString(this);
    let e = this.type.name;
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), xr(this.marks, e);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(e) {
    let t = this.type.contentMatch.matchFragment(this.content, 0, e);
    if (!t)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return t;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(e, t, n = x.empty, i = 0, o = n.childCount) {
    let a = this.contentMatchAt(e).matchFragment(n, i, o), s = a && a.matchFragment(this.content, t);
    if (!s || !s.validEnd)
      return !1;
    for (let l = i; l < o; l++)
      if (!this.type.allowsMarks(n.child(l).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, t, n, i) {
    if (i && !this.type.allowsMarks(i))
      return !1;
    let o = this.contentMatchAt(e).matchType(n), a = o && o.matchFragment(this.content, t);
    return a ? a.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(e) {
    return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let e = S.none;
    for (let t = 0; t < this.marks.length; t++) {
      let n = this.marks[t];
      n.type.checkAttrs(n.attrs), e = n.addToSet(e);
    }
    if (!S.sameSet(e, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((t) => t.type.name)}`);
    this.content.forEach((t) => t.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((t) => t.toJSON())), e;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Node.fromJSON");
    let n;
    if (t.marks) {
      if (!Array.isArray(t.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      n = t.marks.map(e.markFromJSON);
    }
    if (t.type == "text") {
      if (typeof t.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(t.text, n);
    }
    let i = x.fromJSON(e, t.content), o = e.nodeType(t.type).create(t.attrs, i, n);
    return o.type.checkAttrs(o.attrs), o;
  }
};
be.prototype.text = void 0;
class ht extends be {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    if (super(e, t, null, i), !n)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = n;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : xr(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(e, t) {
    return this.text.slice(e, t);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(e) {
    return e == this.marks ? this : new ht(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new ht(this.type, this.attrs, e, this.marks);
  }
  cut(e = 0, t = this.text.length) {
    return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
  }
  eq(e) {
    return this.sameMarkup(e) && this.text == e.text;
  }
  toJSON() {
    let e = super.toJSON();
    return e.text = this.text, e;
  }
}
function xr(r, e) {
  for (let t = r.length - 1; t >= 0; t--)
    e = r[t].type.name + "(" + e + ")";
  return e;
}
class ye {
  /**
  @internal
  */
  constructor(e) {
    this.validEnd = e, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(e, t) {
    let n = new Go(e, t);
    if (n.next == null)
      return ye.empty;
    let i = vr(n);
    n.next && n.err("Unexpected trailing text");
    let o = ta(ea(i));
    return na(o, n), o;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(e) {
    for (let t = 0; t < this.next.length; t++)
      if (this.next[t].type == e)
        return this.next[t].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(e, t = 0, n = e.childCount) {
    let i = this;
    for (let o = t; i && o < n; o++)
      i = i.matchType(e.child(o).type);
    return i;
  }
  /**
  @internal
  */
  get inlineContent() {
    return this.next.length != 0 && this.next[0].type.isInline;
  }
  /**
  Get the first matching node type at this match position that can
  be generated.
  */
  get defaultType() {
    for (let e = 0; e < this.next.length; e++) {
      let { type: t } = this.next[e];
      if (!(t.isText || t.hasRequiredAttrs()))
        return t;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(e) {
    for (let t = 0; t < this.next.length; t++)
      for (let n = 0; n < e.next.length; n++)
        if (this.next[t].type == e.next[n].type)
          return !0;
    return !1;
  }
  /**
  Try to match the given fragment, and if that fails, see if it can
  be made to match by inserting nodes in front of it. When
  successful, return a fragment of inserted nodes (which may be
  empty if nothing had to be inserted). When `toEnd` is true, only
  return a fragment if the resulting match goes to the end of the
  content expression.
  */
  fillBefore(e, t = !1, n = 0) {
    let i = [this];
    function o(a, s) {
      let l = a.matchFragment(e, n);
      if (l && (!t || l.validEnd))
        return x.from(s.map((c) => c.createAndFill()));
      for (let c = 0; c < a.next.length; c++) {
        let { type: p, next: u } = a.next[c];
        if (!(p.isText || p.hasRequiredAttrs()) && i.indexOf(u) == -1) {
          i.push(u);
          let h = o(u, s.concat(p));
          if (h)
            return h;
        }
      }
      return null;
    }
    return o(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(e) {
    for (let n = 0; n < this.wrapCache.length; n += 2)
      if (this.wrapCache[n] == e)
        return this.wrapCache[n + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let t = /* @__PURE__ */ Object.create(null), n = [{ match: this, type: null, via: null }];
    for (; n.length; ) {
      let i = n.shift(), o = i.match;
      if (o.matchType(e)) {
        let a = [];
        for (let s = i; s.type; s = s.via)
          a.push(s.type);
        return a.reverse();
      }
      for (let a = 0; a < o.next.length; a++) {
        let { type: s, next: l } = o.next[a];
        !s.isLeaf && !s.hasRequiredAttrs() && !(s.name in t) && (!i.type || l.validEnd) && (n.push({ match: s.contentMatch, type: s, via: i }), t[s.name] = !0);
      }
    }
    return null;
  }
  /**
  The number of outgoing edges this node has in the finite
  automaton that describes the content expression.
  */
  get edgeCount() {
    return this.next.length;
  }
  /**
  Get the _n_​th outgoing edge from this node in the finite
  automaton that describes the content expression.
  */
  edge(e) {
    if (e >= this.next.length)
      throw new RangeError(`There's no ${e}th edge in this content match`);
    return this.next[e];
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    function t(n) {
      e.push(n);
      for (let i = 0; i < n.next.length; i++)
        e.indexOf(n.next[i].next) == -1 && t(n.next[i].next);
    }
    return t(this), e.map((n, i) => {
      let o = i + (n.validEnd ? "*" : " ") + " ";
      for (let a = 0; a < n.next.length; a++)
        o += (a ? ", " : "") + n.next[a].type.name + "->" + e.indexOf(n.next[a].next);
      return o;
    }).join(`
`);
  }
}
ye.empty = new ye(!0);
class Go {
  constructor(e, t) {
    this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(e) {
    return this.next == e && (this.pos++ || !0);
  }
  err(e) {
    throw new SyntaxError(e + " (in content expression '" + this.string + "')");
  }
}
function vr(r) {
  let e = [];
  do
    e.push(Ko(r));
  while (r.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function Ko(r) {
  let e = [];
  do
    e.push(Yo(r));
  while (r.next && r.next != ")" && r.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function Yo(r) {
  let e = Zo(r);
  for (; ; )
    if (r.eat("+"))
      e = { type: "plus", expr: e };
    else if (r.eat("*"))
      e = { type: "star", expr: e };
    else if (r.eat("?"))
      e = { type: "opt", expr: e };
    else if (r.eat("{"))
      e = Xo(r, e);
    else
      break;
  return e;
}
function Sn(r) {
  /\D/.test(r.next) && r.err("Expected number, got '" + r.next + "'");
  let e = Number(r.next);
  return r.pos++, e;
}
function Xo(r, e) {
  let t = Sn(r), n = t;
  return r.eat(",") && (r.next != "}" ? n = Sn(r) : n = -1), r.eat("}") || r.err("Unclosed braced range"), { type: "range", min: t, max: n, expr: e };
}
function Qo(r, e) {
  let t = r.nodeTypes, n = t[e];
  if (n)
    return [n];
  let i = [];
  for (let o in t) {
    let a = t[o];
    a.isInGroup(e) && i.push(a);
  }
  return i.length == 0 && r.err("No node type or group '" + e + "' found"), i;
}
function Zo(r) {
  if (r.eat("(")) {
    let e = vr(r);
    return r.eat(")") || r.err("Missing closing paren"), e;
  } else if (/\W/.test(r.next))
    r.err("Unexpected token '" + r.next + "'");
  else {
    let e = Qo(r, r.next).map((t) => (r.inline == null ? r.inline = t.isInline : r.inline != t.isInline && r.err("Mixing inline and block content"), { type: "name", value: t }));
    return r.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function ea(r) {
  let e = [[]];
  return i(o(r, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function n(a, s, l) {
    let c = { term: l, to: s };
    return e[a].push(c), c;
  }
  function i(a, s) {
    a.forEach((l) => l.to = s);
  }
  function o(a, s) {
    if (a.type == "choice")
      return a.exprs.reduce((l, c) => l.concat(o(c, s)), []);
    if (a.type == "seq")
      for (let l = 0; ; l++) {
        let c = o(a.exprs[l], s);
        if (l == a.exprs.length - 1)
          return c;
        i(c, s = t());
      }
    else if (a.type == "star") {
      let l = t();
      return n(s, l), i(o(a.expr, l), l), [n(l)];
    } else if (a.type == "plus") {
      let l = t();
      return i(o(a.expr, s), l), i(o(a.expr, l), l), [n(l)];
    } else {
      if (a.type == "opt")
        return [n(s)].concat(o(a.expr, s));
      if (a.type == "range") {
        let l = s;
        for (let c = 0; c < a.min; c++) {
          let p = t();
          i(o(a.expr, l), p), l = p;
        }
        if (a.max == -1)
          i(o(a.expr, l), l);
        else
          for (let c = a.min; c < a.max; c++) {
            let p = t();
            n(l, p), i(o(a.expr, l), p), l = p;
          }
        return [n(l)];
      } else {
        if (a.type == "name")
          return [n(s, void 0, a.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function wr(r, e) {
  return e - r;
}
function Cn(r, e) {
  let t = [];
  return n(e), t.sort(wr);
  function n(i) {
    let o = r[i];
    if (o.length == 1 && !o[0].term)
      return n(o[0].to);
    t.push(i);
    for (let a = 0; a < o.length; a++) {
      let { term: s, to: l } = o[a];
      !s && t.indexOf(l) == -1 && n(l);
    }
  }
}
function ta(r) {
  let e = /* @__PURE__ */ Object.create(null);
  return t(Cn(r, 0));
  function t(n) {
    let i = [];
    n.forEach((a) => {
      r[a].forEach(({ term: s, to: l }) => {
        if (!s)
          return;
        let c;
        for (let p = 0; p < i.length; p++)
          i[p][0] == s && (c = i[p][1]);
        Cn(r, l).forEach((p) => {
          c || i.push([s, c = []]), c.indexOf(p) == -1 && c.push(p);
        });
      });
    });
    let o = e[n.join(",")] = new ye(n.indexOf(r.length - 1) > -1);
    for (let a = 0; a < i.length; a++) {
      let s = i[a][1].sort(wr);
      o.next.push({ type: i[a][0], next: e[s.join(",")] || t(s) });
    }
    return o;
  }
}
function na(r, e) {
  for (let t = 0, n = [r]; t < n.length; t++) {
    let i = n[t], o = !i.validEnd, a = [];
    for (let s = 0; s < i.next.length; s++) {
      let { type: l, next: c } = i.next[s];
      a.push(l.name), o && !(l.isText || l.hasRequiredAttrs()) && (o = !1), n.indexOf(c) == -1 && n.push(c);
    }
    o && e.err("Only non-generatable nodes (" + a.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function kr(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let n = r[t];
    if (!n.hasDefault)
      return null;
    e[t] = n.default;
  }
  return e;
}
function _r(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let n in r) {
    let i = e && e[n];
    if (i === void 0) {
      let o = r[n];
      if (o.hasDefault)
        i = o.default;
      else
        throw new RangeError("No value supplied for attribute " + n);
    }
    t[n] = i;
  }
  return t;
}
function Nr(r, e, t, n) {
  for (let i in e)
    if (!(i in r))
      throw new RangeError(`Unsupported attribute ${i} for ${t} of type ${i}`);
  for (let i in r) {
    let o = r[i];
    o.validate && o.validate(e[i]);
  }
}
function Sr(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let n in e)
      t[n] = new ia(r, n, e[n]);
  return t;
}
class ft {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = Sr(e, n.attrs), this.defaultAttrs = kr(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
  }
  /**
  True if this is an inline type.
  */
  get isInline() {
    return !this.isBlock;
  }
  /**
  True if this is a textblock type, a block that contains inline
  content.
  */
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  /**
  True for node types that allow no content.
  */
  get isLeaf() {
    return this.contentMatch == ye.empty;
  }
  /**
  True when this node is an atom, i.e. when it does not have
  directly editable content.
  */
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  /**
  Return true when this node type is part of the given
  [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
  */
  isInGroup(e) {
    return this.groups.indexOf(e) > -1;
  }
  /**
  The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
  */
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
  }
  /**
  Tells you whether this node type has any required attributes.
  */
  hasRequiredAttrs() {
    for (let e in this.attrs)
      if (this.attrs[e].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(e) {
    return this == e || this.contentMatch.compatible(e.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(e) {
    return !e && this.defaultAttrs ? this.defaultAttrs : _r(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, t, n) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new be(this, this.computeAttrs(e), x.from(t), S.setFrom(n));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, n) {
    return t = x.from(t), this.checkContent(t), new be(this, this.computeAttrs(e), t, S.setFrom(n));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, t, n) {
    if (e = this.computeAttrs(e), t = x.from(t), t.size) {
      let a = this.contentMatch.fillBefore(t);
      if (!a)
        return null;
      t = a.append(t);
    }
    let i = this.contentMatch.matchFragment(t), o = i && i.fillBefore(x.empty, !0);
    return o ? new be(this, e, t.append(o), S.setFrom(n)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd)
      return !1;
    for (let n = 0; n < e.childCount; n++)
      if (!this.allowsMarks(e.child(n).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(e) {
    if (!this.validContent(e))
      throw new RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(e) {
    Nr(this.attrs, e, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(e) {
    return this.markSet == null || this.markSet.indexOf(e) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(e) {
    if (this.markSet == null)
      return !0;
    for (let t = 0; t < e.length; t++)
      if (!this.allowsMarkType(e[t].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(e) {
    if (this.markSet == null)
      return e;
    let t;
    for (let n = 0; n < e.length; n++)
      this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t || (t = e.slice(0, n));
    return t ? t.length ? t : S.none : e;
  }
  /**
  @internal
  */
  static compile(e, t) {
    let n = /* @__PURE__ */ Object.create(null);
    e.forEach((o, a) => n[o] = new ft(o, t, a));
    let i = t.spec.topNode || "doc";
    if (!n[i])
      throw new RangeError("Schema is missing its top node type ('" + i + "')");
    if (!n.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let o in n.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return n;
  }
}
function ra(r, e, t) {
  let n = t.split("|");
  return (i) => {
    let o = i === null ? "null" : typeof i;
    if (n.indexOf(o) < 0)
      throw new RangeError(`Expected value of type ${n} for attribute ${e} on type ${r}, got ${o}`);
  };
}
class ia {
  constructor(e, t, n) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? ra(e, t, n.validate) : n.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class Kt {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    this.name = e, this.rank = t, this.schema = n, this.spec = i, this.attrs = Sr(e, i.attrs), this.excluded = null;
    let o = kr(this.attrs);
    this.instance = o ? new S(this, o) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new S(this, _r(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let n = /* @__PURE__ */ Object.create(null), i = 0;
    return e.forEach((o, a) => n[o] = new Kt(o, i++, t, a)), n;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(e) {
    for (var t = 0; t < e.length; t++)
      e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
    return e;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (e[t].type == this)
        return e[t];
  }
  /**
  @internal
  */
  checkAttrs(e) {
    Nr(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class oa {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let t = this.spec = {};
    for (let i in e)
      t[i] = e[i];
    t.nodes = R.from(e.nodes), t.marks = R.from(e.marks || {}), this.nodes = ft.compile(this.spec.nodes, this), this.marks = Kt.compile(this.spec.marks, this);
    let n = /* @__PURE__ */ Object.create(null);
    for (let i in this.nodes) {
      if (i in this.marks)
        throw new RangeError(i + " can not be both a node and a mark");
      let o = this.nodes[i], a = o.spec.content || "", s = o.spec.marks;
      if (o.contentMatch = n[a] || (n[a] = ye.parse(a, this.nodes)), o.inlineContent = o.contentMatch.inlineContent, o.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!o.isInline || !o.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = o;
      }
      o.markSet = s == "_" ? null : s ? En(this, s.split(" ")) : s == "" || !o.inlineContent ? [] : null;
    }
    for (let i in this.marks) {
      let o = this.marks[i], a = o.spec.excludes;
      o.excluded = a == null ? [o] : a == "" ? [] : En(this, a.split(" "));
    }
    this.nodeFromJSON = (i) => be.fromJSON(this, i), this.markFromJSON = (i) => S.fromJSON(this, i), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, n, i) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof ft) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, n, i);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let n = this.nodes.text;
    return new ht(n, n.defaultAttrs, e, S.setFrom(t));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(e, t) {
    return typeof e == "string" && (e = this.marks[e]), e.create(t);
  }
  /**
  @internal
  */
  nodeType(e) {
    let t = this.nodes[e];
    if (!t)
      throw new RangeError("Unknown node type: " + e);
    return t;
  }
}
function En(r, e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let i = e[n], o = r.marks[i], a = o;
    if (o)
      t.push(o);
    else
      for (let s in r.marks) {
        let l = r.marks[s];
        (i == "_" || l.spec.group && l.spec.group.split(" ").indexOf(i) > -1) && t.push(a = l);
      }
    if (!a)
      throw new SyntaxError("Unknown mark type: '" + e[n] + "'");
  }
  return t;
}
function aa(r) {
  return r.tag != null;
}
function sa(r) {
  return r.style != null;
}
class Ne {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, t) {
    this.schema = e, this.rules = t, this.tags = [], this.styles = [];
    let n = this.matchedStyles = [];
    t.forEach((i) => {
      if (aa(i))
        this.tags.push(i);
      else if (sa(i)) {
        let o = /[^=]*/.exec(i.style)[0];
        n.indexOf(o) < 0 && n.push(o), this.styles.push(i);
      }
    }), this.normalizeLists = !this.tags.some((i) => {
      if (!/^(ul|ol)\b/.test(i.tag) || !i.node)
        return !1;
      let o = e.nodes[i.node];
      return o.contentMatch.matchType(o);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let n = new Mn(this, t, !1);
    return n.addAll(e, S.none, t.from, t.to), n.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(e, t = {}) {
    let n = new Mn(this, t, !0);
    return n.addAll(e, S.none, t.from, t.to), w.maxOpen(n.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, n) {
    for (let i = n ? this.tags.indexOf(n) + 1 : 0; i < this.tags.length; i++) {
      let o = this.tags[i];
      if (da(e, o.tag) && (o.namespace === void 0 || e.namespaceURI == o.namespace) && (!o.context || t.matchesContext(o.context))) {
        if (o.getAttrs) {
          let a = o.getAttrs(e);
          if (a === !1)
            continue;
          o.attrs = a || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(e, t, n, i) {
    for (let o = i ? this.styles.indexOf(i) + 1 : 0; o < this.styles.length; o++) {
      let a = this.styles[o], s = a.style;
      if (!(s.indexOf(e) != 0 || a.context && !n.matchesContext(a.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      s.length > e.length && (s.charCodeAt(e.length) != 61 || s.slice(e.length + 1) != t))) {
        if (a.getAttrs) {
          let l = a.getAttrs(t);
          if (l === !1)
            continue;
          a.attrs = l || void 0;
        }
        return a;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(e) {
    let t = [];
    function n(i) {
      let o = i.priority == null ? 50 : i.priority, a = 0;
      for (; a < t.length; a++) {
        let s = t[a];
        if ((s.priority == null ? 50 : s.priority) < o)
          break;
      }
      t.splice(a, 0, i);
    }
    for (let i in e.marks) {
      let o = e.marks[i].spec.parseDOM;
      o && o.forEach((a) => {
        n(a = In(a)), a.mark || a.ignore || a.clearMark || (a.mark = i);
      });
    }
    for (let i in e.nodes) {
      let o = e.nodes[i].spec.parseDOM;
      o && o.forEach((a) => {
        n(a = In(a)), a.node || a.ignore || a.mark || (a.node = i);
      });
    }
    return t;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(e) {
    return e.cached.domParser || (e.cached.domParser = new Ne(e, Ne.schemaRules(e)));
  }
}
const Cr = {
  address: !0,
  article: !0,
  aside: !0,
  blockquote: !0,
  canvas: !0,
  dd: !0,
  div: !0,
  dl: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  li: !0,
  noscript: !0,
  ol: !0,
  output: !0,
  p: !0,
  pre: !0,
  section: !0,
  table: !0,
  tfoot: !0,
  ul: !0
}, la = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, Er = { ol: !0, ul: !0 }, qe = 1, jt = 2, $e = 4;
function An(r, e, t) {
  return e != null ? (e ? qe : 0) | (e === "full" ? jt : 0) : r && r.whitespace == "pre" ? qe | jt : t & ~$e;
}
class nt {
  constructor(e, t, n, i, o, a) {
    this.type = e, this.attrs = t, this.marks = n, this.solid = i, this.options = a, this.content = [], this.activeMarks = S.none, this.match = o || (a & $e ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(x.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let n = this.type.contentMatch, i;
        return (i = n.findWrapping(e.type)) ? (this.match = n, i) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & qe)) {
      let n = this.content[this.content.length - 1], i;
      if (n && n.isText && (i = /[ \t\r\n\u000c]+$/.exec(n.text))) {
        let o = n;
        n.text.length == i[0].length ? this.content.pop() : this.content[this.content.length - 1] = o.withText(o.text.slice(0, o.text.length - i[0].length));
      }
    }
    let t = x.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(x.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !Cr.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class Mn {
  constructor(e, t, n) {
    this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
    let i = t.topNode, o, a = An(null, t.preserveWhitespace, 0) | (n ? $e : 0);
    i ? o = new nt(i.type, i.attrs, S.none, !0, t.topMatch || i.type.contentMatch, a) : n ? o = new nt(null, null, S.none, !0, null, a) : o = new nt(e.schema.topNodeType, null, S.none, !0, null, a), this.nodes = [o], this.find = t.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(e, t) {
    e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
  }
  addTextNode(e, t) {
    let n = e.nodeValue, i = this.top, o = i.options & jt ? "full" : this.localPreserveWS || (i.options & qe) > 0, { schema: a } = this.parser;
    if (o === "full" || i.inlineContext(e) || /[^ \t\r\n\u000c]/.test(n)) {
      if (o)
        if (o === "full")
          n = n.replace(/\r\n?/g, `
`);
        else if (a.linebreakReplacement && /[\r\n]/.test(n) && this.top.findWrapping(a.linebreakReplacement.create())) {
          let s = n.split(/\r?\n|\r/);
          for (let l = 0; l < s.length; l++)
            l && this.insertNode(a.linebreakReplacement.create(), t, !0), s[l] && this.insertNode(a.text(s[l]), t, !/\S/.test(s[l]));
          n = "";
        } else
          n = n.replace(/\r?\n|\r/g, " ");
      else if (n = n.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(n) && this.open == this.nodes.length - 1) {
        let s = i.content[i.content.length - 1], l = e.previousSibling;
        (!s || l && l.nodeName == "BR" || s.isText && /[ \t\r\n\u000c]$/.test(s.text)) && (n = n.slice(1));
      }
      n && this.insertNode(a.text(n), t, !/\S/.test(n)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, n) {
    let i = this.localPreserveWS, o = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let a = e.nodeName.toLowerCase(), s;
    Er.hasOwnProperty(a) && this.parser.normalizeLists && ca(e);
    let l = this.options.ruleFromNode && this.options.ruleFromNode(e) || (s = this.parser.matchTag(e, this, n));
    e: if (l ? l.ignore : la.hasOwnProperty(a))
      this.findInside(e), this.ignoreFallback(e, t);
    else if (!l || l.skip || l.closeParent) {
      l && l.closeParent ? this.open = Math.max(0, this.open - 1) : l && l.skip.nodeType && (e = l.skip);
      let c, p = this.needsBlock;
      if (Cr.hasOwnProperty(a))
        o.content.length && o.content[0].isInline && this.open && (this.open--, o = this.top), c = !0, o.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, t);
        break e;
      }
      let u = l && l.skip ? t : this.readStyles(e, t);
      u && this.addAll(e, u), c && this.sync(o), this.needsBlock = p;
    } else {
      let c = this.readStyles(e, t);
      c && this.addElementByRule(e, l, c, l.consuming === !1 ? s : void 0);
    }
    this.localPreserveWS = i;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(e, t) {
    e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode(`
`), t);
  }
  // Called for ignored nodes
  ignoreFallback(e, t) {
    e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), t, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(e, t) {
    let n = e.style;
    if (n && n.length)
      for (let i = 0; i < this.parser.matchedStyles.length; i++) {
        let o = this.parser.matchedStyles[i], a = n.getPropertyValue(o);
        if (a)
          for (let s = void 0; ; ) {
            let l = this.parser.matchStyle(o, a, this, s);
            if (!l)
              break;
            if (l.ignore)
              return null;
            if (l.clearMark ? t = t.filter((c) => !l.clearMark(c)) : t = t.concat(this.parser.schema.marks[l.mark].create(l.attrs)), l.consuming === !1)
              s = l;
            else
              break;
          }
      }
    return t;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(e, t, n, i) {
    let o, a;
    if (t.node)
      if (a = this.parser.schema.nodes[t.node], a.isLeaf)
        this.insertNode(a.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
      else {
        let l = this.enter(a, t.attrs || null, n, t.preserveWhitespace);
        l && (o = !0, n = l);
      }
    else {
      let l = this.parser.schema.marks[t.mark];
      n = n.concat(l.create(t.attrs));
    }
    let s = this.top;
    if (a && a.isLeaf)
      this.findInside(e);
    else if (i)
      this.addElement(e, n, i);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((l) => this.insertNode(l, n, !1));
    else {
      let l = e;
      typeof t.contentElement == "string" ? l = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? l = t.contentElement(e) : t.contentElement && (l = t.contentElement), this.findAround(e, l, !0), this.addAll(l, n), this.findAround(e, l, !1);
    }
    o && this.sync(s) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, n, i) {
    let o = n || 0;
    for (let a = n ? e.childNodes[n] : e.firstChild, s = i == null ? null : e.childNodes[i]; a != s; a = a.nextSibling, ++o)
      this.findAtPoint(e, o), this.addDOM(a, t);
    this.findAtPoint(e, o);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, n) {
    let i, o;
    for (let a = this.open, s = 0; a >= 0; a--) {
      let l = this.nodes[a], c = l.findWrapping(e);
      if (c && (!i || i.length > c.length + s) && (i = c, o = l, !c.length))
        break;
      if (l.solid) {
        if (n)
          break;
        s += 2;
      }
    }
    if (!i)
      return null;
    this.sync(o);
    for (let a = 0; a < i.length; a++)
      t = this.enterInner(i[a], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, n) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let o = this.textblockFromContext();
      o && (t = this.enterInner(o, null, t));
    }
    let i = this.findPlace(e, t, n);
    if (i) {
      this.closeExtra();
      let o = this.top;
      o.match && (o.match = o.match.matchType(e.type));
      let a = S.none;
      for (let s of i.concat(e.marks))
        (o.type ? o.type.allowsMarkType(s.type) : Tn(s.type, e.type)) && (a = s.addToSet(a));
      return o.content.push(e.mark(a)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, n, i) {
    let o = this.findPlace(e.create(t), n, !1);
    return o && (o = this.enterInner(e, t, n, !0, i)), o;
  }
  // Open a node of the given type
  enterInner(e, t, n, i = !1, o) {
    this.closeExtra();
    let a = this.top;
    a.match = a.match && a.match.matchType(e);
    let s = An(e, o, a.options);
    a.options & $e && a.content.length == 0 && (s |= $e);
    let l = S.none;
    return n = n.filter((c) => (a.type ? a.type.allowsMarkType(c.type) : Tn(c.type, e)) ? (l = c.addToSet(l), !1) : !0), this.nodes.push(new nt(e, t, l, i, null, s)), this.open++, n;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(e = !1) {
    let t = this.nodes.length - 1;
    if (t > this.open) {
      for (; t > this.open; t--)
        this.nodes[t - 1].content.push(this.nodes[t].finish(e));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(e) {
    for (let t = this.open; t >= 0; t--) {
      if (this.nodes[t] == e)
        return this.open = t, !0;
      this.localPreserveWS && (this.nodes[t].options |= qe);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let n = this.nodes[t].content;
      for (let i = n.length - 1; i >= 0; i--)
        e += n[i].nodeSize;
      t && e++;
    }
    return e;
  }
  findAtPoint(e, t) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
  }
  findAround(e, t, n) {
    if (e != t && this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].pos == null && e.nodeType == 1 && e.contains(this.find[i].node) && t.compareDocumentPosition(this.find[i].node) & (n ? 2 : 4) && (this.find[i].pos = this.currentPos);
  }
  findInText(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(e) {
    if (e.indexOf("|") > -1)
      return e.split(/\s*\|\s*/).some(this.matchesContext, this);
    let t = e.split("/"), n = this.options.context, i = !this.isOpen && (!n || n.parent.type == this.nodes[0].type), o = -(n ? n.depth + 1 : 0) + (i ? 0 : 1), a = (s, l) => {
      for (; s >= 0; s--) {
        let c = t[s];
        if (c == "") {
          if (s == t.length - 1 || s == 0)
            continue;
          for (; l >= o; l--)
            if (a(s - 1, l))
              return !0;
          return !1;
        } else {
          let p = l > 0 || l == 0 && i ? this.nodes[l].type : n && l >= o ? n.node(l - o).type : null;
          if (!p || p.name != c && !p.isInGroup(c))
            return !1;
          l--;
        }
      }
      return !0;
    };
    return a(t.length - 1, this.open);
  }
  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let t = e.depth; t >= 0; t--) {
        let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (n && n.isTextblock && n.defaultAttrs)
          return n;
      }
    for (let t in this.parser.schema.nodes) {
      let n = this.parser.schema.nodes[t];
      if (n.isTextblock && n.defaultAttrs)
        return n;
    }
  }
}
function ca(r) {
  for (let e = r.firstChild, t = null; e; e = e.nextSibling) {
    let n = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    n && Er.hasOwnProperty(n) && t ? (t.appendChild(e), e = t) : n == "li" ? t = e : n && (t = null);
  }
}
function da(r, e) {
  return (r.matches || r.msMatchesSelector || r.webkitMatchesSelector || r.mozMatchesSelector).call(r, e);
}
function In(r) {
  let e = {};
  for (let t in r)
    e[t] = r[t];
  return e;
}
function Tn(r, e) {
  let t = e.schema.nodes;
  for (let n in t) {
    let i = t[n];
    if (!i.allowsMarkType(r))
      continue;
    let o = [], a = (s) => {
      o.push(s);
      for (let l = 0; l < s.edgeCount; l++) {
        let { type: c, next: p } = s.edge(l);
        if (c == e || o.indexOf(p) < 0 && a(p))
          return !0;
      }
    };
    if (a(i.contentMatch))
      return !0;
  }
}
const Ar = 65535, Mr = Math.pow(2, 16);
function pa(r, e) {
  return r + e * Mr;
}
function Rn(r) {
  return r & Ar;
}
function ua(r) {
  return (r - (r & Ar)) / Mr;
}
const Ir = 1, Tr = 2, at = 4, Rr = 8;
class On {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.pos = e, this.delInfo = t, this.recover = n;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & Rr) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (Ir | at)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (Tr | at)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & at) > 0;
  }
}
class j {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(e, t = !1) {
    if (this.ranges = e, this.inverted = t, !e.length && j.empty)
      return j.empty;
  }
  /**
  @internal
  */
  recover(e) {
    let t = 0, n = Rn(e);
    if (!this.inverted)
      for (let i = 0; i < n; i++)
        t += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[n * 3] + t + ua(e);
  }
  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }
  map(e, t = 1) {
    return this._map(e, t, !0);
  }
  /**
  @internal
  */
  _map(e, t, n) {
    let i = 0, o = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let l = this.ranges[s] - (this.inverted ? i : 0);
      if (l > e)
        break;
      let c = this.ranges[s + o], p = this.ranges[s + a], u = l + c;
      if (e <= u) {
        let h = c ? e == l ? -1 : e == u ? 1 : t : t, m = l + i + (h < 0 ? 0 : p);
        if (n)
          return m;
        let b = e == (t < 0 ? l : u) ? null : pa(s / 3, e - l), g = e == l ? Tr : e == u ? Ir : at;
        return (t < 0 ? e != l : e != u) && (g |= Rr), new On(m, g, b);
      }
      i += p - c;
    }
    return n ? e + i : new On(e + i, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let n = 0, i = Rn(t), o = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let l = this.ranges[s] - (this.inverted ? n : 0);
      if (l > e)
        break;
      let c = this.ranges[s + o], p = l + c;
      if (e <= p && s == i * 3)
        return !0;
      n += this.ranges[s + a] - c;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let t = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2;
    for (let i = 0, o = 0; i < this.ranges.length; i += 3) {
      let a = this.ranges[i], s = a - (this.inverted ? o : 0), l = a + (this.inverted ? 0 : o), c = this.ranges[i + t], p = this.ranges[i + n];
      e(s, s + c, l, l + p), o += p - c;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new j(this.ranges, !this.inverted);
  }
  /**
  @internal
  */
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  /**
  Create a map that moves all positions by offset `n` (which may be
  negative). This can be useful when applying steps meant for a
  sub-document to a larger document, or vice-versa.
  */
  static offset(e) {
    return e == 0 ? j.empty : new j(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
j.empty = new j([]);
const It = /* @__PURE__ */ Object.create(null);
class z {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return j.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(e) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(e, t) {
    if (!t || !t.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let n = It[t.stepType];
    if (!n)
      throw new RangeError(`No step type ${t.stepType} defined`);
    return n.fromJSON(e, t);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, t) {
    if (e in It)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return It[e] = t, t.prototype.jsonID = e, t;
  }
}
class I {
  /**
  @internal
  */
  constructor(e, t) {
    this.doc = e, this.failed = t;
  }
  /**
  Create a successful step result.
  */
  static ok(e) {
    return new I(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new I(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, t, n, i) {
    try {
      return I.ok(e.replace(t, n, i));
    } catch (o) {
      if (o instanceof dt)
        return I.fail(o.message);
      throw o;
    }
  }
}
function Yt(r, e, t) {
  let n = [];
  for (let i = 0; i < r.childCount; i++) {
    let o = r.child(i);
    o.content.size && (o = o.copy(Yt(o.content, e, o))), o.isInline && (o = e(o, t, i)), n.push(o);
  }
  return x.fromArray(n);
}
class de extends z {
  /**
  Create a mark step.
  */
  constructor(e, t, n) {
    super(), this.from = e, this.to = t, this.mark = n;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), n = e.resolve(this.from), i = n.node(n.sharedDepth(this.to)), o = new w(Yt(t.content, (a, s) => !a.isAtom || !s.type.allowsMarkType(this.mark.type) ? a : a.mark(this.mark.addToSet(a.marks)), i), t.openStart, t.openEnd);
    return I.fromReplace(e, this.from, this.to, o);
  }
  invert() {
    return new pe(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1);
    return t.deleted && n.deleted || t.pos >= n.pos ? null : new de(t.pos, n.pos, this.mark);
  }
  merge(e) {
    return e instanceof de && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new de(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new de(t.from, t.to, e.markFromJSON(t.mark));
  }
}
z.jsonID("addMark", de);
class pe extends z {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, n) {
    super(), this.from = e, this.to = t, this.mark = n;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), n = new w(Yt(t.content, (i) => i.mark(this.mark.removeFromSet(i.marks)), e), t.openStart, t.openEnd);
    return I.fromReplace(e, this.from, this.to, n);
  }
  invert() {
    return new de(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1);
    return t.deleted && n.deleted || t.pos >= n.pos ? null : new pe(t.pos, n.pos, this.mark);
  }
  merge(e) {
    return e instanceof pe && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new pe(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new pe(t.from, t.to, e.markFromJSON(t.mark));
  }
}
z.jsonID("removeMark", pe);
class ue extends z {
  /**
  Create a node mark step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return I.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return I.fromReplace(e, this.pos, this.pos + 1, new w(x.from(n), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let n = this.mark.addToSet(t.marks);
      if (n.length == t.marks.length) {
        for (let i = 0; i < t.marks.length; i++)
          if (!t.marks[i].isInSet(n))
            return new ue(this.pos, t.marks[i]);
        return new ue(this.pos, this.mark);
      }
    }
    return new We(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new ue(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new ue(t.pos, e.markFromJSON(t.mark));
  }
}
z.jsonID("addNodeMark", ue);
class We extends z {
  /**
  Create a mark-removing step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return I.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return I.fromReplace(e, this.pos, this.pos + 1, new w(x.from(n), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new ue(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new We(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new We(t.pos, e.markFromJSON(t.mark));
  }
}
z.jsonID("removeNodeMark", We);
class P extends z {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(e, t, n, i = !1) {
    super(), this.from = e, this.to = t, this.slice = n, this.structure = i;
  }
  apply(e) {
    return this.structure && Vt(e, this.from, this.to) ? I.fail("Structure replace would overwrite content") : I.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new j([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new P(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let t = e.mapResult(this.to, -1), n = this.from == this.to && P.MAP_BIAS < 0 ? t : e.mapResult(this.from, 1);
    return n.deletedAcross && t.deletedAcross ? null : new P(n.pos, Math.max(n.pos, t.pos), this.slice, this.structure);
  }
  merge(e) {
    if (!(e instanceof P) || e.structure || this.structure)
      return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let t = this.slice.size + e.slice.size == 0 ? w.empty : new w(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new P(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t = this.slice.size + e.slice.size == 0 ? w.empty : new w(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
      return new P(e.from, this.to, t, this.structure);
    } else
      return null;
  }
  toJSON() {
    let e = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new P(t.from, t.to, w.fromJSON(e, t.slice), !!t.structure);
  }
}
P.MAP_BIAS = 1;
z.jsonID("replace", P);
class H extends z {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(e, t, n, i, o, a, s = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = i, this.slice = o, this.insert = a, this.structure = s;
  }
  apply(e) {
    if (this.structure && (Vt(e, this.from, this.gapFrom) || Vt(e, this.gapTo, this.to)))
      return I.fail("Structure gap-replace would overwrite content");
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd)
      return I.fail("Gap is not a flat range");
    let n = this.slice.insertAt(this.insert, t.content);
    return n ? I.fromReplace(e, this.from, this.to, n) : I.fail("Content does not fit in gap");
  }
  getMap() {
    return new j([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(e) {
    let t = this.gapTo - this.gapFrom;
    return new H(this.from, this.from + this.slice.size + t, this.from + this.insert, this.from + this.insert + t, e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1), i = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), o = this.to == this.gapTo ? n.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && n.deletedAcross || i < t.pos || o > n.pos ? null : new H(t.pos, n.pos, i, o, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let e = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number" || typeof t.gapFrom != "number" || typeof t.gapTo != "number" || typeof t.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new H(t.from, t.to, t.gapFrom, t.gapTo, w.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
z.jsonID("replaceAround", H);
function Vt(r, e, t) {
  let n = r.resolve(e), i = t - e, o = n.depth;
  for (; i > 0 && o > 0 && n.indexAfter(o) == n.node(o).childCount; )
    o--, i--;
  if (i > 0) {
    let a = n.node(o).maybeChild(n.indexAfter(o));
    for (; i > 0; ) {
      if (!a || a.isLeaf)
        return !0;
      a = a.firstChild, i--;
    }
  }
  return !1;
}
function ha(r, e, t) {
  return (e == 0 || r.canReplace(e, r.childCount)) && (t == r.childCount || r.canReplace(0, t));
}
function Ae(r) {
  let t = r.parent.content.cutByIndex(r.startIndex, r.endIndex);
  for (let n = r.depth, i = 0, o = 0; ; --n) {
    let a = r.$from.node(n), s = r.$from.index(n) + i, l = r.$to.indexAfter(n) - o;
    if (n < r.depth && a.canReplace(s, l, t))
      return n;
    if (n == 0 || a.type.spec.isolating || !ha(a, s, l))
      break;
    s && (i = 1), l < a.childCount && (o = 1);
  }
  return null;
}
function Or(r, e, t = null, n = r) {
  let i = fa(r, e), o = i && ma(n, e);
  return o ? i.map($n).concat({ type: e, attrs: t }).concat(o.map($n)) : null;
}
function $n(r) {
  return { type: r, attrs: null };
}
function fa(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r, o = t.contentMatchAt(n).findWrapping(e);
  if (!o)
    return null;
  let a = o.length ? o[0] : e;
  return t.canReplaceWith(n, i, a) ? o : null;
}
function ma(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r, o = t.child(n), a = e.contentMatch.findWrapping(o.type);
  if (!a)
    return null;
  let l = (a.length ? a[a.length - 1] : e).contentMatch;
  for (let c = n; l && c < i; c++)
    l = l.matchType(t.child(c).type);
  return !l || !l.validEnd ? null : a;
}
function Z(r, e, t = 1, n) {
  let i = r.resolve(e), o = i.depth - t, a = n && n[n.length - 1] || i.parent;
  if (o < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !a.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount)))
    return !1;
  for (let c = i.depth - 1, p = t - 2; c > o; c--, p--) {
    let u = i.node(c), h = i.index(c);
    if (u.type.spec.isolating)
      return !1;
    let m = u.content.cutByIndex(h, u.childCount), b = n && n[p + 1];
    b && (m = m.replaceChild(0, b.type.create(b.attrs)));
    let g = n && n[p] || u;
    if (!u.canReplace(h + 1, u.childCount) || !g.type.validContent(m))
      return !1;
  }
  let s = i.indexAfter(o), l = n && n[0];
  return i.node(o).canReplaceWith(s, s, l ? l.type : i.node(o + 1).type);
}
function ve(r, e) {
  let t = r.resolve(e), n = t.index();
  return $r(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(n, n + 1);
}
function ga(r, e) {
  e.content.size || r.type.compatibleContent(e.type);
  let t = r.contentMatchAt(r.childCount), { linebreakReplacement: n } = r.type.schema;
  for (let i = 0; i < e.childCount; i++) {
    let o = e.child(i), a = o.type == n ? r.type.schema.nodes.text : o.type;
    if (t = t.matchType(a), !t || !r.type.allowsMarks(o.marks))
      return !1;
  }
  return t.validEnd;
}
function $r(r, e) {
  return !!(r && e && !r.isLeaf && ga(r, e));
}
function _t(r, e, t = -1) {
  let n = r.resolve(e);
  for (let i = n.depth; ; i--) {
    let o, a, s = n.index(i);
    if (i == n.depth ? (o = n.nodeBefore, a = n.nodeAfter) : t > 0 ? (o = n.node(i + 1), s++, a = n.node(i).maybeChild(s)) : (o = n.node(i).maybeChild(s - 1), a = n.node(i + 1)), o && !o.isTextblock && $r(o, a) && n.node(i).canReplace(s, s + 1))
      return e;
    if (i == 0)
      break;
    e = t < 0 ? n.before(i) : n.after(i);
  }
}
function Xt(r, e, t = e, n = w.empty) {
  if (e == t && !n.size)
    return null;
  let i = r.resolve(e), o = r.resolve(t);
  return ba(i, o, n) ? new P(e, t, n) : new ya(i, o, n).fit();
}
function ba(r, e, t) {
  return !t.openStart && !t.openEnd && r.start() == e.start() && r.parent.canReplace(r.index(), e.index(), t.content);
}
class ya {
  constructor(e, t, n) {
    this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = x.empty;
    for (let i = 0; i <= e.depth; i++) {
      let o = e.node(i);
      this.frontier.push({
        type: o.type,
        match: o.contentMatchAt(e.indexAfter(i))
      });
    }
    for (let i = e.depth; i > 0; i--)
      this.placed = x.from(e.node(i).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, n = this.$from, i = this.close(e < 0 ? this.$to : n.doc.resolve(e));
    if (!i)
      return null;
    let o = this.placed, a = n.depth, s = i.depth;
    for (; a && s && o.childCount == 1; )
      o = o.firstChild.content, a--, s--;
    let l = new w(o, a, s);
    return e > -1 ? new H(n.pos, e, this.$to.pos, this.$to.end(), l, t) : l.size || n.pos != this.$to.pos ? new P(n.pos, i.pos, l) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, n = 0, i = this.unplaced.openEnd; n < e; n++) {
      let o = t.firstChild;
      if (t.childCount > 1 && (i = 0), o.type.spec.isolating && i <= n) {
        e = n;
        break;
      }
      t = o.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
        let i, o = null;
        n ? (o = Tt(this.unplaced.content, n - 1).firstChild, i = o.content) : i = this.unplaced.content;
        let a = i.firstChild;
        for (let s = this.depth; s >= 0; s--) {
          let { type: l, match: c } = this.frontier[s], p, u = null;
          if (t == 1 && (a ? c.matchType(a.type) || (u = c.fillBefore(x.from(a), !1)) : o && l.compatibleContent(o.type)))
            return { sliceDepth: n, frontierDepth: s, parent: o, inject: u };
          if (t == 2 && a && (p = c.findWrapping(a.type)))
            return { sliceDepth: n, frontierDepth: s, parent: o, wrap: p };
          if (o && c.matchType(o.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced, i = Tt(e, t);
    return !i.childCount || i.firstChild.isLeaf ? !1 : (this.unplaced = new w(e, t + 1, Math.max(n, i.size + t >= e.size - n ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced, i = Tt(e, t);
    if (i.childCount <= 1 && t > 0) {
      let o = e.size - t <= t + i.size;
      this.unplaced = new w(Ie(e, t - 1, 1), t - 1, o ? t - 1 : n);
    } else
      this.unplaced = new w(Ie(e, t, 1), t, n);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: i, wrap: o }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (o)
      for (let g = 0; g < o.length; g++)
        this.openFrontierNode(o[g]);
    let a = this.unplaced, s = n ? n.content : a.content, l = a.openStart - e, c = 0, p = [], { match: u, type: h } = this.frontier[t];
    if (i) {
      for (let g = 0; g < i.childCount; g++)
        p.push(i.child(g));
      u = u.matchFragment(i);
    }
    let m = s.size + e - (a.content.size - a.openEnd);
    for (; c < s.childCount; ) {
      let g = s.child(c), y = u.matchType(g.type);
      if (!y)
        break;
      c++, (c > 1 || l == 0 || g.content.size) && (u = y, p.push(Lr(g.mark(h.allowedMarks(g.marks)), c == 1 ? l : 0, c == s.childCount ? m : -1)));
    }
    let b = c == s.childCount;
    b || (m = -1), this.placed = Te(this.placed, t, x.from(p)), this.frontier[t].match = u, b && m < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let g = 0, y = s; g < m; g++) {
      let v = y.lastChild;
      this.frontier.push({ type: v.type, match: v.contentMatchAt(v.childCount) }), y = v.content;
    }
    this.unplaced = b ? e == 0 ? w.empty : new w(Ie(a.content, e - 1, 1), e - 1, m < 0 ? a.openEnd : e - 1) : new w(Ie(a.content, e, c), a.openStart, a.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !Rt(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: n } = this.$to, i = this.$to.after(n);
    for (; n > 1 && i == this.$to.end(--n); )
      ++i;
    return i;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: n, type: i } = this.frontier[t], o = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), a = Rt(e, t, i, n, o);
      if (a) {
        for (let s = t - 1; s >= 0; s--) {
          let { match: l, type: c } = this.frontier[s], p = Rt(e, s, c, l, !0);
          if (!p || p.childCount)
            continue e;
        }
        return { depth: t, fit: a, move: o ? e.doc.resolve(e.after(t + 1)) : e };
      }
    }
  }
  close(e) {
    let t = this.findCloseLevel(e);
    if (!t)
      return null;
    for (; this.depth > t.depth; )
      this.closeFrontierNode();
    t.fit.childCount && (this.placed = Te(this.placed, t.depth, t.fit)), e = t.move;
    for (let n = t.depth + 1; n <= e.depth; n++) {
      let i = e.node(n), o = i.type.contentMatch.fillBefore(i.content, !0, e.index(n));
      this.openFrontierNode(i.type, i.attrs, o);
    }
    return e;
  }
  openFrontierNode(e, t = null, n) {
    let i = this.frontier[this.depth];
    i.match = i.match.matchType(e), this.placed = Te(this.placed, this.depth, x.from(e.create(t, n))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(x.empty, !0);
    t.childCount && (this.placed = Te(this.placed, this.frontier.length, t));
  }
}
function Ie(r, e, t) {
  return e == 0 ? r.cutByIndex(t, r.childCount) : r.replaceChild(0, r.firstChild.copy(Ie(r.firstChild.content, e - 1, t)));
}
function Te(r, e, t) {
  return e == 0 ? r.append(t) : r.replaceChild(r.childCount - 1, r.lastChild.copy(Te(r.lastChild.content, e - 1, t)));
}
function Tt(r, e) {
  for (let t = 0; t < e; t++)
    r = r.firstChild.content;
  return r;
}
function Lr(r, e, t) {
  if (e <= 0)
    return r;
  let n = r.content;
  return e > 1 && (n = n.replaceChild(0, Lr(n.firstChild, e - 1, n.childCount == 1 ? t - 1 : 0))), e > 0 && (n = r.type.contentMatch.fillBefore(n).append(n), t <= 0 && (n = n.append(r.type.contentMatch.matchFragment(n).fillBefore(x.empty, !0)))), r.copy(n);
}
function Rt(r, e, t, n, i) {
  let o = r.node(e), a = i ? r.indexAfter(e) : r.index(e);
  if (a == o.childCount && !t.compatibleContent(o.type))
    return null;
  let s = n.fillBefore(o.content, !0, a);
  return s && !xa(t, o.content, a) ? s : null;
}
function xa(r, e, t) {
  for (let n = t; n < e.childCount; n++)
    if (!r.allowsMarks(e.child(n).marks))
      return !0;
  return !1;
}
class Le extends z {
  /**
  Construct an attribute step.
  */
  constructor(e, t, n) {
    super(), this.pos = e, this.attr = t, this.value = n;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return I.fail("No node at attribute step's position");
    let n = /* @__PURE__ */ Object.create(null);
    for (let o in t.attrs)
      n[o] = t.attrs[o];
    n[this.attr] = this.value;
    let i = t.type.create(n, null, t.marks);
    return I.fromReplace(e, this.pos, this.pos + 1, new w(x.from(i), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return j.empty;
  }
  invert(e) {
    return new Le(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Le(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Le(t.pos, t.attr, t.value);
  }
}
z.jsonID("attr", Le);
class mt extends z {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e.attrs)
      t[i] = e.attrs[i];
    t[this.attr] = this.value;
    let n = e.type.create(t, e.content, e.marks);
    return I.ok(n);
  }
  getMap() {
    return j.empty;
  }
  invert(e) {
    return new mt(this.attr, e.attrs[this.attr]);
  }
  map(e) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new mt(t.attr, t.value);
  }
}
z.jsonID("docAttr", mt);
let Ge = class extends Error {
};
Ge = function r(e) {
  let t = Error.call(this, e);
  return t.__proto__ = r.prototype, t;
};
Ge.prototype = Object.create(Error.prototype);
Ge.prototype.constructor = Ge;
Ge.prototype.name = "TransformError";
const Ot = /* @__PURE__ */ Object.create(null);
class _ {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, n) {
    this.$anchor = e, this.$head = t, this.ranges = n || [new va(e.min(t), e.max(t))];
  }
  /**
  The selection's anchor, as an unresolved position.
  */
  get anchor() {
    return this.$anchor.pos;
  }
  /**
  The selection's head.
  */
  get head() {
    return this.$head.pos;
  }
  /**
  The lower bound of the selection's main range.
  */
  get from() {
    return this.$from.pos;
  }
  /**
  The upper bound of the selection's main range.
  */
  get to() {
    return this.$to.pos;
  }
  /**
  The resolved lower  bound of the selection's main range.
  */
  get $from() {
    return this.ranges[0].$from;
  }
  /**
  The resolved upper bound of the selection's main range.
  */
  get $to() {
    return this.ranges[0].$to;
  }
  /**
  Indicates whether the selection contains any content.
  */
  get empty() {
    let e = this.ranges;
    for (let t = 0; t < e.length; t++)
      if (e[t].$from.pos != e[t].$to.pos)
        return !1;
    return !0;
  }
  /**
  Get the content of this selection as a slice.
  */
  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }
  /**
  Replace the selection with a slice or, if no slice is given,
  delete the selection. Will append to the given transaction.
  */
  replace(e, t = w.empty) {
    let n = t.content.lastChild, i = null;
    for (let s = 0; s < t.openEnd; s++)
      i = n, n = n.lastChild;
    let o = e.steps.length, a = this.ranges;
    for (let s = 0; s < a.length; s++) {
      let { $from: l, $to: c } = a[s], p = e.mapping.slice(o);
      e.replaceRange(p.map(l.pos), p.map(c.pos), s ? w.empty : t), s == 0 && zn(e, o, (n ? n.isInline : i && i.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let n = e.steps.length, i = this.ranges;
    for (let o = 0; o < i.length; o++) {
      let { $from: a, $to: s } = i[o], l = e.mapping.slice(n), c = l.map(a.pos), p = l.map(s.pos);
      o ? e.deleteRange(c, p) : (e.replaceRangeWith(c, p, t), zn(e, n, t.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, t, n = !1) {
    let i = e.parent.inlineContent ? new E(e) : _e(e.node(0), e.parent, e.pos, e.index(), t, n);
    if (i)
      return i;
    for (let o = e.depth - 1; o >= 0; o--) {
      let a = t < 0 ? _e(e.node(0), e.node(o), e.before(o + 1), e.index(o), t, n) : _e(e.node(0), e.node(o), e.after(o + 1), e.index(o) + 1, t, n);
      if (a)
        return a;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(e, t = 1) {
    return this.findFrom(e, t) || this.findFrom(e, -t) || new V(e.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(e) {
    return _e(e, e, 0, 0, 1) || new V(e);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(e) {
    return _e(e, e, e.content.size, e.childCount, -1) || new V(e);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(e, t) {
    if (!t || !t.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let n = Ot[t.type];
    if (!n)
      throw new RangeError(`No selection type ${t.type} defined`);
    return n.fromJSON(e, t);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, t) {
    if (e in Ot)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return Ot[e] = t, t.prototype.jsonID = e, t;
  }
  /**
  Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
  which is a value that can be mapped without having access to a
  current document, and later resolved to a real selection for a
  given document again. (This is used mostly by the history to
  track and restore old selections.) The default implementation of
  this method just converts the selection to a text selection and
  returns the bookmark for that.
  */
  getBookmark() {
    return E.between(this.$anchor, this.$head).getBookmark();
  }
}
_.prototype.visible = !0;
class va {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let Ln = !1;
function Bn(r) {
  !Ln && !r.parent.inlineContent && (Ln = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + r.parent.type.name + ")"));
}
class E extends _ {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    Bn(e), Bn(t), super(e, t);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, t) {
    let n = e.resolve(t.map(this.head));
    if (!n.parent.inlineContent)
      return _.near(n);
    let i = e.resolve(t.map(this.anchor));
    return new E(i.parent.inlineContent ? i : n, n);
  }
  replace(e, t = w.empty) {
    if (super.replace(e, t), t == w.empty) {
      let n = this.$from.marksAcross(this.$to);
      n && e.ensureMarks(n);
    }
  }
  eq(e) {
    return e instanceof E && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new Nt(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number" || typeof t.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new E(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, n = t) {
    let i = e.resolve(t);
    return new this(i, n == t ? i : e.resolve(n));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, t, n) {
    let i = e.pos - t.pos;
    if ((!n || i) && (n = i >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let o = _.findFrom(t, n, !0) || _.findFrom(t, -n, !0);
      if (o)
        t = o.$head;
      else
        return _.near(t, n);
    }
    return e.parent.inlineContent || (i == 0 ? e = t : (e = (_.findFrom(e, -n, !0) || _.findFrom(e, n, !0)).$anchor, e.pos < t.pos != i < 0 && (e = t))), new E(e, t);
  }
}
_.jsonID("text", E);
class Nt {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new Nt(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return E.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class N extends _ {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, n), this.node = t;
  }
  map(e, t) {
    let { deleted: n, pos: i } = t.mapResult(this.anchor), o = e.resolve(i);
    return n ? _.near(o) : new N(o);
  }
  content() {
    return new w(x.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof N && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Qt(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new N(e.resolve(t.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, t) {
    return new N(e.resolve(t));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
N.prototype.visible = !1;
_.jsonID("node", N);
class Qt {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: n } = e.mapResult(this.anchor);
    return t ? new Nt(n, n) : new Qt(n);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), n = t.nodeAfter;
    return n && N.isSelectable(n) ? new N(t) : _.near(t);
  }
}
class V extends _ {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = w.empty) {
    if (t == w.empty) {
      e.delete(0, e.doc.content.size);
      let n = _.atStart(e.doc);
      n.eq(e.selection) || e.setSelection(n);
    } else
      super.replace(e, t);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(e) {
    return new V(e);
  }
  map(e) {
    return new V(e);
  }
  eq(e) {
    return e instanceof V;
  }
  getBookmark() {
    return wa;
  }
}
_.jsonID("all", V);
const wa = {
  map() {
    return this;
  },
  resolve(r) {
    return new V(r);
  }
};
function _e(r, e, t, n, i, o = !1) {
  if (e.inlineContent)
    return E.create(r, t);
  for (let a = n - (i > 0 ? 0 : 1); i > 0 ? a < e.childCount : a >= 0; a += i) {
    let s = e.child(a);
    if (s.isAtom) {
      if (!o && N.isSelectable(s))
        return N.create(r, t - (i < 0 ? s.nodeSize : 0));
    } else {
      let l = _e(r, s, t + i, i < 0 ? s.childCount : 0, i, o);
      if (l)
        return l;
    }
    t += s.nodeSize * i;
  }
  return null;
}
function zn(r, e, t) {
  let n = r.steps.length - 1;
  if (n < e)
    return;
  let i = r.steps[n];
  if (!(i instanceof P || i instanceof H))
    return;
  let o = r.mapping.maps[n], a;
  o.forEach((s, l, c, p) => {
    a == null && (a = p);
  }), r.setSelection(_.near(r.doc.resolve(a), t));
}
function Fn(r, e) {
  return !e || !r ? r : r.bind(e);
}
class rt {
  constructor(e, t, n) {
    this.name = e, this.init = Fn(t.init, n), this.apply = Fn(t.apply, n);
  }
}
new rt("doc", {
  init(r) {
    return r.doc || r.schema.topNodeType.createAndFill();
  },
  apply(r) {
    return r.doc;
  }
}), new rt("selection", {
  init(r, e) {
    return r.selection || _.atStart(e.doc);
  },
  apply(r) {
    return r.selection;
  }
}), new rt("storedMarks", {
  init(r) {
    return r.storedMarks || null;
  },
  apply(r, e, t, n) {
    return n.selection.$cursor ? r.storedMarks : null;
  }
}), new rt("scrollToSelection", {
  init() {
    return 0;
  },
  apply(r, e) {
    return r.scrolledIntoView ? e + 1 : e;
  }
});
function Br(r, e, t) {
  for (let n in r) {
    let i = r[n];
    i instanceof Function ? i = i.bind(e) : n == "handleDOMEvents" && (i = Br(i, e, {})), t[n] = i;
  }
  return t;
}
class we {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && Br(e.props, this, this.props), this.key = e.key ? e.key.key : zr("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const $t = /* @__PURE__ */ Object.create(null);
function zr(r) {
  return r in $t ? r + "$" + ++$t[r] : ($t[r] = 0, r + "$");
}
class ke {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = zr(e);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(e) {
    return e.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const Zt = (r, e) => r.selection.empty ? !1 : (e && e(r.tr.deleteSelection().scrollIntoView()), !0);
function Fr(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("backward", r) : t.parentOffset > 0) ? null : t;
}
const Pr = (r, e, t) => {
  let n = Fr(r, t);
  if (!n)
    return !1;
  let i = en(n);
  if (!i) {
    let a = n.blockRange(), s = a && Ae(a);
    return s == null ? !1 : (e && e(r.tr.lift(a, s).scrollIntoView()), !0);
  }
  let o = i.nodeBefore;
  if (Gr(r, i, e, -1))
    return !0;
  if (n.parent.content.size == 0 && (Se(o, "end") || N.isSelectable(o)))
    for (let a = n.depth; ; a--) {
      let s = Xt(r.doc, n.before(a), n.after(a), w.empty);
      if (s && s.slice.size < s.to - s.from) {
        if (e) {
          let l = r.tr.step(s);
          l.setSelection(Se(o, "end") ? _.findFrom(l.doc.resolve(l.mapping.map(i.pos, -1)), -1) : N.create(l.doc, i.pos - o.nodeSize)), e(l.scrollIntoView());
        }
        return !0;
      }
      if (a == 1 || n.node(a - 1).childCount > 1)
        break;
    }
  return o.isAtom && i.depth == n.depth - 1 ? (e && e(r.tr.delete(i.pos - o.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, ka = (r, e, t) => {
  let n = Fr(r, t);
  if (!n)
    return !1;
  let i = en(n);
  return i ? Dr(r, i, e) : !1;
}, _a = (r, e, t) => {
  let n = Ur(r, t);
  if (!n)
    return !1;
  let i = tn(n);
  return i ? Dr(r, i, e) : !1;
};
function Dr(r, e, t) {
  let n = e.nodeBefore, i = n, o = e.pos - 1;
  for (; !i.isTextblock; o--) {
    if (i.type.spec.isolating)
      return !1;
    let p = i.lastChild;
    if (!p)
      return !1;
    i = p;
  }
  let a = e.nodeAfter, s = a, l = e.pos + 1;
  for (; !s.isTextblock; l++) {
    if (s.type.spec.isolating)
      return !1;
    let p = s.firstChild;
    if (!p)
      return !1;
    s = p;
  }
  let c = Xt(r.doc, o, l, w.empty);
  if (!c || c.from != o || c instanceof P && c.slice.size >= l - o)
    return !1;
  if (t) {
    let p = r.tr.step(c);
    p.setSelection(E.create(p.doc, o)), t(p.scrollIntoView());
  }
  return !0;
}
function Se(r, e, t = !1) {
  for (let n = r; n; n = e == "start" ? n.firstChild : n.lastChild) {
    if (n.isTextblock)
      return !0;
    if (t && n.childCount != 1)
      return !1;
  }
  return !1;
}
const Hr = (r, e, t) => {
  let { $head: n, empty: i } = r.selection, o = n;
  if (!i)
    return !1;
  if (n.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", r) : n.parentOffset > 0)
      return !1;
    o = en(n);
  }
  let a = o && o.nodeBefore;
  return !a || !N.isSelectable(a) ? !1 : (e && e(r.tr.setSelection(N.create(r.doc, o.pos - a.nodeSize)).scrollIntoView()), !0);
};
function en(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      if (r.index(e) > 0)
        return r.doc.resolve(r.before(e + 1));
      if (r.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function Ur(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("forward", r) : t.parentOffset < t.parent.content.size) ? null : t;
}
const jr = (r, e, t) => {
  let n = Ur(r, t);
  if (!n)
    return !1;
  let i = tn(n);
  if (!i)
    return !1;
  let o = i.nodeAfter;
  if (Gr(r, i, e, 1))
    return !0;
  if (n.parent.content.size == 0 && (Se(o, "start") || N.isSelectable(o))) {
    let a = Xt(r.doc, n.before(), n.after(), w.empty);
    if (a && a.slice.size < a.to - a.from) {
      if (e) {
        let s = r.tr.step(a);
        s.setSelection(Se(o, "start") ? _.findFrom(s.doc.resolve(s.mapping.map(i.pos)), 1) : N.create(s.doc, s.mapping.map(i.pos))), e(s.scrollIntoView());
      }
      return !0;
    }
  }
  return o.isAtom && i.depth == n.depth - 1 ? (e && e(r.tr.delete(i.pos, i.pos + o.nodeSize).scrollIntoView()), !0) : !1;
}, Vr = (r, e, t) => {
  let { $head: n, empty: i } = r.selection, o = n;
  if (!i)
    return !1;
  if (n.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", r) : n.parentOffset < n.parent.content.size)
      return !1;
    o = tn(n);
  }
  let a = o && o.nodeAfter;
  return !a || !N.isSelectable(a) ? !1 : (e && e(r.tr.setSelection(N.create(r.doc, o.pos)).scrollIntoView()), !0);
};
function tn(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      let t = r.node(e);
      if (r.index(e) + 1 < t.childCount)
        return r.doc.resolve(r.after(e + 1));
      if (t.type.spec.isolating)
        break;
    }
  return null;
}
const Na = (r, e) => {
  let t = r.selection, n = t instanceof N, i;
  if (n) {
    if (t.node.isTextblock || !ve(r.doc, t.from))
      return !1;
    i = t.from;
  } else if (i = _t(r.doc, t.from, -1), i == null)
    return !1;
  if (e) {
    let o = r.tr.join(i);
    n && o.setSelection(N.create(o.doc, i - r.doc.resolve(i).nodeBefore.nodeSize)), e(o.scrollIntoView());
  }
  return !0;
}, Sa = (r, e) => {
  let t = r.selection, n;
  if (t instanceof N) {
    if (t.node.isTextblock || !ve(r.doc, t.to))
      return !1;
    n = t.to;
  } else if (n = _t(r.doc, t.to, 1), n == null)
    return !1;
  return e && e(r.tr.join(n).scrollIntoView()), !0;
}, Ca = (r, e) => {
  let { $from: t, $to: n } = r.selection, i = t.blockRange(n), o = i && Ae(i);
  return o == null ? !1 : (e && e(r.tr.lift(i, o).scrollIntoView()), !0);
}, Jr = (r, e) => {
  let { $head: t, $anchor: n } = r.selection;
  return !t.parent.type.spec.code || !t.sameParent(n) ? !1 : (e && e(r.tr.insertText(`
`).scrollIntoView()), !0);
};
function nn(r) {
  for (let e = 0; e < r.edgeCount; e++) {
    let { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const Ea = (r, e) => {
  let { $head: t, $anchor: n } = r.selection;
  if (!t.parent.type.spec.code || !t.sameParent(n))
    return !1;
  let i = t.node(-1), o = t.indexAfter(-1), a = nn(i.contentMatchAt(o));
  if (!a || !i.canReplaceWith(o, o, a))
    return !1;
  if (e) {
    let s = t.after(), l = r.tr.replaceWith(s, s, a.createAndFill());
    l.setSelection(_.near(l.doc.resolve(s), 1)), e(l.scrollIntoView());
  }
  return !0;
}, qr = (r, e) => {
  let t = r.selection, { $from: n, $to: i } = t;
  if (t instanceof V || n.parent.inlineContent || i.parent.inlineContent)
    return !1;
  let o = nn(i.parent.contentMatchAt(i.indexAfter()));
  if (!o || !o.isTextblock)
    return !1;
  if (e) {
    let a = (!n.parentOffset && i.index() < i.parent.childCount ? n : i).pos, s = r.tr.insert(a, o.createAndFill());
    s.setSelection(E.create(s.doc, a + 1)), e(s.scrollIntoView());
  }
  return !0;
}, Wr = (r, e) => {
  let { $cursor: t } = r.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let o = t.before();
    if (Z(r.doc, o))
      return e && e(r.tr.split(o).scrollIntoView()), !0;
  }
  let n = t.blockRange(), i = n && Ae(n);
  return i == null ? !1 : (e && e(r.tr.lift(n, i).scrollIntoView()), !0);
};
function Aa(r) {
  return (e, t) => {
    let { $from: n, $to: i } = e.selection;
    if (e.selection instanceof N && e.selection.node.isBlock)
      return !n.parentOffset || !Z(e.doc, n.pos) ? !1 : (t && t(e.tr.split(n.pos).scrollIntoView()), !0);
    if (!n.depth)
      return !1;
    let o = [], a, s, l = !1, c = !1;
    for (let m = n.depth; ; m--)
      if (n.node(m).isBlock) {
        l = n.end(m) == n.pos + (n.depth - m), c = n.start(m) == n.pos - (n.depth - m), s = nn(n.node(m - 1).contentMatchAt(n.indexAfter(m - 1))), o.unshift(l && s ? { type: s } : null), a = m;
        break;
      } else {
        if (m == 1)
          return !1;
        o.unshift(null);
      }
    let p = e.tr;
    (e.selection instanceof E || e.selection instanceof V) && p.deleteSelection();
    let u = p.mapping.map(n.pos), h = Z(p.doc, u, o.length, o);
    if (h || (o[0] = s ? { type: s } : null, h = Z(p.doc, u, o.length, o)), !h)
      return !1;
    if (p.split(u, o.length, o), !l && c && n.node(a).type != s) {
      let m = p.mapping.map(n.before(a)), b = p.doc.resolve(m);
      s && n.node(a - 1).canReplaceWith(b.index(), b.index() + 1, s) && p.setNodeMarkup(p.mapping.map(n.before(a)), s);
    }
    return t && t(p.scrollIntoView()), !0;
  };
}
const Ma = Aa(), Ia = (r, e) => {
  let { $from: t, to: n } = r.selection, i, o = t.sharedDepth(n);
  return o == 0 ? !1 : (i = t.before(o), e && e(r.tr.setSelection(N.create(r.doc, i))), !0);
};
function Ta(r, e, t) {
  let n = e.nodeBefore, i = e.nodeAfter, o = e.index();
  return !n || !i || !n.type.compatibleContent(i.type) ? !1 : !n.content.size && e.parent.canReplace(o - 1, o) ? (t && t(r.tr.delete(e.pos - n.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(o, o + 1) || !(i.isTextblock || ve(r.doc, e.pos)) ? !1 : (t && t(r.tr.join(e.pos).scrollIntoView()), !0);
}
function Gr(r, e, t, n) {
  let i = e.nodeBefore, o = e.nodeAfter, a, s, l = i.type.spec.isolating || o.type.spec.isolating;
  if (!l && Ta(r, e, t))
    return !0;
  let c = !l && e.parent.canReplace(e.index(), e.index() + 1);
  if (c && (a = (s = i.contentMatchAt(i.childCount)).findWrapping(o.type)) && s.matchType(a[0] || o.type).validEnd) {
    if (t) {
      let m = e.pos + o.nodeSize, b = x.empty;
      for (let v = a.length - 1; v >= 0; v--)
        b = x.from(a[v].create(null, b));
      b = x.from(i.copy(b));
      let g = r.tr.step(new H(e.pos - 1, m, e.pos, m, new w(b, 1, 0), a.length, !0)), y = g.doc.resolve(m + 2 * a.length);
      y.nodeAfter && y.nodeAfter.type == i.type && ve(g.doc, y.pos) && g.join(y.pos), t(g.scrollIntoView());
    }
    return !0;
  }
  let p = o.type.spec.isolating || n > 0 && l ? null : _.findFrom(e, 1), u = p && p.$from.blockRange(p.$to), h = u && Ae(u);
  if (h != null && h >= e.depth)
    return t && t(r.tr.lift(u, h).scrollIntoView()), !0;
  if (c && Se(o, "start", !0) && Se(i, "end")) {
    let m = i, b = [];
    for (; b.push(m), !m.isTextblock; )
      m = m.lastChild;
    let g = o, y = 1;
    for (; !g.isTextblock; g = g.firstChild)
      y++;
    if (m.canReplace(m.childCount, m.childCount, g.content)) {
      if (t) {
        let v = x.empty;
        for (let M = b.length - 1; M >= 0; M--)
          v = x.from(b[M].copy(v));
        let A = r.tr.step(new H(e.pos - b.length, e.pos + o.nodeSize, e.pos + y, e.pos + o.nodeSize - y, new w(v, b.length, 0), 0, !0));
        t(A.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function Kr(r) {
  return function(e, t) {
    let n = e.selection, i = r < 0 ? n.$from : n.$to, o = i.depth;
    for (; i.node(o).isInline; ) {
      if (!o)
        return !1;
      o--;
    }
    return i.node(o).isTextblock ? (t && t(e.tr.setSelection(E.create(e.doc, r < 0 ? i.start(o) : i.end(o)))), !0) : !1;
  };
}
const Ra = Kr(-1), Oa = Kr(1);
function $a(r, e = null) {
  return function(t, n) {
    let { $from: i, $to: o } = t.selection, a = i.blockRange(o), s = a && Or(a, r, e);
    return s ? (n && n(t.tr.wrap(a, s).scrollIntoView()), !0) : !1;
  };
}
function Pn(r, e = null) {
  return function(t, n) {
    let i = !1;
    for (let o = 0; o < t.selection.ranges.length && !i; o++) {
      let { $from: { pos: a }, $to: { pos: s } } = t.selection.ranges[o];
      t.doc.nodesBetween(a, s, (l, c) => {
        if (i)
          return !1;
        if (!(!l.isTextblock || l.hasMarkup(r, e)))
          if (l.type == r)
            i = !0;
          else {
            let p = t.doc.resolve(c), u = p.index();
            i = p.parent.canReplaceWith(u, u + 1, r);
          }
      });
    }
    if (!i)
      return !1;
    if (n) {
      let o = t.tr;
      for (let a = 0; a < t.selection.ranges.length; a++) {
        let { $from: { pos: s }, $to: { pos: l } } = t.selection.ranges[a];
        o.setBlockType(s, l, r, e);
      }
      n(o.scrollIntoView());
    }
    return !0;
  };
}
function rn(...r) {
  return function(e, t, n) {
    for (let i = 0; i < r.length; i++)
      if (r[i](e, t, n))
        return !0;
    return !1;
  };
}
rn(Zt, Pr, Hr);
rn(Zt, jr, Vr);
rn(Jr, qr, Wr, Ma);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function La(r, e = null) {
  return function(t, n) {
    let { $from: i, $to: o } = t.selection, a = i.blockRange(o);
    if (!a)
      return !1;
    let s = n ? t.tr : null;
    return Ba(s, a, r, e) ? (n && n(s.scrollIntoView()), !0) : !1;
  };
}
function Ba(r, e, t, n = null) {
  let i = !1, o = e, a = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let l = a.resolve(e.start - 2);
    o = new ut(l, l, e.depth), e.endIndex < e.parent.childCount && (e = new ut(e.$from, a.resolve(e.$to.end(e.depth)), e.depth)), i = !0;
  }
  let s = Or(o, t, n, e);
  return s ? (r && za(r, e, s, i, t), !0) : !1;
}
function za(r, e, t, n, i) {
  let o = x.empty;
  for (let p = t.length - 1; p >= 0; p--)
    o = x.from(t[p].type.create(t[p].attrs, o));
  r.step(new H(e.start - (n ? 2 : 0), e.end, e.start, e.end, new w(o, 0, 0), t.length, !0));
  let a = 0;
  for (let p = 0; p < t.length; p++)
    t[p].type == i && (a = p + 1);
  let s = t.length - a, l = e.start + t.length - (n ? 2 : 0), c = e.parent;
  for (let p = e.startIndex, u = e.endIndex, h = !0; p < u; p++, h = !1)
    !h && Z(r.doc, l, s) && (r.split(l, s), l += 2 * s), l += c.child(p).nodeSize;
  return r;
}
function Fa(r) {
  return function(e, t) {
    let { $from: n, $to: i } = e.selection, o = n.blockRange(i, (a) => a.childCount > 0 && a.firstChild.type == r);
    return o ? t ? n.node(o.depth - 1).type == r ? Pa(e, t, r, o) : Da(e, t, o) : !0 : !1;
  };
}
function Pa(r, e, t, n) {
  let i = r.tr, o = n.end, a = n.$to.end(n.depth);
  o < a && (i.step(new H(o - 1, a, o, a, new w(x.from(t.create(null, n.parent.copy())), 1, 0), 1, !0)), n = new ut(i.doc.resolve(n.$from.pos), i.doc.resolve(a), n.depth));
  const s = Ae(n);
  if (s == null)
    return !1;
  i.lift(n, s);
  let l = i.doc.resolve(i.mapping.map(o, -1) - 1);
  return ve(i.doc, l.pos) && l.nodeBefore.type == l.nodeAfter.type && i.join(l.pos), e(i.scrollIntoView()), !0;
}
function Da(r, e, t) {
  let n = r.tr, i = t.parent;
  for (let m = t.end, b = t.endIndex - 1, g = t.startIndex; b > g; b--)
    m -= i.child(b).nodeSize, n.delete(m - 1, m + 1);
  let o = n.doc.resolve(t.start), a = o.nodeAfter;
  if (n.mapping.map(t.end) != t.start + o.nodeAfter.nodeSize)
    return !1;
  let s = t.startIndex == 0, l = t.endIndex == i.childCount, c = o.node(-1), p = o.index(-1);
  if (!c.canReplace(p + (s ? 0 : 1), p + 1, a.content.append(l ? x.empty : x.from(i))))
    return !1;
  let u = o.pos, h = u + a.nodeSize;
  return n.step(new H(u - (s ? 1 : 0), h + (l ? 1 : 0), u + 1, h - 1, new w((s ? x.empty : x.from(i.copy(x.empty))).append(l ? x.empty : x.from(i.copy(x.empty))), s ? 0 : 1, l ? 0 : 1), s ? 0 : 1)), e(n.scrollIntoView()), !0;
}
function Ha(r) {
  return function(e, t) {
    let { $from: n, $to: i } = e.selection, o = n.blockRange(i, (c) => c.childCount > 0 && c.firstChild.type == r);
    if (!o)
      return !1;
    let a = o.startIndex;
    if (a == 0)
      return !1;
    let s = o.parent, l = s.child(a - 1);
    if (l.type != r)
      return !1;
    if (t) {
      let c = l.lastChild && l.lastChild.type == s.type, p = x.from(c ? r.create() : null), u = new w(x.from(r.create(null, x.from(s.type.create(null, p)))), c ? 3 : 1, 0), h = o.start, m = o.end;
      t(e.tr.step(new H(h - (c ? 3 : 1), m, h, m, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function Yr(r) {
  const { state: e, transaction: t } = r;
  let { selection: n } = t, { doc: i } = t, { storedMarks: o } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return o;
    },
    get selection() {
      return n;
    },
    get doc() {
      return i;
    },
    get tr() {
      return n = t.selection, i = t.doc, o = t.storedMarks, t;
    }
  };
}
class Ua {
  constructor(e) {
    this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands: e, editor: t, state: n } = this, { view: i } = t, { tr: o } = n, a = this.buildProps(o);
    return Object.fromEntries(Object.entries(e).map(([s, l]) => [s, (...p) => {
      const u = l(...p)(a);
      return !o.getMeta("preventDispatch") && !this.hasCustomState && i.dispatch(o), u;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(e, t = !0) {
    const { rawCommands: n, editor: i, state: o } = this, { view: a } = i, s = [], l = !!e, c = e || o.tr, p = () => (!l && t && !c.getMeta("preventDispatch") && !this.hasCustomState && a.dispatch(c), s.every((h) => h === !0)), u = {
      ...Object.fromEntries(Object.entries(n).map(([h, m]) => [h, (...g) => {
        const y = this.buildProps(c, t), v = m(...g)(y);
        return s.push(v), u;
      }])),
      run: p
    };
    return u;
  }
  createCan(e) {
    const { rawCommands: t, state: n } = this, i = !1, o = e || n.tr, a = this.buildProps(o, i);
    return {
      ...Object.fromEntries(Object.entries(t).map(([l, c]) => [l, (...p) => c(...p)({ ...a, dispatch: void 0 })])),
      chain: () => this.createChain(o, i)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: n, editor: i, state: o } = this, { view: a } = i, s = {
      tr: e,
      editor: i,
      view: a,
      state: Yr({
        state: o,
        transaction: e
      }),
      dispatch: t ? () => {
      } : void 0,
      chain: () => this.createChain(e, t),
      can: () => this.createCan(e),
      get commands() {
        return Object.fromEntries(Object.entries(n).map(([l, c]) => [l, (...p) => c(...p)(s)]));
      }
    };
    return s;
  }
}
function W(r, e, t) {
  return r.config[e] === void 0 && r.parent ? W(r.parent, e, t) : typeof r.config[e] == "function" ? r.config[e].bind({
    ...t,
    parent: r.parent ? W(r.parent, e, t) : null
  }) : r.config[e];
}
function ja(r) {
  const e = r.filter((i) => i.type === "extension"), t = r.filter((i) => i.type === "node"), n = r.filter((i) => i.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: n
  };
}
function L(r, e) {
  if (typeof r == "string") {
    if (!e.nodes[r])
      throw Error(`There is no node type named '${r}'. Maybe you forgot to add the extension?`);
    return e.nodes[r];
  }
  return r;
}
function Xr(...r) {
  return r.filter((e) => !!e).reduce((e, t) => {
    const n = { ...e };
    return Object.entries(t).forEach(([i, o]) => {
      if (!n[i]) {
        n[i] = o;
        return;
      }
      if (i === "class") {
        const s = o ? String(o).split(" ") : [], l = n[i] ? n[i].split(" ") : [], c = s.filter((p) => !l.includes(p));
        n[i] = [...l, ...c].join(" ");
      } else if (i === "style") {
        const s = o ? o.split(";").map((p) => p.trim()).filter(Boolean) : [], l = n[i] ? n[i].split(";").map((p) => p.trim()).filter(Boolean) : [], c = /* @__PURE__ */ new Map();
        l.forEach((p) => {
          const [u, h] = p.split(":").map((m) => m.trim());
          c.set(u, h);
        }), s.forEach((p) => {
          const [u, h] = p.split(":").map((m) => m.trim());
          c.set(u, h);
        }), n[i] = Array.from(c.entries()).map(([p, u]) => `${p}: ${u}`).join("; ");
      } else
        n[i] = o;
    }), n;
  }, {});
}
function Va(r, e) {
  return e.filter((t) => t.type === r.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(r.attrs) || {} : {
    [t.name]: r.attrs[t.name]
  }).reduce((t, n) => Xr(t, n), {});
}
function Ja(r) {
  return typeof r == "function";
}
function Q(r, e = void 0, ...t) {
  return Ja(r) ? e ? r.bind(e)(...t) : r(...t) : r;
}
function qa(r) {
  return Object.prototype.toString.call(r) === "[object RegExp]";
}
function Wa(r) {
  return Object.prototype.toString.call(r).slice(8, -1);
}
function it(r) {
  return Wa(r) !== "Object" ? !1 : r.constructor === Object && Object.getPrototypeOf(r) === Object.prototype;
}
function on(r, e) {
  const t = { ...r };
  return it(r) && it(e) && Object.keys(e).forEach((n) => {
    it(e[n]) && it(r[n]) ? t[n] = on(r[n], e[n]) : t[n] = e[n];
  }), t;
}
class G {
  constructor(e = {}) {
    this.type = "extension", this.name = "extension", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = Q(W(this, "addOptions", {
      name: this.name
    }))), this.storage = Q(W(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new G(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => on(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new G({ ...this.config, ...e });
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = Q(W(t, "addOptions", {
      name: t.name
    })), t.storage = Q(W(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function Ga(r, e, t) {
  const { from: n, to: i } = e, { blockSeparator: o = `

`, textSerializers: a = {} } = t || {};
  let s = "";
  return r.nodesBetween(n, i, (l, c, p, u) => {
    var h;
    l.isBlock && c > n && (s += o);
    const m = a == null ? void 0 : a[l.type.name];
    if (m)
      return p && (s += m({
        node: l,
        pos: c,
        parent: p,
        index: u,
        range: e
      })), !1;
    l.isText && (s += (h = l == null ? void 0 : l.text) === null || h === void 0 ? void 0 : h.slice(Math.max(n, c) - c, i - c));
  }), s;
}
function Ka(r) {
  return Object.fromEntries(Object.entries(r.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
G.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new we({
        key: new ke("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: r } = this, { state: e, schema: t } = r, { doc: n, selection: i } = e, { ranges: o } = i, a = Math.min(...o.map((p) => p.$from.pos)), s = Math.max(...o.map((p) => p.$to.pos)), l = Ka(t);
            return Ga(n, { from: a, to: s }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: l
            });
          }
        }
      })
    ];
  }
});
const Ya = () => ({ editor: r, view: e }) => (requestAnimationFrame(() => {
  var t;
  r.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), Xa = (r = !1) => ({ commands: e }) => e.setContent("", r), Qa = () => ({ state: r, tr: e, dispatch: t }) => {
  const { selection: n } = e, { ranges: i } = n;
  return t && i.forEach(({ $from: o, $to: a }) => {
    r.doc.nodesBetween(o.pos, a.pos, (s, l) => {
      if (s.type.isText)
        return;
      const { doc: c, mapping: p } = e, u = c.resolve(p.map(l)), h = c.resolve(p.map(l + s.nodeSize)), m = u.blockRange(h);
      if (!m)
        return;
      const b = Ae(m);
      if (s.type.isTextblock) {
        const { defaultType: g } = u.parent.contentMatchAt(u.index());
        e.setNodeMarkup(m.start, g);
      }
      (b || b === 0) && e.lift(m, b);
    });
  }), !0;
}, Za = (r) => (e) => r(e), es = () => ({ state: r, dispatch: e }) => qr(r, e), ts = (r, e) => ({ editor: t, tr: n }) => {
  const { state: i } = t, o = i.doc.slice(r.from, r.to);
  n.deleteRange(r.from, r.to);
  const a = n.mapping.map(e);
  return n.insert(a, o.content), n.setSelection(new E(n.doc.resolve(Math.max(a - 1, 0)))), !0;
}, ns = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, n = t.$anchor.node();
  if (n.content.size > 0)
    return !1;
  const i = r.selection.$anchor;
  for (let o = i.depth; o > 0; o -= 1)
    if (i.node(o).type === n.type) {
      if (e) {
        const s = i.before(o), l = i.after(o);
        r.delete(s, l).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, rs = (r) => ({ tr: e, state: t, dispatch: n }) => {
  const i = L(r, t.schema), o = e.selection.$anchor;
  for (let a = o.depth; a > 0; a -= 1)
    if (o.node(a).type === i) {
      if (n) {
        const l = o.before(a), c = o.after(a);
        e.delete(l, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, is = (r) => ({ tr: e, dispatch: t }) => {
  const { from: n, to: i } = r;
  return t && e.delete(n, i), !0;
}, as = () => ({ state: r, dispatch: e }) => Zt(r, e), ss = () => ({ commands: r }) => r.keyboardShortcut("Enter"), ls = () => ({ state: r, dispatch: e }) => Ea(r, e);
function gt(r, e, t = { strict: !0 }) {
  const n = Object.keys(e);
  return n.length ? n.every((i) => t.strict ? e[i] === r[i] : qa(e[i]) ? e[i].test(r[i]) : e[i] === r[i]) : !0;
}
function Qr(r, e, t = {}) {
  return r.find((n) => n.type === e && gt(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((i) => [i, n.attrs[i]])),
    t
  ));
}
function Dn(r, e, t = {}) {
  return !!Qr(r, e, t);
}
function Zr(r, e, t) {
  var n;
  if (!r || !e)
    return;
  let i = r.parent.childAfter(r.parentOffset);
  if ((!i.node || !i.node.marks.some((p) => p.type === e)) && (i = r.parent.childBefore(r.parentOffset)), !i.node || !i.node.marks.some((p) => p.type === e) || (t = t || ((n = i.node.marks[0]) === null || n === void 0 ? void 0 : n.attrs), !Qr([...i.node.marks], e, t)))
    return;
  let a = i.index, s = r.start() + i.offset, l = a + 1, c = s + i.node.nodeSize;
  for (; a > 0 && Dn([...r.parent.child(a - 1).marks], e, t); )
    a -= 1, s -= r.parent.child(a).nodeSize;
  for (; l < r.parent.childCount && Dn([...r.parent.child(l).marks], e, t); )
    c += r.parent.child(l).nodeSize, l += 1;
  return {
    from: s,
    to: c
  };
}
function ce(r, e) {
  if (typeof r == "string") {
    if (!e.marks[r])
      throw Error(`There is no mark type named '${r}'. Maybe you forgot to add the extension?`);
    return e.marks[r];
  }
  return r;
}
const cs = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  const o = ce(r, n.schema), { doc: a, selection: s } = t, { $from: l, from: c, to: p } = s;
  if (i) {
    const u = Zr(l, o, e);
    if (u && u.from <= c && u.to >= p) {
      const h = E.create(a, u.from, u.to);
      t.setSelection(h);
    }
  }
  return !0;
}, ds = (r) => (e) => {
  const t = typeof r == "function" ? r(e) : r;
  for (let n = 0; n < t.length; n += 1)
    if (t[n](e))
      return !0;
  return !1;
};
function ei(r) {
  return r instanceof E;
}
function he(r = 0, e = 0, t = 0) {
  return Math.min(Math.max(r, e), t);
}
function ps(r, e = null) {
  if (!e)
    return null;
  const t = _.atStart(r), n = _.atEnd(r);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return n;
  const i = t.from, o = n.to;
  return e === "all" ? E.create(r, he(0, i, o), he(r.content.size, i, o)) : E.create(r, he(e, i, o), he(e, i, o));
}
function Jt() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function Ke() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function us() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const hs = (r = null, e = {}) => ({ editor: t, view: n, tr: i, dispatch: o }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const a = () => {
    (Ke() || Jt()) && n.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (n.focus(), us() && !Ke() && !Jt() && n.dom.focus({ preventScroll: !0 }));
    });
  };
  if (n.hasFocus() && r === null || r === !1)
    return !0;
  if (o && r === null && !ei(t.state.selection))
    return a(), !0;
  const s = ps(i.doc, r) || t.state.selection, l = t.state.selection.eq(s);
  return o && (l || i.setSelection(s), l && i.storedMarks && i.setStoredMarks(i.storedMarks), a()), !0;
}, fs = (r, e) => (t) => r.every((n, i) => e(n, { ...t, index: i })), ms = (r, e) => ({ tr: t, commands: n }) => n.insertContentAt({ from: t.selection.from, to: t.selection.to }, r, e), ti = (r) => {
  const e = r.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const n = e[t];
    n.nodeType === 3 && n.nodeValue && /^(\n\s\s|\n)$/.test(n.nodeValue) ? r.removeChild(n) : n.nodeType === 1 && ti(n);
  }
  return r;
};
function ot(r) {
  const e = `<body>${r}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return ti(t);
}
function Ye(r, e, t) {
  if (r instanceof be || r instanceof x)
    return r;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const n = typeof r == "object" && r !== null, i = typeof r == "string";
  if (n)
    try {
      if (Array.isArray(r) && r.length > 0)
        return x.fromArray(r.map((s) => e.nodeFromJSON(s)));
      const a = e.nodeFromJSON(r);
      return t.errorOnInvalidContent && a.check(), a;
    } catch (o) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: o });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", r, "Error:", o), Ye("", e, t);
    }
  if (i) {
    if (t.errorOnInvalidContent) {
      let a = !1, s = "";
      const l = new oa({
        topNode: e.spec.topNode,
        marks: e.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: e.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (c) => (a = !0, s = typeof c == "string" ? c : c.outerHTML, null)
              }
            ]
          }
        })
      });
      if (t.slice ? Ne.fromSchema(l).parseSlice(ot(r), t.parseOptions) : Ne.fromSchema(l).parse(ot(r), t.parseOptions), t.errorOnInvalidContent && a)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${s}`) });
    }
    const o = Ne.fromSchema(e);
    return t.slice ? o.parseSlice(ot(r), t.parseOptions).content : o.parse(ot(r), t.parseOptions);
  }
  return Ye("", e, t);
}
function gs(r, e, t) {
  const n = r.steps.length - 1;
  if (n < e)
    return;
  const i = r.steps[n];
  if (!(i instanceof P || i instanceof H))
    return;
  const o = r.mapping.maps[n];
  let a = 0;
  o.forEach((s, l, c, p) => {
    a === 0 && (a = p);
  }), r.setSelection(_.near(r.doc.resolve(a), t));
}
const bs = (r) => !("type" in r), ys = (r, e, t) => ({ tr: n, dispatch: i, editor: o }) => {
  var a;
  if (i) {
    t = {
      parseOptions: o.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...t
    };
    let s;
    const l = (y) => {
      o.emit("contentError", {
        editor: o,
        error: y,
        disableCollaboration: () => {
          o.storage.collaboration && (o.storage.collaboration.isDisabled = !0);
        }
      });
    }, c = {
      preserveWhitespace: "full",
      ...t.parseOptions
    };
    if (!t.errorOnInvalidContent && !o.options.enableContentCheck && o.options.emitContentError)
      try {
        Ye(e, o.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (y) {
        l(y);
      }
    try {
      s = Ye(e, o.schema, {
        parseOptions: c,
        errorOnInvalidContent: (a = t.errorOnInvalidContent) !== null && a !== void 0 ? a : o.options.enableContentCheck
      });
    } catch (y) {
      return l(y), !1;
    }
    let { from: p, to: u } = typeof r == "number" ? { from: r, to: r } : { from: r.from, to: r.to }, h = !0, m = !0;
    if ((bs(s) ? s : [s]).forEach((y) => {
      y.check(), h = h ? y.isText && y.marks.length === 0 : !1, m = m ? y.isBlock : !1;
    }), p === u && m) {
      const { parent: y } = n.doc.resolve(p);
      y.isTextblock && !y.type.spec.code && !y.childCount && (p -= 1, u += 1);
    }
    let g;
    if (h) {
      if (Array.isArray(e))
        g = e.map((y) => y.text || "").join("");
      else if (e instanceof x) {
        let y = "";
        e.forEach((v) => {
          v.text && (y += v.text);
        }), g = y;
      } else typeof e == "object" && e && e.text ? g = e.text : g = e;
      n.insertText(g, p, u);
    } else
      g = s, n.replaceWith(p, u, g);
    t.updateSelection && gs(n, n.steps.length - 1, -1), t.applyInputRules && n.setMeta("applyInputRules", { from: p, text: g }), t.applyPasteRules && n.setMeta("applyPasteRules", { from: p, text: g });
  }
  return !0;
}, xs = () => ({ state: r, dispatch: e }) => Na(r, e), vs = () => ({ state: r, dispatch: e }) => Sa(r, e), ws = () => ({ state: r, dispatch: e }) => Pr(r, e), ks = () => ({ state: r, dispatch: e }) => jr(r, e), _s = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const n = _t(r.doc, r.selection.$from.pos, -1);
    return n == null ? !1 : (t.join(n, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Ns = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const n = _t(r.doc, r.selection.$from.pos, 1);
    return n == null ? !1 : (t.join(n, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Ss = () => ({ state: r, dispatch: e }) => ka(r, e), Cs = () => ({ state: r, dispatch: e }) => _a(r, e);
function ni() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function Es(r) {
  const e = r.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let n, i, o, a;
  for (let s = 0; s < e.length - 1; s += 1) {
    const l = e[s];
    if (/^(cmd|meta|m)$/i.test(l))
      a = !0;
    else if (/^a(lt)?$/i.test(l))
      n = !0;
    else if (/^(c|ctrl|control)$/i.test(l))
      i = !0;
    else if (/^s(hift)?$/i.test(l))
      o = !0;
    else if (/^mod$/i.test(l))
      Ke() || ni() ? a = !0 : i = !0;
    else
      throw new Error(`Unrecognized modifier name: ${l}`);
  }
  return n && (t = `Alt-${t}`), i && (t = `Ctrl-${t}`), a && (t = `Meta-${t}`), o && (t = `Shift-${t}`), t;
}
const As = (r) => ({ editor: e, view: t, tr: n, dispatch: i }) => {
  const o = Es(r).split(/-(?!$)/), a = o.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), s = new KeyboardEvent("keydown", {
    key: a === "Space" ? " " : a,
    altKey: o.includes("Alt"),
    ctrlKey: o.includes("Ctrl"),
    metaKey: o.includes("Meta"),
    shiftKey: o.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), l = e.captureTransaction(() => {
    t.someProp("handleKeyDown", (c) => c(t, s));
  });
  return l == null || l.steps.forEach((c) => {
    const p = c.map(n.mapping);
    p && i && n.maybeStep(p);
  }), !0;
};
function an(r, e, t = {}) {
  const { from: n, to: i, empty: o } = r.selection, a = e ? L(e, r.schema) : null, s = [];
  r.doc.nodesBetween(n, i, (u, h) => {
    if (u.isText)
      return;
    const m = Math.max(n, h), b = Math.min(i, h + u.nodeSize);
    s.push({
      node: u,
      from: m,
      to: b
    });
  });
  const l = i - n, c = s.filter((u) => a ? a.name === u.node.type.name : !0).filter((u) => gt(u.node.attrs, t, { strict: !1 }));
  return o ? !!c.length : c.reduce((u, h) => u + h.to - h.from, 0) >= l;
}
const Ms = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return an(t, i, e) ? Ca(t, n) : !1;
}, Is = () => ({ state: r, dispatch: e }) => Wr(r, e), Ts = (r) => ({ state: e, dispatch: t }) => {
  const n = L(r, e.schema);
  return Fa(n)(e, t);
}, Rs = () => ({ state: r, dispatch: e }) => Jr(r, e);
function ri(r, e) {
  return e.nodes[r] ? "node" : e.marks[r] ? "mark" : null;
}
function Hn(r, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(r).reduce((n, i) => (t.includes(i) || (n[i] = r[i]), n), {});
}
const Os = (r, e) => ({ tr: t, state: n, dispatch: i }) => {
  let o = null, a = null;
  const s = ri(typeof r == "string" ? r : r.name, n.schema);
  return s ? (s === "node" && (o = L(r, n.schema)), s === "mark" && (a = ce(r, n.schema)), i && t.selection.ranges.forEach((l) => {
    n.doc.nodesBetween(l.$from.pos, l.$to.pos, (c, p) => {
      o && o === c.type && t.setNodeMarkup(p, void 0, Hn(c.attrs, e)), a && c.marks.length && c.marks.forEach((u) => {
        a === u.type && t.addMark(p, p + c.nodeSize, a.create(Hn(u.attrs, e)));
      });
    });
  }), !0) : !1;
}, $s = () => ({ tr: r, dispatch: e }) => (e && r.scrollIntoView(), !0), Ls = () => ({ tr: r, dispatch: e }) => {
  if (e) {
    const t = new V(r.doc);
    r.setSelection(t);
  }
  return !0;
}, Bs = () => ({ state: r, dispatch: e }) => Hr(r, e), zs = () => ({ state: r, dispatch: e }) => Vr(r, e), Fs = () => ({ state: r, dispatch: e }) => Ia(r, e), Ps = () => ({ state: r, dispatch: e }) => Oa(r, e), Ds = () => ({ state: r, dispatch: e }) => Ra(r, e);
function Hs(r, e, t = {}, n = {}) {
  return Ye(r, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: n.errorOnInvalidContent
  });
}
const Us = (r, e = !1, t = {}, n = {}) => ({ editor: i, tr: o, dispatch: a, commands: s }) => {
  var l, c;
  const { doc: p } = o;
  if (t.preserveWhitespace !== "full") {
    const u = Hs(r, i.schema, t, {
      errorOnInvalidContent: (l = n.errorOnInvalidContent) !== null && l !== void 0 ? l : i.options.enableContentCheck
    });
    return a && o.replaceWith(0, p.content.size, u).setMeta("preventUpdate", !e), !0;
  }
  return a && o.setMeta("preventUpdate", !e), s.insertContentAt({ from: 0, to: p.content.size }, r, {
    parseOptions: t,
    errorOnInvalidContent: (c = n.errorOnInvalidContent) !== null && c !== void 0 ? c : i.options.enableContentCheck
  });
};
function js(r, e) {
  const t = ce(e, r.schema), { from: n, to: i, empty: o } = r.selection, a = [];
  o ? (r.storedMarks && a.push(...r.storedMarks), a.push(...r.selection.$head.marks())) : r.doc.nodesBetween(n, i, (l) => {
    a.push(...l.marks);
  });
  const s = a.find((l) => l.type.name === t.name);
  return s ? { ...s.attrs } : {};
}
function Vs(r) {
  for (let e = 0; e < r.edgeCount; e += 1) {
    const { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
function Js(r, e) {
  for (let t = r.depth; t > 0; t -= 1) {
    const n = r.node(t);
    if (e(n))
      return {
        pos: t > 0 ? r.before(t) : 0,
        start: r.start(t),
        depth: t,
        node: n
      };
  }
}
function sn(r) {
  return (e) => Js(e.$from, r);
}
function st(r, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([n]) => {
    const i = r.find((o) => o.type === e && o.name === n);
    return i ? i.attribute.keepOnSplit : !1;
  }));
}
function qs(r, e, t = {}) {
  const { empty: n, ranges: i } = r.selection, o = e ? ce(e, r.schema) : null;
  if (n)
    return !!(r.storedMarks || r.selection.$from.marks()).filter((u) => o ? o.name === u.type.name : !0).find((u) => gt(u.attrs, t, { strict: !1 }));
  let a = 0;
  const s = [];
  if (i.forEach(({ $from: u, $to: h }) => {
    const m = u.pos, b = h.pos;
    r.doc.nodesBetween(m, b, (g, y) => {
      if (!g.isText && !g.marks.length)
        return;
      const v = Math.max(m, y), A = Math.min(b, y + g.nodeSize), M = A - v;
      a += M, s.push(...g.marks.map(($) => ({
        mark: $,
        from: v,
        to: A
      })));
    });
  }), a === 0)
    return !1;
  const l = s.filter((u) => o ? o.name === u.mark.type.name : !0).filter((u) => gt(u.mark.attrs, t, { strict: !1 })).reduce((u, h) => u + h.to - h.from, 0), c = s.filter((u) => o ? u.mark.type !== o && u.mark.type.excludes(o) : !0).reduce((u, h) => u + h.to - h.from, 0);
  return (l > 0 ? l + c : l) >= a;
}
function Un(r, e) {
  const { nodeExtensions: t } = ja(e), n = t.find((a) => a.name === r);
  if (!n)
    return !1;
  const i = {
    name: n.name,
    options: n.options,
    storage: n.storage
  }, o = Q(W(n, "group", i));
  return typeof o != "string" ? !1 : o.split(" ").includes("list");
}
function ii(r, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
  var n;
  if (t) {
    if (r.type.name === "hardBreak")
      return !0;
    if (r.isText)
      return /^\s*$/m.test((n = r.text) !== null && n !== void 0 ? n : "");
  }
  if (r.isText)
    return !r.text;
  if (r.isAtom || r.isLeaf)
    return !1;
  if (r.content.childCount === 0)
    return !0;
  if (e) {
    let i = !0;
    return r.content.forEach((o) => {
      i !== !1 && (ii(o, { ignoreWhitespace: t, checkChildren: e }) || (i = !1));
    }), i;
  }
  return !1;
}
function Ws(r, e, t) {
  var n;
  const { selection: i } = e;
  let o = null;
  if (ei(i) && (o = i.$cursor), o) {
    const s = (n = r.storedMarks) !== null && n !== void 0 ? n : o.marks();
    return !!t.isInSet(s) || !s.some((l) => l.type.excludes(t));
  }
  const { ranges: a } = i;
  return a.some(({ $from: s, $to: l }) => {
    let c = s.depth === 0 ? r.doc.inlineContent && r.doc.type.allowsMarkType(t) : !1;
    return r.doc.nodesBetween(s.pos, l.pos, (p, u, h) => {
      if (c)
        return !1;
      if (p.isInline) {
        const m = !h || h.type.allowsMarkType(t), b = !!t.isInSet(p.marks) || !p.marks.some((g) => g.type.excludes(t));
        c = m && b;
      }
      return !c;
    }), c;
  });
}
const Gs = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  const { selection: o } = t, { empty: a, ranges: s } = o, l = ce(r, n.schema);
  if (i)
    if (a) {
      const c = js(n, l);
      t.addStoredMark(l.create({
        ...c,
        ...e
      }));
    } else
      s.forEach((c) => {
        const p = c.$from.pos, u = c.$to.pos;
        n.doc.nodesBetween(p, u, (h, m) => {
          const b = Math.max(m, p), g = Math.min(m + h.nodeSize, u);
          h.marks.find((v) => v.type === l) ? h.marks.forEach((v) => {
            l === v.type && t.addMark(b, g, l.create({
              ...v.attrs,
              ...e
            }));
          }) : t.addMark(b, g, l.create(e));
        });
      });
  return Ws(n, t, l);
}, Ks = (r, e) => ({ tr: t }) => (t.setMeta(r, e), !0), Ys = (r, e = {}) => ({ state: t, dispatch: n, chain: i }) => {
  const o = L(r, t.schema);
  let a;
  return t.selection.$anchor.sameParent(t.selection.$head) && (a = t.selection.$anchor.parent.attrs), o.isTextblock ? i().command(({ commands: s }) => Pn(o, { ...a, ...e })(t) ? !0 : s.clearNodes()).command(({ state: s }) => Pn(o, { ...a, ...e })(s, n)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, Xs = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: n } = e, i = he(r, 0, n.content.size), o = N.create(n, i);
    e.setSelection(o);
  }
  return !0;
}, Qs = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: n } = e, { from: i, to: o } = typeof r == "number" ? { from: r, to: r } : r, a = E.atStart(n).from, s = E.atEnd(n).to, l = he(i, a, s), c = he(o, a, s), p = E.create(n, l, c);
    e.setSelection(p);
  }
  return !0;
}, Zs = (r) => ({ state: e, dispatch: t }) => {
  const n = L(r, e.schema);
  return Ha(n)(e, t);
};
function jn(r, e) {
  const t = r.storedMarks || r.selection.$to.parentOffset && r.selection.$from.marks();
  if (t) {
    const n = t.filter((i) => e == null ? void 0 : e.includes(i.type.name));
    r.tr.ensureMarks(n);
  }
}
const el = ({ keepMarks: r = !0 } = {}) => ({ tr: e, state: t, dispatch: n, editor: i }) => {
  const { selection: o, doc: a } = e, { $from: s, $to: l } = o, c = i.extensionManager.attributes, p = st(c, s.node().type.name, s.node().attrs);
  if (o instanceof N && o.node.isBlock)
    return !s.parentOffset || !Z(a, s.pos) ? !1 : (n && (r && jn(t, i.extensionManager.splittableMarks), e.split(s.pos).scrollIntoView()), !0);
  if (!s.parent.isBlock)
    return !1;
  const u = l.parentOffset === l.parent.content.size, h = s.depth === 0 ? void 0 : Vs(s.node(-1).contentMatchAt(s.indexAfter(-1)));
  let m = u && h ? [
    {
      type: h,
      attrs: p
    }
  ] : void 0, b = Z(e.doc, e.mapping.map(s.pos), 1, m);
  if (!m && !b && Z(e.doc, e.mapping.map(s.pos), 1, h ? [{ type: h }] : void 0) && (b = !0, m = h ? [
    {
      type: h,
      attrs: p
    }
  ] : void 0), n) {
    if (b && (o instanceof E && e.deleteSelection(), e.split(e.mapping.map(s.pos), 1, m), h && !u && !s.parentOffset && s.parent.type !== h)) {
      const g = e.mapping.map(s.before()), y = e.doc.resolve(g);
      s.node(-1).canReplaceWith(y.index(), y.index() + 1, h) && e.setNodeMarkup(e.mapping.map(s.before()), h);
    }
    r && jn(t, i.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return b;
}, tl = (r, e = {}) => ({ tr: t, state: n, dispatch: i, editor: o }) => {
  var a;
  const s = L(r, n.schema), { $from: l, $to: c } = n.selection, p = n.selection.node;
  if (p && p.isBlock || l.depth < 2 || !l.sameParent(c))
    return !1;
  const u = l.node(-1);
  if (u.type !== s)
    return !1;
  const h = o.extensionManager.attributes;
  if (l.parent.content.size === 0 && l.node(-1).childCount === l.indexAfter(-1)) {
    if (l.depth === 2 || l.node(-3).type !== s || l.index(-2) !== l.node(-2).childCount - 1)
      return !1;
    if (i) {
      let v = x.empty;
      const A = l.index(-1) ? 1 : l.index(-2) ? 2 : 3;
      for (let J = l.depth - A; J >= l.depth - 3; J -= 1)
        v = x.from(l.node(J).copy(v));
      const M = l.indexAfter(-1) < l.node(-2).childCount ? 1 : l.indexAfter(-2) < l.node(-3).childCount ? 2 : 3, $ = {
        ...st(h, l.node().type.name, l.node().attrs),
        ...e
      }, F = ((a = s.contentMatch.defaultType) === null || a === void 0 ? void 0 : a.createAndFill($)) || void 0;
      v = v.append(x.from(s.createAndFill(null, F) || void 0));
      const T = l.before(l.depth - (A - 1));
      t.replace(T, l.after(-M), new w(v, 4 - A, 0));
      let U = -1;
      t.doc.nodesBetween(T, t.doc.content.size, (J, li) => {
        if (U > -1)
          return !1;
        J.isTextblock && J.content.size === 0 && (U = li + 1);
      }), U > -1 && t.setSelection(E.near(t.doc.resolve(U))), t.scrollIntoView();
    }
    return !0;
  }
  const m = c.pos === l.end() ? u.contentMatchAt(0).defaultType : null, b = {
    ...st(h, u.type.name, u.attrs),
    ...e
  }, g = {
    ...st(h, l.node().type.name, l.node().attrs),
    ...e
  };
  t.delete(l.pos, c.pos);
  const y = m ? [
    { type: s, attrs: b },
    { type: m, attrs: g }
  ] : [{ type: s, attrs: b }];
  if (!Z(t.doc, l.pos, 2))
    return !1;
  if (i) {
    const { selection: v, storedMarks: A } = n, { splittableMarks: M } = o.extensionManager, $ = A || v.$to.parentOffset && v.$from.marks();
    if (t.split(l.pos, 2, y).scrollIntoView(), !$ || !i)
      return !0;
    const F = $.filter((T) => M.includes(T.type.name));
    t.ensureMarks(F);
  }
  return !0;
}, Lt = (r, e) => {
  const t = sn((a) => a.type === e)(r.selection);
  if (!t)
    return !0;
  const n = r.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (n === void 0)
    return !0;
  const i = r.doc.nodeAt(n);
  return t.node.type === (i == null ? void 0 : i.type) && ve(r.doc, t.pos) && r.join(t.pos), !0;
}, Bt = (r, e) => {
  const t = sn((a) => a.type === e)(r.selection);
  if (!t)
    return !0;
  const n = r.doc.resolve(t.start).after(t.depth);
  if (n === void 0)
    return !0;
  const i = r.doc.nodeAt(n);
  return t.node.type === (i == null ? void 0 : i.type) && ve(r.doc, n) && r.join(n), !0;
}, nl = (r, e, t, n = {}) => ({ editor: i, tr: o, state: a, dispatch: s, chain: l, commands: c, can: p }) => {
  const { extensions: u, splittableMarks: h } = i.extensionManager, m = L(r, a.schema), b = L(e, a.schema), { selection: g, storedMarks: y } = a, { $from: v, $to: A } = g, M = v.blockRange(A), $ = y || g.$to.parentOffset && g.$from.marks();
  if (!M)
    return !1;
  const F = sn((T) => Un(T.type.name, u))(g);
  if (M.depth >= 1 && F && M.depth - F.depth <= 1) {
    if (F.node.type === m)
      return c.liftListItem(b);
    if (Un(F.node.type.name, u) && m.validContent(F.node.content) && s)
      return l().command(() => (o.setNodeMarkup(F.pos, m), !0)).command(() => Lt(o, m)).command(() => Bt(o, m)).run();
  }
  return !t || !$ || !s ? l().command(() => p().wrapInList(m, n) ? !0 : c.clearNodes()).wrapInList(m, n).command(() => Lt(o, m)).command(() => Bt(o, m)).run() : l().command(() => {
    const T = p().wrapInList(m, n), U = $.filter((J) => h.includes(J.type.name));
    return o.ensureMarks(U), T ? !0 : c.clearNodes();
  }).wrapInList(m, n).command(() => Lt(o, m)).command(() => Bt(o, m)).run();
}, rl = (r, e = {}, t = {}) => ({ state: n, commands: i }) => {
  const { extendEmptyMarkRange: o = !1 } = t, a = ce(r, n.schema);
  return qs(n, a, e) ? i.unsetMark(a, { extendEmptyMarkRange: o }) : i.setMark(a, e);
}, il = (r, e, t = {}) => ({ state: n, commands: i }) => {
  const o = L(r, n.schema), a = L(e, n.schema), s = an(n, o, t);
  let l;
  return n.selection.$anchor.sameParent(n.selection.$head) && (l = n.selection.$anchor.parent.attrs), s ? i.setNode(a, l) : i.setNode(o, { ...l, ...t });
}, ol = (r, e = {}) => ({ state: t, commands: n }) => {
  const i = L(r, t.schema);
  return an(t, i, e) ? n.lift(i) : n.wrapIn(i, e);
}, al = () => ({ state: r, dispatch: e }) => {
  const t = r.plugins;
  for (let n = 0; n < t.length; n += 1) {
    const i = t[n];
    let o;
    if (i.spec.isInputRules && (o = i.getState(r))) {
      if (e) {
        const a = r.tr, s = o.transform;
        for (let l = s.steps.length - 1; l >= 0; l -= 1)
          a.step(s.steps[l].invert(s.docs[l]));
        if (o.text) {
          const l = a.doc.resolve(o.from).marks();
          a.replaceWith(o.from, o.to, r.schema.text(o.text, l));
        } else
          a.delete(o.from, o.to);
      }
      return !0;
    }
  }
  return !1;
}, sl = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, { empty: n, ranges: i } = t;
  return n || e && i.forEach((o) => {
    r.removeMark(o.$from.pos, o.$to.pos);
  }), !0;
}, ll = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  var o;
  const { extendEmptyMarkRange: a = !1 } = e, { selection: s } = t, l = ce(r, n.schema), { $from: c, empty: p, ranges: u } = s;
  if (!i)
    return !0;
  if (p && a) {
    let { from: h, to: m } = s;
    const b = (o = c.marks().find((y) => y.type === l)) === null || o === void 0 ? void 0 : o.attrs, g = Zr(c, l, b);
    g && (h = g.from, m = g.to), t.removeMark(h, m, l);
  } else
    u.forEach((h) => {
      t.removeMark(h.$from.pos, h.$to.pos, l);
    });
  return t.removeStoredMark(l), !0;
}, cl = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  let o = null, a = null;
  const s = ri(typeof r == "string" ? r : r.name, n.schema);
  return s ? (s === "node" && (o = L(r, n.schema)), s === "mark" && (a = ce(r, n.schema)), i && t.selection.ranges.forEach((l) => {
    const c = l.$from.pos, p = l.$to.pos;
    let u, h, m, b;
    t.selection.empty ? n.doc.nodesBetween(c, p, (g, y) => {
      o && o === g.type && (m = Math.max(y, c), b = Math.min(y + g.nodeSize, p), u = y, h = g);
    }) : n.doc.nodesBetween(c, p, (g, y) => {
      y < c && o && o === g.type && (m = Math.max(y, c), b = Math.min(y + g.nodeSize, p), u = y, h = g), y >= c && y <= p && (o && o === g.type && t.setNodeMarkup(y, void 0, {
        ...g.attrs,
        ...e
      }), a && g.marks.length && g.marks.forEach((v) => {
        if (a === v.type) {
          const A = Math.max(y, c), M = Math.min(y + g.nodeSize, p);
          t.addMark(A, M, a.create({
            ...v.attrs,
            ...e
          }));
        }
      }));
    }), h && (u !== void 0 && t.setNodeMarkup(u, void 0, {
      ...h.attrs,
      ...e
    }), a && h.marks.length && h.marks.forEach((g) => {
      a === g.type && t.addMark(m, b, a.create({
        ...g.attrs,
        ...e
      }));
    }));
  }), !0) : !1;
}, dl = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return $a(i, e)(t, n);
}, pl = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return La(i, e)(t, n);
};
var ul = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: Ya,
  clearContent: Xa,
  clearNodes: Qa,
  command: Za,
  createParagraphNear: es,
  cut: ts,
  deleteCurrentNode: ns,
  deleteNode: rs,
  deleteRange: is,
  deleteSelection: as,
  enter: ss,
  exitCode: ls,
  extendMarkRange: cs,
  first: ds,
  focus: hs,
  forEach: fs,
  insertContent: ms,
  insertContentAt: ys,
  joinBackward: ws,
  joinDown: vs,
  joinForward: ks,
  joinItemBackward: _s,
  joinItemForward: Ns,
  joinTextblockBackward: Ss,
  joinTextblockForward: Cs,
  joinUp: xs,
  keyboardShortcut: As,
  lift: Ms,
  liftEmptyBlock: Is,
  liftListItem: Ts,
  newlineInCode: Rs,
  resetAttributes: Os,
  scrollIntoView: $s,
  selectAll: Ls,
  selectNodeBackward: Bs,
  selectNodeForward: zs,
  selectParentNode: Fs,
  selectTextblockEnd: Ps,
  selectTextblockStart: Ds,
  setContent: Us,
  setMark: Gs,
  setMeta: Ks,
  setNode: Ys,
  setNodeSelection: Xs,
  setTextSelection: Qs,
  sinkListItem: Zs,
  splitBlock: el,
  splitListItem: tl,
  toggleList: nl,
  toggleMark: rl,
  toggleNode: il,
  toggleWrap: ol,
  undoInputRule: al,
  unsetAllMarks: sl,
  unsetMark: ll,
  updateAttributes: cl,
  wrapIn: dl,
  wrapInList: pl
});
G.create({
  name: "commands",
  addCommands() {
    return {
      ...ul
    };
  }
});
G.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new we({
        key: new ke("tiptapDrop"),
        props: {
          handleDrop: (r, e, t, n) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: t,
              moved: n
            });
          }
        }
      })
    ];
  }
});
G.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new we({
        key: new ke("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
const hl = new ke("focusEvents");
G.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: r } = this;
    return [
      new we({
        key: hl,
        props: {
          handleDOMEvents: {
            focus: (e, t) => {
              r.isFocused = !0;
              const n = r.state.tr.setMeta("focus", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(n), !1;
            },
            blur: (e, t) => {
              r.isFocused = !1;
              const n = r.state.tr.setMeta("blur", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(n), !1;
            }
          }
        }
      })
    ];
  }
});
G.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const r = () => this.editor.commands.first(({ commands: a }) => [
      () => a.undoInputRule(),
      // maybe convert first text block node to default node
      () => a.command(({ tr: s }) => {
        const { selection: l, doc: c } = s, { empty: p, $anchor: u } = l, { pos: h, parent: m } = u, b = u.parent.isTextblock && h > 0 ? s.doc.resolve(h - 1) : u, g = b.parent.type.spec.isolating, y = u.pos - u.parentOffset, v = g && b.parent.childCount === 1 ? y === u.pos : _.atStart(c).from === h;
        return !p || !m.type.isTextblock || m.textContent.length || !v || v && u.parent.type.name === "paragraph" ? !1 : a.clearNodes();
      }),
      () => a.deleteSelection(),
      () => a.joinBackward(),
      () => a.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: a }) => [
      () => a.deleteSelection(),
      () => a.deleteCurrentNode(),
      () => a.joinForward(),
      () => a.selectNodeForward()
    ]), n = {
      Enter: () => this.editor.commands.first(({ commands: a }) => [
        () => a.newlineInCode(),
        () => a.createParagraphNear(),
        () => a.liftEmptyBlock(),
        () => a.splitBlock()
      ]),
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: r,
      "Mod-Backspace": r,
      "Shift-Backspace": r,
      Delete: e,
      "Mod-Delete": e,
      "Mod-a": () => this.editor.commands.selectAll()
    }, i = {
      ...n
    }, o = {
      ...n,
      "Ctrl-h": r,
      "Alt-Backspace": r,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return Ke() || ni() ? o : i;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new we({
        key: new ke("clearDocument"),
        appendTransaction: (r, e, t) => {
          if (r.some((g) => g.getMeta("composition")))
            return;
          const n = r.some((g) => g.docChanged) && !e.doc.eq(t.doc), i = r.some((g) => g.getMeta("preventClearDocument"));
          if (!n || i)
            return;
          const { empty: o, from: a, to: s } = e.selection, l = _.atStart(e.doc).from, c = _.atEnd(e.doc).to;
          if (o || !(a === l && s === c) || !ii(t.doc))
            return;
          const h = t.tr, m = Yr({
            state: t,
            transaction: h
          }), { commands: b } = new Ua({
            editor: this.editor,
            state: m
          });
          if (b.clearNodes(), !!h.steps.length)
            return h;
        }
      })
    ];
  }
});
G.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new we({
        key: new ke("tiptapPaste"),
        props: {
          handlePaste: (r, e, t) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice: t
            });
          }
        }
      })
    ];
  }
});
G.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new we({
        key: new ke("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
class bt {
  constructor(e = {}) {
    this.type = "node", this.name = "node", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = Q(W(this, "addOptions", {
      name: this.name
    }))), this.storage = Q(W(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new bt(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => on(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new bt(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = Q(W(t, "addOptions", {
      name: t.name
    })), t.storage = Q(W(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
let fl = class {
  constructor(e, t, n) {
    this.isDragging = !1, this.component = e, this.editor = t.editor, this.options = {
      stopEvent: null,
      ignoreMutation: null,
      ...n
    }, this.extension = t.extension, this.node = t.node, this.decorations = t.decorations, this.innerDecorations = t.innerDecorations, this.view = t.view, this.HTMLAttributes = t.HTMLAttributes, this.getPos = t.getPos, this.mount();
  }
  mount() {
  }
  get dom() {
    return this.editor.view.dom;
  }
  get contentDOM() {
    return null;
  }
  onDragStart(e) {
    var t, n, i, o, a, s, l;
    const { view: c } = this.editor, p = e.target, u = p.nodeType === 3 ? (t = p.parentElement) === null || t === void 0 ? void 0 : t.closest("[data-drag-handle]") : p.closest("[data-drag-handle]");
    if (!this.dom || !((n = this.contentDOM) === null || n === void 0) && n.contains(p) || !u)
      return;
    let h = 0, m = 0;
    if (this.dom !== u) {
      const A = this.dom.getBoundingClientRect(), M = u.getBoundingClientRect(), $ = (i = e.offsetX) !== null && i !== void 0 ? i : (o = e.nativeEvent) === null || o === void 0 ? void 0 : o.offsetX, F = (a = e.offsetY) !== null && a !== void 0 ? a : (s = e.nativeEvent) === null || s === void 0 ? void 0 : s.offsetY;
      h = M.x - A.x + $, m = M.y - A.y + F;
    }
    const b = this.dom.cloneNode(!0);
    (l = e.dataTransfer) === null || l === void 0 || l.setDragImage(b, h, m);
    const g = this.getPos();
    if (typeof g != "number")
      return;
    const y = N.create(c.state.doc, g), v = c.state.tr.setSelection(y);
    c.dispatch(v);
  }
  stopEvent(e) {
    var t;
    if (!this.dom)
      return !1;
    if (typeof this.options.stopEvent == "function")
      return this.options.stopEvent({ event: e });
    const n = e.target;
    if (!(this.dom.contains(n) && !(!((t = this.contentDOM) === null || t === void 0) && t.contains(n))))
      return !1;
    const o = e.type.startsWith("drag"), a = e.type === "drop";
    if ((["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(n.tagName) || n.isContentEditable) && !a && !o)
      return !0;
    const { isEditable: l } = this.editor, { isDragging: c } = this, p = !!this.node.type.spec.draggable, u = N.isSelectable(this.node), h = e.type === "copy", m = e.type === "paste", b = e.type === "cut", g = e.type === "mousedown";
    if (!p && u && o && e.target === this.dom && e.preventDefault(), p && o && !c && e.target === this.dom)
      return e.preventDefault(), !1;
    if (p && l && !c && g) {
      const y = n.closest("[data-drag-handle]");
      y && (this.dom === y || this.dom.contains(y)) && (this.isDragging = !0, document.addEventListener("dragend", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("drop", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("mouseup", () => {
        this.isDragging = !1;
      }, { once: !0 }));
    }
    return !(c || a || h || m || b || g && u);
  }
  /**
   * Called when a DOM [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) or a selection change happens within the view.
   * @return `false` if the editor should re-read the selection or re-parse the range around the mutation
   * @return `true` if it can safely be ignored.
   */
  ignoreMutation(e) {
    return !this.dom || !this.contentDOM ? !0 : typeof this.options.ignoreMutation == "function" ? this.options.ignoreMutation({ mutation: e }) : this.node.isLeaf || this.node.isAtom ? !0 : e.type === "selection" || this.dom.contains(e.target) && e.type === "childList" && (Ke() || Jt()) && this.editor.isFocused && [
      ...Array.from(e.addedNodes),
      ...Array.from(e.removedNodes)
    ].every((n) => n.isContentEditable) ? !1 : this.contentDOM === e.target && e.type === "attributes" ? !0 : !this.contentDOM.contains(e.target);
  }
  /**
   * Update the attributes of the prosemirror node.
   */
  updateAttributes(e) {
    this.editor.commands.command(({ tr: t }) => {
      const n = this.getPos();
      return typeof n != "number" ? !1 : (t.setNodeMarkup(n, void 0, {
        ...this.node.attrs,
        ...e
      }), !0);
    });
  }
  /**
   * Delete the node.
   */
  deleteNode() {
    const e = this.getPos();
    if (typeof e != "number")
      return;
    const t = e + this.node.nodeSize;
    this.editor.commands.deleteRange({ from: e, to: t });
  }
};
var oi = { exports: {} }, zt = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Vn;
function ml() {
  if (Vn) return zt;
  Vn = 1;
  var r = O;
  function e(u, h) {
    return u === h && (u !== 0 || 1 / u === 1 / h) || u !== u && h !== h;
  }
  var t = typeof Object.is == "function" ? Object.is : e, n = r.useState, i = r.useEffect, o = r.useLayoutEffect, a = r.useDebugValue;
  function s(u, h) {
    var m = h(), b = n({ inst: { value: m, getSnapshot: h } }), g = b[0].inst, y = b[1];
    return o(function() {
      g.value = m, g.getSnapshot = h, l(g) && y({ inst: g });
    }, [u, m, h]), i(function() {
      return l(g) && y({ inst: g }), u(function() {
        l(g) && y({ inst: g });
      });
    }, [u]), a(m), m;
  }
  function l(u) {
    var h = u.getSnapshot;
    u = u.value;
    try {
      var m = h();
      return !t(u, m);
    } catch {
      return !0;
    }
  }
  function c(u, h) {
    return h();
  }
  var p = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? c : s;
  return zt.useSyncExternalStore = r.useSyncExternalStore !== void 0 ? r.useSyncExternalStore : p, zt;
}
oi.exports = ml();
var ai = oi.exports;
const gl = (...r) => (e) => {
  r.forEach((t) => {
    typeof t == "function" ? t(e) : t && (t.current = e);
  });
}, bl = ({ contentComponent: r }) => {
  const e = ai.useSyncExternalStore(r.subscribe, r.getSnapshot, r.getServerSnapshot);
  return O.createElement(O.Fragment, null, Object.values(e));
};
function yl() {
  const r = /* @__PURE__ */ new Set();
  let e = {};
  return {
    /**
     * Subscribe to the editor instance's changes.
     */
    subscribe(t) {
      return r.add(t), () => {
        r.delete(t);
      };
    },
    getSnapshot() {
      return e;
    },
    getServerSnapshot() {
      return e;
    },
    /**
     * Adds a new NodeView Renderer to the editor.
     */
    setRenderer(t, n) {
      e = {
        ...e,
        [t]: yi.createPortal(n.reactElement, n.element, t)
      }, r.forEach((i) => i());
    },
    /**
     * Removes a NodeView Renderer from the editor.
     */
    removeRenderer(t) {
      const n = { ...e };
      delete n[t], e = n, r.forEach((i) => i());
    }
  };
}
class xl extends O.Component {
  constructor(e) {
    var t;
    super(e), this.editorContentRef = O.createRef(), this.initialized = !1, this.state = {
      hasContentComponentInitialized: !!(!((t = e.editor) === null || t === void 0) && t.contentComponent)
    };
  }
  componentDidMount() {
    this.init();
  }
  componentDidUpdate() {
    this.init();
  }
  init() {
    const e = this.props.editor;
    if (e && !e.isDestroyed && e.options.element) {
      if (e.contentComponent)
        return;
      const t = this.editorContentRef.current;
      t.append(...e.options.element.childNodes), e.setOptions({
        element: t
      }), e.contentComponent = yl(), this.state.hasContentComponentInitialized || (this.unsubscribeToContentComponent = e.contentComponent.subscribe(() => {
        this.setState((n) => n.hasContentComponentInitialized ? n : {
          hasContentComponentInitialized: !0
        }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent();
      })), e.createNodeViews(), this.initialized = !0;
    }
  }
  componentWillUnmount() {
    const e = this.props.editor;
    if (!e || (this.initialized = !1, e.isDestroyed || e.view.setProps({
      nodeViews: {}
    }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent(), e.contentComponent = null, !e.options.element.firstChild))
      return;
    const t = document.createElement("div");
    t.append(...e.options.element.childNodes), e.setOptions({
      element: t
    });
  }
  render() {
    const { editor: e, innerRef: t, ...n } = this.props;
    return O.createElement(
      O.Fragment,
      null,
      O.createElement("div", { ref: gl(t, this.editorContentRef), ...n }),
      (e == null ? void 0 : e.contentComponent) && O.createElement(bl, { contentComponent: e.contentComponent })
    );
  }
}
const vl = qt((r, e) => {
  const t = O.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [r.editor]);
  return O.createElement(xl, {
    key: t,
    innerRef: e,
    ...r
  });
});
O.memo(vl);
var Ft = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Jn;
function wl() {
  if (Jn) return Ft;
  Jn = 1;
  var r = O, e = ai;
  function t(c, p) {
    return c === p && (c !== 0 || 1 / c === 1 / p) || c !== c && p !== p;
  }
  var n = typeof Object.is == "function" ? Object.is : t, i = e.useSyncExternalStore, o = r.useRef, a = r.useEffect, s = r.useMemo, l = r.useDebugValue;
  return Ft.useSyncExternalStoreWithSelector = function(c, p, u, h, m) {
    var b = o(null);
    if (b.current === null) {
      var g = { hasValue: !1, value: null };
      b.current = g;
    } else g = b.current;
    b = s(function() {
      function v(T) {
        if (!A) {
          if (A = !0, M = T, T = h(T), m !== void 0 && g.hasValue) {
            var U = g.value;
            if (m(U, T)) return $ = U;
          }
          return $ = T;
        }
        if (U = $, n(M, T)) return U;
        var J = h(T);
        return m !== void 0 && m(U, J) ? U : (M = T, $ = J);
      }
      var A = !1, M, $, F = u === void 0 ? null : u;
      return [function() {
        return v(p());
      }, F === null ? void 0 : function() {
        return v(F());
      }];
    }, [p, u, h, m]);
    var y = i(c, b[0], b[1]);
    return a(function() {
      g.hasValue = !0, g.value = y;
    }, [y]), l(y), y;
  }, Ft;
}
wl();
const kl = Xn({
  editor: null
});
kl.Consumer;
const si = Xn({
  onDragStart: void 0
}), _l = () => mi(si), te = O.forwardRef((r, e) => {
  const { onDragStart: t } = _l(), n = r.as || "div";
  return (
    // @ts-ignore
    O.createElement(n, { ...r, ref: e, "data-node-view-wrapper": "", onDragStart: t, style: {
      whiteSpace: "normal",
      ...r.style
    } })
  );
});
function qn(r) {
  return !!(typeof r == "function" && r.prototype && r.prototype.isReactComponent);
}
function Wn(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.forward_ref)" || r.$$typeof.description === "react.forward_ref"));
}
function Nl(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.memo)" || r.$$typeof.description === "react.memo"));
}
function Sl(r) {
  if (qn(r) || Wn(r))
    return !0;
  if (Nl(r)) {
    const e = r.type;
    if (e)
      return qn(e) || Wn(e);
  }
  return !1;
}
function Cl() {
  try {
    if (yn)
      return parseInt(yn.split(".")[0], 10) >= 19;
  } catch {
  }
  return !1;
}
class El {
  /**
   * Immediately creates element and renders the provided React component.
   */
  constructor(e, { editor: t, props: n = {}, as: i = "div", className: o = "" }) {
    this.ref = null, this.id = Math.floor(Math.random() * 4294967295).toString(), this.component = e, this.editor = t, this.props = n, this.element = document.createElement(i), this.element.classList.add("react-renderer"), o && this.element.classList.add(...o.split(" ")), this.editor.isInitialized ? xi(() => {
      this.render();
    }) : queueMicrotask(() => {
      this.render();
    });
  }
  /**
   * Render the React component.
   */
  render() {
    var e;
    const t = this.component, n = this.props, i = this.editor, o = Cl(), a = Sl(t), s = { ...n };
    s.ref && !(o || a) && delete s.ref, !s.ref && (o || a) && (s.ref = (l) => {
      this.ref = l;
    }), this.reactElement = O.createElement(t, { ...s }), (e = i == null ? void 0 : i.contentComponent) === null || e === void 0 || e.setRenderer(this.id, this);
  }
  /**
   * Re-renders the React component with new props.
   */
  updateProps(e = {}) {
    this.props = {
      ...this.props,
      ...e
    }, this.render();
  }
  /**
   * Destroy the React component.
   */
  destroy() {
    var e;
    const t = this.editor;
    (e = t == null ? void 0 : t.contentComponent) === null || e === void 0 || e.removeRenderer(this.id);
  }
  /**
   * Update the attributes of the element that holds the React component.
   */
  updateAttributes(e) {
    Object.keys(e).forEach((t) => {
      this.element.setAttribute(t, e[t]);
    });
  }
}
class Al extends fl {
  constructor(e, t, n) {
    if (super(e, t, n), !this.node.isLeaf) {
      this.options.contentDOMElementTag ? this.contentDOMElement = document.createElement(this.options.contentDOMElementTag) : this.contentDOMElement = document.createElement(this.node.isInline ? "span" : "div"), this.contentDOMElement.dataset.nodeViewContentReact = "", this.contentDOMElement.dataset.nodeViewWrapper = "", this.contentDOMElement.style.whiteSpace = "inherit";
      const i = this.dom.querySelector("[data-node-view-content]");
      if (!i)
        return;
      i.appendChild(this.contentDOMElement);
    }
  }
  /**
   * Setup the React component.
   * Called on initialization.
   */
  mount() {
    const e = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      innerDecorations: this.innerDecorations,
      view: this.view,
      selected: !1,
      extension: this.extension,
      HTMLAttributes: this.HTMLAttributes,
      getPos: () => this.getPos(),
      updateAttributes: (c = {}) => this.updateAttributes(c),
      deleteNode: () => this.deleteNode(),
      ref: hi()
    };
    if (!this.component.displayName) {
      const c = (p) => p.charAt(0).toUpperCase() + p.substring(1);
      this.component.displayName = c(this.extension.name);
    }
    const i = { onDragStart: this.onDragStart.bind(this), nodeViewContentRef: (c) => {
      c && this.contentDOMElement && c.firstChild !== this.contentDOMElement && (c.hasAttribute("data-node-view-wrapper") && c.removeAttribute("data-node-view-wrapper"), c.appendChild(this.contentDOMElement));
    } }, o = this.component, a = fi((c) => O.createElement(si.Provider, { value: i }, lt(o, c)));
    a.displayName = "ReactNodeView";
    let s = this.node.isInline ? "span" : "div";
    this.options.as && (s = this.options.as);
    const { className: l = "" } = this.options;
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this), this.renderer = new El(a, {
      editor: this.editor,
      props: e,
      as: s,
      className: `node-${this.node.type.name} ${l}`.trim()
    }), this.editor.on("selectionUpdate", this.handleSelectionUpdate), this.updateElementAttributes();
  }
  /**
   * Return the DOM element.
   * This is the element that will be used to display the node view.
   */
  get dom() {
    var e;
    if (this.renderer.element.firstElementChild && !(!((e = this.renderer.element.firstElementChild) === null || e === void 0) && e.hasAttribute("data-node-view-wrapper")))
      throw Error("Please use the NodeViewWrapper component for your node view.");
    return this.renderer.element;
  }
  /**
   * Return the content DOM element.
   * This is the element that will be used to display the rich-text content of the node.
   */
  get contentDOM() {
    return this.node.isLeaf ? null : this.contentDOMElement;
  }
  /**
   * On editor selection update, check if the node is selected.
   * If it is, call `selectNode`, otherwise call `deselectNode`.
   */
  handleSelectionUpdate() {
    const { from: e, to: t } = this.editor.state.selection, n = this.getPos();
    if (typeof n == "number")
      if (e <= n && t >= n + this.node.nodeSize) {
        if (this.renderer.props.selected)
          return;
        this.selectNode();
      } else {
        if (!this.renderer.props.selected)
          return;
        this.deselectNode();
      }
  }
  /**
   * On update, update the React component.
   * To prevent unnecessary updates, the `update` option can be used.
   */
  update(e, t, n) {
    const i = (o) => {
      this.renderer.updateProps(o), typeof this.options.attrs == "function" && this.updateElementAttributes();
    };
    if (e.type !== this.node.type)
      return !1;
    if (typeof this.options.update == "function") {
      const o = this.node, a = this.decorations, s = this.innerDecorations;
      return this.node = e, this.decorations = t, this.innerDecorations = n, this.options.update({
        oldNode: o,
        oldDecorations: a,
        newNode: e,
        newDecorations: t,
        oldInnerDecorations: s,
        innerDecorations: n,
        updateProps: () => i({ node: e, decorations: t, innerDecorations: n })
      });
    }
    return e === this.node && this.decorations === t && this.innerDecorations === n || (this.node = e, this.decorations = t, this.innerDecorations = n, i({ node: e, decorations: t, innerDecorations: n })), !0;
  }
  /**
   * Select the node.
   * Add the `selected` prop and the `ProseMirror-selectednode` class.
   */
  selectNode() {
    this.renderer.updateProps({
      selected: !0
    }), this.renderer.element.classList.add("ProseMirror-selectednode");
  }
  /**
   * Deselect the node.
   * Remove the `selected` prop and the `ProseMirror-selectednode` class.
   */
  deselectNode() {
    this.renderer.updateProps({
      selected: !1
    }), this.renderer.element.classList.remove("ProseMirror-selectednode");
  }
  /**
   * Destroy the React component instance.
   */
  destroy() {
    this.renderer.destroy(), this.editor.off("selectionUpdate", this.handleSelectionUpdate), this.contentDOMElement = null;
  }
  /**
   * Update the attributes of the top-level element that holds the React component.
   * Applying the attributes defined in the `attrs` option.
   */
  updateElementAttributes() {
    if (this.options.attrs) {
      let e = {};
      if (typeof this.options.attrs == "function") {
        const t = this.editor.extensionManager.attributes, n = Va(this.node, t);
        e = this.options.attrs({ node: this.node, HTMLAttributes: n });
      } else
        e = this.options.attrs;
      this.renderer.updateAttributes(e);
    }
  }
}
function Ml(r, e) {
  return (t) => t.editor.contentComponent ? new Al(r, t, e) : {};
}
function ne({
  subId: r,
  defaultAttrs: e,
  view: t
}) {
  const n = `${Hi}/${r}`, i = tr(
    r.replace(/-([a-z])/g, (o, a) => a.toUpperCase())
  );
  return bt.create({
    name: i,
    group: "block",
    atom: !0,
    selectable: !0,
    draggable: !0,
    addAttributes() {
      return {
        attrs: {
          default: e,
          parseHTML: (o) => Y(o.getAttribute("data-attrs") ?? "", e),
          renderHTML: (o) => ({
            "data-attrs": Me(o.attrs ?? e)
          })
        }
      };
    },
    parseHTML() {
      return [{ tag: `div[data-cms-block="${n}"]` }];
    },
    renderHTML({ HTMLAttributes: o }) {
      return [
        "div",
        Xr(o, { "data-cms-block": n })
      ];
    },
    addNodeView() {
      return Ml((o) => {
        const a = o.node.attrs.attrs ?? e;
        return /* @__PURE__ */ d(t, { attrs: a, updateAttrs: (l) => {
          o.updateAttributes({ attrs: { ...a, ...l } });
        }, selected: o.selected });
      });
    }
  });
}
function re(r) {
  return tr(r.replace(/-([a-z])/g, (e, t) => t.toUpperCase()));
}
const Il = {
  creator: { description: 'Creator name in the byline moved under the product title ("by <creator>"). Empty = no byline.' },
  creatorPrefix: { description: 'Word before the creator name. Empty = "by".' },
  downloadUrl: { description: "Download button target (opens in a new tab). Empty = no Download button.", format: "URL" },
  previewUrl: { description: "Live Preview button target (opens in a new tab). Empty = no Preview button.", format: "URL" },
  downloadLabel: { description: "Download button text." },
  previewLabel: { description: "Live Preview button text." },
  freeLabel: { description: "Badge shown before the buttons (when at least one URL is set)." }
}, ln = "header-buttons", Be = re(ln);
function Tl({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core"), n = !!(r.downloadUrl || r.previewUrl);
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(ir, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.headerButtons.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: n ? [r.downloadUrl, r.previewUrl].filter(Boolean).join(" · ") : t("blocks.headerButtons.untitled") })
        ] })
      ] })
    }
  );
}
function Rl({ editor: r }) {
  const e = r.getAttributes(Be), t = { ...Xe, ...e.attrs ?? {} };
  function n(i) {
    r.chain().updateAttributes(Be, { attrs: { ...t, ...i } }).run();
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { className: "grid grid-cols-[1fr_2fr] gap-2", children: [
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Byline prefix" }),
        /* @__PURE__ */ d(
          "input",
          {
            className: "input",
            placeholder: "by",
            value: t.creatorPrefix,
            onChange: (i) => n({ creatorPrefix: i.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Created by" }),
        /* @__PURE__ */ d(
          "input",
          {
            className: "input",
            placeholder: "Brad Frost",
            value: t.creator,
            onChange: (i) => n({ creator: i.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Download URL" }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://github.com/example/your-project/releases/latest",
          value: t.downloadUrl,
          onChange: (i) => n({ downloadUrl: i.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Live Preview URL" }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://demo.example.com",
          value: t.previewUrl,
          onChange: (i) => n({ previewUrl: i.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ f("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Download label" }),
        /* @__PURE__ */ d(
          "input",
          {
            className: "input",
            value: t.downloadLabel,
            onChange: (i) => n({ downloadLabel: i.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Preview label" }),
        /* @__PURE__ */ d(
          "input",
          {
            className: "input",
            value: t.previewLabel,
            onChange: (i) => n({ previewLabel: i.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Free badge label" }),
      /* @__PURE__ */ d(
        "input",
        {
          className: "input",
          value: t.freeLabel,
          onChange: (i) => n({ freeLabel: i.target.value })
        }
      )
    ] })
  ] });
}
const Ol = ne({
  subId: ln,
  defaultAttrs: Xe,
  view: Tl
}), $l = {
  id: `marketplace-core/${ln}`,
  nodeName: Be,
  titleKey: "blocks.headerButtons.title",
  namespace: "theme-marketplace-core",
  icon: ir,
  category: "layout",
  extensions: [Ol],
  insert: (r) => {
    r.focus().insertContent({ type: Be, attrs: { attrs: Xe } }).run();
  },
  isActive: (r) => r.isActive(Be),
  attrsSchema: Il,
  inspector: (r) => /* @__PURE__ */ d(Rl, { editor: r.editor })
}, Ll = {
  images: {
    description: "Product gallery: [{ url, alt }]. url = Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL (the editor picks the \"large\" format). Nothing renders in the body: the images fill the thumbnail strip under the product page's hero image and a lightbox (hero + images). Only works on the theme's single template; items without url are skipped, empty list = no gallery.",
    format: "array of objects"
  }
}, cn = "gallery", ze = re(cn);
function Bl({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(Gt, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.gallery.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: t("blocks.gallery.count", { n: r.images.length }) })
        ] })
      ] })
    }
  );
}
function zl({ editor: r }) {
  const e = r.getAttributes(ze), t = { ...Qe, ...e.attrs ?? {} }, [n, i] = fe(!1);
  function o(c) {
    r.chain().updateAttributes(ze, { attrs: { ...t, ...c } }).run();
  }
  function a(c, p) {
    const u = [...t.images];
    u[c] = p, o({ images: u });
  }
  function s(c) {
    o({ images: t.images.filter((p, u) => u !== c) });
  }
  function l(c, p) {
    const u = c + p;
    if (u < 0 || u >= t.images.length) return;
    const h = [...t.images];
    [h[c], h[u]] = [h[u], h[c]], o({ images: h });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    t.images.length === 0 && /* @__PURE__ */ d("p", { className: "text-xs text-surface-500", children: 'No images yet — click "Add image" to pick from the media library.' }),
    t.images.map((c, p) => /* @__PURE__ */ f(
      "div",
      {
        className: "flex items-start gap-2 rounded border border-surface-200 p-2 dark:border-surface-700",
        children: [
          c.url && /* @__PURE__ */ d("img", { src: c.url, alt: c.alt, className: "h-16 w-16 object-cover rounded" }),
          /* @__PURE__ */ f("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ d(
              "input",
              {
                className: "input text-xs",
                placeholder: "Image alt",
                value: c.alt,
                onChange: (u) => a(p, { ...c, alt: u.target.value })
              }
            ),
            /* @__PURE__ */ d("p", { className: "text-[10px] text-surface-500 mt-1 truncate", title: c.url, children: c.url })
          ] }),
          /* @__PURE__ */ f("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ d(
              "button",
              {
                type: "button",
                onClick: () => l(p, -1),
                disabled: p === 0,
                className: "btn-ghost p-1",
                title: "Move up",
                children: /* @__PURE__ */ d(To, { className: "h-3 w-3" })
              }
            ),
            /* @__PURE__ */ d(
              "button",
              {
                type: "button",
                onClick: () => l(p, 1),
                disabled: p === t.images.length - 1,
                className: "btn-ghost p-1",
                title: "Move down",
                children: /* @__PURE__ */ d(Io, { className: "h-3 w-3" })
              }
            ),
            /* @__PURE__ */ d(
              "button",
              {
                type: "button",
                onClick: () => s(p),
                className: "btn-ghost p-1 text-red-600",
                title: "Remove",
                children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" })
              }
            )
          ] })
        ]
      },
      p
    )),
    /* @__PURE__ */ f(
      "button",
      {
        type: "button",
        onClick: () => i(!0),
        className: "btn-secondary text-xs w-full",
        children: [
          /* @__PURE__ */ d(Gt, { className: "h-3.5 w-3.5" }),
          "Add image from library"
        ]
      }
    ),
    n && /* @__PURE__ */ d(
      pi,
      {
        onClose: () => i(!1),
        onPick: (c) => {
          i(!1);
          const p = St(c, "large") || St(c, "medium") || St(c);
          p && o({ images: [...t.images, { url: p, alt: c.alt ?? "" }] });
        }
      }
    )
  ] });
}
const Fl = ne({
  subId: cn,
  defaultAttrs: Qe,
  view: Bl
}), Pl = {
  id: `marketplace-core/${cn}`,
  nodeName: ze,
  titleKey: "blocks.gallery.title",
  namespace: "theme-marketplace-core",
  icon: Gt,
  category: "media",
  extensions: [Fl],
  insert: (r) => {
    r.focus().insertContent({ type: ze, attrs: { attrs: Qe } }).run();
  },
  isActive: (r) => r.isActive(ze),
  attrsSchema: Ll,
  inspector: (r) => /* @__PURE__ */ d(zl, { editor: r.editor })
}, Dl = {
  heading: { description: "Section heading (h3) above the table. Empty = hidden." },
  rows: {
    description: 'Specification rows: [{ label, value }] (e.g. { label: "Version", value: "1.2.0" }). Rows with both empty are skipped; no row = the whole block is hidden.',
    format: "array of objects"
  }
}, dn = "specs", Fe = re(dn);
function Hl({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core"), n = r.rows.map((i) => i.label).filter(Boolean).slice(0, 3).join(" · ");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(ar, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.specs.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: n || t("blocks.specs.untitled") })
        ] })
      ] })
    }
  );
}
function Ul({ editor: r }) {
  const e = r.getAttributes(Fe), t = { ...Ze, ...e.attrs ?? {} };
  function n(s) {
    r.chain().updateAttributes(Fe, { attrs: { ...t, ...s } }).run();
  }
  function i(s, l, c) {
    const p = [...t.rows];
    p[s] = { ...p[s], [l]: c }, n({ rows: p });
  }
  function o() {
    n({ rows: [...t.rows, { label: "", value: "" }] });
  }
  function a(s) {
    n({ rows: t.rows.filter((l, c) => c !== s) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Section heading" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.heading, onChange: (s) => n({ heading: s.target.value }) })
    ] }),
    t.rows.map((s, l) => /* @__PURE__ */ f("div", { className: "space-y-2 rounded border border-surface-200 p-2 dark:border-surface-700", children: [
      /* @__PURE__ */ f("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ f("span", { className: "text-xs font-semibold uppercase text-surface-500", children: [
          "Row ",
          l + 1
        ] }),
        /* @__PURE__ */ d("button", { type: "button", onClick: () => a(l), className: "btn-ghost p-1 text-red-600", children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" }) })
      ] }),
      /* @__PURE__ */ f("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ f("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: "Label" }),
          /* @__PURE__ */ d(
            "input",
            {
              className: "input text-xs",
              value: s.label,
              onChange: (c) => i(l, "label", c.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ f("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: "Value" }),
          /* @__PURE__ */ d(
            "input",
            {
              className: "input text-xs",
              value: s.value,
              onChange: (c) => i(l, "value", c.target.value)
            }
          )
        ] })
      ] })
    ] }, l)),
    /* @__PURE__ */ f("button", { type: "button", onClick: o, className: "btn-secondary text-xs w-full", children: [
      /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
      "Add row"
    ] })
  ] });
}
const jl = ne({
  subId: dn,
  defaultAttrs: Ze,
  view: Hl
}), Vl = {
  id: `marketplace-core/${dn}`,
  nodeName: Fe,
  titleKey: "blocks.specs.title",
  namespace: "theme-marketplace-core",
  icon: ar,
  category: "layout",
  extensions: [jl],
  insert: (r) => {
    r.focus().insertContent({ type: Fe, attrs: { attrs: Ze } }).run();
  },
  isActive: (r) => r.isActive(Fe),
  attrsSchema: Dl,
  inspector: (r) => /* @__PURE__ */ d(Ul, { editor: r.editor })
}, Jl = {
  heading: { description: "Section heading (h3) above the list. Empty = hidden." },
  items: {
    description: 'Feature tiles (icon + short title, for product pages): [{ icon, title }]. icon = a Material Symbols Outlined icon name ("bolt", "palette", "devices"…; empty = "bolt"); items without a title are skipped. No item with a title = the whole block (heading included) is hidden.',
    format: "array of objects"
  }
}, Gn = [
  "dashboard",
  "analytics",
  "monitoring",
  "trending_up",
  "insights",
  "bolt",
  "rocket_launch",
  "auto_awesome",
  "star",
  "favorite",
  "shopping_bag",
  "shopping_cart",
  "credit_card",
  "payments",
  "sell",
  "lock",
  "security",
  "shield",
  "verified_user",
  "key",
  "settings",
  "tune",
  "build",
  "construction",
  "extension",
  "palette",
  "brush",
  "format_paint",
  "color_lens",
  "design_services",
  "code",
  "terminal",
  "data_object",
  "developer_mode",
  "integration_instructions",
  "cloud",
  "cloud_upload",
  "cloud_download",
  "storage",
  "database",
  "search",
  "filter_alt",
  "sort",
  "view_module",
  "view_list",
  "mail",
  "send",
  "chat",
  "forum",
  "notifications",
  "person",
  "group",
  "groups",
  "manage_accounts",
  "support_agent",
  "download",
  "upload",
  "file_download",
  "file_upload",
  "save",
  "language",
  "translate",
  "public",
  "globe",
  "travel_explore",
  "speed",
  "memory",
  "bar_chart",
  "pie_chart",
  "show_chart",
  "shopping_basket",
  "store",
  "inventory",
  "package_2",
  "local_shipping",
  "smartphone",
  "devices",
  "tablet_mac",
  "laptop_mac",
  "tv",
  "schedule",
  "today",
  "event",
  "calendar_month",
  "timer",
  "help",
  "info",
  "question_mark",
  "lightbulb",
  "tips_and_updates",
  "check_circle",
  "task_alt",
  "verified",
  "done",
  "thumb_up",
  "warning",
  "error",
  "block",
  "report",
  "priority_high"
], Kn = "mp-icon-picker-font", ql = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0";
function Wl() {
  if (typeof document > "u" || document.getElementById(Kn)) return;
  const r = document.createElement("link");
  r.id = Kn, r.rel = "stylesheet", r.href = ql, document.head.appendChild(r);
}
const Yn = {
  fontFamily: '"Material Symbols Outlined"',
  fontWeight: "normal",
  fontStyle: "normal",
  fontSize: 24,
  lineHeight: 1,
  letterSpacing: "normal",
  textTransform: "none",
  display: "inline-block",
  whiteSpace: "nowrap",
  wordWrap: "normal",
  direction: "ltr",
  WebkitFontSmoothing: "antialiased",
  fontVariationSettings: '"FILL" 0'
};
function Gl({
  value: r,
  onChange: e,
  placeholder: t = "e.g. dashboard, security, bolt"
}) {
  const [n, i] = fe(!1), [o, a] = fe(""), s = gi(null);
  xn(() => {
    Wl();
  }, []), xn(() => {
    if (!n) return;
    const c = (p) => {
      s.current && (s.current.contains(p.target) || i(!1));
    };
    return document.addEventListener("mousedown", c), () => document.removeEventListener("mousedown", c);
  }, [n]);
  const l = bi(() => {
    const c = o.trim().toLowerCase();
    return c ? Gn.filter((p) => p.includes(c)) : Gn;
  }, [o]);
  return /* @__PURE__ */ f("div", { ref: s, className: "relative", children: [
    /* @__PURE__ */ f("div", { className: "flex items-stretch gap-2", children: [
      /* @__PURE__ */ d(
        "input",
        {
          className: "input text-xs flex-1",
          value: r,
          placeholder: t,
          onChange: (c) => e(c.target.value),
          onFocus: () => i(!0)
        }
      ),
      /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          onClick: () => i((c) => !c),
          className: "flex items-center justify-center w-10 rounded border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800 shrink-0",
          "aria-label": "Pick icon",
          title: r || "No icon selected",
          children: /* @__PURE__ */ d("span", { style: Yn, children: r || "image" })
        }
      )
    ] }),
    n && /* @__PURE__ */ f("div", { className: "absolute z-20 mt-1 w-full rounded border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900", children: [
      /* @__PURE__ */ d("div", { className: "border-b border-surface-100 p-2 dark:border-surface-800", children: /* @__PURE__ */ d(
        "input",
        {
          className: "input text-xs w-full",
          placeholder: "Search icons…",
          value: o,
          onChange: (c) => a(c.target.value),
          autoFocus: !0
        }
      ) }),
      /* @__PURE__ */ d("div", { className: "max-h-60 overflow-y-auto p-2", children: l.length === 0 ? /* @__PURE__ */ d("p", { className: "text-center text-xs text-surface-500 py-4", children: "No match — keep typing in the field above to use it anyway." }) : /* @__PURE__ */ d("div", { className: "grid grid-cols-6 gap-1", children: l.map((c) => /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          title: c,
          onClick: () => {
            e(c), i(!1), a("");
          },
          className: "flex flex-col items-center justify-center gap-1 rounded p-2 text-[10px] " + (c === r ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "hover:bg-surface-100 text-surface-700 dark:hover:bg-surface-800 dark:text-surface-300"),
          children: [
            /* @__PURE__ */ d("span", { style: Yn, children: c }),
            /* @__PURE__ */ d("span", { className: "truncate w-full text-center", children: c })
          ]
        },
        c
      )) }) })
    ] })
  ] });
}
const pn = "features", Pe = re(pn);
function Kl({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(dr, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.features.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: t("blocks.features.count", { n: r.items.length }) })
        ] })
      ] })
    }
  );
}
function Yl({ editor: r }) {
  const e = r.getAttributes(Pe), t = { ...et, ...e.attrs ?? {} };
  function n(s) {
    r.chain().updateAttributes(Pe, { attrs: { ...t, ...s } }).run();
  }
  function i(s, l, c) {
    const p = [...t.items];
    p[s] = { ...p[s], [l]: c }, n({ items: p });
  }
  function o() {
    n({
      items: [...t.items, { icon: "bolt", title: "" }]
    });
  }
  function a(s) {
    n({ items: t.items.filter((l, c) => c !== s) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Section heading" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.heading, onChange: (s) => n({ heading: s.target.value }) })
    ] }),
    t.items.map((s, l) => /* @__PURE__ */ f("div", { className: "space-y-2 rounded border border-surface-200 p-2 dark:border-surface-700", children: [
      /* @__PURE__ */ f("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ f("span", { className: "text-xs font-semibold uppercase text-surface-500", children: [
          "Feature ",
          l + 1
        ] }),
        /* @__PURE__ */ d("button", { type: "button", onClick: () => a(l), className: "btn-ghost p-1 text-red-600", children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Icon" }),
        /* @__PURE__ */ d(
          Gl,
          {
            value: s.icon,
            onChange: (c) => i(l, "icon", c)
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Title" }),
        /* @__PURE__ */ d(
          "input",
          {
            className: "input text-xs",
            value: s.title,
            onChange: (c) => i(l, "title", c.target.value)
          }
        )
      ] })
    ] }, l)),
    /* @__PURE__ */ f("button", { type: "button", onClick: o, className: "btn-secondary text-xs w-full", children: [
      /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
      "Add feature"
    ] })
  ] });
}
const Xl = ne({
  subId: pn,
  defaultAttrs: et,
  view: Kl
}), Ql = {
  id: `marketplace-core/${pn}`,
  nodeName: Pe,
  titleKey: "blocks.features.title",
  namespace: "theme-marketplace-core",
  icon: dr,
  category: "layout",
  extensions: [Xl],
  insert: (r) => {
    r.focus().insertContent({ type: Pe, attrs: { attrs: et } }).run();
  },
  isActive: (r) => r.isActive(Pe),
  attrsSchema: Jl,
  inspector: (r) => /* @__PURE__ */ d(Yl, { editor: r.editor })
}, Zl = {
  eyebrow: { description: "Small label above the headline. Empty = hidden." },
  headline: { description: "Hero headline, rendered as the page's h1. Required: empty = the whole block is hidden." },
  subhead: { description: "Paragraph under the headline. Empty = hidden." },
  primaryCta: {
    description: "Primary (filled) button: { label, href }. href is a URL or site path. Hidden unless both label and href are set.",
    format: "object"
  },
  secondaryCta: {
    description: "Secondary (outlined) button: { label, href }. Same rules as primaryCta.",
    format: "object"
  },
  imageUrl: { description: "Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL. Shown in the right column; empty = text only.", format: "media URL" },
  imageAlt: { description: "Image alt text. Empty = the headline." }
}, un = "landing-hero", De = re(un);
function ec({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(lr, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.landingHero.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.headline || t("blocks.landingHero.empty") })
        ] })
      ] })
    }
  );
}
function tc({ editor: r }) {
  const e = r.getAttributes(De), t = { ...yt, ...e.attrs ?? {} };
  function n(i) {
    r.chain().updateAttributes(De, { attrs: { ...t, ...i } }).run();
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Eyebrow" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.eyebrow, onChange: (i) => n({ eyebrow: i.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Headline" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[60px]", value: t.headline, onChange: (i) => n({ headline: i.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Subhead" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[60px]", value: t.subhead, onChange: (i) => n({ subhead: i.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Primary CTA label" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.primaryCta.label, onChange: (i) => n({ primaryCta: { ...t.primaryCta, label: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Primary CTA URL" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.primaryCta.href, onChange: (i) => n({ primaryCta: { ...t.primaryCta, href: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Secondary CTA label" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.secondaryCta.label, onChange: (i) => n({ secondaryCta: { ...t.secondaryCta, label: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Secondary CTA URL" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.secondaryCta.href, onChange: (i) => n({ secondaryCta: { ...t.secondaryCta, href: i.target.value } }) })
      ] })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Image URL" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.imageUrl, onChange: (i) => n({ imageUrl: i.target.value }), placeholder: "home-hero-admin.jpg or /media/…" })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Image alt text" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.imageAlt, onChange: (i) => n({ imageAlt: i.target.value }) })
    ] })
  ] });
}
const nc = ne({
  subId: un,
  defaultAttrs: yt,
  view: ec
}), rc = {
  id: `marketplace-core/${un}`,
  nodeName: De,
  titleKey: "blocks.landingHero.title",
  namespace: "theme-marketplace-core",
  icon: lr,
  category: "layout",
  extensions: [nc],
  insert: (r) => {
    r.focus().insertContent({ type: De, attrs: { attrs: yt } }).run();
  },
  isActive: (r) => r.isActive(De),
  attrsSchema: Zl,
  inspector: (r) => /* @__PURE__ */ d(tc, { editor: r.editor })
}, ic = {
  heading: { description: "Section heading (h2) above the cards. Empty = hidden." },
  subhead: { description: "Paragraph under the heading. Empty = hidden." },
  items: {
    description: 'Cards, 3 per row on desktop: [{ icon, title, body }]. icon = a Material Symbols Outlined icon name ("bolt", "language", "shield"…; empty = "bolt"); title is required (items without one are skipped); body = optional 1-2 sentences. No item with a title = the whole block is hidden.',
    format: "array of objects"
  }
}, hn = "feature-grid", He = re(hn);
function oc({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(or, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.featureGrid.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: t("blocks.featureGrid.count", { n: r.items.length }) })
        ] })
      ] })
    }
  );
}
function ac({ editor: r }) {
  const e = r.getAttributes(He), t = { ...xt, ...e.attrs ?? {} };
  function n(s) {
    r.chain().updateAttributes(He, { attrs: { ...t, ...s } }).run();
  }
  function i(s, l, c) {
    const p = [...t.items];
    p[s] = { ...p[s], [l]: c }, n({ items: p });
  }
  function o() {
    n({ items: [...t.items, { icon: "bolt", title: "", body: "" }] });
  }
  function a(s) {
    n({ items: t.items.filter((l, c) => c !== s) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Heading" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.heading, onChange: (s) => n({ heading: s.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Subhead" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.subhead, onChange: (s) => n({ subhead: s.target.value }) })
    ] }),
    t.items.map((s, l) => /* @__PURE__ */ f("div", { className: "space-y-2 rounded border border-surface-200 p-2 dark:border-surface-700", children: [
      /* @__PURE__ */ f("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ f("span", { className: "text-xs font-semibold uppercase text-surface-500", children: [
          "Item ",
          l + 1
        ] }),
        /* @__PURE__ */ d("button", { type: "button", onClick: () => a(l), className: "btn-ghost p-1 text-red-600", children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" }) })
      ] }),
      /* @__PURE__ */ d("input", { className: "input text-xs", placeholder: "Material icon (bolt, language, …)", value: s.icon, onChange: (c) => i(l, "icon", c.target.value) }),
      /* @__PURE__ */ d("input", { className: "input text-xs", placeholder: "Title", value: s.title, onChange: (c) => i(l, "title", c.target.value) }),
      /* @__PURE__ */ d("textarea", { className: "input text-xs min-h-[60px]", placeholder: "Body", value: s.body, onChange: (c) => i(l, "body", c.target.value) })
    ] }, l)),
    /* @__PURE__ */ f("button", { type: "button", onClick: o, className: "btn-secondary text-xs w-full", children: [
      /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
      "Add item"
    ] })
  ] });
}
const sc = ne({
  subId: hn,
  defaultAttrs: xt,
  view: oc
}), lc = {
  id: `marketplace-core/${hn}`,
  nodeName: He,
  titleKey: "blocks.featureGrid.title",
  namespace: "theme-marketplace-core",
  icon: or,
  category: "layout",
  extensions: [sc],
  insert: (r) => {
    r.focus().insertContent({ type: He, attrs: { attrs: xt } }).run();
  },
  isActive: (r) => r.isActive(He),
  attrsSchema: ic,
  inspector: (r) => /* @__PURE__ */ d(ac, { editor: r.editor })
}, cc = {
  imagePosition: {
    description: 'Side of the image (copy goes on the other side). Alternate it between consecutive rows; anything but "left" renders as "right".',
    values: ["left", "right"]
  },
  eyebrow: { description: "Small label above the headline. Empty = hidden." },
  headline: { description: "Row headline (h2). Required: empty = the whole block is hidden." },
  body: { description: "Paragraph under the headline. Empty = hidden." },
  bullets: {
    description: 'Checklist under the body: ["text", …], each shown with a check icon. Empty strings are skipped; empty list = hidden.',
    format: "array of strings"
  },
  ctaLabel: { description: "Text of the arrow link under the copy. Hidden unless ctaHref is set too." },
  ctaHref: { description: "Target of the link: URL or site path.", format: "URL or site path" },
  imageUrl: { description: "Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL. Empty = no image column.", format: "media URL" },
  imageAlt: { description: "Image alt text. Empty = the headline." }
}, fn = "feature-row", Ue = re(fn);
function dc({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(pr, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.featureRow.title") }),
          /* @__PURE__ */ f("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: [
            r.headline || t("blocks.featureRow.empty"),
            " ·",
            " ",
            /* @__PURE__ */ d("span", { className: "text-surface-500", children: r.imagePosition === "left" ? "← image" : "image →" })
          ] })
        ] })
      ] })
    }
  );
}
function pc({ editor: r }) {
  const e = r.getAttributes(Ue), t = { ...vt, ...e.attrs ?? {} };
  function n(s) {
    r.chain().updateAttributes(Ue, { attrs: { ...t, ...s } }).run();
  }
  function i(s, l) {
    const c = [...t.bullets];
    c[s] = l, n({ bullets: c });
  }
  function o() {
    n({ bullets: [...t.bullets, ""] });
  }
  function a(s) {
    n({ bullets: t.bullets.filter((l, c) => c !== s) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Image position" }),
      /* @__PURE__ */ f(
        "select",
        {
          className: "input",
          value: t.imagePosition,
          onChange: (s) => n({ imagePosition: s.target.value }),
          children: [
            /* @__PURE__ */ d("option", { value: "left", children: "Image on the left" }),
            /* @__PURE__ */ d("option", { value: "right", children: "Image on the right" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Eyebrow" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.eyebrow, onChange: (s) => n({ eyebrow: s.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Headline" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[60px]", value: t.headline, onChange: (s) => n({ headline: s.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Body" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[80px]", value: t.body, onChange: (s) => n({ body: s.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Bullets" }),
      /* @__PURE__ */ f("div", { className: "space-y-2", children: [
        t.bullets.map((s, l) => /* @__PURE__ */ f("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ d("input", { className: "input text-xs flex-1", value: s, onChange: (c) => i(l, c.target.value) }),
          /* @__PURE__ */ d("button", { type: "button", onClick: () => a(l), className: "btn-ghost p-1 text-red-600", children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" }) })
        ] }, l)),
        /* @__PURE__ */ f("button", { type: "button", onClick: o, className: "btn-secondary text-xs w-full", children: [
          /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
          "Add bullet"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ f("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "CTA label" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.ctaLabel, onChange: (s) => n({ ctaLabel: s.target.value }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "CTA URL" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.ctaHref, onChange: (s) => n({ ctaHref: s.target.value }) })
      ] })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Image URL" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.imageUrl, onChange: (s) => n({ imageUrl: s.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Image alt" }),
      /* @__PURE__ */ d("input", { className: "input", value: t.imageAlt, onChange: (s) => n({ imageAlt: s.target.value }) })
    ] })
  ] });
}
const uc = ne({
  subId: fn,
  defaultAttrs: vt,
  view: dc
}), hc = {
  id: `marketplace-core/${fn}`,
  nodeName: Ue,
  titleKey: "blocks.featureRow.title",
  namespace: "theme-marketplace-core",
  icon: pr,
  category: "layout",
  extensions: [uc],
  insert: (r) => {
    r.focus().insertContent({ type: Ue, attrs: { attrs: vt } }).run();
  },
  isActive: (r) => r.isActive(Ue),
  attrsSchema: cc,
  inspector: (r) => /* @__PURE__ */ d(pc, { editor: r.editor })
}, fc = {
  items: {
    description: 'Stats in one strip (2 columns on mobile): [{ value, label }]. value = the big text ("10k", "MIT", "∞"), label = the caption under it. Items with both empty are skipped; no item = the whole block is hidden.',
    format: "array of objects"
  }
}, mn = "stats-bar", je = re(mn);
function mc({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(rr, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.statsBar.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: t("blocks.statsBar.count", { n: r.items.length }) })
        ] })
      ] })
    }
  );
}
function gc({ editor: r }) {
  const e = r.getAttributes(je), t = { ...wt, ...e.attrs ?? {} };
  function n(s) {
    r.chain().updateAttributes(je, { attrs: { ...t, ...s } }).run();
  }
  function i(s, l, c) {
    const p = [...t.items];
    p[s] = { ...p[s], [l]: c }, n({ items: p });
  }
  function o() {
    n({ items: [...t.items, { value: "", label: "" }] });
  }
  function a(s) {
    n({ items: t.items.filter((l, c) => c !== s) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    t.items.map((s, l) => /* @__PURE__ */ f("div", { className: "space-y-2 rounded border border-surface-200 p-2 dark:border-surface-700", children: [
      /* @__PURE__ */ f("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ f("span", { className: "text-xs font-semibold uppercase text-surface-500", children: [
          "Stat ",
          l + 1
        ] }),
        /* @__PURE__ */ d("button", { type: "button", onClick: () => a(l), className: "btn-ghost p-1 text-red-600", children: /* @__PURE__ */ d(xe, { className: "h-3 w-3" }) })
      ] }),
      /* @__PURE__ */ d("input", { className: "input text-xs", placeholder: "Value (10, MIT, ∞)", value: s.value, onChange: (c) => i(l, "value", c.target.value) }),
      /* @__PURE__ */ d("input", { className: "input text-xs", placeholder: "Label", value: s.label, onChange: (c) => i(l, "label", c.target.value) })
    ] }, l)),
    /* @__PURE__ */ f("button", { type: "button", onClick: o, className: "btn-secondary text-xs w-full", children: [
      /* @__PURE__ */ d(Ee, { className: "h-3.5 w-3.5" }),
      "Add stat"
    ] })
  ] });
}
const bc = ne({
  subId: mn,
  defaultAttrs: wt,
  view: mc
}), yc = {
  id: `marketplace-core/${mn}`,
  nodeName: je,
  titleKey: "blocks.statsBar.title",
  namespace: "theme-marketplace-core",
  icon: rr,
  category: "layout",
  extensions: [bc],
  insert: (r) => {
    r.focus().insertContent({ type: je, attrs: { attrs: wt } }).run();
  },
  isActive: (r) => r.isActive(je),
  attrsSchema: fc,
  inspector: (r) => /* @__PURE__ */ d(gc, { editor: r.editor })
}, xc = {
  headline: { description: "Banner headline (h2). Required: empty = the whole block is hidden." },
  body: { description: "Short paragraph under the headline. Empty = hidden." },
  primaryCta: {
    description: 'Primary (filled) button: { label, href }. href is a URL or site path ("/contact.html"). Hidden unless both label and href are set.',
    format: "object"
  },
  secondaryCta: {
    description: "Secondary (ghost) button: { label, href }. Same rules as primaryCta.",
    format: "object"
  }
}, gn = "cta-banner", Ve = re(gn);
function vc({ attrs: r, selected: e }) {
  const { t } = ee("theme-marketplace-core");
  return /* @__PURE__ */ d(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ f("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(sr, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ f("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.ctaBanner.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.headline || t("blocks.ctaBanner.empty") })
        ] })
      ] })
    }
  );
}
function wc({ editor: r }) {
  const e = r.getAttributes(Ve), t = { ...kt, ...e.attrs ?? {} };
  function n(i) {
    r.chain().updateAttributes(Ve, { attrs: { ...t, ...i } }).run();
  }
  return /* @__PURE__ */ f("div", { className: "space-y-3", children: [
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Headline" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[60px]", value: t.headline, onChange: (i) => n({ headline: i.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: "Body" }),
      /* @__PURE__ */ d("textarea", { className: "input min-h-[60px]", value: t.body, onChange: (i) => n({ body: i.target.value }) })
    ] }),
    /* @__PURE__ */ f("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Primary CTA label" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.primaryCta.label, onChange: (i) => n({ primaryCta: { ...t.primaryCta, label: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Primary CTA URL" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.primaryCta.href, onChange: (i) => n({ primaryCta: { ...t.primaryCta, href: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Secondary CTA label" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.secondaryCta.label, onChange: (i) => n({ secondaryCta: { ...t.secondaryCta, label: i.target.value } }) })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: "Secondary CTA URL" }),
        /* @__PURE__ */ d("input", { className: "input", value: t.secondaryCta.href, onChange: (i) => n({ secondaryCta: { ...t.secondaryCta, href: i.target.value } }) })
      ] })
    ] })
  ] });
}
const kc = ne({
  subId: gn,
  defaultAttrs: kt,
  view: vc
}), _c = {
  id: `marketplace-core/${gn}`,
  nodeName: Ve,
  titleKey: "blocks.ctaBanner.title",
  namespace: "theme-marketplace-core",
  icon: sr,
  category: "layout",
  extensions: [kc],
  insert: (r) => {
    r.focus().insertContent({ type: Ve, attrs: { attrs: kt } }).run();
  },
  isActive: (r) => r.isActive(Ve),
  attrsSchema: xc,
  inspector: (r) => /* @__PURE__ */ d(wc, { editor: r.editor })
}, Nc = [
  `<div data-cms-block="marketplace-core/header-buttons" data-attrs="${Me(Xe)}"></div>`,
  `<div data-cms-block="marketplace-core/gallery" data-attrs="${Me(Qe)}"></div>`,
  `<div data-cms-block="marketplace-core/specs" data-attrs="${Me(Ze)}"></div>`,
  `<div data-cms-block="marketplace-core/features" data-attrs="${Me(et)}"></div>`,
  "",
  "## Description",
  "",
  "Write the long-form description of your theme or plugin here. Markdown is supported.",
  ""
].join(`

`), Rc = {
  id: "marketplace-core",
  name: "Marketplace Core",
  version: "1.7.3",
  description: "App-store style theme for listing themes / plugins. Modern Corporate aesthetic with ambient shadows and rounded XL corners.",
  scssEntry: "theme.css",
  cssText: vn,
  i18n: { en: Ce, fr: Li, de: Bi, es: zi, nl: Fi, pt: Pi, ko: Di },
  defaultPostMarkdown: { post: Nc },
  settings: {
    navLabelKey: "title",
    defaultConfig: ie,
    component: $o,
    schema: Uo
  },
  compileCss: (r) => Co(vn, r.style),
  imageFormats: {
    inputFormats: [".jpg", ".jpeg", ".png", ".webp"],
    outputFormat: "webp",
    quality: 82,
    formats: {
      small: { width: 480, height: 300, fit: "cover" },
      medium: { width: 800, height: 500, fit: "cover" },
      large: { width: 1600, height: 1e3, fit: "cover" }
    },
    defaultFormat: "medium"
  },
  templates: {
    base: Ai,
    home: Mi,
    single: Ii,
    category: Ri,
    author: Oi,
    notFound: $i
  },
  blocks: [
    // Product blocks — used on single product pages.
    $l,
    Pl,
    Vl,
    Ql,
    // Landing blocks — used on home / about / marketing pages
    // (added in v1.3.0).
    rc,
    lc,
    hc,
    yc,
    _c
  ],
  register(r) {
    r.addFilter("post.html.body", (e, t, n) => {
      var u, h;
      const i = ui(), o = n, s = (((u = o == null ? void 0 : o.settings) == null ? void 0 : u.language) || ((h = i == null ? void 0 : i.settings) == null ? void 0 : h.language) || "en").toLowerCase().split("-")[0], l = K.getResource(s, "theme-marketplace-core", "publicBaked.codeBlock.copy") ?? "Copy", c = K.getResource(s, "theme-marketplace-core", "publicBaked.codeBlock.copied") ?? "Copied", p = t;
      return Pt = i && p && !p.heroMediaId && p.primaryTermId ? { postId: p.id, siblings: Sc(i, p.id, p.primaryTermId) } : null, ko(e, l, c);
    }), r.addFilter("post.template.props", (e, t) => {
      const n = t, i = Pt;
      return Pt = null, !i || i.postId !== (n == null ? void 0 : n.id) ? e : {
        ...e,
        docSiblings: i.siblings
      };
    });
  }
};
let Pt = null;
function Sc(r, e, t) {
  if (!(r != null && r.posts)) return [];
  const n = r.terms.find((i) => i.id === t);
  return n ? r.posts.filter(
    (i) => i.type === "post" && i.primaryTermId === t && (i.id === e || i.status === "online")
  ).sort((i, o) => {
    var l, c, p, u;
    const a = ((c = (l = i.createdAt) == null ? void 0 : l.toMillis) == null ? void 0 : c.call(l)) ?? 0, s = ((u = (p = o.createdAt) == null ? void 0 : p.toMillis) == null ? void 0 : u.call(p)) ?? 0;
    return a - s;
  }).map((i) => ({
    id: i.id,
    title: i.title,
    url: `${n.slug}/${i.slug}.html`
  })) : [];
}
export {
  Rc as default
};
