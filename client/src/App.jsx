import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ManageLadles from './pages/ManageLadles';
import Navbar from './components/Navbar';
import ManageUnits from './pages/ManageUnits';

function App() {
  const [smsUnits, setSmsUnits] = useState([]);
  const getSmsUnits = async () => {
    try {
      const response = await axios.get('/api/smsunits');
      if (response?.data?.length > 0) {
        setSmsUnits(response.data);
      }
    } catch (error) {
      console.log(error);
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
        <Route path="/manage-ladles" element={<ManageLadles smsUnits={smsUnits} />} />
        <Route path="/manage-units" element={<ManageUnits smsUnits={smsUnits} />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
