import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { sessionsApi, subjectsApi, usersApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, Star, Edit, CheckCheck } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import type { TutoringSession, Subject, User as UserType } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'

export default function Sessions() {
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterTutor, setFilterTutor] = useState<string>('all')
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: upcomingSessions, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['sessions', 'upcoming', filterSubject, filterTutor],
    queryFn: () =>
      sessionsApi.upcoming({
        ...(filterSubject && filterSubject !== 'all' ? { subject: parseInt(filterSubject) } : {}),
        ...(filterTutor && filterTutor !== 'all' ? { tutor: parseInt(filterTutor) } : {}),
      }),
  })

  const { data: completedSessions, isLoading: loadingCompleted } = useQuery({
    queryKey: ['sessions', 'completed', filterSubject, filterTutor],
    queryFn: () =>
      sessionsApi.completed({
        ...(filterSubject && filterSubject !== 'all' ? { subject: parseInt(filterSubject) } : {}),
        ...(filterTutor && filterTutor !== 'all' ? { tutor: parseInt(filterTutor) } : {}),
      }),
  })

  const { data: mySessions, isLoading: loadingMy } = useQuery({
    queryKey: ['sessions', 'my'],
    queryFn: () => sessionsApi.my(),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const { data: tutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => usersApi.tutors(),
  })

  const confirmMutation = useMutation({
    mutationFn: (sessionId: number) => sessionsApi.confirm(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast({
        title: 'Session confirmed',
        description: 'The tutoring session has been confirmed.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to confirm session.',
        variant: 'destructive',
      })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: number; reason?: string }) =>
      sessionsApi.cancel(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast({
        title: 'Session cancelled',
        description: 'The tutoring session has been cancelled.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel session.',
        variant: 'destructive',
      })
    },
  })

  const completeMutation = useMutation({
    mutationFn: (sessionId: number) =>
      sessionsApi.update(sessionId, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast({
        title: 'Session completed',
        description: 'The session has been marked as completed.',
      })
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.detail || 
                       error?.response?.data?.status?.[0] ||
                       'Failed to complete session.'
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      })
    },
  })

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const tutorsList: UserType[] = tutors?.data?.results || tutors?.data || []
  const upcomingList: TutoringSession[] = upcomingSessions?.data?.results || upcomingSessions?.data || []
  const completedList: TutoringSession[] = completedSessions?.data?.results || completedSessions?.data || []
  const myList: TutoringSession[] = mySessions?.data?.results || mySessions?.data || []

  const getStatusBadge = (session: TutoringSession) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={variants[session.status] || ''}>
        {session.status}
      </Badge>
    )
  }

  const SessionCard = ({ session, showActions = false }: { session: TutoringSession; showActions?: boolean }) => {
    const isMySession = user && (session.tutor === user.id || session.student === user.id)
    const isTutor = user && session.tutor === user.id
    const canConfirm = isTutor && session.status === 'pending' && !session.is_confirmed
    const canCancel = isMySession && ['pending', 'scheduled'].includes(session.status)
    const canComplete = isMySession && session.status === 'scheduled'
    const canEdit = isMySession && ['pending', 'scheduled'].includes(session.status)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-start justify-between">
            <span>{session.title}</span>
            {session.is_confirmed && session.status === 'scheduled' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(session.date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{session.time} ({session.duration} min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Tutor: {session.tutor_detail?.username}</span>
          </div>
          {session.student_detail && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Student: {session.student_detail.username}</span>
            </div>
          )}
          <div className="pt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{session.subject_detail?.name}</Badge>
            {getStatusBadge(session)}
            {session.review && (
              <Badge className="bg-amber-100 text-amber-800">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {session.review.rating}/5
              </Badge>
            )}
          </div>
          {showActions && (
            <div className="pt-3 flex flex-wrap gap-2">
              {canConfirm && (
                <Button
                  size="sm"
                  onClick={() => confirmMutation.mutate(session.id)}
                  disabled={confirmMutation.isPending}
                  className="flex-1 min-w-[100px]"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              )}
              {canComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => completeMutation.mutate(session.id)}
                  disabled={completeMutation.isPending}
                  className="flex-1 min-w-[100px]"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="flex-1 min-w-[100px]"
                >
                  <Link to={`/sessions/${session.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              )}
              {canCancel && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cancelMutation.mutate({ sessionId: session.id })}
                  disabled={cancelMutation.isPending}
                  className="flex-1 min-w-[100px]"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tutoring Sessions</h1>
          <p className="text-muted-foreground">Manage your tutoring schedule</p>
        </div>
        <Button asChild>
          <Link to="/sessions/new">
            <Plus className="mr-2 h-4 w-4" /> Schedule Session
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
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
        <Select value={filterTutor} onValueChange={setFilterTutor}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tutor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tutors</SelectItem>
            {tutorsList.map((tutor) => (
              <SelectItem key={tutor.id} value={tutor.id.toString()}>
                {tutor.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="my">
        <TabsList>
          <TabsTrigger value="my">
            My Sessions ({myList.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            All Upcoming ({upcomingList.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="mt-4">
          {loadingMy ? (
            <div className="text-center py-8">Loading...</div>
          ) : myList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sessions found</p>
                <Button asChild className="mt-4">
                  <Link to="/sessions/new">Schedule a Session</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myList.map((session) => (
                <SessionCard key={session.id} session={session} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          {loadingUpcoming ? (
            <div className="text-center py-8">Loading...</div>
          ) : upcomingList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming sessions</p>
                <Button asChild className="mt-4">
                  <Link to="/sessions/new">Schedule a Session</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingList.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {loadingCompleted ? (
            <div className="text-center py-8">Loading...</div>
          ) : completedList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed sessions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedList.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
