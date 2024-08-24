import { useState } from 'react'
import axios from 'axios'
import { notification } from 'antd';
import AddUnit from '../components/AddUnit';

const ManageUnits = ({ smsUnits }) => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [deleting, setDeleting] = useState(false);
    const deleteUnit = async (id) => {
        try {
            setDeleting(true);
            const response = await axios.delete(`/api/deleteUnit/${id}`);
            openNotification("Unit deleted!", 'success')
            window.location.reload();
        } catch (error) {
            openNotification("Error deleting unit!", "error")
        } finally {
            setDeleting(false);
        }
    }
    return (
        <div className='px-4 sm:px-12 lg:px-24 xl:px-48 py-4 lg:py-8'>
            {contextHolder}
            <div className='flex justify-between items-center mb-4'>
                <h2 className='font-light text-2xl'>Manage Units</h2>
                <div className='flex items-center gap-8'>
                    <AddUnit />
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <h1 className='text-center font-semibold text-orange-950 text-2xl'>Units</h1>
                <div className='flex flex-wrap gap-8'>
                    {smsUnits?.map((item, index) =>
                        <div key={index} className='relative shadow-sm cursor-pointer border rounded-md bg-white min-w-[200px] min-h-[80px] flex justify-center items-center'>
                            <span>{item.unitId}</span>
                            <button disabled={deleting} className='absolute top-[-10px] right-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-2 flex items-center justify-center text-white' onClick={() => deleteUnit(item.id)}>
                                X
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ManageUnits