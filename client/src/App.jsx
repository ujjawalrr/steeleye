import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import { Select } from 'antd';

function App() {
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [smsUnits, setSmsUnits] = useState([]);
  const [unitLadles, setUnitLadles] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const getCameraFeeds = async () => {
    try {
      const response = await axios.get('/api/camerafeeds');
      if (response?.data?.length > 0) {
        setCameraFeeds(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

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

  const getUnitLadles = async () => {
    try {
      const response = await axios.get(`/api/unitladles/${selectedUnit}`);
      if (response?.data?.length > 0) {
        setUnitLadles(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // useEffect(() => {
  //   getCameraFeeds();

  //   const interval = setInterval(getData, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    getSmsUnits();
  }, []);

  useEffect(() => {
    if(selectedUnit) {
      getUnitLadles();
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (smsUnits?.length > 0) {
      setSelectedUnit(smsUnits[0].unitId);
    }
  }, [smsUnits]);

  const handleUnitChange = (value) => {
    setSelectedUnit(value);
  };

  return (
    <div>
      <nav className='bg-orange-950 w-full h-[60px] px-4 sm:px-8 flex flex-col justify-center text-white'>
        <h1>Steel Eye | IIT Kharagpur</h1>
      </nav>
      <main className='flex'>
        <div className='min-h-[calc(100vh-60px)] min-w-[250px] p-4 bg-gray-50 border border-r-slate-200 flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-orange-950 text-xl'>UNIT</label>
            <Select
              value={selectedUnit}
              className='w-full'
              onChange={handleUnitChange}
              options={
                smsUnits.map((item) => ({
                  value: item.unitId,
                  label: item.unitId,
                }))}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className='font-semibold text-orange-950 text-xl'>LADLES</label>
            <div className='grid grid-cols-3 gap-2'>
              {unitLadles?.map((item, index) =>
                <span key={index} className='shadow-sm border rounded-md bg-white h-16 w-16 flex justify-center items-center'>
                  {item.ladleId}
                </span>
              )}
              </div>
          </div>
        </div>
        <div className='min-h-[calc(100vh-60px)] p-4 flex flex-col  w-full'>
          <h1 className='text-center text-2xl mb-4'>Camera Feed</h1>
          <div className='flex justify-center items-center gap-8'>
            {cameraFeeds?.map((item, index) =>
              <div key={index} className='shadow-md p-4 w-[250px] text-center flex flex-col gap-2'>
                <h1 className='font-semibold text-xl'>Camera {item.cameraId}</h1>
                <h1>Ladle {item.ladleId}</h1>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
