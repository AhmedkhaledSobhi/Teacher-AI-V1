import tailwindcssLogical from 'tailwindcss-logical'
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

import tailwindPlugin from './src/@core/tailwind/plugin'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [tailwindcssLogical, tailwindPlugin, typography],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'var(--mui-palette-primary-main)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            code: {
              color: 'var(--mui-palette-primary-main)',
              backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel), 0.1)',
              borderRadius: '3px',
              padding: '0.2em 0.4em',
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: 0,
              borderRadius: 0,
              color: 'inherit',
            },
          },
        },
      },
    }
  }
}

export default config
