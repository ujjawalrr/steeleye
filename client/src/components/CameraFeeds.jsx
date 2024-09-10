import React, { useEffect, useState } from 'react'
import axios from 'axios'
const CameraFeeds = () => {
    const [cameraFeeds, setCameraFeeds] = useState([]);
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
    useEffect(() => {
        getCameraFeeds();

        const interval = setInterval(getCameraFeeds, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='p-4 flex flex-col  w-full'>
            <h1 className='text-center text-2xl mb-4'>Camera Feed</h1>
            <div className='flex justify-center items-center flex-wrap gap-8'>
                {cameraFeeds?.map((item, index) =>
                    <div key={index} className='shadow-md p-4 w-[250px] text-center flex flex-col gap-2'>
                        <h1 className='font-semibold text-xl'>Camera {item.cameraId}</h1>
                        <h1>Ladle {item.ladleId}</h1>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CameraFeeds
