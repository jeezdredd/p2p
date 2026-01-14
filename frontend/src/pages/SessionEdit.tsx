import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { sessionsApi, subjectsApi, usersApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/authStore'
import type { Subject, User } from '@/types'

const sessionSchema = z.object({
  student: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().optional(),
  notes: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

export default function SessionEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const isTutor = user?.role === 'tutor'

  const { data: session, isLoading } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => sessionsApi.get(parseInt(id!)),
    enabled: !!id,
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => usersApi.list({ role: 'student' }),
    enabled: isTutor,
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => sessionsApi.update(parseInt(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      toast({ title: 'Session updated successfully' })
      navigate('/sessions')
    },
    onError: (error: any) => {
      console.error('Session update error:', error.response?.data)
      const errorMsg = error?.response?.data?.detail || 
                       JSON.stringify(error?.response?.data) ||
                       'Failed to update session'
      toast({ 
        title: 'Failed to update session', 
        description: errorMsg,
        variant: 'destructive' 
      })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  })

  useEffect(() => {
    if (session?.data) {
      const sessionData = session.data
      setValue('subject', sessionData.subject.toString())
      setValue('title', sessionData.title)
      setValue('date', sessionData.date)
      setValue('time', sessionData.time)
      setValue('duration', sessionData.duration.toString())
      setValue('notes', sessionData.notes || '')
      if (sessionData.student) {
        setValue('student', sessionData.student.toString())
      }
    }
  }, [session, setValue])

  const onSubmit = (data: SessionFormData) => {
    const payload: any = {
      subject: parseInt(data.subject),
      title: data.title,
      date: data.date,
      time: data.time,
      duration: data.duration ? parseInt(data.duration) : 60,
      notes: data.notes || '',
    }

    // Only tutor can change student
    if (isTutor && data.student && data.student !== 'none') {
      payload.student = parseInt(data.student)
    }

    console.log('Updating session:', payload)
    updateMutation.mutate(payload)
  }

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const studentsList: User[] = students?.data?.results || students?.data || []
  const sessionData = session?.data

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            Loading...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            Session not found
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Tutoring Session</CardTitle>
          <CardDescription>
            Update session details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isTutor && (
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select 
                  defaultValue={sessionData.student?.toString() || 'none'}
                  onValueChange={(value) => setValue('student', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No student (open session)</SelectItem>
                    {studentsList.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.first_name} {student.last_name} ({student.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                defaultValue={sessionData.subject.toString()}
                onValueChange={(value) => setValue('subject', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjectsList.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Math Homework Help"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" {...register('time')} />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                defaultValue={sessionData.duration.toString()}
                onValueChange={(value) => setValue('duration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or special instructions..."
                {...register('notes')}
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sessions')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Session'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
