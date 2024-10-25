import { Skeleton, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import moment from 'moment';
import EditTemperature from '../components/EditTemperature';

const LadleHistory = ({ smsUnits }) => {
    const [selectedUnit, setSelectedUnit] = useState('');
    const updateSelectedUnit = (value) => {
        setSelectedUnit(value);
    }
    useEffect(() => {
        if (smsUnits?.length > 0) {
            setSelectedUnit(smsUnits[0].unitId);
        }
    }, [smsUnits]);
    const params = useParams();
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    // const [cycleCount, setCycleCount] = useState();
    const [ladleData, setLadleData] = useState();
    const updateLadleData = (data) => {
        setLadleData(data);
    };
    const [fetchingLadleData, setFetchingLadleData] = useState(true);

    const getLadleData = async () => {
        try {
            setLadleData();
            setFetchingLadleData(true);
            const response = await axios.get(`/api/ladle/${params.id}`);
            setLadleData(response.data);
        } catch (error) {
        } finally {
            setFetchingLadleData(false);
        }
    };

    const getHistory = async () => {
        try {
            setLoading(true);
            setHistory([]);
            setError(false);
            const response = await axios.get(`/api/ladle-history/${params.id}`);
            setHistory(response.data);
        } catch (error) {
            setError(error.response.data.detail || "History not found!");
        } finally {
            setLoading(false);
        }
    };

    // const getCycleCount = async () => {
    //     try {
    //         setCycleCount();
    //         const response = await axios.get(`/api/cycle-count/${params.id}`);
    //         setCycleCount(response.data);
    //     } catch (error) {
    //     }
    // };

    useEffect(() => {
        params.id && getLadleData();
        params.id && getHistory();
        // params.id && getCycleCount();
    }, [params.id]);

    const columns = [
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Temperature (°C)',
            dataIndex: 'temperature',
            key: 'temperature',
        },
        {
            title: 'Arrival Time',
            dataIndex: 'arrival_time',
            key: 'arrival_time',
        },
        {
            title: 'Departure Time',
            dataIndex: 'departure_time',
            key: 'departure_time',
        }
    ];

    const renderLadleDetail = (label, value) => (
        <div className="flex gap-8 justify-between items-end">
            <span className='text-orange-950 font-semibold text-xl'>{label}</span>
            <span>{value}</span>
        </div>
    );

    const renderExpectedTemperature = (item) => {
        const minElapsed = moment().diff(moment.utc(item.timestamp).local(), 'minutes');
        const expectedTemp = (item.temperature - (minElapsed * 10 / 15)).toFixed(2);
        return (
            <div className="flex gap-8 justify-between items-end">
                <span className='text-orange-950 font-semibold text-xl'>Current Temperature</span>
                <span>{expectedTemp > 0 ? `${expectedTemp} °C` : 'Measure'}</span>
            </div>
        );
    };

    return (
        <main className='flex'>
            <Sidebar smsUnits={smsUnits} selectedUnit={selectedUnit} updateSelectedUnit={updateSelectedUnit} />
            <div className='min-h-[calc(100vh-60px)] w-full p-4 max-w-[900px] mx-auto'>
                {(fetchingLadleData || loading) ?
                    <Skeleton active />
                    :
                    <div className='space-y-8'>
                        <div className='flex items-center justify-between gap-16'>
                            <div className="space-y-4 text-center">
                                <div className="text-[160px] leading-[160px] font-semibold text-orange-950">{ladleData.ladleId}</div>
                                <div className="">Ladle Number</div>
                            </div>
                            <div className="flex-1">
                                <div className='p-4 space-y-2 max-w-[450px] w-full'>
                                    {renderLadleDetail('Grade', ladleData.grade || '----')}
                                    {renderLadleDetail('Capacity', `${ladleData.capacity} tonn`)}
                                    {renderLadleDetail('Weight', `${ladleData.weight} kg`)}
                                    {renderExpectedTemperature(ladleData)}
                                    {renderLadleDetail('Measured Temperature', `${ladleData.temperature} °C`)}
                                    {renderLadleDetail('Last Measured', moment.utc(ladleData.timestamp).local().fromNow())}
                                </div>
                            </div>
                            <div className='spacey-y-4'>
                                {/* <div>
                                    <div className='text-center text-2xl font-medium text-orange-950'>Cycle Count</div>
                                    <div className='text-center text-4xl font-semibold text-orange-950'>{history.filter(item => item.location.startsWith('CCM ')).length}</div>
                                </div> */}
                                {renderLadleDetail('Cycle', history.filter(item => item.location.startsWith('CCM ')).length)}
                                <div className='pt-4'>
                                    <EditTemperature ladleData={ladleData} updateLadleData={updateLadleData} />
                                </div>
                            </div>
                        </div>
                        <div className='space-y-6'>
                            <h1 className='text-center text-2xl font-medium text-orange-950'>Tracking History</h1>
                            <Table
                                className='w-full'
                                size="small"
                                columns={columns}
                                dataSource={history.map((item) => ({
                                    key: item.id,
                                    location: item.location,
                                    temperature: item.temperature,
                                    arrival_time: moment.utc(item.arrival_time).local().format('YYYY-MM-DD HH:mm:ss'),
                                    departure_time: moment.utc(item.departure_time).local().format('YYYY-MM-DD HH:mm:ss'),
                                }))}
                                pagination={history.length > 50 ? { pageSize: 50 } : false}
                            />
                        </div>
                    </div>
                }
            </div>
        </main>
    );
};

export default LadleHistory;