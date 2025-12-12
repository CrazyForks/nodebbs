import { notFound } from 'next/navigation';
import TopicPageClient from '@/components/topic/TopicPageClient';
import { getTopicData, getPostsData, getTopicRewardData } from '@/lib/server/topics';

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

  // 优化：先获取话题数据（利用 Next.js 自动去重与 generateMetadata 的请求）
  const topic = await getTopicData(id);

  // 话题不存在，立即返回 404，避免浪费 posts 请求
  if (!topic) {
    notFound();
  }

  // 话题存在后，再获取回复数据
  const postsData = await getPostsData(id, currentPage, LIMIT);

  const posts = postsData.items || [];
  const totalPosts = postsData.total || 0;
  const totalPages = Math.ceil(totalPosts / LIMIT);

  // 获取积分系统状态和打赏数据 (服务端封装)
  const { isRewardEnabled, initialRewardStats } = await getTopicRewardData(topic, posts);

  return (
    <TopicPageClient
      topic={topic}
      initialPosts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
      currentPage={currentPage}
      limit={LIMIT}
      initialRewardStats={initialRewardStats}
      initialIsRewardEnabled={isRewardEnabled}
    />
  );
}
