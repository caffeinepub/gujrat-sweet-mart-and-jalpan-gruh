import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                }
            },
            fontFamily: {
                sans: ['Mona Sans', 'system-ui', 'sans-serif'],
                display: ['Fraunces', 'Georgia', 'serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                paisley: '0 4px 6px -1px oklch(var(--primary) / 0.3), 0 2px 4px -1px oklch(var(--secondary) / 0.2)',
                'glow-primary': '0 0 30px oklch(var(--primary) / 0.5)',
                'glow-secondary': '0 0 30px oklch(var(--secondary) / 0.5)',
                'glow-accent': '0 0 30px oklch(var(--accent) / 0.5)',
                'glow-gold': '0 0 40px oklch(0.85 0.18 85 / 0.4)',
            },
            transitionDuration: { '400': '400ms' },
            animationDelay: {
                '100': '100ms', '200': '200ms', '300': '300ms',
                '400': '400ms', '500': '500ms', '600': '600ms'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in-up': {
                    from: { opacity: '0', transform: 'translateY(24px)' },
                    to:   { opacity: '1', transform: 'translateY(0)' }
                },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.92)' },
                    to:   { opacity: '1', transform: 'scale(1)' }
                },
                'shimmer': {
                    '0%':   { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%':      { transform: 'translateY(-8px)' }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 0 0 oklch(var(--primary) / 0.4)' },
                    '50%':      { boxShadow: '0 0 0 12px oklch(var(--primary) / 0)' }
                },
                'slide-in-right': {
                    from: { opacity: '0', transform: 'translateX(16px)' },
                    to:   { opacity: '1', transform: 'translateX(0)' }
                },
                'bounce-in': {
                    '0%':   { opacity: '0', transform: 'scale(0.6) translateY(30px)' },
                    '60%':  { opacity: '1', transform: 'scale(1.08) translateY(-6px)' },
                    '80%':  { transform: 'scale(0.97) translateY(2px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '20%':      { transform: 'rotate(-8deg)' },
                    '40%':      { transform: 'rotate(8deg)' },
                    '60%':      { transform: 'rotate(-5deg)' },
                    '80%':      { transform: 'rotate(5deg)' }
                },
                'spin-slow': {
                    from: { transform: 'rotate(0deg)' },
                    to:   { transform: 'rotate(360deg)' }
                },
                'sparkle-pop': {
                    '0%':   { transform: 'scale(1)' },
                    '30%':  { transform: 'scale(1.4) rotate(12deg)' },
                    '60%':  { transform: 'scale(0.9) rotate(-6deg)' },
                    '100%': { transform: 'scale(1) rotate(0deg)' }
                },
                'marquee': {
                    '0%':   { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' }
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 0 0 oklch(var(--primary) / 0.6), 0 0 20px oklch(var(--primary) / 0.2)' },
                    '50%':      { boxShadow: '0 0 0 8px oklch(var(--primary) / 0), 0 0 35px oklch(var(--primary) / 0.5)' }
                },
                'tilt-in': {
                    from: { opacity: '0', transform: 'perspective(600px) rotateY(-15deg) translateX(-20px)' },
                    to:   { opacity: '1', transform: 'perspective(600px) rotateY(0deg) translateX(0)' }
                },
                'diya-flicker': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(-2deg)' },
                    '25%':      { opacity: '0.85', transform: 'scale(1.05) rotate(2deg)' },
                    '50%':      { opacity: '0.95', transform: 'scale(0.97) rotate(-1deg)' },
                    '75%':      { opacity: '1', transform: 'scale(1.02) rotate(1deg)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in-up': 'fade-in-up 0.5s ease-out both',
                'scale-in': 'scale-in 0.4s ease-out both',
                'shimmer': 'shimmer 3s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'slide-in-right': 'slide-in-right 0.3s ease-out both',
                'bounce-in': 'bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                'wiggle': 'wiggle 0.5s ease-in-out',
                'spin-slow': 'spin-slow 20s linear infinite',
                'sparkle-pop': 'sparkle-pop 0.4s ease-out both',
                'marquee': 'marquee 25s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'tilt-in': 'tilt-in 0.5s ease-out both',
                'diya-flicker': 'diya-flicker 1.5s ease-in-out infinite'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
