import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import PublicPageRenderer from './PublicPageRenderer';
import { getPageBySlug, joinSlugSegments } from '@/lib/server/pages';

export const dynamic = 'force-dynamic';

const INTERNAL_HEADER = 'x-page-render-internal';
const INTERNAL_TOKEN = '1';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = await getPageBySlug(resolvedParams.slug);

  if (!page || !['html', 'markdown'].includes(page.type)) {
    return {};
  }

  const slug = joinSlugSegments(resolvedParams.slug);

  return {
    title: page.title,
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default async function InternalPageRender({ params }) {
  const headersList = await headers();

  if (headersList.get(INTERNAL_HEADER) !== INTERNAL_TOKEN) {
    notFound();
  }

  const resolvedParams = await params;
  const page = await getPageBySlug(resolvedParams.slug);

  if (!page || !['html', 'markdown'].includes(page.type)) {
    notFound();
  }

  const content = <PublicPageRenderer type={page.type} content={page.content} />;
  return (
    <div className='container mx-auto px-4 py-6'>
      {content}
    </div>
  );
}
