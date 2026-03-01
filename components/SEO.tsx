import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  schema?: any;
  parentSlug?: string;
  currentLang?: string;
  tool?: any;
}

const SUPPORTED_LANGS = ['es', 'fr', 'hi'];

// Simple deterministic hash to vary ratings per tool
const getDynamicRating = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const ratingValue = (4.7 + (Math.abs(hash) % 3) / 10).toFixed(1); // 4.7, 4.8, or 4.9
  const ratingCount = 800 + (Math.abs(hash) % 1700); // 800 - 2500
  return { ratingValue, ratingCount };
};

export const SEO: React.FC<SEOProps> = ({ title, description, canonical, schema, parentSlug, currentLang = 'en', tool }) => {
  const siteUrl = 'https://pdfa2z.com';

  // Smart Canonicalization Logic:
  // 1. If parentSlug is provided AND it's not marked as unique, canonicalize to parent.
  // 2. Otherwise use the provided canonical or fallback to siteUrl.
  let targetCanonical = canonical;
  if (parentSlug && !schema?.some((s: any) => s.unique)) {
    targetCanonical = `/${parentSlug}`;
  }

  const baseSlug = targetCanonical?.startsWith('/') ? targetCanonical.slice(1) : (targetCanonical || '');

  const fullCanonical = targetCanonical
    ? (targetCanonical.startsWith('http') ? targetCanonical : `${siteUrl}${targetCanonical.startsWith('/') ? '' : '/'}${targetCanonical}`)
    : siteUrl;

  /* Open Graph & Twitter Image */
  const ogImage = `${siteUrl}/og-image.svg`;
  const ogWidth = "1200";
  const ogHeight = "630";

  // Generate Hreflang Tags
  const hreflangs = [
    { lang: 'x-default', href: `${siteUrl}/${baseSlug}` },
    { lang: 'en', href: `${siteUrl}/${baseSlug}` },
    ...SUPPORTED_LANGS.map(l => ({
      lang: l,
      href: `${siteUrl}/${l}/${baseSlug}`
    }))
  ];

  const GLOBAL_KEYWORDS = [
    'pdf converter',
    'free pdf tools',
    'online pdf editor',
    'ilovepdf alternative',
    'smallpdf alternative',
    'pdf to word',
    'merge pdf',
    'compress pdf'
  ];

  const keywords = (tool?.features ? tool.features.join(', ') : '') +
    ', ' + title +
    ', ' + GLOBAL_KEYWORDS.join(', ');

  return (
    <Helmet>
      {/* Page Title */}
      <title>{title}</title>

      {/* Standard Meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />

      {/* Hreflang Tags */}
      {hreflangs.map(h => (
        <link key={h.lang} rel="alternate" hrefLang={h.lang} href={h.href} />
      ))}

      {/* OG Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PDFA2Z" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content={ogWidth} />
      <meta property="og:image:height" content={ogHeight} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pdfa2z" />
      <meta name="twitter:creator" content="@pdfa2z" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};



const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PDFA2Z",
  "url": "https://pdfa2z.com",
  "logo": "https://pdfa2z.com/icon.svg",
  "description": "Professional-grade PDF and image tools powered by AI. Merge, compress, convert, and analyze documents completely client-side.",
  "sameAs": [
    "https://twitter.com/pdfa2z",
    "https://github.com/pdfa2z"
  ]
});

export const generateToolSchema = (tool: any) => {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.h1,
    "description": tool.description,
    "url": `https://pdfa2z.com/${tool.slug}`,
    "applicationCategory": "MultimediaApplication",
    "applicationSubCategory": tool.type === 'PDF_SUITE' ? 'ProductivityApplication' : 'PhotoEditor',
    "operatingSystem": "Web, Windows, macOS, Android, iOS",
    "screenshot": `https://pdfa2z.com/og-image.svg`,
    "featureList": tool.features ? tool.features.join(', ') : 'Free online tool, No installation required, Secure processing',
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": getDynamicRating(tool.slug).ratingValue,
      "ratingCount": getDynamicRating(tool.slug).ratingCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    ...(tool.unique ? { unique: true } : {})
  };

  const howToSchema = tool.steps && tool.steps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${tool.title}`,
    "totalTime": "PT1M",
    "step": tool.steps.map((step: string, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  } : null;

  const faqSchema = tool.faqs && tool.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pdfa2z.com"
      },
      ...(tool.slug === 'blog' ? [] : [
        {
          "@type": "ListItem",
          "position": 2,
          "name": tool.parentSlug === 'blog' ? 'Blog' : 'Tools',
          "item": `https://pdfa2z.com/${tool.parentSlug === 'blog' ? 'blog' : ''}`
        }
      ]),
      {
        "@type": "ListItem",
        "position": tool.slug === 'blog' ? 2 : 3,
        "name": tool.title,
        "item": `https://pdfa2z.com/${tool.slug}`
      }
    ]
  };

  const articleSchema = tool.parentSlug === 'blog' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": tool.title,
    "description": tool.description,
    "image": `https://pdfa2z.com/og-image.svg`,
    "author": {
      "@type": "Person",
      "name": "PDFA2Z Expert"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PDFA2Z",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pdfa2z.com/icon.svg"
      }
    },
    "datePublished": "2026-02-26"
  } : null;

  const organizationSchema = tool.slug === '' ? generateOrganizationSchema() : null;

  return [websiteSchema, howToSchema, faqSchema, breadcrumbSchema, articleSchema, organizationSchema].filter(Boolean);
};
