import AddCamera from '../components/AddCamera';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { notification, Select, Skeleton, Switch, Modal } from 'antd';
import moment from 'moment';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import EditCamera from '../components/EditCamera';

const ManageCameras = ({ smsUnits }) => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const [unitCameras, setUnitCameras] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [gettingUnitCameras, setGettingUnitCameras] = useState(false);
    const [cameraState, setCameraState] = useState({});

    const getUnitCameras = async () => {
        try {
            setUnitCameras([]);
            setGettingUnitCameras(true);
            const response = await axios.get(`/api/unitcameras/${selectedUnit}`);
            if (response?.data?.length > 0) {
                setUnitCameras(response.data);
            }
        } catch (error) {
        } finally {
            setGettingUnitCameras(false);
        }
    }
    useEffect(() => {
        if (selectedUnit) {
            getUnitCameras();
        }
    }, [selectedUnit]);

    useEffect(() => {
        if (smsUnits?.length > 0) {
            setSelectedUnit(smsUnits[0].unitId);
        }
    }, [smsUnits]);

    const handleUnitChange = (value) => {
        setSelectedUnit(value);
    };
    const [deleting, setDeleting] = useState(false);
    const confirmRemoveCamera = (id) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to remove this camera?`,
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: () => deleteCamera(id),
        });
    };

    const deleteCamera = async (id) => {
        try {
            setDeleting(true);
            const response = await axios.delete(`/api/deleteCamera/${id}`);
            setUnitCameras(unitCameras.filter((item) => item.id !== id));
            openNotification("Camera deleted!", 'success');
        } catch (error) {
            openNotification("Error deleting camera!", "error");
        } finally {
            setDeleting(false);
        }
    }

    const renderCameraDetail = (label, value) => (
        <div className="flex gap-8 justify-between items-end">
            <span className='text-orange-950 font-semibold text-xl'>{label}</span>
            <span>{value}</span>
        </div>
    );

    const toggleCameraState = async (id, currentState) => {
        try {
            const newState = !currentState;

            await axios.put(`/api/toggleCameraState/${id}`, { state: newState });
            setUnitCameras(unitCameras.map(item =>
                item.id === id ? { ...item, state: newState } : item
            ));
            openNotification("Camera state updated!", 'success');
        } catch (error) {
            openNotification("Error updating camera state!", "error");
        }
    }

    return (
        <div className='px-4 sm:px-12 py-4 lg:py-8'>
            <div className="max-w-7xl mx-auto">
                {contextHolder}
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='font-light text-2xl'>Manage Cameras</h2>
                    <div className='flex items-center gap-8'>
                        <Select
                            value={selectedUnit}
                            className='w-[100px] h-full'
                            onChange={handleUnitChange}
                            options={
                                smsUnits.map((item) => ({
                                    value: item.unitId,
                                    label: item.unitId,
                                }))
                            }
                        />
                        <AddCamera smsUnits={smsUnits} />
                    </div>
                </div>
                <div className='flex flex-col gap-8'>
                    <h1 className='text-center font-semibold text-orange-950 text-2xl'>{selectedUnit}</h1>
                    <label className='text-xl mb-4'>CAMERAS</label>
                    {gettingUnitCameras ?
                        <Skeleton active />
                        :
                        unitCameras?.length === 0 ? <p className='text-center'>No cameras found</p>
                            :
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                                {unitCameras?.map((item) => (
                                    <div key={item.id} className='relative shadow-sm cursor-pointer border rounded-md bg-white'>
                                        <div className='p-8 space-y-2'>
                                            <div className='text-center pb-2 text-2xl font-semibold text-orange-950'>{item.location}</div>
                                            <div className='text-center break-all pb-2 text-xl underline text-orange-950'>{item.camera_url}</div>
                                            {renderCameraDetail('Subunit', item.subunit || '----')}
                                            <div className="flex gap-8 justify-between items-end">
                                                <span className='text-orange-950 font-semibold text-xl'>Status</span>
                                                <div className="flex items-center gap-4">
                                                    <span>{cameraState[item.id] ?? item.state ? 'On' : 'Off'}</span>
                                                    <Switch
                                                        checked={cameraState[item.id] ?? item.state}
                                                        onChange={(checked) => {
                                                            setCameraState(prev => ({ ...prev, [item.id]: checked }));
                                                            toggleCameraState(item.id, item.state);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {renderCameraDetail('Ladle', item.ladle_details?.ladleId || '---')}
                                            {renderCameraDetail('Last Tracked', moment.utc(item.timestamp).local().fromNow())}
                                        </div>
                                        <EditCamera smsUnits={smsUnits} camera={item} />
                                        <button disabled={deleting} className='absolute top-[-10px] right-[-10px] bg-black bg-opacity-15 hover:bg-opacity-100 rounded-full h-5 w-5 p-4 flex items-center justify-center text-white' onClick={() => confirmRemoveCamera(item.id)}>
                                            <DeleteOutlined color='red' className='text-red-500' />
                                        </button>
                                    </div>
                                ))}
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default ManageCameras;
