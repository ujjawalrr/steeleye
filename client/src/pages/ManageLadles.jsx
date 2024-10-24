import AddLadle from '../components/AddLadle'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { notification, Select, Skeleton } from 'antd';
import moment from 'moment';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import EditLadle from '../components/EditLadle';

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
    const updateLadles = (updatedLadles) => {
        setUnitLadles(updatedLadles);
    }

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

    const confirmRemoveLadle = (id) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to remove this ladle?`,
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: () => deleteLadle(id),
        });
    };

    const renderLadleDetail = (label, value) => (
        <div className="flex gap-8 justify-between items-end">
            <span className='text-orange-950 font-semibold text-xl'>{label}</span>
            <span>{value}</span>
        </div>
    );

    const renderExpectedTemperature = (item) => {
        const minElapsed = moment().diff(moment.utc(item.timestamp).local(), 'minutes');
        const expectedTemp = (item.temperature - (minElapsed * 10 / 15)).toFixed(2);
        return (
            <div className="flex gap-8 justify-between items-end">
                <span className='text-orange-950 font-semibold text-xl'>Current Temperature</span>
                <span>{expectedTemp > 0 ? `${expectedTemp} °C` : 'Measure'}</span>
            </div>
        );
    };

    return (
        <div className='px-4 sm:px-12 lg:px-24 py-4 lg:py-8'>
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
            <div className='flex flex-col gap-8'>
                <h1 className='text-center font-semibold text-orange-950 text-2xl'>{selectedUnit}</h1>
                <label className='text-xl mb-4'>LADLES</label>
                {gettingUnitLadles ?
                    <Skeleton active />
                    :
                    unitLadles?.length === 0 ? <p className='text-center'>No ladles found</p>
                        :
                        <div className='grid grid-cols-3 gap-12'>
                            {unitLadles?.map((item) => (
                                <div key={item.id} className='relative shadow-sm cursor-pointer border rounded-md bg-white flex justify-center items-center'>
                                    <div className='p-4 space-y-2 w-full'>
                                        <div className='text-center pb-2 text-5xl font-semibold text-orange-950'>{item.ladleId}</div>
                                        {renderLadleDetail('Grade', item.grade || '----')}
                                        {renderLadleDetail('Capacity', `${item.capacity} tonn`)}
                                        {renderLadleDetail('Weight', `${item.weight} kg`)}
                                        {renderExpectedTemperature(item)}
                                        {renderLadleDetail('Last Measured', moment.utc(item.timestamp).local().fromNow())}
                                        {renderLadleDetail('Measured Temperature', `${item.temperature} °C`)}
                                    </div>
                                    <button disabled={deleting} className='absolute top-[-10px] right-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-4 flex items-center justify-center text-white' onClick={() => confirmRemoveLadle(item.id)}>
                                        <DeleteOutlined color='red' className='text-red-500' />
                                    </button>
                                    <EditLadle smsUnits={smsUnits} ladle={item} ladles={unitLadles} updateLadles={updateLadles} />
                                </div>
                            ))}
                        </div>
                }
            </div>
        </div>
    )
}

export default ManageLadles
