import type { Metadata } from 'next';
import type { Production } from '../../../../../../src/components/Profile/Company/types';

const SITE_NAME = 'Chicago Artist Guide';
const FALLBACK_DESCRIPTION =
  'Discover casting opportunities in Chicago theatre on Chicago Artist Guide.';
const OG_DESCRIPTION_MAX_LENGTH = 200;

const truncate = (value: string, maxLength: number): string =>
  value.length > maxLength
    ? `${value.slice(0, maxLength - 1).trimEnd()}…`
    : value;

// The single biggest SEO lever on this page: every show used to share one
// generic OG card site-wide. Per-show title/description/image here means a
// link to any production now unfurls with that show's own name, blurb, and
// poster in Slack, iMessage, socials, etc.
export const buildProductionMetadata = (production: Production): Metadata => {
  const title = `${production.production_name} | ${SITE_NAME}`;
  const description = production.description
    ? truncate(production.description, OG_DESCRIPTION_MAX_LENGTH)
    : FALLBACK_DESCRIPTION;

  return {
    description,
    openGraph: {
      description,
      images: production.production_image_url
        ? [{ url: production.production_image_url }]
        : undefined,
      title
    },
    title
  };
};
