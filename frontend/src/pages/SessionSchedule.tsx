import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { sessionsApi, subjectsApi, usersApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toaster'
import type { Subject, User } from '@/types'

const sessionSchema = z.object({
  tutor: z.string().min(1, 'Tutor is required'),
  subject: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

export default function SessionSchedule() {
  const navigate = useNavigate()

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const { data: tutors } = useQuery({
    queryKey: ['tutors'],
    queryFn: () => usersApi.tutors(),
  })

  const createMutation = useMutation({
    mutationFn: (data: {
      tutor: number
      subject: number
      title: string
      date: string
      time: string
      duration?: number
    }) => sessionsApi.create(data),
    onSuccess: () => {
      toast({ title: 'Session scheduled successfully' })
      navigate('/sessions')
    },
    onError: () => {
      toast({ title: 'Failed to schedule session', variant: 'destructive' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      duration: '60',
    },
  })

  const onSubmit = (data: SessionFormData) => {
    createMutation.mutate({
      tutor: parseInt(data.tutor),
      subject: parseInt(data.subject),
      title: data.title,
      date: data.date,
      time: data.time,
      duration: data.duration ? parseInt(data.duration) : 60,
    })
  }

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const tutorsList: User[] = tutors?.data?.results || tutors?.data || []

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Tutoring Session</CardTitle>
          <CardDescription>
            Book a session with a tutor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tutor">Tutor *</Label>
              <Select onValueChange={(value) => setValue('tutor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tutor" />
                </SelectTrigger>
                <SelectContent>
                  {tutorsList.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id.toString()}>
                      {tutor.first_name} {tutor.last_name} ({tutor.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tutor && (
                <p className="text-sm text-destructive">{errors.tutor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
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
                defaultValue="60"
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

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sessions')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Scheduling...' : 'Schedule Session'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
