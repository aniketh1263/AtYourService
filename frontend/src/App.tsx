import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import Layout from './components/Layout'
import ChatPage from './pages/ChatPage'
import ConversationPage from './pages/ConversationPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TicketsPage from './pages/TicketsPage'
import UploadPage from './pages/UploadPage'

// The route table: "when the URL is X, show component Y".
export default function App() {
  return (
    <Routes>
      {/* Public pages: anyone can open these. */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      {/* Everything below needs a login. RequireAuth redirects to /login otherwise. */}
      <Route element={<RequireAuth />}>
        {/* Layout (sidebar + page area) wraps every page below it. */}
        <Route element={<Layout />}>
          <Route index element={<ChatPage />} /> {/* "/" */}
          <Route path="history" element={<HistoryPage />} />
          {/* ":conversationId" is a URL parameter: /history/abc123 shows conversation abc123. */}
          <Route path="history/:conversationId" element={<ConversationPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="upload" element={<UploadPage />} />
          {/* Any unknown URL goes back to the chat page. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
