import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import MyPage from './pages/MyPage/MyPage'
import FundingTab from './pages/FundingTab/FundingTab'
import FundingList from './pages/FundingList/FundingList'
import Login from './pages/Login/Login'
import ProfileSetup from './pages/ProfileSetup/ProfileSetup'
import MyPosts from './pages/MyPosts/MyPosts'
import ChatList from './pages/ChatRoom/ChatList'
import ChatRoom from './pages/ChatRoom/ChatRoom'
import FundingForm from './pages/FundingForm/FundingForm'
import SignupPassword from './pages/Signup/SignupPassword'
import InterestSelect from './pages/Signup/InterestSelect'
import LocationPermission from './pages/Signup/LocationPermission'
import ReviewForm from './pages/Review/ReviewForm'
import Notifications from './pages/Notifications/Notifications'
import AuthBootstrap from './components/AuthBootstrap'
import RequireAuth from './components/RequireAuth'
import ToastHost from './components/ToastHost'
import OnboardingOverlay from './components/OnboardingOverlay'

function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
      <ToastHost />
      <OnboardingOverlay />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup mode="signup" />} />
        <Route path="/signup/password" element={<SignupPassword />} />
        <Route path="/signup/interests" element={<InterestSelect />} />
        <Route path="/signup/location" element={<LocationPermission />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/list"
          element={
            <RequireAuth>
              <FundingList />
            </RequireAuth>
          }
        />
        <Route
          path="/funding/new"
          element={
            <RequireAuth>
              <FundingForm />
            </RequireAuth>
          }
        />
        <Route
          path="/funding/:id"
          element={
            <RequireAuth>
              <FundingTab />
            </RequireAuth>
          }
        />
        <Route
          path="/funding/:id/edit"
          element={
            <RequireAuth>
              <FundingForm />
            </RequireAuth>
          }
        />
        <Route
          path="/myposts"
          element={
            <RequireAuth>
              <MyPosts />
            </RequireAuth>
          }
        />
        <Route
          path="/mypage"
          element={
            <RequireAuth>
              <MyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile-setup/edit"
          element={
            <RequireAuth>
              <ProfileSetup mode="edit" />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <ChatList />
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <RequireAuth>
              <ChatRoom />
            </RequireAuth>
          }
        />
        <Route
          path="/review/new/:fundingId"
          element={
            <RequireAuth>
              <ReviewForm />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />
      </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  )
}

export default App
