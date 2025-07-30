import { Route, Routes } from 'react-router'
import './App.css'
import { HomePage } from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  
  
  return (
    <Routes>
      <Route index element={<HomePage />}/>
      <Route path='characters' element={<CharactersPage />}/>
      <Route path='campaigns' element={<CampaignsPage />}/>
      <Route path='profile' element={<ProfilePage />}/>
      <Route path='register' element={<RegisterPage />}/>
      <Route path='login' element={<LoginPage />}/>
    </Routes>
  )
}

export default App
