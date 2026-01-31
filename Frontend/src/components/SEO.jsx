import { Helmet } from 'react-helmet'

const SEO = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = '/images/logo.png',
  robots = 'index, follow',
  children,
}) => {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://abssd.in'
  const siteName = 'अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट | Akhil Bhartiya Swachhta Sewa Dal Trust | ABSSD'

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || 'अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट - समर्पित सामाजिक संगठन जो स्वच्छता, सेवा और सामाजिक उत्थान के लिए कार्य करता है।'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#f97316" />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="language" content="hi-IN" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      {title && <meta property="og:title" content={ogTitle || title} />}
      {description && <meta property="og:description" content={ogDescription || description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={`${baseUrl}${canonical}`} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      {title && <meta name="twitter:title" content={ogTitle || title} />}
      {description && <meta name="twitter:description" content={ogDescription || description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Schema.org Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteName,
          url: baseUrl,
          logo: `${baseUrl}/images/logo.png`,
          description: 'अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट - सामाजिक सेवा संगठन',
          sameAs: [
            'https://facebook.com/p/%E0%A4%85%E0%A4%96%E0%A4%BF%E0%A4%B2-%E0%A4%AD%E0%A4%BE%E0%A4%B0%E0%A4%A4%E0%A5%80%E0%A4%AF%E0%A4%B8%E0%A5%8D%E0%A4%B5%E0%A4%9B%E0%A4%A4%E0%A5%8D%E0%A4%A4%E0%A4%BE-%E0%A4%B8%E0%A5%87%E0%A4%B5%E0%A4%BE-%E0%A4%A6%E0%A4%B2-100064129565746/',
            'https://twitter.com/abssdtrust',
            'https://instagram.com/akhilbhartiyaswachhtasewadal'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Support',
            email: 'abssdtrust@gmail.com',
            telephone: "+91-8860442044"
          }
        })}
      </script>

      {children}
    </Helmet>
  )
}

export default SEO
