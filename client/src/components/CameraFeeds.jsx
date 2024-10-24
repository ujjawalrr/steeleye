import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment';
import { IoVideocamOff, IoVideocam } from "react-icons/io5";
const CameraFeeds = ({ selectedUnit }) => {
    const [cameraFeeds, setCameraFeeds] = useState([]);
    const getCameraFeeds = async () => {
        if(!selectedUnit) return;
        try {
            const response = await axios.get(`/api/unitcameras/${selectedUnit}`);
            if (response?.data?.length > 0) {
                setCameraFeeds(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        selectedUnit && getCameraFeeds();

        const interval = setInterval(getCameraFeeds, 5000);

        return () => clearInterval(interval);
    }, [selectedUnit]);

    const renderCameraDetail = (label, value) => (
        <div className="flex gap-8 justify-between items-end">
            <span className='text-orange-950 font-semibold'>{label}</span>
            <span>{value}</span>
        </div>
    );

    const toggleCameraState = async (id, currentState) => {
        try {
            const newState = !currentState;

            await axios.put(`/api/toggleCameraState/${id}`, { state: newState });
            setCameraFeeds(cameraFeeds.map(item =>
                item.id === id ? { ...item, state: newState } : item
            ));
        } catch (error) {
        }
    }
    const renderExpectedTemperature = (item) => {
        if (!item) return (
            <div className="flex gap-8 justify-between items-end">
                <span className='text-orange-950 font-semibold'>Temperature</span>
                <span>---</span>
            </div>
        );
        const minElapsed = moment().diff(moment.utc(item.timestamp).local(), 'minutes');
        const expectedTemp = (item.temperature - (minElapsed * 10 / 15)).toFixed(2);
        return (
            <div className="flex gap-8 justify-between items-end">
                <span className='text-orange-950 font-semibold'>Temperature</span>
                <span>{expectedTemp > 0 ? `${expectedTemp} °C` : 'Measure'}</span>
            </div>
        );
    };
    return (
        <div className='p-4 flex flex-col w-full'>
            <h1 className='text-center text-2xl mb-4'>Camera Feed</h1>
            {cameraFeeds.length > 0 ?
                <div className='space-y-16'>
                    <div className="grid grid-cols-3 gap-8">
                        {['BOF', 'LF', 'CCM'].map((subunit, index) => (
                            <div key={index}>
                                <h3 className='text-center pb-4 text-2xl font-semibold text-orange-950'>{subunit}</h3>
                                <div className='space-y-4'>
                                    {cameraFeeds.filter((item) => item.subunit === subunit).map((item, index) => (
                                        <div key={index} className="p-4 border shadow-md rounded-xl">
                                            <div className='text-center pb-2 text-xl font-medium text-orange-950'>{item.location}</div>
                                            <div className="flex gap-8 justify-between items-end">
                                                <span className='text-orange-950 font-semibold'>Status</span>
                                                <button className='text-orange-950 text-3xl' onClick={() => toggleCameraState(item.id, item.state)}>{item.state ? <IoVideocam /> : <IoVideocamOff />}</button>
                                            </div>
                                            {renderCameraDetail('Ladle', item.ladle_details?.ladleId || '---')}
                                            {renderExpectedTemperature(item.ladle_details)}
                                            {renderCameraDetail(item.ladle_details ? 'Arrived' : 'Departed', moment.utc(item.timestamp).local().fromNow())}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        {/* <h3 className='text-center pb-4 text-2xl font-semibold text-orange-950'>Ladle Preparation Bay</h3> */}
                        <div className='space-y-4 max-w-[400px] mx-auto'>
                            {cameraFeeds.filter((item) => item.subunit === 'Preparation Bay').map((item, index) => (
                                <div key={index} className="p-4 border shadow-md rounded-xl">
                                    <div className='text-center pb-2 text-xl font-medium text-orange-950'>{item.location}</div>
                                    <div className="flex gap-8 justify-between items-end">
                                        <span className='text-orange-950 font-semibold'>Status</span>
                                        <button className='text-orange-950 text-3xl' onClick={() => toggleCameraState(item.id, item.state)}>{item.state ? <IoVideocam /> : <IoVideocamOff />}</button>
                                    </div>
                                    {renderCameraDetail('Ladle', item.ladle_details?.ladleId || '---')}
                                    {renderExpectedTemperature(item.ladle_details)}
                                    {renderCameraDetail(item.ladle_details ? 'Arrived' : 'Departed', moment.utc(item.timestamp).local().fromNow())}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                :
                <p className='text-center'>No camera found</p>
            }
        </div>
    )
}

export default CameraFeeds
