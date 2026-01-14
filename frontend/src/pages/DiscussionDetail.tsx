import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forumApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toaster'
import { ArrowLeft, MessageSquare, Reply as ReplyIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Discussion, Reply } from '@/types'

const replySchema = z.object({
  content: z.string().min(1, 'Reply cannot be empty'),
})

type ReplyFormData = z.infer<typeof replySchema>

function ReplyComponent({
  reply,
  discussionId,
  depth = 0,
}: {
  reply: Reply
  discussionId: number
  depth?: number
}) {
  const queryClient = useQueryClient()
  const [showReplyForm, setShowReplyForm] = useState(false)

  const replyMutation = useMutation({
    mutationFn: (data: { content: string; parent: number }) =>
      forumApi.addReply(discussionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] })
      toast({ title: 'Reply added' })
      setShowReplyForm(false)
      reset()
    },
    onError: () => {
      toast({ title: 'Failed to add reply', variant: 'destructive' })
    },
  })

  const { register, handleSubmit, reset } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
  })

  const onSubmit = (data: ReplyFormData) => {
    replyMutation.mutate({ content: data.content, parent: reply.id })
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary text-sm font-medium">
              {reply.author?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{reply.author?.username}</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{reply.content}</p>
            {depth < 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <ReplyIcon className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
            {showReplyForm && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  rows={2}
                  {...register('content')}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={replyMutation.isPending}>
                    {replyMutation.isPending ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {reply.children?.map((child) => (
        <ReplyComponent
          key={child.id}
          reply={child}
          discussionId={discussionId}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

export default function DiscussionDetail() {
  const { id } = useParams<{ id: string }>()
  const discussionId = parseInt(id!)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: () => forumApi.get(discussionId),
  })

  const replyMutation = useMutation({
    mutationFn: (data: { content: string }) => forumApi.addReply(discussionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] })
      toast({ title: 'Reply added' })
      reset()
    },
    onError: () => {
      toast({ title: 'Failed to add reply', variant: 'destructive' })
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
  })

  const onSubmit = (data: ReplyFormData) => {
    replyMutation.mutate(data)
  }

  const discussion: Discussion | undefined = data?.data

  if (isLoading) {
    return <div className="text-center py-8">Loading discussion...</div>
  }

  if (!discussion) {
    return (
      <div className="text-center py-8">
        <p>Discussion not found</p>
        <Button asChild className="mt-4">
          <Link to="/forum">Back to Forum</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="mb-4">
        <Link to="/forum">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-lg font-medium">
                {discussion.author?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{discussion.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{discussion.author?.username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(discussion.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {discussion.subject_detail && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                      {discussion.subject_detail.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{discussion.content}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Replies ({discussion.replies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            <Textarea
              placeholder="Write a reply..."
              rows={3}
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <Button type="submit" disabled={replyMutation.isPending}>
              {replyMutation.isPending ? 'Posting...' : 'Post Reply'}
            </Button>
          </form>

          <div className="divide-y">
            {discussion.replies?.map((reply) => (
              <ReplyComponent
                key={reply.id}
                reply={reply}
                discussionId={discussionId}
              />
            ))}
            {(!discussion.replies || discussion.replies.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                No replies yet. Be the first to respond!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
