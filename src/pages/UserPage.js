import React, { useState, useEffect } from "react";
import Navbar from '../components/common/Navbar';
import SwitchCustom from '../components/common/SwitchCustom';
import '../styles/Advert.css'
import { DatePicker, Table, Button } from 'antd'
import UserModal from "../components/modal/UserModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import callApi from '../service/callApi';
import { format } from 'date-fns';
import { EditOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";

function UserPage() {
    const userId = localStorage.getItem('userId');
    // const type = localStorage.getItem('type');
    const pagePage = 10; // จำนวนแถวต่อหน้า
    const [showModalUser, setShowModalUser] = useState(false);
    const [clickSource, setClickSource] = useState(false);
    const [dataEdit, setdataEdit] = useState([]);
    const [totalDoc, setTotalDoc] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [dataTable, setDataTable] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
       
            fetchData();
       
        //eslint-disable-next-line
    }, [userId]);

    const columns = [
        { title: 'ลำดับ', dataIndex: 'no', key: 'no', align: 'center' },
        {
            title: 'ผู้ใช้',
            dataIndex: 'username',
            key: 'username',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.username}</div>
        },
        {
            title: 'ชื่อ-นามสกุล',
            dataIndex: 'name',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.name} {record.lastname}</div>
        },
        {
            title: 'วันที่สร้าง',
            dataIndex: 'createAt',
            key: 'createAt',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.createAt}</div>
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => (
                <SwitchCustom
                    checkend={record.status}
                    apiEndPoint={"/api/updateUserById/" + record.key}
                />)
        },
        {
            title: 'จัดการ',
            dataIndex: 'edit',
            key: 'edit',
            align: 'center',
            render: (text, record) => <Button onClick={() => handleEdit(record.key)} icon={<EditOutlined />}>edit</Button>

        }
    ];

    const fetchData = async (startDate, endDate, page) => {
        setLoading(true)
        // console.log(format(startDate.$d, 'yyyy-MM-dd'));
        // console.log(format(endDate.$d, 'yyyy-MM-dd'));
        var dateStart, dateEnd;
        if (startDate && endDate) {
            dateStart = format(startDate.$d, 'yyyy-MM-dd');
            dateEnd = format(endDate.$d, 'yyyy-MM-dd');
        }
        try {

            window.scrollTo(0, 0);
            let responseDocCountUser, pageTable, responseGetUser, dataCallApi;
            dataCallApi = { startDate: dateStart, endDate: dateEnd };
            responseDocCountUser = await callApi("get", "/api/countUser", dataCallApi)
            const totalDoc = responseDocCountUser;
            setTotalDoc(totalDoc);
            if (page) {
                pageTable = page
            } else {
                pageTable = currentPage;
            }

            dataCallApi.page = pageTable;
            dataCallApi.perPage = pagePage;
            dataCallApi.type = "all";
            responseGetUser = await callApi("get", "/api/getUser", dataCallApi)
            const dataSource = [];

            responseGetUser.forEach((value, index) => {
                const dataItem = {
                    key: value.user_id,
                    no: String((index + 1) + ((pageTable - 1) * pagePage)),
                    username: value.username,
                    name: value.name,
                    lastname: value.lastname,
                    createAt: format(value.create_at, 'dd-MM-yyyy ') ,
                    status: value.active
                }
 
                dataSource.push(dataItem);
            });
            setDataTable(dataSource);
            setLoading(false)
        } catch (error) {
            console.error('Error getting documents: ', error);
        }
    }


    const handleStartDateChange = (dateStart) => {
        if (dateStart && selectedEndDate && dateStart > selectedEndDate) {
            setSelectedEndDate(dateStart);
            fetchData(dateStart, dateStart, 1);
            setCurrentPage(1);
        } else if (dateStart && selectedEndDate) {
            fetchData(dateStart, selectedEndDate, 1);
            setCurrentPage(1);
        }
        if (dateStart) {
            setSelectedStartDate(dateStart);
        } else if (dateStart === null) {
            fetchData();
            setSelectedEndDate(null)
            setCurrentPage(1);
        }
    };

    const handleEndDateChange = (dateEnd) => {
        if (dateEnd && selectedStartDate && dateEnd < selectedStartDate) {
            setSelectedStartDate(dateEnd);
            fetchData(dateEnd, dateEnd, 1);
            setCurrentPage(1);
        } else if (dateEnd && selectedStartDate) {
            fetchData(selectedStartDate, dateEnd, 1);
            setCurrentPage(1);
        }
        if (dateEnd) {
            setSelectedEndDate(dateEnd);
        } else if (dateEnd === null) {
            fetchData();
            setSelectedStartDate(null)
            setCurrentPage(1);
        }
    };

    const handleChangePage = (page) => {
        setCurrentPage(page);
        fetchData(selectedStartDate, selectedEndDate, "", page)
    };

    const handleOk = async (value, clickSource) => {

        setShowModalUser(false);
        let dataCall = "", pathCallApi = "", metod = "";

        dataCall = {
            username: value.username,
            password: value.password,
            name: value.name,
            lastname: value.lastname,
            type: "0",
        }

        if (clickSource === "add") {
            pathCallApi = "/api/insUser";
            metod = "post";
        } else if (clickSource === "edit") {
            pathCallApi = "/api/updateUserById/" + value.userId
            metod = "patch";
        }
        await callApi(metod, pathCallApi, dataCall)

        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: "บันทึกข้อมูลสำเร็จ"
        });

        fetchData(selectedStartDate, selectedEndDate, currentPage)

    };

    const handleEdit = async (id) => {
        const response = await callApi("get", "/api/getUserById/" + id, {});

        setdataEdit(response[0])
        setClickSource("edit");
        setShowModalUser(true);
    };
    const onClose = () => {

        setShowModalUser(false);
    };
    return (
        <>
            <Navbar />
            <UserModal
                clickSource={clickSource}
                openModal={showModalUser}
                onSave={handleOk}
                onClose={onClose}
                dataEdit={dataEdit}
            />

            <div className="advert-datepicker" >
                <div className="div-btn-add-advert">
                    <Button type="primary"
                        className="btn-add-advert"
                        onClick={() => {
                            setShowModalUser(true);
                            setClickSource("add");
                        }}
                    >
                        <label className="fontawesome-faplus"> <FontAwesomeIcon icon={faPlus} /></label>
                        <label className="label-add-advert">เพิ่มผู้ใช้งาน</label>
                    </Button>
                </div>
                <div>
                    <DatePicker
                        value={selectedStartDate}
                        onChange={handleStartDateChange}
                        format="DD/MM/YYYY"
                        className="datepicker-startDate-advert-search"

                    />
                    <label className="label-between" style={{ margin: "5px" }}> - </label>
                    <DatePicker
                        value={selectedEndDate}
                        onChange={handleEndDateChange}
                        format="DD/MM/YYYY"
                        className="datepicker-endDate-advert-search"
                    />
                </div>
            </div>

            <div className="d-flex">
                <div className="table">
                    <Table
                        dataSource={dataTable}
                        columns={columns}
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            total: totalDoc,
                            pageSize: pagePage,
                            onChange: handleChangePage
                        }} />
                </div>
            </div>
        </>
    );
}

export default UserPage;
