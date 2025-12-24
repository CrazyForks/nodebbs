'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import CopyButton from '@/components/common/CopyButton';
import {
  Heart,
  MoreHorizontal,
  Loader2,
  Flag,
  Trash2,
  Reply,
  AlertCircle,
  Clock,
  Coins,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/user/UserAvatar';
import ReportDialog from '@/components/common/ReportDialog';
import { RewardDialog } from '@/extensions/rewards/components/RewardDialog';
import { useAuth } from '@/contexts/AuthContext';
import { postApi, rewardsApi } from '@/lib/api';
import { toast } from 'sonner';
import MarkdownRender from '../common/MarkdownRender';

import { RewardListDialog } from '@/extensions/rewards/components/RewardListDialog';
import Time from '../common/Time';

export default function ReplyItem({ reply, topicId, onDeleted, onReplyAdded, isRewardEnabled, rewardStats, onRewardSuccess }) {
  const { user, isAuthenticated, openLoginDialog } = useAuth();
  const [likingPostIds, setLikingPostIds] = useState(new Set());
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [replyToContent, setReplyToContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [rewardListOpen, setRewardListOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const [reportTarget, setReportTarget] = useState({
    type: '',
    id: 0,
    title: '',
  });

  // 本地状态
  const [localReply, setLocalReply] = useState(reply);
  const [localRewardStats, setLocalRewardStats] = useState(rewardStats || { totalCount: 0, totalAmount: 0 });

  // 同步 props 到本地状态
  useEffect(() => {
    setLocalRewardStats(rewardStats || { totalCount: 0, totalAmount: 0 });
  }, [rewardStats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // 检查审核状态
  const isPending = localReply.approvalStatus === 'pending';
  const isRejected = localReply.approvalStatus === 'rejected';
  const isOwnReply = user?.id === localReply.userId;
  const canInteract = !isPending && !isRejected; // 只有已批准的回复可以点赞和回复

  // 切换点赞状态
  const handleTogglePostLike = async (postId, isLiked) => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    if (likingPostIds.has(postId)) {
      return;
    }

    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      if (isLiked) {
        await postApi.unlike(postId);
      } else {
        await postApi.like(postId);
      }

      setLocalReply((prev) => ({
        ...prev,
        isLiked: !isLiked,
        likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));

      toast.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (err) {
      console.error('点赞操作失败:', err);
      toast.error(err.message || '操作失败');
    } finally {
      setLikingPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // 删除回复
  const handleDeletePost = async (postId, postNumber) => {
    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    if (postNumber === 1) {
      toast.error('不能删除话题内容，请删除整个话题');
      return;
    }

    if (!confirm('确定要删除这条回复吗？此操作不可恢复。')) {
      return;
    }

    setDeletingPostId(postId);

    try {
      await postApi.delete(postId);
      toast.success('回复已删除');
      onDeleted?.(postId);
    } catch (err) {
      console.error('删除回复失败:', err);
      toast.error(err.message || '删除失败');
    } finally {
      setDeletingPostId(null);
    }
  };

  // 提交回复到回复
  const handleSubmitReplyToPost = async (replyToPostId) => {
    if (!replyToContent.trim()) {
      toast.error('请输入回复内容');
      return;
    }

    if (!isAuthenticated) {
      openLoginDialog();
      return;
    }

    setSubmitting(true);

    try {
      const response = await postApi.create({
        topicId: topicId,
        content: replyToContent,
        replyToPostId: replyToPostId,
      });

      if (response.requiresApproval) {
        toast.success(
          response.message || '您的回复已提交，等待审核后将公开显示'
        );
      } else {
        toast.success(response.message || '回复成功！');

        // 如果返回了新帖子数据且有回调，立即添加到列表
        if (response.post && onReplyAdded) {
          const newPost = {
            id: response.post.id,
            content: replyToContent,
            userId: user.id,
            userName: user.name,
            username: user.username,
            userUsername: user.username,
            userAvatar: user.avatar,
            topicId: topicId,
            replyToPostId: replyToPostId,
            replyToPost: {
              postNumber: localReply.postNumber,
              userName: localReply.userName,
              userUsername: localReply.userUsername,
            },
            postNumber: response.post.postNumber || 0,
            likeCount: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            editCount: 0,
            ...response.post,
          };
          onReplyAdded(newPost);
        }
      }

      setReplyToContent('');
      setReplyingToPostId(null);
    } catch (err) {
      console.error('发布回复失败:', err);
      toast.error('发布回复失败：' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        id={`post-${localReply.id}`}
        className={`bg-card border rounded-lg hover:border-border/80 transition-all duration-300 group ${
          isPending
            ? 'border-chart-5/30 bg-chart-5/5'
            : isRejected
            ? 'border-destructive/30 bg-destructive/5'
            : localReply.userRole === 'admin'
            ? 'border-border'
            : 'border-border'
        }`}
        data-post-number={localReply.postNumber}
      >
        <div className='p-4 sm:p-5'>
          {/* 头部信息区 */}
          <div className='flex items-start justify-between gap-4 mb-4'>
            <div className='flex items-start gap-3'>
              {/* 头像 */}
              <Link href={`/users/${localReply.username}`} prefetch={false} className="shrink-0 mt-0.5">
                <UserAvatar
                  url={localReply.userAvatar}
                  name={localReply.userName}
                  size='sm'
                  className='h-9 w-9 ring-1 ring-border/50 group-hover:ring-primary/20 transition-all'
                  frameMetadata={localReply.userAvatarFrame?.itemMetadata}
                />
              </Link>

              <div className='flex flex-col gap-0.5 min-w-0'>
                {/* 第一行：用户名 */}
                <div className='flex items-center gap-2 text-sm'>
                  <Link
                    href={`/users/${localReply.username}`}
                    prefetch={false}
                    className='font-medium text-foreground hover:underline decoration-primary/50 underline-offset-4 truncate'
                  >
                    {localReply.userName || localReply.userUsername}
                  </Link>
                </div>

                {/* 第二行：时间与徽章 */}
                <div className='flex items-center gap-2 text-xs text-muted-foreground/70 flex-wrap leading-none'>
                  <Time date={localReply.createdAt} fromNow />
                  
                  {/* 角色标识 */}
                  {localReply.topicUserId === localReply.userId && (
                    <Badge variant="secondary" className="px-1.5 h-4 text-[10px] font-normal bg-primary/10 text-primary hover:bg-primary/20 border-0 rounded">
                      楼主
                    </Badge>
                  )}
                  
                  {localReply.userRole === 'admin' && (
                     <Badge variant="secondary" className="px-1.5 h-4 text-[10px] font-normal bg-chart-1/10 text-chart-1 hover:bg-chart-1/20 border-0 rounded">
                      管理员
                    </Badge>
                  )}

                  {/* 状态标识 */}
                  {isPending && (
                    <Badge variant="outline" className="px-1.5 h-4 text-[10px] font-normal text-chart-5 border-chart-5/30 gap-1 rounded">
                      <Clock className='h-2.5 w-2.5' /> 审核中
                    </Badge>
                  )}

                  {isRejected && (
                    <Badge variant="outline" className="px-1.5 h-4 text-[10px] font-normal text-destructive border-destructive/30 gap-1 rounded">
                      <AlertCircle className='h-2.5 w-2.5' /> 已拒绝
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 右上角操作区：楼层号 */}
            <div className="flex items-center">
              {/* 楼层号 (带复制功能) - 放大显示 */}
              <CopyButton 
                value={`${origin}/topic/${topicId}#post-${localReply.id}`}
                className="h-8 px-2 text-xs sm:text-base font-bold text-muted-foreground/30 hover:text-primary hover:cursor-pointer font-mono hover:bg-transparent transition-colors"
                variant="ghost"
                onCopy={() => toast.success('链接已复制')}
              >
                 {({ copied }) => (
                  <>
                    <span className="sr-only">复制链接</span>
                    {copied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <>#{localReply.postNumber}</>
                    )}
                  </>
                )}
              </CopyButton>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="pl-0 sm:pl-[52px]">
            {/* 引用/回复目标 */}
            {localReply.replyToPostId && localReply.replyToPost && (
              <div className='mb-3 text-xs text-muted-foreground/60 flex items-center gap-1.5 bg-muted/30 px-3 py-2 rounded-md border border-border/50 w-fit max-w-full'>
                <Reply className='h-3 w-3 shrink-0 opacity-70' />
                <span className="shrink-0">回复</span>
                <Link
                  href={`/topic/${topicId}#post-${localReply.replyToPost.id}`}
                  prefetch={false}
                  className="hover:text-primary transition-colors font-mono"
                >
                  #{localReply.replyToPost.postNumber}
                </Link>
                <span className="truncate max-w-[150px] sm:max-w-xs">
                  {localReply.replyToPost.userName || localReply.replyToPost.userUsername}
                </span>
              </div>
            )}

            {/* Markdown 内容 */}
            <div className='max-w-none prose prose-stone dark:prose-invert prose-sm sm:prose-base break-words'>
              <MarkdownRender content={localReply.content} />
            </div>

            {/* 底部操作栏 */}
            <div className='flex items-center justify-end gap-2 mt-4 pt-3 border-t border-dashed border-border/60'>
              {/* 回复按钮 */}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  if (!isAuthenticated) {
                    openLoginDialog();
                    return;
                  }
                  if (!canInteract) {
                    toast.error('此回复暂时无法回复');
                    return;
                  }
                  setReplyingToPostId(localReply.id);
                  setReplyToContent('');
                }}
                disabled={!canInteract}
                className='h-8 px-3 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 gap-1.5'
                title={canInteract ? '回复' : '此回复暂时无法回复'}
              >
                <Reply className='h-4 w-4' />
                <span className="text-xs">回复</span>
              </Button>

              {/* 点赞按钮 */}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  if (!canInteract) {
                    toast.error('此回复暂时无法点赞');
                    return;
                  }
                  handleTogglePostLike(localReply.id, localReply.isLiked);
                }}
                disabled={
                  !canInteract ||
                  likingPostIds.has(localReply.id) ||
                  !isAuthenticated
                }
                className={`h-8 min-w-[3rem] px-3 gap-1.5 ${
                  localReply.isLiked
                    ? 'text-destructive hover:text-destructive/80 bg-destructive/5'
                    : 'text-muted-foreground/70 hover:text-destructive hover:bg-destructive/5'
                }`}
              >
                {likingPostIds.has(localReply.id) ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <Heart
                      className={`h-4 w-4 ${
                        localReply.isLiked ? 'fill-current' : ''
                      }`}
                    />
                    <span className='text-xs'>
                      {localReply.likeCount > 0 ? localReply.likeCount : '点赞'}
                    </span>
                  </>
                )}
              </Button>

              {/* 打赏按钮 */}
              {(isRewardEnabled && !isOwnReply && canInteract) && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    if (!isAuthenticated) {
                      openLoginDialog();
                      return;
                    }
                    setRewardDialogOpen(true);
                  }}
                  className='h-8 min-w-[3rem] px-3 text-muted-foreground/70 hover:text-yellow-600 hover:bg-yellow-500/10 gap-1.5'
                  title='打赏'
                >
                  <Coins className='h-4 w-4' />
                  <span className='text-xs'>
                    {localRewardStats.totalAmount > 0 ? localRewardStats.totalAmount : '打赏'}
                  </span>
                </Button>
              )}
              
              {/* 作者查看打赏记录按钮 */}
              {(isRewardEnabled && isOwnReply && localRewardStats.totalCount > 0) && (
                 <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setRewardListOpen(true)}
                  className='h-8 px-3 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 gap-1.5'
                  title='查看打赏记录'
                 >
                   <Coins className='h-4 w-4' />
                   <span className='text-xs'>
                     {localRewardStats.totalAmount}
                   </span>
                 </Button>
              )}

              {/* 更多操作 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 rounded-md'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                    <span className="sr-only">更多操作</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className="w-48">
                  {/* 删除选项 */}
                  {isAuthenticated &&
                    (user?.id === localReply.userId ||
                      ['moderator', 'admin'].includes(user?.role)) && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeletePost(
                              localReply.id,
                              localReply.postNumber
                            )
                          }
                          disabled={deletingPostId === localReply.id}
                          className='text-destructive focus:text-destructive cursor-pointer'
                        >
                          {deletingPostId === localReply.id ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              删除中...
                            </>
                          ) : (
                            <>
                              <Trash2 className='h-4 w-4 mr-2' />
                              删除回复
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                  <DropdownMenuItem
                    onClick={() => {
                      setReportTarget({
                        type: 'post',
                        id: localReply.id,
                        title: `回复 #${localReply.postNumber}`,
                      });
                      setReportDialogOpen(true);
                    }}
                    disabled={!isAuthenticated}
                    className="cursor-pointer"
                  >
                    <Flag className='h-4 w-4 mr-2' />
                    举报回复
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* 楼中楼回复输入框 */}
        {replyingToPostId === localReply.id && (
          <div className='px-4 sm:px-6 pb-5 pt-0 opacity-100 transition-all'>
            <div className='bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50'>
              <div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
                <span className="flex items-center gap-1">
                  <Reply className="h-3 w-3" />
                  回复 <span className="font-medium text-foreground">@{localReply.userName || localReply.userUsername}</span>
                </span>
              </div>
              <Textarea
                className='w-full min-h-[80px] resize-y text-sm bg-background/50 focus:bg-background transition-colors'
                placeholder='写下你的回复...'
                value={replyToContent}
                onChange={(e) => setReplyToContent(e.target.value)}
                disabled={submitting}
                autoFocus
              />
              <div className='flex items-center justify-end gap-2 mt-3'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setReplyingToPostId(null);
                    setReplyToContent('');
                  }}
                  disabled={submitting}
                  className="h-8"
                >
                  取消
                </Button>
                <Button
                  size='sm'
                  onClick={() => handleSubmitReplyToPost(localReply.id)}
                  disabled={submitting || !replyToContent.trim()}
                  className="h-8"
                >
                  {submitting ? (
                    <>
                      <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
                      提交中...
                    </>
                  ) : (
                    '发表回复'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 举报对话框 */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        reportType={reportTarget.type}
        targetId={reportTarget.id}
        targetTitle={reportTarget.title}
      />

      {/* 打赏对话框 */}
      <RewardDialog
        open={rewardDialogOpen}
        onOpenChange={setRewardDialogOpen}
        postId={localReply.id}
        postAuthor={localReply.userName || localReply.userUsername}
        onSuccess={(amount) => {
          // 局部更新打赏统计，无需重新调用批量接口
          setLocalRewardStats(prev => ({
            totalCount: (prev.totalCount || 0) + 1,
            totalAmount: (prev.totalAmount || 0) + amount
          }));
          onRewardSuccess?.(localReply.id, amount);
        }}
        onViewHistory={() => {
          setRewardDialogOpen(false);
          setRewardListOpen(true);
        }}
      />
      
      {/* 打赏记录对话框 */}
      <RewardListDialog
        open={rewardListOpen}
        onOpenChange={setRewardListOpen}
        postId={localReply.id}
      />
    </>
  );
}
