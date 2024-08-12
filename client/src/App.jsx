import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [data, setData] = useState([]);
  const getData = async () => {
    try {
      const response = await axios.get('/api/camerafeeds');
      setData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getData();

    const interval = setInterval(getData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <nav className='bg-orange-950 w-full h-[60px] px-4 sm:px-8 flex flex-col justify-center text-white'>
        <h1>Steel Eye | IIT Kharagpur</h1>
      </nav>
      <main className='flex'>
        {/* <div className='min-h-[calc(100vh-60px)] min-w-[250px] p-4 bg-gray-50 border border-r-slate-200'>

        </div> */}
        <div className='min-h-[calc(100vh-60px)] p-4 flex flex-col  w-full'>
          <h1 className='text-center text-2xl mb-4'>Camera Feed</h1>
          <div className='flex justify-center items-center gap-8'>
            {data?.map((item, index) =>
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
