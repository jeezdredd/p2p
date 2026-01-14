import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { materialsApi, sessionsApi, forumApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, MessageSquare, Plus, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Hub</h1>
        <p className="text-muted-foreground">
          Welcome to your collaborative learning dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials?.data?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Total materials shared</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions?.data?.results?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Sessions scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discussions?.data?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Active discussions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{material.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.subject_detail?.name} - {material.author?.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No materials yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
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
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), 'MMM d, yyyy')} at {session.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
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
            <div className="space-y-4">
              {recentDiscussions.map((discussion: any) => (
                <Link
                  key={discussion.id}
                  to={`/forum/${discussion.id}`}
                  className="flex items-start gap-4 p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{discussion.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {discussion.reply_count} replies - by {discussion.author?.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No discussions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
