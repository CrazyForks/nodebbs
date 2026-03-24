import { NextResponse } from 'next/server';
import { encodeSlugPath, getPageBySlug, joinSlugSegments } from '@/lib/server/pages';

export const dynamic = 'force-dynamic';

const INTERNAL_HEADER = 'x-page-render-internal';
const INTERNAL_TOKEN = '1';

export { INTERNAL_HEADER, INTERNAL_TOKEN };

function buildForwardHeaders(request) {
  const forwardHeaders = new Headers();
  forwardHeaders.set('accept', 'text/html');
  forwardHeaders.set(INTERNAL_HEADER, INTERNAL_TOKEN);

  for (const name of ['cookie', 'accept-language', 'user-agent']) {
    const value = request.headers.get(name);
    if (value) {
      forwardHeaders.set(name, value);
    }
  }

  return forwardHeaders;
}

async function fetchInternalPage(target, request) {
  const response = await fetch(target, {
    method: 'GET',
    headers: buildForwardHeaders(request),
    cache: 'no-store',
  });

  return {
    html: await response.text(),
    status: response.status,
  };
}

async function renderHtmlNotFound(request) {
  const target = new URL('/not-found-render', request.url);
  const { html } = await fetchInternalPage(target, request);

  return new NextResponse(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = joinSlugSegments(resolvedParams.slug);
    const page = await getPageBySlug(resolvedParams.slug);

    if (!page) {
      const accept = request.headers.get('accept') || '';
      if (accept.includes('text/html')) {
        return await renderHtmlNotFound(request);
      }
      return new NextResponse('Not Found', { status: 404 });
    }

    if (page.type === 'text') {
      return new NextResponse(page.content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (page.type === 'json') {
      return new NextResponse(page.content, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (page.type === 'html' || page.type === 'markdown') {
      const target = new URL(`/page-render/${encodeSlugPath(resolvedParams.slug)}`, request.url);

      const { html, status } = await fetchInternalPage(target, request);

      return new NextResponse(html, {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new NextResponse('Unsupported Page Type', { status: 500 });
  } catch (error) {
    const accept = request.headers.get('accept') || '';
    if (accept.includes('text/html')) {
      try {
        return await renderHtmlNotFound(request);
      } catch {
        // fallback if even 404 rendering fails
      }
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
