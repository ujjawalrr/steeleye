import React, { useState, useEffect } from 'react';
import { Input, Modal, notification } from 'antd';
import axios from 'axios';
import { EditOutlined } from '@ant-design/icons';

const EditUnit = ({ unit }) => {
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const [unitName, setUnitName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (unit) {
            setUnitName(unit.unitId);
        }
    }, [unit]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!unitName) return openNotification('Please enter unit name!', 'error');
        setAdding(true);

        try {
            const response = await axios.put(`/api/updateUnit/${unit.id}`, { unitId: unitName });
            openNotification("Unit updated successfully!", 'success');
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            openNotification("Error updating unit!", 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <button onClick={showModal} className='absolute top-[-10px] left-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-4 flex items-center justify-center text-white'>
                <EditOutlined className='text-blue-500' />
            </button>
            <Modal title="Edit Unit" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[100px]'>Unit Name</label>
                        <Input
                            value={unitName}
                            onChange={(e) => setUnitName(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Unit Name'
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

export default EditUnit;