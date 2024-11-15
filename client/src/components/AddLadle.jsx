import React, { useState } from 'react';
import { Input, Modal, notification, Select } from 'antd';
import axios from 'axios';
const AddLadle = ({ smsUnits }) => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [selectedUnit, setSelectedUnit] = useState();
    const [ladleNumber, setLadleNumber] = useState('');
    const [grade, setGrade] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [weight, setWeight] = useState(0);
    const [temperature, setTemperature] = useState(27);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleUnitChange = (value) => {
        setSelectedUnit(value);
    };
    const [adding, setAdding] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ladleNumber) return openNotification('Please enter ladle number!', 'error');
        if (!selectedUnit) return openNotification('Please select unit!', 'error');
        setAdding(true);
        try {
            const response = await axios.post('/api/addNewLadle', { ladleId: ladleNumber, unitId: selectedUnit, grade: grade, capacity: capacity, weight: weight, temperature: temperature, timestamp: new Date() });
            openNotification("Ladle added!", 'success')
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            openNotification("Error adding ladle!", 'error')
        } finally {
            setAdding(false);
        }
    }
    return (
        <>
            <button className='min-w-[120px] bg-orange-950 p-1 rounded-md text-white hover:bg-opacity-90' onClick={showModal}>
                Add Ladle
            </button>
            <Modal title="Add New Ladle" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Ladle Number</label>
                        <Input
                            value={ladleNumber}
                            onChange={(e) => setLadleNumber(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Ladle Number'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>UNIT</label>
                        <Select
                            value={selectedUnit}
                            placeholder='Select Unit'
                            className='w-full'
                            onChange={handleUnitChange}
                            options={
                                smsUnits.map((item) => ({
                                    value: item.unitId,
                                    label: item.unitId,
                                }))}
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Grade</label>
                        <Input
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Grade'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Capacity (tonns)</label>
                        <Input
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            type='number'
                            className='w-full'
                            placeholder='Enter Capacity'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Weight (kg)</label>
                        <Input
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            type='number'
                            className='w-full'
                            placeholder='Enter Weight'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Temperature (°C)</label>
                        <Input
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            type='number'
                            className='w-full'
                            placeholder='Enter Temperature'
                        />
                    </div>
                    <div className='flex justify-end pt-4'>
                        <button disabled={adding} className='bg-orange-950 p-2 min-w-16 rounded-md hover:bg-opacity-90 text-white'>
                            {adding ? 'Adding' : 'Add'}
                        </button>
                    </div>
                </form>
            </Modal>
            {contextHolder}
        </>
    );
};
export default AddLadle;