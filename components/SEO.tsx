import React from 'react';

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

  React.useEffect(() => {
    // Page Title
    document.title = title;

    // Standard Meta
    updateMetaTag('name', 'description', description);
    
    // Canonical
    updateLinkTag('rel', 'canonical', fullCanonical);

    // OG Tags
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:url', fullCanonical);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:site_name', 'PDFA2Z');

    // Twitter Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);

    // Schema
    let script = document.getElementById('json-ld-schema') as HTMLScriptElement;
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.innerHTML = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonical, fullCanonical, schema]);

  return null;
};

function updateMetaTag(attr: string, key: string, content: string | undefined) {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(attr: string, key: string, href: string | undefined) {
  if (!href) return;
  let element = document.querySelector(`link[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

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
