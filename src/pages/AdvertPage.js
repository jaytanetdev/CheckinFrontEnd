import React, { useState, useEffect } from "react";
import Navbar from '../components/common/Navbar';
import SwitchCustom from '../components/common/SwitchCustom';
import '../styles/Advert.css'
import { DatePicker, Image, Table, Button } from 'antd'
import AdvertModal from "../components/modal/AdvertModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import callApi from '../service/callApi';
import { format } from 'date-fns';
import Swal from "sweetalert2";
import { EditOutlined } from '@ant-design/icons';
function AdvertPage() {
    const userId = localStorage.getItem('userId');
    // const type = localStorage.getItem('type');
    const pagePage = 10; // จำนวนแถวต่อหน้า
    const [shoModalAdvert, setShoModalAdvert] = useState(false);
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
            let responseDocCountAdvert, pageTable, responseGetAdvert, dataCallApi;
            dataCallApi = { startDate: dateStart, endDate: dateEnd };

            responseDocCountAdvert = await callApi("get", "/api/countDocAllAdvert", dataCallApi)
            const totalDoc = responseDocCountAdvert;
            setTotalDoc(totalDoc);
            if (page) {
                pageTable = page
            } else {
                pageTable = currentPage;
            }
            dataCallApi.page = pageTable;
            dataCallApi.perPage = pagePage;
            responseGetAdvert = await callApi("get", "/api/getAdvert", dataCallApi)
            const dataSource = [];
            responseGetAdvert.forEach((value, index) => {
                const dataItem = {
                    key: value.adv_id,
                    no: String((index + 1) + ((pageTable - 1) * pagePage)),
                    name: value.adv_title,
                    dateStart: format(value.adv_date_start, 'dd-MM-yyyy'),
                    dateEnd: format(value.adv_date_end, 'dd-MM-yyyy'),
                    linkImage: value.adv_linkfile,
                    status: value.adv_status
                }
                dataSource.push(dataItem);
            });
            setDataTable(dataSource);
            setLoading(false)
        } catch (error) {
            console.error('Error getting documents: ', error);
        }
    }


    const columns = [
        { title: 'ลำดับ', dataIndex: 'no', key: 'no', align: 'center' },
        {
            title: 'ชื่อโฆษณา',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.name}</div>
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'dateStart',
            key: 'dateStart',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.dateStart}</div>
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'dateEnd',
            align: 'center',
            render: (text, record) => <div style={{ whiteSpace: "nowrap" }}>{record.dateEnd}</div>
        },
        {
            title: 'รูปภาพโฆษณา',
            dataIndex: 'linkImage',
            key: 'linkImage',
            align: 'center',
            render: (text, record) => {
                const arrayLink = record.linkImage.split("||");
                return (
                    <div className="d-flex just-start" style={{ flexWrap: "nowrap" }}>
                        {arrayLink.map((link, index) => (
                            <div key={link} style={{ marginRight: '10px' }}>
                                <Image key={index} width={100} height={100} src={link} />
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => (
                <SwitchCustom
                    checkend={record.status}
                    apiEndPoint={"/api/updateAdvertById/" + record.key}
                />
            )
        },
        {
            title: 'จัดการ',
            dataIndex: 'edit',
            key: 'edit',
            align: 'center',
            render: (text, record) => <Button onClick={() => handleEdit(record.key)} icon={<EditOutlined />}>edit</Button>

        }
    ];



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
        console.log("OK", value)
        setShoModalAdvert(false);

        let urlAdvert = "", filenameAdvert = "", dataCall = "", pathCallApi = "", metod = "";
        for (const data of value.imageAdvert) {
            filenameAdvert += data.name + "||";
            urlAdvert += data.url + "||";
        }
        dataCall = {
            title: value.nameAdvert,
            dateStart: format(value.startDate.$d, 'yyyy-MM-dd'),
            dateEnd: format(value.endDate.$d, 'yyyy-MM-dd'),
            fileName: filenameAdvert.slice(0, -2),
            linkFile: urlAdvert.slice(0, -2),
            detail: value.detail
        }

        if (clickSource === "add") {
            pathCallApi = "/api/insAdvert";
            metod = "post";
        } else if (clickSource === "edit") {
            pathCallApi = "/api/updateAdvertById/" + value.advId
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
            title: "บันทึกโฆษณาสำเร็จ"
        });
        fetchData(selectedStartDate, selectedEndDate, currentPage)

    };

    const handleEdit = async (id) => {
        const response = await callApi("get", "/api/advertById/" + id, {});
        setdataEdit(response[0])
        setClickSource("edit");
        setShoModalAdvert(true);
    };
    const onClose = () => {

        setShoModalAdvert(false);
    };
    return (
        <>
            <Navbar />
            <AdvertModal
                clickSource={clickSource}
                openModal={shoModalAdvert}
                onSave={handleOk}
                onClose={onClose}
                dataEdit={dataEdit}
            />

            <div className="advert-datepicker" >
                <div className="div-btn-add-advert">
                    <Button type="primary"
                        className="btn-add-advert"
                        onClick={() => {
                            setShoModalAdvert(true);
                            setClickSource("add");
                        }}
                    >
                        <label className="fontawesome-faplus"> <FontAwesomeIcon icon={faPlus} /></label>
                        <label className="label-add-advert">เพิ่มโฆษณา</label>
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

export default AdvertPage;
