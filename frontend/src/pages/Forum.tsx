import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forumApi, subjectsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toaster'
import { MessageSquare, Plus, X, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Discussion, Subject } from '@/types'

const discussionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  subject: z.string().optional(),
})

type DiscussionFormData = z.infer<typeof discussionSchema>

export default function Forum() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['discussions', filterSubject, searchQuery],
    queryFn: () =>
      forumApi.list({
        ...(filterSubject && filterSubject !== 'all' ? { subject: parseInt(filterSubject) } : {}),
        ...(searchQuery ? { search: searchQuery } : {}),
      }),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; subject?: number }) =>
      forumApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast({ title: 'Discussion created successfully' })
      setShowForm(false)
      reset()
    },
    onError: () => {
      toast({ title: 'Failed to create discussion', variant: 'destructive' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DiscussionFormData>({
    resolver: zodResolver(discussionSchema),
  })

  const onSubmit = (data: DiscussionFormData) => {
    createMutation.mutate({
      title: data.title,
      content: data.content,
      ...(data.subject ? { subject: parseInt(data.subject) } : {}),
    })
  }

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const discussionsList: Discussion[] = discussions?.data?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussion Forum</h1>
          <p className="text-muted-foreground">Ask questions and share knowledge</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Discussion'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What's your question?"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Provide more details..."
                  rows={5}
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Select onValueChange={(value) => setValue('subject', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsList.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Post Discussion'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjectsList.map((subject) => (
              <SelectItem key={subject.id} value={subject.id.toString()}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading discussions...</div>
      ) : discussionsList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No discussions found</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              Start a Discussion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussionsList.map((discussion) => (
            <Link key={discussion.id} to={`/forum/${discussion.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-medium">
                        {discussion.author?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{discussion.title}</h3>
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
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{discussion.reply_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
