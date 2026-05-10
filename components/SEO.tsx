import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { getToolReviewData } from '../utils/reviewData';

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

export const SEO: React.FC<SEOProps> = ({ title, description, canonical, schema, parentSlug, currentLang: _currentLang = 'en', tool }) => {
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

  /* Open Graph */
  const isBlogPost = parentSlug === 'blog';
  const ogType = isBlogPost ? 'article' : 'website';
  const ogImage = `${siteUrl}/pwa-512x512.png`;
  const ogImageAlt = `PDFA2Z — ${title}`;

  // Hreflang — only add language variants for non-blog pages (blog not localised)
  const hreflangs = [
    { lang: 'x-default', href: `${siteUrl}/${baseSlug}` },
    { lang: 'en', href: `${siteUrl}/${baseSlug}` },
    ...(!isBlogPost ? SUPPORTED_LANGS.map(l => ({
      lang: l,
      href: `${siteUrl}/${l}/${baseSlug}`
    })) : [])
  ];

  const GLOBAL_KEYWORDS = [
    'pdf converter', 'free pdf tools', 'online pdf editor',
    'ilovepdf alternative', 'smallpdf alternative',
    'pdf to word', 'merge pdf', 'compress pdf',
    'adobe acrobat alternative', 'free pdf software'
  ];

  const keywords = [
    ...(tool?.features || []),
    title,
    ...GLOBAL_KEYWORDS
  ].join(', ');

  return (
    <Helmet>
      <title>{title}</title>

      {/* Standard Meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

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
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="PDFA2Z" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content={ogImageAlt} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pdfa2z" />
      <meta name="twitter:creator" content="@pdfa2z" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

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
  "@id": "https://pdfa2z.com/#organization",
  "name": "PDFA2Z",
  "url": "https://pdfa2z.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://pdfa2z.com/icon.svg",
    "width": 512,
    "height": 512
  },
  "description": "100+ free online PDF and image tools. Merge, compress, convert, edit and more — no signup required.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://pdfa2z.com/contact",
    "availableLanguage": ["English", "Spanish", "French", "Hindi"]
  },
  "sameAs": [
    "https://twitter.com/pdfa2z"
  ]
});

export const generateToolSchema = (tool: any) => {
  const reviewData = getToolReviewData(tool.slug);
  const appCategory = tool.type === 'IMAGE_TOOLKIT' ? 'MultimediaApplication' : 'BusinessApplication';
  const websiteSchema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `https://pdfa2z.com/${tool.slug}#software`,
    "name": tool.h1 || tool.title,
    "description": tool.description,
    "url": `https://pdfa2z.com/${tool.slug}`,
    "applicationCategory": appCategory,
    "operatingSystem": "Web Browser — Windows, macOS, Linux, Android, iOS",
    "browserRequirements": "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
    "featureList": tool.features ? tool.features.join(', ') : 'Free online tool, No installation required, Secure processing',
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "provider": {
      "@type": "Organization",
      "@id": "https://pdfa2z.com/#organization"
    }
  };
  if (reviewData && reviewData.count > 0) {
    websiteSchema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": reviewData.rating.toString(),
      "ratingCount": reviewData.count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  const stepCount = tool.steps?.length || 0;
  const totalMinutes = Math.max(1, stepCount);
  const howToSchema = tool.steps && tool.steps.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to ${tool.h1 || tool.title}`,
    "description": tool.description,
    "totalTime": `PT${totalMinutes}M`,
    "tool": [{ "@type": "HowToTool", "name": "PDFA2Z — Free Online PDF & Image Tools" }],
    "step": tool.steps.map((step: string, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.split('.')[0] || `Step ${index + 1}`,
      "text": step,
      "url": `https://pdfa2z.com/${tool.slug}#step-${index + 1}`
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
    "image": {
      "@type": "ImageObject",
      "url": "https://pdfa2z.com/pwa-512x512.png",
      "width": 512,
      "height": 512
    },
    "author": {
      "@type": "Person",
      "name": "PDFA2Z Editorial Team",
      "url": "https://pdfa2z.com/about"
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://pdfa2z.com/#organization",
      "name": "PDFA2Z",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pdfa2z.com/icon.svg",
        "width": 512,
        "height": 512
      }
    },
    "datePublished": tool.datePublished || new Date().toISOString().split('T')[0],
    "dateModified": tool.dateModified || new Date().toISOString().split('T')[0],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://pdfa2z.com/${tool.slug}`
    }
  } : null;

  const organizationSchema = tool.slug === '' ? generateOrganizationSchema() : null;

  return [websiteSchema, howToSchema, faqSchema, breadcrumbSchema, articleSchema, organizationSchema].filter(Boolean);
};

/**
 * Generate ImageObject schema for image tools
 */
export const generateImageSchema = (tool: any) => {
  if (!tool || tool.type !== 'IMAGE_TOOLKIT') return null;

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": tool.h1 || tool.title,
    "description": tool.description,
    "url": `https://pdfa2z.com/${tool.slug}`,
    "creator": {
      "@type": "Organization",
      "name": "PDFA2Z"
    }
  };
};

/**
 * Generate VideoObject schema for video tools
 */
export const generateVideoSchema = (tool: any) => {
  if (!tool || tool.type !== 'VIDEO_SUITE') return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": tool.h1 || tool.title,
    "description": tool.description,
    "url": `https://pdfa2z.com/${tool.slug}`,
    "uploadDate": new Date().toISOString().split('T')[0],
    "duration": "PT5M",
    "thumbnailUrl": "https://pdfa2z.com/pwa-512x512.png",
    "creator": {
      "@type": "Organization",
      "name": "PDFA2Z"
    }
  };
};
