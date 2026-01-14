import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  MessageSquare,
  Plus,
} from 'lucide-react'

import { materialsApi, sessionsApi, forumApi } from '@/services/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Page } from '@/components/ui/page'
import { HoverCard, Item, Stagger } from '@/components/ui/ui'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { data: materials } = useQuery({
    queryKey: ['materials', 'recent'],
    queryFn: () => materialsApi.list(),
  })

  const { data: upcomingSessions } = useQuery({
    queryKey: ['sessions', 'upcoming'],
    queryFn: () => sessionsApi.upcoming(),
  })

  const { data: discussions } = useQuery({
    queryKey: ['discussions', 'recent'],
    queryFn: () => forumApi.list(),
  })

  const recentMaterials = materials?.data?.results?.slice(0, 3) || []
  const recentSessions = upcomingSessions?.data?.results?.slice(0, 3) || []
  const recentDiscussions = discussions?.data?.results?.slice(0, 3) || []

  return (
    <Page>
      <div className="relative overflow-hidden rounded-3xl border bg-background p-6">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
          <p className="text-muted-foreground">
            Welcome to your collaborative learning dashboard
          </p>
        </div>
      </div>

      <Stagger>
        <div className="grid gap-4 md:grid-cols-3">
          <Item>
            <HoverCard className="h-full">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Study Materials
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {materials?.data?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total materials shared
                  </p>
                </CardContent>
              </Card>
            </HoverCard>
          </Item>

          <Item>
            <HoverCard className="h-full">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Sessions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {upcomingSessions?.data?.results?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sessions scheduled
                  </p>
                </CardContent>
              </Card>
            </HoverCard>
          </Item>

          <Item>
            <HoverCard className="h-full">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Discussions
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {discussions?.data?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active discussions
                  </p>
                </CardContent>
              </Card>
            </HoverCard>
          </Item>
        </div>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">
        <Item>
          <HoverCard>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Materials</CardTitle>
                    <CardDescription>Latest study resources</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/materials">
                      View all <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentMaterials.length > 0 ? (
                  <div className="space-y-4">
                    {recentMaterials.map((material: any) => (
                      <div key={material.id} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.subject_detail?.name} -{' '}
                            {material.author?.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-muted-foreground">
                    No materials yet
                  </p>
                )}
              </CardContent>
            </Card>
          </HoverCard>
        </Item>

        <Item>
          <HoverCard>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Sessions</CardTitle>
                    <CardDescription>Your scheduled tutoring</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/sessions/new">
                      <Plus className="mr-2 h-4 w-4" /> Schedule
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session: any) => (
                      <div key={session.id} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.date), 'MMM d, yyyy')} at{' '}
                            {session.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-muted-foreground">
                    No upcoming sessions
                  </p>
                )}
              </CardContent>
            </Card>
          </HoverCard>
        </Item>
      </div>

      <Item>
        <HoverCard>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Discussions</CardTitle>
                  <CardDescription>Join the conversation</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/forum">
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentDiscussions.length > 0 ? (
                <div className="space-y-2">
                  {recentDiscussions.map((discussion: any) => (
                    <Link
                      key={discussion.id}
                      to={`/forum/${discussion.id}`}
                      className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{discussion.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {discussion.reply_count} replies - by{' '}
                          {discussion.author?.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No discussions yet
                </p>
              )}
            </CardContent>
          </Card>
        </HoverCard>
      </Item>
    </Page>
  )
}

