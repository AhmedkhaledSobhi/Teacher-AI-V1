import { useParams } from 'next/navigation'
import { useMemo } from 'react'

// Import dictionaries
import enDict from '@/data/dictionaries/en.json'
import arDict from '@/data/dictionaries/ar.json'

type Dictionary = typeof enDict
type Locale = 'en' | 'ar'

const dictionaries: Record<Locale, Dictionary> = {
  en: enDict,
  ar: arDict
}

export const useTranslation = () => {
  const params = useParams()
  const locale = (params?.lang as Locale) || 'en'

  const dictionary = useMemo(() => {
    return dictionaries[locale] || dictionaries.en
  }, [locale])

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.')
    let value: any = dictionary

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }

    return typeof value === 'string' ? value : fallback || key
  }

  return {
    t,
    locale,
    isRTL: locale === 'ar'
  }
}