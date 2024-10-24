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
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home smsUnits={smsUnits} />} />
        <Route path="/ladle-history/:id" element={<LadleHistory smsUnits={smsUnits} />} />
        <Route path="/manage-cameras" element={<ManageCameras smsUnits={smsUnits} />} />
        <Route path="/manage-ladles" element={<ManageLadles smsUnits={smsUnits} />} />
        <Route path="/manage-units" element={<ManageUnits smsUnits={smsUnits} loading={loading} />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
