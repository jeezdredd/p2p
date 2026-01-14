import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { supportApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toaster'
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'

const supportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type SupportFormData = z.infer<typeof supportSchema>

export default function Support() {
  const [submitted, setSubmitted] = useState(false)

  const submitMutation = useMutation({
    mutationFn: (data: SupportFormData) => supportApi.create(data),
    onSuccess: () => {
      setSubmitted(true)
      toast({ title: 'Message sent successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to send message', variant: 'destructive' })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
  })

  const onSubmit = (data: SupportFormData) => {
    submitMutation.mutate(data)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your message has been sent successfully. We'll get back to you as soon as possible.
            </p>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact & Support</h1>
        <p className="text-muted-foreground">Get help with your academic questions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="Your name" {...register('name')} />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="What is your query about?"
                    {...register('subject')}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your question or concern..."
                    rows={6}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@p2plearning.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    123 Learning Street
                    <br />
                    Education City, ED 12345
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">How do I become a tutor?</p>
                <p className="text-sm text-muted-foreground">
                  Register with the "Tutor" role and start scheduling sessions.
                </p>
              </div>
              <div>
                <p className="font-medium">Is the platform free?</p>
                <p className="text-sm text-muted-foreground">
                  Yes, P2P Learning is completely free for all students.
                </p>
              </div>
              <div>
                <p className="font-medium">How do I upload materials?</p>
                <p className="text-sm text-muted-foreground">
                  Go to Materials page and click "Add Material" to share resources.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
