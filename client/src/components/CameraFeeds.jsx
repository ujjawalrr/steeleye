import React, { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment';
import { IoVideocamOff, IoVideocam } from "react-icons/io5";
import { ArrowDownOutlined, ArrowLeftOutlined, ArrowRightOutlined, ArrowUpOutlined, DoubleLeftOutlined, DoubleRightOutlined, XOutlined } from '@ant-design/icons';
import { Skeleton } from 'antd';
const CameraFeeds = ({ selectedUnit }) => {
    const [cameraFeeds, setCameraFeeds] = useState([]);
    const [untrackedLadles, setUntrackedLadles] = useState([]);
    const getCameraFeeds = async () => {
        if (!selectedUnit) return;
        try {
            const response = await axios.get(`/api/unitcamerafeeds/${selectedUnit}`);
            if (response?.data?.camera_feeds) {
                setCameraFeeds(response.data.camera_feeds);
            }
            if (response?.data?.untracked_ladles) {
                setUntrackedLadles(response.data.untracked_ladles);
            }
        } catch (error) {
            setCameraFeeds([]);
            setUntrackedLadles([]);
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
    const renderUnit = (unit) => {
        return (
            <div>
                <h3 className='text-center pb-4 text-2xl font-semibold text-orange-950'>{unit}</h3>
                <div className='space-y-4 max-w-[400px] mx-auto'>
                    {cameraFeeds.filter((item) => item.subunit === unit).map((item, index) => (
                        <div key={index} className="p-4 border shadow-md rounded-xl">
                            <div className="flex gap-8 justify-between items-center">
                                <span className='text-orange-950 font-semibold'>{item.location}</span>
                                <button className='text-orange-950 text-3xl' onClick={() => toggleCameraState(item.id, item.state)}>{item.state ? <IoVideocam /> : <IoVideocamOff />}</button>
                            </div>
                            {item.ladle_details ?
                                <>
                                    <div className='relative text-center my-4'>
                                        <img className='h-[180px] mx-auto rounded-md z-10' src='/production-ladle.png' alt="" />
                                        <p className='w-full h-full absolute top-[60px] z-20 text-white text-[60px] leading-[60px] font-semibold'>{item.ladle_details.ladleId}</p>
                                    </div>
                                    {renderExpectedTemperature(item.ladle_details)}
                                </>
                                :
                                <div className='text-center text-orange-950 text-[50px]'>
                                    <XOutlined />
                                </div>
                            }
                            {renderCameraDetail(item.ladle_details ? 'Arrived' : 'Departed', moment.utc(item.timestamp).local().fromNow())}
                            {renderCameraDetail('Checked', moment.utc(item.last_detection).local().fromNow())}
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    const renderExpectedTemperatureForOnTheWay = (item) => {
        const minElapsed = moment().diff(moment.utc(item.timestamp).local(), 'minutes');
        const expectedTemp = (item.temperature - (minElapsed * 10 / 15)).toFixed(2);
        return (
            <p className='font-medium text-orange-950'>{expectedTemp > 0 ? `${expectedTemp} °C` : 'Measure Temp'}</p>
        );
    };
    const mapImgUrl = (spot) => {
        switch (spot) {
            case 'MAINTAINANCE':
                return '/maintainance-ladle.png';
            case 'CCM':
                return '/halted-ladle.png';
            case 'NEW':
                return '/halted-ladle.png';
            default:
                return "/production-ladle.png";
        }
    }
    const renderUntrackedLadles = (spot) => {
        return (
            <div className='space-y-4'>
                {untrackedLadles.filter((item) => item.location.startsWith(spot)).map((item) => (
                    <div key={item.id} className='text-center border shadow-md rounded-xl p-1'>
                        <div className='relative h-[180px]'>
                            <img className='h-[180px] rounded-md z-10' src={mapImgUrl(spot)} alt="" />
                            <p className='w-full h-full absolute top-[60px] z-20 text-white text-[60px] leading-[60px] font-semibold'>{item.ladleId}</p>
                        </div>
                        <div className='p-1 py-3'>
                            {renderExpectedTemperatureForOnTheWay(item)}
                            <p>{spot != 'MAINTAINANCE' ? item.location : item.name}</p>
                            <p className='text-sm font-light'>{moment.utc(item.departure_time).local().fromNow()}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return (
        <div className='p-4 flex flex-col w-full'>
            {selectedUnit ?
                <>
                    <h1 className='text-center text-2xl mb-4'>{selectedUnit} Live Status</h1>
                    {cameraFeeds.length > 0 ?
                        <div className='space-y-8'>
                            <div className="flex justify-between w-full">
                                {renderUnit('BOF')}
                                <div className='flex gap-8 flex-col items-center pt-2'>
                                    <div className='flex justify-between'>
                                        <ArrowRightOutlined />
                                        <span className='px-2'>Way to LF</span>
                                        <ArrowRightOutlined />
                                    </div>
                                    {renderUntrackedLadles('BOF')}
                                </div>
                                {renderUnit('LF')}
                                <div className='flex gap-8 flex-col items-center pt-2'>
                                    <div className='flex justify-between'>
                                        <ArrowRightOutlined />
                                        <span className='px-2'>Way to CCM</span>
                                        <ArrowRightOutlined />
                                    </div>
                                    {renderUntrackedLadles('LF')}
                                </div>
                                {renderUnit('CCM')}
                            </div>
                            <div className='flex justify-between'>
                                <div className='text-center'>
                                    <ArrowUpOutlined />
                                    <h3 className='py-4'>Way to BOF</h3>
                                    {renderUntrackedLadles('LPB')}
                                </div>
                                <div className='flex items-center justify-center h-stretch max-h-[410px]'>
                                    <ArrowLeftOutlined />
                                </div>
                                <div className='pt-24'>
                                    {renderUnit('Preparation Bay')}
                                </div>
                                <div className='flex items-center justify-center h-stretch max-h-[410px]'>
                                    <DoubleLeftOutlined />
                                    <DoubleRightOutlined />
                                </div>
                                <div className='pt-48'>
                                    <h3 className='text-center pb-4'>Under Maintenance</h3>
                                    {renderUntrackedLadles('MAINTAINANCE')}
                                </div>
                                <div className='flex items-center justify-center h-stretch max-h-[410px]'>
                                    <DoubleLeftOutlined />
                                    <DoubleRightOutlined />
                                </div>
                                <div className='text-center'>
                                    <ArrowDownOutlined />
                                    <h3 className='py-4'>Available</h3>
                                    <div className='pb-4'>
                                        {renderUntrackedLadles('NEW')}
                                    </div>
                                    {renderUntrackedLadles('CCM')}
                                </div>
                            </div>
                        </div>
                        :
                        <p className='text-center'>No camera found</p>
                    }
                </>
                :
                <Skeleton active />
            }
        </div>
    )
}

export default CameraFeeds
