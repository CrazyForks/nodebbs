'use client';

import MarkdownRender from '@/components/common/MarkdownRender';

export default function PublicPageRenderer({ type, content }) {
  if (type === 'html') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <article className='max-w-none prose prose-stone dark:prose-invert break-all'>
      <MarkdownRender content={content} />
    </article>
  );
}
