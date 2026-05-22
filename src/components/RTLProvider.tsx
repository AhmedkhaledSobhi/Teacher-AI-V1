'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import rtlPlugin from 'stylis-plugin-rtl'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ReactNode } from 'react'

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [ rtlPlugin],
})

const cacheLtr = createCache({
  key: 'muiltr',
})

interface RTLProviderProps {
  children: ReactNode
}

export const RTLProvider = ({ children }: RTLProviderProps) => {
  const { isRTL } = useTranslation()

  const theme = createTheme({
    direction: isRTL ? 'rtl' : 'ltr',
  })

  return (
    <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {children}
        </div>
      </ThemeProvider>
    </CacheProvider>
  )
}