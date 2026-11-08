import { useEffect } from 'react'

const siteUrl = 'https://prayogmanch-dcba.vercel.app'
const socialImage = `${siteUrl}/og-image.svg`

type PageMetadataProps = {
  title: string
  description: string
  path?: string
}

function setMeta(selector: string, attribute: 'name' | 'property', value: string) {
  const element = document.querySelector<HTMLMetaElement>(selector)
  if (element) element.content = value
  else {
    const meta = document.createElement('meta')
    meta.setAttribute(attribute, selector.match(/="([^"]+)/)?.[1] ?? '')
    meta.content = value
    document.head.append(meta)
  }
}

export function PageMetadata({ title, description, path = '/' }: PageMetadataProps) {
  useEffect(() => {
    const url = `${siteUrl}${path}`
    document.title = title
    setMeta('meta[name="description"]', 'name', description)
    setMeta('meta[property="og:title"]', 'property', title)
    setMeta('meta[property="og:description"]', 'property', description)
    setMeta('meta[property="og:url"]', 'property', url)
    setMeta('meta[property="og:image"]', 'property', socialImage)
    setMeta('meta[name="twitter:title"]', 'name', title)
    setMeta('meta[name="twitter:description"]', 'name', description)
    setMeta('meta[name="twitter:image"]', 'name', socialImage)
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url)
  }, [description, path, title])

  return null
}
