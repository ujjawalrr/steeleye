import React, { useState, useEffect } from 'react';
import { Input, Modal, notification, Select } from 'antd';
import axios from 'axios';
import { EditOutlined } from '@ant-design/icons';

const EditLadle = ({ smsUnits, ladles, ladle, updateLadles }) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const [selectedUnit, setSelectedUnit] = useState('');
    const [ladleNumber, setLadleNumber] = useState('');
    const [grade, setGrade] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [weight, setWeight] = useState(0);
    const [temperature, setTemperature] = useState(27);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (ladle) {
            setLadleNumber(ladle.ladleId);
            setSelectedUnit(ladle.unitId);
            setGrade(ladle.grade);
            setCapacity(ladle.capacity);
            setWeight(ladle.weight);
            setTemperature(ladle.temperature);
        }
    }, [ladle]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleUnitChange = (value) => {
        setSelectedUnit(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!ladleNumber) return openNotification('Please enter ladle number!', 'error');
        if (!selectedUnit) return openNotification('Please select unit!', 'error');
        setAdding(true);

        try {
            const response = await axios.put(`/api/updateLadle/${ladle.id}`, {
                ladleId: ladleNumber,
                unitId: selectedUnit,
                grade: grade,
                capacity: capacity,
                weight: weight,
                temperature: temperature,
                timestamp: ladle.temperature == temperature ? ladle.timestamp : new Date(),
            });

            openNotification("Ladle updated successfully!", 'success');
            setIsModalOpen(false);

            updateLadles(ladles.map((item) => item.id === ladle.id ? response.data : item));

        } catch (error) {
            openNotification("Error updating ladle!", 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <button onClick={showModal} className='absolute top-[-10px] left-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-4 flex items-center justify-center text-white'>
                <EditOutlined className='text-blue-500' />
            </button>

            <Modal title="Edit Ladle" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
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
                        <label className='min-w-[120px]'>Capacity (tons)</label>
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
                            {adding ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </Modal>
            {contextHolder}
        </>
    );
};

export default EditLadle;
