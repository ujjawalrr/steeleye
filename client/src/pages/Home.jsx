import React from 'react'
import CameraFeeds from '../components/CameraFeeds';
import Sidebar from '../components/Sidebar';

const Home = ({ smsUnits }) => {
    return (
        <main className='flex'>
            <Sidebar smsUnits={smsUnits} />
            <div className='min-h-[calc(100vh-60px)]  w-full'>
                <CameraFeeds />
            </div>
        </main>
    )
}

export default Home
