import React, { useState, useEffect } from "react";
import Navbar from '../components/common/Navbar'
import '../styles/Dashboard.css'
import { DatePicker, Table } from 'antd'
import { Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faSignOutAlt, faRunning } from '@fortawesome/free-solid-svg-icons';
import callApi from '../service/callApi';
import { format } from 'date-fns';

function DashboardPage() {
  const userId = localStorage.getItem('userId');
  const type = localStorage.getItem('type');
  const [countChecIn, setCountCheckIn] = useState(null);
  const [countCheckOut, setCountCheckOut] = useState(null);
  const [countLate, setCountLate] = useState(null);
  const pagePage = 10; // จำนวนแถวต่อหน้า
  const [totalDoc, setTotalDoc] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataTable, setDataTable] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [dataSelectUser, setDataSelectUser] = useState([]);
  const [selectUser, setSelectUser] = useState("");
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    //eslint-disable-next-line
  }, [userId]);

  const fetchData = async (startDate, endDate, selectUserId, page) => {
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
      let responseDocCountATD, pageTable, responseCountATD, responseGetATD, dataCallApi;
      if (selectUserId) {
        dataCallApi = { userId: selectUserId, startDate: dateStart, endDate: dateEnd };
      } else if (type === "0") {
        dataCallApi = { userId: userId, startDate: dateStart, endDate: dateEnd };
      } else if (type === "1") {
        dataCallApi = { startDate: dateStart, endDate: dateEnd };
      }
      responseCountATD = await callApi("get", "/api/countAttendance", dataCallApi)
      setCountCheckIn(responseCountATD.checkIn)
      setCountCheckOut(responseCountATD.checkOut)
      setCountLate(responseCountATD.late)

      responseDocCountATD = await callApi("get", "/api/countDocAllAtd", dataCallApi)
      const totalDoc = responseDocCountATD;
      setTotalDoc(totalDoc);
      if (page) {
        pageTable = page
      } else {
        pageTable = currentPage;
      }
      dataCallApi.page = pageTable;
      dataCallApi.perPage = pagePage;
      responseGetATD = await callApi("get", "/api/getAttendance", dataCallApi)
      const dataSource = [];
      responseGetATD.forEach((value, index) => {
        if (value.atd_time_checkin) {
          var timeCheckIn = value.atd_time_checkin.substr(0, 5);
        }
        if (value.atd_time_checkout) {
          var timeCheckOut = value.atd_time_checkout.substr(0, 5)
        }
        const dataItem = {
          key: String((index + 1) + ((pageTable - 1) * pagePage)),
          no: String((index + 1) + ((pageTable - 1) * pagePage)),
          date: format(value.atd_date, 'dd-MM-yyyy'),
          checkin: timeCheckIn,
          checkout: timeCheckOut,
          locationCheckin: value.atd_location_checkin,
          detail: value.atd_detail ? value.atd_detail : "-"
        };
        if (type === "1" && !selectUserId) { //ถ้าเป็นสถานะ แอดมิน และเลือกทั้งหมด จะให้ดึงข้อมูลชื่อมาแสดง
          dataItem.name = value.name + " " + value.lastname;
        }
        dataSource.push(dataItem);
      });
      setDataTable(dataSource);

      //เซ็ทคอลั่มตาราง
      const columnDataTable = [
        { title: 'ลำดับ', dataIndex: 'no', key: 'no', align: 'center', },
        { title: 'วันที่', dataIndex: 'date', key: 'date', align: 'center', },
        { title: 'สถานที่เช็คอิน', dataIndex: 'locationCheckin', align: 'center', },
        { title: 'เช็คอิน', dataIndex: 'checkin', align: 'center', },
        { title: 'เช็คเอ้าท์', dataIndex: 'checkout', key: 'checkout', align: 'center', },
        { title: 'รายละเอียด', dataIndex: 'detail', align: 'center', },
      ]
      if (type === "1" && !selectUserId) {       //ถ้าเป็นสถานะ แอดมิน และเลือกทั้งหมด จะให้แสดงคอลัมน์ชื่อ
        const newColumn = { title: 'ชื่อ', dataIndex: 'name', key: 'name', align: 'center' };
        columnDataTable.splice(1, 0, newColumn);
      }
      setColumns(columnDataTable);

      let arraySelectUser = [{
        label: "ทั้งหมด",
        value: ""
      }];

      let responseUser = await callApi("get", "/api/getUser", { type: "all" })
      responseUser.forEach(value => {
        arraySelectUser.push({
          value: value.user_id,
          label: value.name + ' ' + value.lastname
        })

      });
      setDataSelectUser(arraySelectUser)

      setLoading(false)
    } catch (error) {
      console.error('Error getting documents: ', error);
    }
  }

  const handleStartDateChange = (dateStart) => {
    if (dateStart && selectedEndDate && dateStart > selectedEndDate) {
      setSelectedEndDate(dateStart);
      fetchData(dateStart, dateStart, selectUser, 1);
      setCurrentPage(1);
    } else if (dateStart && selectedEndDate) {
      fetchData(selectedStartDate, selectedEndDate, selectUser, 1);
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
      fetchData(dateEnd, dateEnd, selectUser, 1);
      setCurrentPage(1);
    } else if (dateEnd && selectedStartDate) {
      fetchData(selectedStartDate, dateEnd, selectUser, 1);
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


  const handleSelectUser = (value) => {
    setSelectUser(value);
    setCurrentPage(1)
    fetchData("", "", value, 1)
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
    fetchData(selectedStartDate, selectedEndDate, selectUser, page)
  };

  return (
    <>
      <Navbar />
      <div className={type === "1" ? "div-bar-search" : ""}>
        {type === "1" ? <div className="div-select-em">
          <Select
            showSearch
            className="select-em"
            placeholder="กรุณาเลือก พนักงาน"
            optionFilterProp="label"
            onChange={(e) => { handleSelectUser(e) }}
            options={dataSelectUser}
          />
        </div> : ""}
        <div className="datepicker">
          <DatePicker
            value={selectedStartDate}
            onChange={handleStartDateChange}
            format="DD/MM/YYYY"
          />
          <div style={{ margin: "5px" }}> - </div>
          <DatePicker
            value={selectedEndDate}
            onChange={handleEndDateChange}
            format="DD/MM/YYYY"
          />

        </div>
      </div >
      <div className="dashboard-bg">
        <div className="report-worklate">
          <div className="report-data">
            <div className="container">
              <div className="left">
                <label className="text-checkin">เช็คอิน</label>
                <label className="value-checkin">{countChecIn} วัน</label>
              </div>
              <div className="right">
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ width: '25px', height: '25px', color: '#b30000', margin: '10px' }} />
              </div>
            </div>
          </div>
          <div className="report-data">
            <div className="container">
              <div className="left">
                <label className="text-checkin">เช็คเอ้าท์</label>
                <label className="value-checkin">{countCheckOut} วัน</label>
              </div>
              <div className="right">
                <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '25px', height: '25px', color: '#4d9900', margin: '10px' }} />
              </div>
            </div>
          </div>
          <div className="report-data">
            <div className="container">
              <div className="left">
                <label className="text-checkin">สาย</label>
                <label className="value-checkin">{countLate} วัน</label>
              </div>
              <div className="right">
                <FontAwesomeIcon icon={faRunning} style={{ width: '25px', height: '25px', color: '#03a9f4', margin: '10px' }} />
              </div>
            </div>
          </div>
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
              // showSorterTooltip: { target: 'sorter-icon' },
              onChange: handleChangePage,
            }} />,
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
