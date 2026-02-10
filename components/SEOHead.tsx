import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    ogImage?: string;
    jsonLd?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    canonicalUrl,
    ogImage = '/og-image.jpg',
    jsonLd
}) => {
    const siteName = 'PDF A2Z';
    const fullTitle = `${title} | ${siteName}`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl || window.location.href} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl || window.location.href} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl || window.location.href} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />

            {/* Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};
