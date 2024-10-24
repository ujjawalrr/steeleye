import React, { useState } from 'react';
import { Input, Modal, notification, Select, Switch } from 'antd';
import axios from 'axios';

const AddCamera = ({ smsUnits }) => {
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
    const [subunit, setSubunit] = useState();
    const [location, setLocation] = useState('');
    const [cameraUrl, setCameraUrl] = useState('');
    const [state, setState] = useState(1);
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
        if (!selectedUnit) return openNotification('Please select unit!', 'error');
        setAdding(true);
        try {
            const response = await axios.post('/api/addNewCamera', { 
                unitId: selectedUnit, 
                subunit: subunit, 
                location: location, 
                camera_url: cameraUrl, 
                state: state, 
                ladleId: '0',
                timestamp: new Date(),
                last_detection: new Date(),
            });
            openNotification("Camera added!", 'success');
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            openNotification("Error adding camera!", 'error');
        } finally {
            setAdding(false);
        }
    }
    return (
        <>
            <button className='min-w-[120px] bg-orange-950 p-1 rounded-md text-white hover:bg-opacity-90' onClick={showModal}>
                Add Camera
            </button>
            <Modal title="Add New Camera" footer={null} onCancel={() => setIsModalOpen(false)} open={isModalOpen}>
                <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>UNIT</label>
                        <Select
                            value={selectedUnit}
                            placeholder='Select Unit'
                            className='w-full'
                            onChange={handleUnitChange}
                            options={smsUnits.map((item) => ({
                                value: item.unitId,
                                label: item.unitId,
                            }))}
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Subunit</label>
                        <Select
                            value={subunit}
                            placeholder='Select Subunit'
                            className='w-full'
                            onChange={setSubunit}
                            options={[
                                { value: 'BOF', label: 'BOF' },
                                { value: 'LF', label: 'LF' },
                                { value: 'CCM', label: 'CCM' },
                                { value: 'Preparation Bay', label: 'Preparation Bay' },
                            ]}
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Location</label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Location'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>Camera URL</label>
                        <Input
                            value={cameraUrl}
                            onChange={(e) => setCameraUrl(e.target.value)}
                            type='text'
                            className='w-full'
                            placeholder='Enter Camera URL'
                        />
                    </div>
                    <div className='flex justify-center items-center gap-2'>
                        <label className='min-w-[120px]'>State</label>
                        <div className='flex gap-2 items-center w-full'>
                            <Switch
                                checked={state === 1}
                                onChange={(checked) => setState(checked ? 1 : 0)}
                                className=''
                            />
                            {state ? 'On' : 'Off'}
                        </div>
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

export default AddCamera;
