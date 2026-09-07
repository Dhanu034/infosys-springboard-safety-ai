/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stitch Design System Colors (DESIGN.md)
        surface: {
          DEFAULT: '#101415',
          dim: '#101415',
          bright: '#363a3b',
          'container-lowest': '#0b0f10',
          'container-low': '#191c1e',
          container: '#1d2022',
          'container-high': '#272a2c',
          'container-highest': '#323537',
          variant: '#323537',
        },
        'on-surface': {
          DEFAULT: '#e0e3e5',
          variant: '#bbc9cd',
        },
        'inverse-surface': '#e0e3e5',
        'inverse-on-surface': '#2d3133',
        outline: {
          DEFAULT: '#859397',
          variant: '#3c494c',
        },
        'surface-tint': '#2fd9f4',
        
        // Brand Primary: Electric Cyan
        primary: {
          DEFAULT: '#8aebff',
          on: '#00363e',
          container: '#22d3ee',
          'on-container': '#005763',
          inverse: '#006877',
          fixed: '#a2eeff',
          'fixed-dim': '#2fd9f4',
          'on-fixed': '#001f25',
          'on-fixed-variant': '#004e5a',
        },

        // Brand Secondary: Construction Orange (High Risk & Actions)
        secondary: {
          DEFAULT: '#ffb77d',
          on: '#4d2600',
          container: '#fd8b00',
          'on-container': '#603100',
          fixed: '#ffdcc3',
          'fixed-dim': '#ffb77d',
          'on-fixed': '#2f1500',
          'on-fixed-variant': '#6e3900',
        },

        // Brand Tertiary: Emerald Green (Safe / Compliant)
        tertiary: {
          DEFAULT: '#68f5b8',
          on: '#003824',
          container: '#46d89d',
          'on-container': '#005a3d',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
          'on-fixed': '#002113',
          'on-fixed-variant': '#005236',
        },

        // Brand Error: Signal Red (Critical Hazards)
        error: {
          DEFAULT: '#ffb4ab',
          on: '#690005',
          container: '#93000a',
          'on-container': '#ffdad6',
        },

        // Tactical Slate Palette
        slate: {
          750: '#263345',
          850: '#141d2b',
          950: '#0b1017',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
