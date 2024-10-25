import { Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Line } from 'react-chartjs-2';

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
    const [cycleCount, setCycleCount] = useState();
    const [ladleData, setLadleData] = useState();
    const [fetchingLadleData, setFetchingLadleData] = useState(true);

    const getLadleData = async () => {
        try {
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
            setError(false);
            const response = await axios.get(`/api/ladle-history/${params.id}`);
            setHistory(response.data);
        } catch (error) {
            setError(error.response.data.detail || "History not found!");
        } finally {
            setLoading(false);
        }
    };

    const getCycleCount = async () => {
        try {
            const response = await axios.get(`/api/cycle-count/${params.id}`);
            setCycleCount(response.data);
        } catch (error) {
        }
    };

    useEffect(() => {
        getLadleData();
        getHistory();
        getCycleCount();
    }, [params.id]);

    const formatDate = (dateString) => {
        const optionsTime = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };
        const optionsDate = {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
        };

        const date = new Date(dateString);
        const formattedTime = date.toLocaleTimeString('en-GB', optionsTime);
        const formattedDate = date.toLocaleDateString('en-GB', optionsDate);

        return `${formattedTime} ${formattedDate}`;
    };

    const columns = [
        {
            title: 'Location',
            dataIndex: 'cameraId',
            key: 'cameraId',
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
        }
    ];

    // Create a mapping for cameraId to numeric values
    const cameraIdMapping = {
        'SMS1_01': 1,
        'SMS1_02': 2,
        'SMS1_03': 3,
    };

    // Prepare data for the chart
    const chartData = {
        labels: history.map((location) => formatDate(location.timestamp)),
        datasets: [
            {
                label: 'Camera ID',
                data: history.map((location) => cameraIdMapping[location.cameraId] || 0), // Map cameraId to numeric
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Timestamp',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Camera ID',
                },
                ticks: {
                    callback: function (value) {
                        // Reverse map numeric values to cameraId labels
                        return Object.keys(cameraIdMapping).find(key => cameraIdMapping[key] === value) || '';
                    },
                    stepSize: 1, // Force only whole numbers on the Y-axis
                },
                min: 1, // Start from 1 (SMS1_01)
                max: 3, // End at 3 (SMS1_03)
            },
        },
    };
    
    return (
        <main className='flex'>
            <Sidebar smsUnits={smsUnits} selectedUnit={selectedUnit} updateSelectedUnit={updateSelectedUnit} />
            <div className='min-h-[calc(100vh-60px)] w-full'>
                <div className='p-16 flex flex-col justify-center items-center w-full'>
                    <h1 className='text-2xl mb-4'>{selectedUnit}</h1>
                    <p className='text-xl mb-8'>Ladle {ladleData?.ladleId}</p>
                    <div className='mb-8'>
                        <div className='border border-orange-700 shadow-md rounded-lg p-4 text-center'>
                            <h1 className='text-xl'>No. of Cycles</h1>
                            <p className='text-2xl'>{cycleCount ? cycleCount - 1 : '---'}</p>
                        </div>
                    </div>
                    {loading ? 'Loading'
                        :
                        <>
                            {error ?
                                <p className='text-red-500'>{error}</p> :
                                <>
                                    <Table
                                        className='w-full'
                                        columns={columns}
                                        dataSource={history.map((location) => ({
                                            key: location.id,
                                            cameraId: location.cameraId,
                                            timestamp: formatDate(location.timestamp)
                                        }))}
                                    />
                                    {/* Render the chart */}
                                    {history.length > 0 ? (
                                        <div className='mt-8 w-full h-96'>
                                            <Line data={chartData} options={chartOptions} />
                                        </div>
                                    ) : (
                                        <p>No history data available</p>
                                    )}
                                </>
                            }
                        </>
                    }
                </div>
            </div>
        </main>
    );
};

export default LadleHistory;