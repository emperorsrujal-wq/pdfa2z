import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  schema?: any;
}

export const SEO: React.FC<SEOProps> = ({ title, description, canonical, schema }) => {
  const siteUrl = 'https://pdfa2z.com';
  const fullCanonical = canonical
    ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
    : siteUrl;

  return (
    <Helmet>
      {/* Page Title */}
      <title>{title}</title>

      {/* Standard Meta */}
      <meta name="description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />

      {/* OG Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PDFA2Z" />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};



export const generateToolSchema = (tool: any) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": tool.h1,
  "description": tool.description,
  "url": `https://pdfa2z.com/${tool.slug}`,
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
});
