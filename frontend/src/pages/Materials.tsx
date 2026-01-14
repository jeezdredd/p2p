import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { materialsApi, subjectsApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/toaster'
import { BookOpen, Link as LinkIcon, File, Plus, X, ExternalLink, Download } from 'lucide-react'
import type { StudyMaterial, Subject } from '@/types'

const materialSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  link: z.string().url().optional().or(z.literal('')),
})

type MaterialFormData = z.infer<typeof materialSchema>

export default function Materials() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filterSubject, setFilterSubject] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', filterSubject],
    queryFn: () => materialsApi.list(filterSubject ? { subject: parseInt(filterSubject) } : {}),
  })

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => materialsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast({ title: 'Material uploaded successfully' })
      setShowForm(false)
      reset()
      setSelectedFile(null)
    },
    onError: () => {
      toast({ title: 'Failed to upload material', variant: 'destructive' })
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  })

  const onSubmit = (data: MaterialFormData) => {
    const formData = new FormData()
    formData.append('subject', data.subject)
    formData.append('title', data.title)
    formData.append('description', data.description)
    if (data.link) formData.append('link', data.link)
    if (selectedFile) formData.append('file', selectedFile)
    createMutation.mutate(formData)
  }

  const subjectsList: Subject[] = subjects?.data?.results || subjects?.data || []
  const materialsList: StudyMaterial[] = materials?.data?.results || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground">Browse and share learning resources</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Material'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select onValueChange={(value) => setValue('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
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
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Or Link</Label>
                  <Input id="link" placeholder="https://..." {...register('link')} />
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Uploading...' : 'Upload Material'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[200px]">
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
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading materials...</div>
      ) : materialsList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No materials found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materialsList.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    {material.file ? (
                      <File className="h-5 w-5 text-primary" />
                    ) : (
                      <LinkIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{material.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {material.subject_detail?.name}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {material.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    by {material.author?.username}
                  </span>
                  {material.file ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={material.file} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </a>
                    </Button>
                  ) : material.link ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={material.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Open
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
