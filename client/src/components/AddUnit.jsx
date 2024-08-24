import React, { useState } from 'react';
import { Input, Modal, notification } from 'antd';
import axios from 'axios';
const AddUnit = () => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [unit, setUnit] = useState('');
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
        if (!unit) return openNotification('Please enter unit name!', 'error');
        setAdding(true);
        try {
            const response = await axios.post('/api/addNewUnit', { unitId: unit });
            openNotification("Unit added!", 'success')
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            openNotification("Error adding unit!", 'error')
        } finally {
            setAdding(false);
        }
    }
    return (
        <>
            <button className='min-w-[120px] bg-orange-950 p-1 rounded-md text-white hover:bg-opacity-90' onClick={showModal}>
                Add Unit
            </button>
            <Modal title="Add New Ladle" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[100px]'>Unit Name</label>
                        <Input
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Unit Name'
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
export default AddUnit;