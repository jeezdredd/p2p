export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'tutor'
  bio: string
  avatar: string | null
  subjects: Subject[]
  date_joined: string
  is_staff?: boolean
  is_superuser?: boolean
}

export interface Subject {
  id: number
  name: string
  description: string
}

export interface StudyMaterial {
  id: number
  author: User
  subject: number
  subject_detail: Subject
  title: string
  description: string
  file: string | null
  link: string
  created_at: string
  updated_at: string
}

export interface TutoringSession {
  id: number
  tutor: number
  tutor_detail: User
  student: number | null
  student_detail: User | null
  subject: number
  subject_detail: Subject
  title: string
  date: string
  time: string
  duration: number
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled'
  notes: string
  confirmation_required: boolean
  is_confirmed: boolean
  confirmed_at: string | null
  cancelled_by: number | null
  cancelled_by_detail: User | null
  cancellation_reason: string
  max_students: number
  review?: SessionReview
  created_at: string
  updated_at: string
}

export interface SessionReview {
  id: number
  session: number
  reviewer: number
  reviewer_detail: User
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

export interface Discussion {
  id: number
  author: User
  subject: number | null
  subject_detail: Subject | null
  title: string
  content?: string
  reply_count?: number
  replies?: Reply[]
  created_at: string
  updated_at?: string
}

export interface Reply {
  id: number
  discussion: number
  author: User
  parent: number | null
  content: string
  children: Reply[]
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  link: string
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthTokens {
  access: string
  refresh: string
}
