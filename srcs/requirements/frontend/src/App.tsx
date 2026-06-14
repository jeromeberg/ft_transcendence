import { Routes, Route } from "react-router-dom";

import {
  Chat,
  FriendRequests,
  FriendsPage,
  Leaderboard,
  OAuthCallback,
  Privacy,
  Profile,
  Register,
  Settings,
  Signin,
  Terms,
  Home,
  Game,
  Admin
} from "@/pages";
import { Navbar, Footer } from "@/components";
import { ProtectedRoute, GuestRoute, AdminRoute } from "@/features/auth";

function App() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col font-mono overflow-hidden">
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play/:mode" element={<Game />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/signin" element={<GuestRoute><Signin /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/chat/:username" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="/friends/requests" element={<ProtectedRoute><FriendRequests /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
