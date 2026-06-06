import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'GoStay - Đặt phòng khách sạn giá tốt';
const DEFAULT_OG_IMAGE = '/og-image.jpg';

export interface SeoProps {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  jsonLd?: object;
  noIndex?: boolean;
}

export function useSeo({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  jsonLd,
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;
  }, [title]);

  return (
    <Helmet>
      <title>{`${title} | ${SITE_NAME}`}</title>
      {description && <meta name="description" content={description} />}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage || DEFAULT_OG_IMAGE} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${SITE_NAME}`} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage || DEFAULT_OG_IMAGE} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
