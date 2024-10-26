import React, { useState, useEffect } from 'react';
import { Modal, notification, Select } from 'antd';
import axios from 'axios';

const AddMaintainance = ({ ladleId, maintainanceHistory, updateMaintainanceHistory }) => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [users, setUsers] = useState([]);
    const [gettingUsers, setGettingUsers] = useState(true);
    const getUsers = async () => {
        try {
            setGettingUsers(true);
            const response = await axios.get(`/api/users`);
            if (response?.data?.length > 0) {
                setUsers(response.data);
            }
        } catch (error) {
        } finally {
            setGettingUsers(false);
        }
    }
    useEffect(() => {
        users.length == 0 && getUsers();
    }, []);
    const [selectedUser, setSelectedUser] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleUserChange = (value) => {
        setSelectedUser(value);
    };
    const [adding, setAdding] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return openNotification('Please select user!', 'error');
        setAdding(true);
        try {
            const response = await axios.post('/api/assign-ladle-maintainance', {
                ladleId,
                assigned_at: new Date(),
                maintainedBy: selectedUser,
                delivered_at: null,
            });
            openNotification("User assigned!", 'success');
            setIsModalOpen(false);
            updateMaintainanceHistory([{ id: response.data.id, ladleId, assigned_at: new Date(), maintainedBy: selectedUser, delivered_at: null, maintainedBy_name: users.find((user) => user.id === selectedUser).name }, ...maintainanceHistory ]);
        } catch (error) {
            openNotification("Error assigning user!", 'error');
        } finally {
            setAdding(false);
        }
    }
    return (
        <>
            <button onClick={showModal} className='bg-orange-950 text-white rounded-md px-3 py-2'>Maintain Ladle</button>
            <Modal title="Assign User" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Select User</label>
                        <Select
                            value={selectedUser}
                            placeholder='Select USer'
                            className='w-full'
                            onChange={handleUserChange}
                            options={users.map((user) => ({
                                value: user.id,
                                label: user.name,
                            }))}
                        />
                    </div>
                    <div className='flex justify-end pt-4'>
                        <button disabled={adding} className='bg-orange-950 p-2 min-w-16 rounded-md hover:bg-opacity-90 text-white'>
                            {adding ? 'Assigning' : 'Assign'}
                        </button>
                    </div>
                </form>
            </Modal>
            {contextHolder}
        </>
    );
};

export default AddMaintainance;
