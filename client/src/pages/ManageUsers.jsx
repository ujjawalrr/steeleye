import { useEffect, useState } from 'react'
import axios from 'axios'
import { Modal, notification, Skeleton, Space, Table } from 'antd';
import AddUser from '../components/AddUser';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const ManageUsers = () => {
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

    const [confirmModal, modalcontextHolder] = Modal.useModal();
    const confirmRemoveUser = (record) => {
        confirmModal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to remove ${record.name}?`,
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: () => deleteUser(record.id),
        });
    };

    const [deleting, setDeleting] = useState(false);
    const deleteUser = async (id) => {
        try {
            setDeleting(true);
            const response = await axios.delete(`/api/deleteUser/${id}`);
            setUsers(users.filter((item) => item.id !== id));
            openNotification("User deleted!", 'success')
        } catch (error) {
            openNotification("Error deleting user!", "error")
        } finally {
            setDeleting(false);
        }
    }

    let columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Action',
            key: 'Action',
            render: (_, record) => (
                <Space size="middle">
                    {/* <UpdateModal record={record} users={users} updateUsers={handleUsersChange} /> */}
                    <button onClick={() => confirmRemoveUser(record)}><DeleteOutlined /></button>
                </Space>
            ),
        },
    ];

    return (
        <div className='px-4 sm:px-12 lg:px-24 py-4 lg:py-8'>
            {contextHolder}
            <div className='flex justify-between items-center mb-4'>
                <h2 className='font-light text-2xl'>Manage Users</h2>
                <AddUser />
            </div>
            <div className='flex flex-col gap-8'>
                {gettingUsers ?
                    <Skeleton active />
                    :
                    users?.length === 0 ? <p className='text-center'>No user found</p>
                        :
                        <div className=''>
                            {modalcontextHolder}
                            <Table dataSource={users?.map(user => ({ ...user, key: user.id }))} columns={columns} pagination={users?.length > 20 ? { pageSize: 20 } : false} />
                        </div>
                }
            </div>
        </div>
    )
}

export default ManageUsers
