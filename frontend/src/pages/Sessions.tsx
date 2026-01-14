import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { sessionsApi, subjectsApi, usersApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import type { TutoringSession, Subject, User as UserType } from '@/types'

export default function Sessions() {
  const [filterSubject, setFilterSubject] = useState<string>('')
  const [filterTutor, setFilterTutor] = useState<string>('')

  const { data: upcomingSessions, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['sessions', 'upcoming', filterSubject, filterTutor],
    queryFn: () =>
      sessionsApi.upcoming({
        ...(filterSubject ? { subject: parseInt(filterSubject) } : {}),
        ...(filterTutor ? { tutor: parseInt(filterTutor) } : {}),
      }),
  })

  const { data: completedSessions, isLoading: loadingCompleted } = useQuery({
    queryKey: ['sessions', 'completed', filterSubject, filterTutor],
    queryFn: () =>
      sessionsApi.completed({
        ...(filterSubject ? { subject: parseInt(filterSubject) } : {}),
        ...(filterTutor ? { tutor: parseInt(filterTutor) } : {}),
      }),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const { data: tutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => usersApi.tutors(),
  })

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const tutorsList: UserType[] = tutors?.data?.results || tutors?.data || []
  const upcomingList: TutoringSession[] = upcomingSessions?.data?.results || upcomingSessions?.data || []
  const completedList: TutoringSession[] = completedSessions?.data?.results || completedSessions?.data || []

  const SessionCard = ({ session }: { session: TutoringSession }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{session.title}</CardTitle>
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
        <div className="pt-2">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
            {session.subject_detail?.name}
          </span>
          <span
            className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              session.status === 'scheduled'
                ? 'bg-blue-100 text-blue-800'
                : session.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {session.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )

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
            <SelectItem value="">All subjects</SelectItem>
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
            <SelectItem value="">All tutors</SelectItem>
            {tutorsList.map((tutor) => (
              <SelectItem key={tutor.id} value={tutor.id.toString()}>
                {tutor.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingList.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedList.length})
          </TabsTrigger>
        </TabsList>

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
