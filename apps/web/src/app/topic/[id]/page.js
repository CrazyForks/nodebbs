import { notFound } from 'next/navigation';
import TopicPageClient from '@/components/topic/TopicPageClient';
import { getTopicData, getPostsData } from '@/lib/server/topics';

// 生成页面元数据（SEO优化）
export async function generateMetadata({ params }) {
  const { id } = await params;
  const topic = await getTopicData(id);

  if (!topic) {
    return {
      title: '话题不存在',
    };
  }

  // 提取纯文本内容作为描述（去除Markdown标记）
  const description =
    topic.content?.replace(/[#*`\[\]]/g, '').substring(0, 160) || '';

  return {
    title: `${topic.title} - 话题详情`,
    description,
    openGraph: {
      title: topic.title,
      description,
      type: 'article',
      publishedTime: topic.createdAt,
      modifiedTime: topic.updatedAt,
      authors: [topic.userName || topic.username],
    },
  };
}

// 主页面组件（服务端组件）
export default async function TopicDetailPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.p) || 1;
  const LIMIT = 20;

  // 并行获取话题和回复数据
  const [topic, postsData] = await Promise.all([
    getTopicData(id),
    getPostsData(id, currentPage, LIMIT),
  ]);

  // 话题不存在
  if (!topic) {
    notFound();
  }

  const posts = postsData.items || [];
  const totalPosts = postsData.total || 0;
  const totalPages = Math.ceil(totalPosts / LIMIT);

  return (
    <TopicPageClient
      topic={topic}
      initialPosts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
      currentPage={currentPage}
      limit={LIMIT}
    />
  );
}
