# Gujrat Sweet Mart and Jalpan Gruh

## Current State
The app is a full-stack Indian sweet shop e-commerce site with:
- Home page with hero banner, info cards, features section, categories grid, bulk order CTA
- Products page with search, category sections, ProductCard components
- Full e-commerce flow (cart, checkout, orders, delivery, admin panel)
- Basic Indian color palette (saffron/orange primary, deep red secondary, marigold accent)
- Playfair Display for headings, Inter for body
- Minimal animations (only accordion animations defined)
- `index.css` with OKLCH tokens and a simple `pattern-border` / `paisley-shadow` helper
- `tailwind.config.js` with basic setup, no custom keyframes except accordion

## Requested Changes (Diff)

### Add
- Rich CSS animations: entrance animations (fade-in-up, scale-in), hover micro-interactions on cards and buttons, a floating/pulsing effect on hero elements, shimmer effect on loading states
- Indian-themed decorative motifs in CSS: paisley dots pattern, rangoli-inspired gradient borders, a subtle mandala-like radial gradient in hero background
- Smooth page-load stagger animation for category cards on homepage
- Scroll-triggered reveal for feature cards
- Enhanced navbar: frosted glass effect with backdrop blur, subtle animated underline on active links
- Hero section: animated gradient text shimmer on the shop name, subtle parallax-like layered radial gradients
- Product card: smooth scale-up on hover with colored border glow matching category, image zoom on hover
- Sticky category quick-nav bar on Products page (pills for each category) with animated active indicator
- Footer: richer layout with decorative top border pattern using CSS gradients

### Modify
- `index.css`: add custom @font-face for Bricolage Grotesque (body) and keep Playfair Display for headings; add all new keyframe animations; enrich OKLCH palette with a warm gold token (`--gold`) and a deep maroon token; add new animation utility classes
- `tailwind.config.js`: register Bricolage Grotesque as `sans` font, add new keyframes (fade-in-up, scale-in, shimmer, pulse-glow, float), register animation utilities
- `Home.tsx`: apply entrance animations to all sections, stagger category cards, add animated hero background layers, add scroll-reveal class to feature cards
- `ProductCard.tsx`: add hover glow border, image zoom, smooth transitions
- `Products.tsx`: add sticky category nav pills at the top that scroll to section on click
- `App.tsx` (Layout): add frosted glass header, animated underline nav links, smooth mobile menu slide-in animation

### Remove
- Nothing to remove

## Implementation Plan
1. Update `tailwind.config.js` with new fonts, keyframes (fade-in-up, scale-in, shimmer, float, pulse-glow, stagger delays), and animation utilities
2. Update `index.css` with:
   - @font-face for Bricolage Grotesque from /assets/fonts/
   - New gold and maroon OKLCH tokens
   - Rangoli border gradient utility class
   - Mandala-inspired radial gradient utility
   - Shimmer animation keyframe
   - Entrance animation classes: `.animate-fade-in-up`, `.animate-scale-in`
   - Stagger delay helpers: `.delay-100` through `.delay-600`
   - Hover glow utility: `.card-glow-primary`, `.card-glow-secondary`
3. Update `App.tsx` Layout:
   - Header: add `backdrop-blur-md bg-card/80` frosted glass
   - Nav links: add animated underline with `after:` pseudo-element via inline classes
   - Mobile menu: animate slide-in
4. Update `Home.tsx`:
   - Hero: layered radial gradients for mandala effect, animated title with shimmer class
   - Info cards: `animate-fade-in-up` with stagger delays
   - Feature cards: `animate-fade-in-up` with stagger
   - Category cards: scale-in with stagger delays on hover
   - CTA banner: pulse glow on the icon
5. Update `ProductCard.tsx`:
   - Wrapper: `group` class with `hover:scale-[1.02] transition-transform duration-300`
   - Border glow on hover using category-specific ring
   - Image container: `overflow-hidden` with `group-hover:scale-110` on img
   - Add to Cart button: `hover:shadow-lg` with transition
6. Update `Products.tsx`:
   - Add sticky category quick-nav bar (pills) below hero section
   - Pills: animated active underline, smooth scroll behavior
7. Validate (typecheck + lint + build)
