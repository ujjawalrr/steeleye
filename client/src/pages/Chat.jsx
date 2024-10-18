import React, { useEffect, useRef, useState } from "react";
import { Select, Switch, Input, Tooltip, Skeleton, Badge, Card, Table, Steps, notification } from "antd";
import { DownloadOutlined, HistoryOutlined, TwitchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
// import SchemaDrawer from "../components/SchemaDrawer";
// import SQLQueryModal from "../components/SQLQueryModal";
// import VisualiserModal from "../components/Home/Graphs/VisualiserModal";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

const Chat = () => {
    const [api, contextHolder] = notification.useNotification();
    const openNotification = (message, type) => {
        api[type]({
            message: message,
            placement: 'bottomRight',
            showProgress: true,
            pauseOnHover: true,
        });
    };
    const scrollableRef = useRef(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(null);
    //   const navigate = useNavigate();
    //   const location = useLocation();
    //   const searchParams = new URLSearchParams(location.search);
    //   const [ThreadID, setThreadID] = useState(
    //     searchParams.get("ThreadID") || null
    //   );
    //   useEffect(() => {
    //     setThreadID(searchParams.get("ThreadID"));
    //   }, [location.search]);

    //   const [isChatting, setIsChatting] = useState(ThreadID ? true : false);
    //   const [savedQueries, setSavedQueries] = useState([]);
    const [userQuestion, setUserQuestion] = useState(null);
    const [receivingResponse, setReceivingResponse] = useState(false);
    const handleChat = async () => {
        if (!userQuestion) return openNotification('Please enter your question!', 'error');
        // setIsChatting(true);
        setReceivingResponse(true);
        try {
            setChatMessages([
                ...chatMessages,
                {
                    message: userQuestion,
                    sender: "user",
                    timestamp: new Date(),
                },
            ]);
            const res = await axios.post(
                `/api/message`,
                { message: userQuestion }
            );
            setUserQuestion("");
            setNewMessage(res.data.newMessage);
        } catch (error) {
            openNotification(error.response.data.message, "error");
        } finally {
            setReceivingResponse(false);
        }
    };
    useEffect(() => {
        if (newMessage) {
            setChatMessages([...chatMessages, newMessage]);
        }
    }, [newMessage]);
    useEffect(() => {
        if (scrollableRef.current) {
            scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
        }
    }, [chatMessages]);

    console.log(chatMessages);

    // const handleNewChat = () => {
    //     setReceivingResponse(false);
    //     // setIsChatting(false);
    //     setChatMessages([]);
    //     setNewMessage(null);
    //     navigate("/chat");
    // };

    useEffect(() => {
        window.scrollTo(0, 0);
        if (scrollableRef.current) {
            scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
        }
    }, []);

    const exportCSV = (data) => {
        const csv = Papa.unparse({
            fields: data.columns,
            data: data.rows,
        });
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `table-${uuidv4()}.csv`);
    };

    // const handleNavigate = (path) => {
    //     setReceivingResponse(false);
    //     navigate(path);
    // }

    return (
        <main className="w-full h-[calc(100vh-80px)]">
            {contextHolder}
            <div className="flex w-full h-[calc(100vh-80px)]">
                <div className="md:p-4 w-full max-w-3xl mx-auto flex h-[calc(100vh-80px)]">
                    <div className="flex flex-col justify-between md:border-2 md:border-black rounded-md h-stretch w-full">
                        <div
                            ref={scrollableRef}
                            className="h-stretch overflow-auto px-4 pt-2 md:px-8 md:pt-8 pb-2 flex-auto flex flex-col items-center scroll-smooth"
                        >
                            <div className="flex flex-col gap-4 w-full">
                                {chatMessages?.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-2 ${message.sender === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div className="min-w-[80%] lg:max-w-[700px] xl:max-w-[900px] lg:min-w-[300px]">
                                            <Badge.Ribbon
                                                text={message.sender === "user" ? "You" : "AI"}
                                                color={`${message.sender === "user" ? "#01b799" : "#fa9111"
                                                    }`}
                                                placement={`${message.sender === "user" ? "end" : "start"
                                                    }`}
                                            >
                                                <Card
                                                    title={message.sender === "ai" && !message?.message?.error ? (
                                                        <>
                                                            <div className="flex w-full justify-end gap-2 pl-32 pt-6 sm:pt-2">
                                                                <Tooltip title="Export Data">
                                                                    <DownloadOutlined
                                                                        onClick={() => exportCSV(message?.message)}
                                                                        className="cursor-pointer z-30 hover:text-[#fa9111]  transition-all duration-300 ease-in-out transform hover:scale-110 text-xl"
                                                                    />
                                                                </Tooltip>
                                                                {/* <SQLQueryModal
                                                                    data={message?.message}
                                                                    assistantId={message?.senderID}
                                                                    index={index}
                                                                    updateData={
                                                                        handleUpdateData
                                                                    }
                                                                    updateSavedQueries={updateSavedQueries}
                                                                    savedQueries={savedQueries}
                                                                /> */}
                                                                {/* <VisualiserModal
                                                                    data={message?.message}
                                                                /> */}
                                                            </div>
                                                        </>
                                                    ) : message.sender === "user" ? (
                                                        <Tooltip title="Ask Follow Up">
                                                            <TwitchOutlined
                                                                className="cursor-pointer text-white"
                                                                onClick={() =>
                                                                    setUserQuestion(message?.message)
                                                                }
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        " "
                                                    )
                                                    }
                                                    size="small"
                                                    className={`text-lg w-full shadow-md ${message.sender === "user"
                                                        ? "bg-[#fa9111] text-white"
                                                        : "bg-[#ECF0EF]"
                                                        }`}
                                                >
                                                    {message.sender === "user" ? (
                                                        message.message
                                                    ) : (
                                                        <div className="w-full">
                                                            {message.message.error ? (
                                                                <p>
                                                                    {JSON.stringify(message.message.error) ||
                                                                        JSON.stringify(message.message.Error)}
                                                                </p>
                                                            ) : (
                                                                <>
                                                                    <Table
                                                                        scroll={{
                                                                            y: 400,
                                                                        }}
                                                                        virtual
                                                                        dataSource={message.message.rows?.map(
                                                                            (row, index) => {
                                                                                return {
                                                                                    key: index,
                                                                                    ...Object.keys(row).reduce(
                                                                                        (acc, key) => {
                                                                                            if (
                                                                                                typeof row[key] === "number"
                                                                                            ) {
                                                                                                acc[key] =
                                                                                                    row[key].toLocaleString(
                                                                                                        "en-IN"
                                                                                                    );
                                                                                            } else {
                                                                                                acc[key] = row[key];
                                                                                            }
                                                                                            return acc;
                                                                                        },
                                                                                        {}
                                                                                    ),
                                                                                };
                                                                            }
                                                                        )}
                                                                        columns={message.message.columns?.map(
                                                                            (column, index) => {
                                                                                return {
                                                                                    title: column,
                                                                                    dataIndex: column,
                                                                                    key: index,
                                                                                };
                                                                            }
                                                                        )}
                                                                        className="table-wrapper"
                                                                        pagination={
                                                                            message?.message?.rows?.length > 20
                                                                                ? { pageSize: 20 }
                                                                                : false
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="flex justify-end text-xs pt-2">
                                                        {new Date(message.timestamp).toLocaleString(
                                                            "en-US",
                                                            {
                                                                hour: "numeric",
                                                                minute: "numeric",
                                                                hour12: true,
                                                            }
                                                        )}
                                                        ,{" "}
                                                        {new Date(message.timestamp).toLocaleString(
                                                            "en-US",
                                                            { day: "numeric", month: "short" }
                                                        )}
                                                    </p>
                                                </Card>
                                            </Badge.Ribbon>
                                        </div>
                                    </div>
                                ))}
                                {receivingResponse && (
                                    // <>
                                    //     {statusState && statusState.length > 0 ? (
                                    //         <div className="flex flex-col justify-center items-center gap-2">
                                    //             <Steps
                                    //                 size="small"
                                    //                 items={statusState.map((status, index) => ({
                                    //                     key: index,
                                    //                     title: status.status || status.message,
                                    //                     description: status.error,
                                    //                 }))}
                                    //                 direction="vertical"
                                    //                 current={statusState.length - 1}
                                    //             />
                                    //         </div>
                                    //     ) : (
                                    //         <div className="flex justify-center items-center gap-2">
                                    //             <Skeleton.Avatar active />
                                    //             <Skeleton.Input active />
                                    //         </div>
                                    //     )}
                                    // </>
                                    <div className="flex justify-center items-center gap-2">
                                        <Skeleton.Avatar active />
                                        <Skeleton.Input active />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex px-2 md:px-8 py-4 items-center gap-2">
                            {/* <SchemaDrawer /> */}
                            <Input
                                className="md:ml-4"
                                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                                size="large"
                                addonAfter={
                                    <button disabled={receivingResponse} onClick={handleChat}>
                                        Send
                                    </button>
                                }
                                autoFocus
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                placeholder="Enter full question here..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Chat;
