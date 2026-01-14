import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Materials from '@/pages/Materials'
import Sessions from '@/pages/Sessions'
import SessionSchedule from '@/pages/SessionSchedule'
import Forum from '@/pages/Forum'
import DiscussionDetail from '@/pages/DiscussionDetail'
import Support from '@/pages/Support'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { Toaster } from '@/components/ui/toaster'
import AssistantChat from "./components/AssistantChat"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <>
        <AssistantChat />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="materials" element={<Materials />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sessions/new" element={<SessionSchedule />} />
          <Route path="forum" element={<Forum />} />
          <Route path="forum/:id" element={<DiscussionDetail />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
