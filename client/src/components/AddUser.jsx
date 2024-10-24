import React, { useState } from 'react';
import { Input, Modal, notification, Select } from 'antd';
import axios from 'axios';

const AddUser = () => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !role) return openNotification('Please fill all fields!', 'error');
        setAdding(true);
        try {
            const response = await axios.post('/api/addNewUser', { name, email, role });
            openNotification("User added!", 'success');
            setIsModalOpen(false);
            setName('');
            setEmail('');
            setRole('');
            window.location.reload();
        } catch (error) {
            openNotification("Error adding user!", 'error');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div>
            <button className='min-w-[120px] bg-orange-950 p-1 rounded-md text-white hover:bg-opacity-90' onClick={showModal}>
                Add User
            </button>
            <Modal title="Add New User" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Name'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Email</label>
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type='email'
                            className='w-full'
                            placeholder='Enter Email'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Role</label>
                        <Select
                            value={role}
                            placeholder='Select Role'
                            className='w-full'
                            onChange={setRole}
                            options={[
                                { value: 'operator', label: 'Operator' },
                                { value: 'admin', label: 'Admin' },
                                { value: 'user', label: 'User' },
                            ]}
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
        </div>
    );
};

export default AddUser;
