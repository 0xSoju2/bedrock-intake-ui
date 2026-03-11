import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bedrock: {
          bg: '#0a0a0a',
          card: '#111111',
          border: '#1f1f1f',
          accent: '#7C3AED',
          accentHover: '#6D28D9',
          text: '#f5f5f5',
          muted: '#6b7280',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
