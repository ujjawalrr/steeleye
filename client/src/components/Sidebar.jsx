import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Select, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
const Sidebar = ({ smsUnits, selectedUnit, updateSelectedUnit }) => {
    const [unitLadles, setUnitLadles] = useState([]);
    const [gettingUnitLadles, setGettingUnitLadles] = useState(true);
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
        if (selectedUnit) {
            getUnitLadles();
        }
    }, [selectedUnit]);

    const handleUnitChange = (value) => {
        updateSelectedUnit(value);
    };
    return (
        <div className='min-h-[calc(100vh-60px)] min-w-[250px] p-4 bg-gray-50 border border-r-slate-200'>
            <div className='flex flex-col gap-4 sticky top-20'>
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
                    {gettingUnitLadles ?
                        <Skeleton active />
                        :
                        unitLadles?.length == 0 ? <p className='text-center'>No ladle found</p>
                            :
                            <div className='grid grid-cols-3 gap-2'>
                                {unitLadles?.map((item, index) =>
                                    <Link to={`/ladle-history/${item.id}`} key={index} className='shadow-sm cursor-pointer border rounded-md bg-white h-16 w-16 flex justify-center items-center'>
                                        {item.ladleId}
                                    </Link>
                                )}
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Sidebar
