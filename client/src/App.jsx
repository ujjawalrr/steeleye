import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ManageLadles from './pages/ManageLadles';
import Navbar from './components/Navbar';
import ManageUnits from './pages/ManageUnits';
import LadleHistory from './pages/LadleHistory';
import Chat from './pages/Chat';
import ManageCameras from './pages/ManageCameras';
import ManageUsers from './pages/ManageUsers';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [loading, setLoading] = useState(true);
  const [smsUnits, setSmsUnits] = useState([]);
  const getSmsUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/smsunits');
      if (response?.data?.length > 0) {
        setSmsUnits(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getSmsUnits();
  }, []);
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home smsUnits={smsUnits} /></ProtectedRoute>} />
          <Route path="/ladle-history/:id" element={<ProtectedRoute><LadleHistory smsUnits={smsUnits} /></ProtectedRoute>} />
          <Route path="/manage-cameras" element={<ProtectedRoute adminRoute={true}><ManageCameras smsUnits={smsUnits} /></ProtectedRoute>} />
          <Route path="/manage-ladles" element={<ProtectedRoute adminRoute={true}><ManageLadles smsUnits={smsUnits} /></ProtectedRoute>} />
          <Route path="/manage-units" element={<ProtectedRoute adminRoute={true}><ManageUnits smsUnits={smsUnits} loading={loading} /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute adminRoute={true}><ManageUsers /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:user_id/:token" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App
