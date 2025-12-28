'use client';

import TopicSidebar from './TopicSidebar';
import { useTopicSidebar } from '@/hooks/topic/useTopicSidebar';

export default function TopicSidebarWrapper() {
  const {
    topic,
    user,
    isAuthenticated,
    isBookmarked,
    bookmarkLoading,
    handleToggleBookmark,
    isSubscribed,
    subscribeLoading,
    handleToggleSubscribe,
    handleToggleTopicStatus,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editLoading,
    handleEditTopic,
    reportDialogOpen,
    setReportDialogOpen,
    canCloseOrPinTopic,
    isTopicOwner,
  } = useTopicSidebar();

  return (
    <TopicSidebar
      topic={topic}
      isBookmarked={isBookmarked}
      bookmarkLoading={bookmarkLoading}
      onToggleBookmark={handleToggleBookmark}
      isSubscribed={isSubscribed}
      subscribeLoading={subscribeLoading}
      onToggleSubscribe={handleToggleSubscribe}
      onToggleTopicStatus={handleToggleTopicStatus}
      isEditDialogOpen={isEditDialogOpen}
      setIsEditDialogOpen={setIsEditDialogOpen}
      onEditTopic={handleEditTopic}
      editLoading={editLoading}
      isAuthenticated={isAuthenticated}
      user={user}
      reportDialogOpen={reportDialogOpen}
      setReportDialogOpen={setReportDialogOpen}
      canCloseOrPinTopic={canCloseOrPinTopic}
      isTopicOwner={isTopicOwner}
    />
  );
}
