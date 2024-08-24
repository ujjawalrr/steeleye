
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Select, Skeleton } from 'antd';

const Home = ({ smsUnits }) => {
    const [cameraFeeds, setCameraFeeds] = useState([]);
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

    const [gettingUnitLadles, setGettingUnitLadles] = useState(false);
    const getUnitLadles = async () => {
        try {
            setUnitLadles([]);
            setGettingUnitLadles(true);
            const response = await axios.get(`/api/unitladles/${selectedUnit}`);
            if (response?.data?.length > 0) {
                setUnitLadles(response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setGettingUnitLadles(false);
        }
    }

    useEffect(() => {
        getCameraFeeds();

        // const interval = setInterval(getCameraFeeds, 5000);

        // return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUnit) {
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
                        {gettingUnitLadles ?
                            <Skeleton active />
                            :
                            unitLadles?.map((item, index) =>
                                <span key={index} className='shadow-sm cursor-pointer border rounded-md bg-white h-16 w-16 flex justify-center items-center'>
                                    {item.ladleId}
                                </span>
                            )}
                    </div>
                </div>
            </div>
            <div className='min-h-[calc(100vh-60px)] p-4 flex flex-col  w-full'>
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
        </main>
    )
}

export default Home
