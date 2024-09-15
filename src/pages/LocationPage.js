import React, { useState, useEffect } from 'react';

import Navbar from '../components/common/Navbar';
import { Button, Table } from 'antd';
import SwitchCustom from '../components/common/SwitchCustom';
import { EditOutlined } from '@ant-design/icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import callApi from '../service/callApi';
import { format } from 'date-fns';
import LocationModal from '../components/modal/LocationModal';
import Swal from 'sweetalert2';


function LocationPage() {
    const [dataTable, setDataTable] = useState([]);
    const pagePage = 10;
    const [totalDoc, setTotalDoc] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [clickSource, setClickSource] = useState("add");
    const [showModalLocation, setShowModalLocation] = useState(false);
    const [dataEdit, setdataEdit] = useState([]);


    const columns = [
        { title: 'ลำดับ', dataIndex: 'no', key: 'no', align: 'center' },
        {
            title: 'ชื่อสถานที่',
            dataIndex: 'locationName',
            key: 'locationName',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.locationName}</div>
        },
        {
            title: 'Latitude',
            dataIndex: 'Latitude',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.Latitude}</div>
        },
        {
            title: 'Longitude',
            dataIndex: 'Longitude',
            key: 'Longitude',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.Longitude}</div>
        },
        {
            title: 'วันที่สร้าง',
            dataIndex: 'create_at',
            key: 'create_at',
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
                    apiEndPoint={"/api/updateLocationById/" + record.key}
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

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async (page) => {

        window.scrollTo(0, 0);
        let responseDocCountUser, pageTable, responseGetLocation;
        responseDocCountUser = await callApi("get", "/api/getCountLocation", {})
        const totalDoc = responseDocCountUser;
        setTotalDoc(totalDoc);
        if (page) {
            pageTable = page
        } else {
            pageTable = 1;
        }

        let dataCallApi = {};
        dataCallApi.page = pageTable;
        dataCallApi.perPage = pagePage;
        dataCallApi.type = "all";

        responseGetLocation = await callApi("get", "/api/getLocation", dataCallApi)
        const dataSource = [];

        responseGetLocation.forEach((value, index) => {
            const dataItem = {
                key: value.lo_id,
                no: String((index + 1) + ((pageTable - 1) * pagePage)),
                locationName: value.lo_title,
                Latitude: value.lo_latitude,
                Longitude: value.lo_longitude,
                createAt: format(value.lo_create_at, 'dd-MM-yyyy '),
                status: value.lo_active
            }
            dataSource.push(dataItem);
        });
        setDataTable(dataSource);
        setLoading(false)
    }




    const handleChangePage = (page) => {
        setCurrentPage(page);
        fetchData(page)
    };


    const handleOk = async (value, clickSource) => {

        setShowModalLocation(false);
        let dataCall = "", pathCallApi = "", metod = "";
        dataCall = {
            title: value.title,
            latitude: value.position.lat,
            longitude: value.position.lng,
        }

        if (clickSource === "add") {
            pathCallApi = "/api/insLocation";
            metod = "post";
        } else if (clickSource === "edit") {
            pathCallApi = "/api/updateLocationById/" + value.loId
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
        fetchData(currentPage)
    };

    const handleEdit = async (id) => {
        const response = await callApi("get", "/api/getLocationById/" + id, {});
        setdataEdit(response[0])
        setClickSource("edit");
        setShowModalLocation(true);
    };

    const onClose = () => {
        setShowModalLocation(false);
    };


    return (
        <>
            <Navbar />
            <LocationModal
                clickSource={clickSource}
                openModal={showModalLocation}
                onSave={handleOk}
                onClose={onClose}
                dataEdit={dataEdit}
            />
            <div className="advert-datepicker" >
                <div className="div-btn-add-advert">
                    <Button type="primary"
                        className="btn-add-advert"
                        onClick={() => {
                            setShowModalLocation(true);
                            setClickSource("add");
                        }}
                    >
                        <label className="fontawesome-faplus"> <FontAwesomeIcon icon={faPlus} /></label>
                        <label className="label-add-advert">เพิ่มสถานที่เช็คอิน</label>
                    </Button>
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

export default LocationPage
