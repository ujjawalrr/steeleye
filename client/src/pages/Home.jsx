import React, { useEffect, useState } from 'react'
import CameraFeeds from '../components/CameraFeeds';
import Sidebar from '../components/Sidebar';

const Home = ({ smsUnits }) => {
    const [selectedUnit, setSelectedUnit] = useState('');
    const updateSelectedUnit = (value) => {
        setSelectedUnit(value);
    }
    useEffect(() => {
        if (smsUnits?.length > 0) {
            setSelectedUnit(smsUnits[0].unitId);
        }
    }, [smsUnits]);

    return (
        <main className='flex'>
            <Sidebar smsUnits={smsUnits} selectedUnit={selectedUnit} updateSelectedUnit={updateSelectedUnit} />
            <div className='min-h-[calc(100vh-60px)] w-full'>
                <CameraFeeds selectedUnit={selectedUnit} />
            </div>
        </main>
    )
}

export default Home
