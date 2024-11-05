import { Skeleton, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import moment from 'moment';
import EditTemperature from '../components/EditTemperature';
import AddMaintainance from '../components/AddMaintainance';
import { useAuth } from '../AuthContext';

const LadleHistory = ({ smsUnits }) => {
    const { user } = useAuth();
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
    const [maintainanceHistory, setMaintainanceHistory] = useState([]);
    const updateMaintainanceHistory = (data) => {
        setMaintainanceHistory(data);
    };
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
            setHistory(response.data.ladleHistory);
            setMaintainanceHistory(response.data.ladleMaintainanceHistory);
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
    const [markingDelivered, setMarkingDelivered] = useState(false);
    const markDelivered = async (historyId) => {
        try {
            setMarkingDelivered(true);
            const data = { time: new Date() }
            const response = await axios.put(`/api/maintain-ladle/${historyId}`, data);
            setMaintainanceHistory(maintainanceHistory.map(item => item.id === historyId ? { ...item, delivered_at: data.time } : item));
        } catch (error) {
            console.log(error)
        } finally {
            setMarkingDelivered(false);
        }
    };

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
        },
        {
            title: 'Processing Time (min)',
            dataIndex: 'processing_time',
            key: 'processing_time'
        }
    ];

    const maintainanceColumns = [
        {
            title: 'Maintained By',
            dataIndex: 'maintainedBy_name',
            key: 'maintainedBy',
        },
        {
            title: 'Assigned At',
            dataIndex: 'assigned_at',
            key: 'assigned_at',
        },
        {
            title: 'Delivered At',
            key: 'delivered_at',
            render: (_, record) => (
                record.delivered_at != '---' ?
                    <span>{record.delivered_at}</span>
                    :
                    (user.role === 'admin' || record.maintainedBy == user.id) ?
                        <button disabled={markingDelivered} onClick={() => markDelivered(record.key)} className='px-2 py-1 rounded-md bg-orange-950 text-white'>{markingDelivered ? 'Delivering' : 'Deliver Now'}</button>
                        :
                        <span>{record.delivered_at}</span>
            )
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
                    ladleData ? <div className='space-y-8'>
                        <div className='flex items-center justify-between gap-16'>
                            <div className="flex-1 max-w-[250px] flex flex-col gap-2 text-center">
                                <div className="text-[160px] leading-[160px] font-semibold text-orange-950">{ladleData.ladleId}</div>
                                <div className="">Ladle Number</div>
                                {(maintainanceHistory.length && !maintainanceHistory[0].delivered_at)
                                    ?
                                    (user.role === 'admin' || maintainanceHistory[0].maintainedBy == user.id) ?
                                        <button disabled={markingDelivered} onClick={() => markDelivered(maintainanceHistory[0].id)} className='bg-red-800 text-white rounded-md px-3 py-2'>{markingDelivered ? 'Delivering' : 'Deliver Now'}</button>
                                        :
                                        <p className='text-red-500'>Ladle is under maintainance</p>
                                    :
                                    <AddMaintainance ladleId={ladleData.id} maintainanceHistory={maintainanceHistory} updateMaintainanceHistory={updateMaintainanceHistory} />
                                }
                                <EditTemperature ladleData={ladleData} updateLadleData={updateLadleData} />
                            </div>
                            <div className='p-4 space-y-2 w-[450px]'>
                                {renderLadleDetail('Grade', ladleData.grade || '----')}
                                {renderLadleDetail('Capacity', `${ladleData.capacity} tonn`)}
                                {renderLadleDetail('Weight', `${ladleData.weight} kg`)}
                                {renderExpectedTemperature(ladleData)}
                                {renderLadleDetail('Measured Temperature', `${ladleData.temperature} °C`)}
                                {renderLadleDetail('Last Measured', moment.utc(ladleData.timestamp).local().fromNow())}
                                {renderLadleDetail('Total Cycles', history.filter(item => item.location.startsWith('CCM ')).length)}
                                {renderLadleDetail('Total Maintainance', (maintainanceHistory.length && !maintainanceHistory[0].delivered_at) ? maintainanceHistory.length - 1 : maintainanceHistory.length)}
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
                                    processing_time: moment.utc(item.departure_time).local().diff(moment.utc(item.arrival_time).local(), 'minutes')
                                }))}
                                pagination={history.length > 40 ? { pageSize: 40 } : false}
                            />
                        </div>
                        <div className='space-y-6'>
                            <h1 className='text-center text-2xl font-medium text-orange-950'>Maintainance History</h1>
                            <Table
                                className='w-full'
                                size="small"
                                columns={maintainanceColumns}
                                dataSource={maintainanceHistory.map((item) => ({
                                    key: item.id,
                                    id: item.id,
                                    assigned_at: moment.utc(item.assigned_at).local().format('YYYY-MM-DD HH:mm:ss'),
                                    maintainedBy: item.maintainedBy,
                                    delivered_at: item.delivered_at ? moment.utc(item.delivered_at).local().format('YYYY-MM-DD HH:mm:ss') : '---',
                                    maintainedBy_name: item.maintainedBy_name
                                }))}
                                pagination={history.length > 40 ? { pageSize: 40 } : false}
                            />
                        </div>
                    </div>
                        :
                        <p className='text-center'>Ladle not found</p>
                }
            </div>
        </main>
    );
};

export default LadleHistory;