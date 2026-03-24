import { cache } from 'react';
import { request } from './api';

export function normalizeSlugSegments(slug) {
  return (Array.isArray(slug) ? slug : [slug])
    .filter(Boolean)
    .map((segment) => decodeURIComponent(String(segment)))
    .filter(Boolean);
}

export function joinSlugSegments(slug) {
  return normalizeSlugSegments(slug).join('/');
}

export function encodeSlugPath(slug) {
  return normalizeSlugSegments(slug)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

const fetchPageByEncodedSlug = cache(async (encodedSlug) => {
  try {
    return await request(`/pages/${encodedSlug}`, {
      cache: 'no-store',
    });
  } catch {
    return null;
  }
});

export async function getPageBySlug(slug) {
  const encodedSlug = encodeSlugPath(slug);

  if (!encodedSlug) {
    return null;
  }

  return fetchPageByEncodedSlug(encodedSlug);
}
