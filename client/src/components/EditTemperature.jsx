import React, { useState, useEffect } from 'react';
import { Input, Modal, notification } from 'antd';
import axios from 'axios';

const EditTemperature = ({ ladleData, updateLadleData }) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const [temperature, setTemperature] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (ladleData) {
            setTemperature(ladleData.temperature);
        }
    }, [ladleData]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!temperature) return openNotification('Please enter temperature!', 'error');
        setAdding(true);

        try {
            const response = await axios.put(`/api/updateLadleTemperature/${ladleData.id}`, { temperature: temperature, timestamp: new Date() });
            openNotification("Temperature updated successfully!", 'success');
            setIsModalOpen(false);
            updateLadleData(response.data);
        } catch (error) {
            openNotification("Error updating temperature!", 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <button onClick={showModal} className='bg-orange-950 text-white rounded-md px-3 py-2'>Edit Temperature</button>
            <Modal title="Edit Temperature" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[140px]'>Temperature (°C)</label>
                        <Input
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            type='text'
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

export default EditTemperature;