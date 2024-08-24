import AddLadle from '../components/AddLadle'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { notification, Select, Skeleton } from 'antd';

const ManageLadles = ({ smsUnits }) => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [unitLadles, setUnitLadles] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState('');
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
    const [deleting, setDeleting] = useState(false);
    const deleteLadle = async (id) => {
        try {
            setDeleting(true);
            const response = await axios.delete(`/api/deleteLadle/${id}`);
            setUnitLadles(unitLadles.filter((item) => item.id !== id));
            openNotification("Ladle deleted!", 'success')
        } catch (error) {
            openNotification("Error deleting ladle!", "error")
        } finally {
            setDeleting(false);
        }
    }
    return (
        <div className='px-4 sm:px-12 lg:px-24 xl:px-48 py-4 lg:py-8'>
            {contextHolder}
            <div className='flex justify-between items-center mb-4'>
                <h2 className='font-light text-2xl'>Manage Ladles</h2>
                <div className='flex items-center gap-8'>
                    <Select
                        value={selectedUnit}
                        className='w-[100px] h-full'
                        onChange={handleUnitChange}
                        options={
                            smsUnits.map((item) => ({
                                value: item.unitId,
                                label: item.unitId,
                            }))}
                    />
                    <AddLadle smsUnits={smsUnits} />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h1 className='text-center font-semibold text-orange-950 text-2xl'>{selectedUnit}</h1>
                <label className='text-xl mb-4'>LADLES</label>
                <div className='flex flex-wrap gap-8'>
                    {gettingUnitLadles ?
                        <Skeleton active />
                        :
                        unitLadles?.map((item, index) =>
                            <div key={index} className='relative shadow-sm cursor-pointer border rounded-md bg-white h-16 w-16 flex justify-center items-center'>
                                <span>{item.ladleId}</span>
                                <button disabled={deleting} className='absolute top-[-10px] right-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-2 flex items-center justify-center text-white' onClick={() => deleteLadle(item.id)}>
                                    X
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export default ManageLadles