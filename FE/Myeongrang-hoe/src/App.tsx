import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import MyPage from './pages/MyPage/MyPage'
import FundingTab from './pages/FundingTab/FundingTab'
import FundingList from './pages/FundingList/FundingList'
import Login from './pages/Login/Login'
import ProfileSetup from './pages/ProfileSetup/ProfileSetup'
import MyPosts from './pages/MyPosts/MyPosts'
import ChatRoom from './pages/ChatRoom/ChatRoom'
import FundingForm from './pages/FundingForm/FundingForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<FundingList />} />
        <Route path="/funding" element={<FundingTab />} />
        <Route path="/funding/new" element={<FundingForm />} />
        <Route path="/myposts" element={<MyPosts />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
