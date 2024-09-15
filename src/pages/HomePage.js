import React, { useState, useEffect } from "react";
import Navbar from '../components/common/Navbar'
import '../styles/Home.css'

import { Button } from 'antd'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'
import callApi from '../service/callApi';
import { format } from 'date-fns';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import "../styles/swiper.css"
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';  // Import useNavigate มา
import HomeAdvertModal from "../components/modal/HomeAdvertModal";
import CheckInModal from "../components/modal/CheckInModal";

function HomePage() {

  const userId = localStorage.getItem('userId');
  const Navigate = useNavigate();
  const [showModalCheckin, setShowModalCheckin] = useState(false);
  const [showModalHomeAdvert, setShowModalHomeAdvert] = useState(false);
  const [dataDetailAdvert, setDataDetailAdvert] = useState([]);
  const [disableCheckIn, setDisableCheckIn] = useState(true);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [arrayAdvert, setArrayAdvert] = useState([]);
  const [titleCheckin, setTitleCheckin] = useState("");



  const dateNow = new Date();
  useEffect(() => {

    fetchData();

    //eslint-disable-next-line
  }, [userId]);

  const fetchData = async () => {

    try {
      const positionCheckin = await callApi("get", "/api/getLocationCheckin", {});
      setTitleCheckin(positionCheckin[0].lo_title)
      setLatitude(positionCheckin[0].lo_latitude);
      setLongitude(positionCheckin[0].lo_longitude)
      window.scrollTo(0, 0);
      const responseCheckDate = await callApi("get", "/api/checkDateAttendance", { userId: userId, dateATD: format(dateNow, 'yyyy-MM-dd') })
      if (responseCheckDate.length > 0 && responseCheckDate[0].atd_time_checkin) {
        setDisableCheckIn(true)
      } else {
        setDisableCheckIn(false)
      }
      const arrayAdvert = [];
      const responseAdvert = await callApi("get", "/api/getAdvert/showHomePage", {})

      responseAdvert.forEach(value => {
        arrayAdvert.push({
          adv_id: value.adv_id,
          adv_linkFile: value.adv_linkfile,
          adv_title: value.adv_title,
          adv_detail: value.adv_detail
        })
      });
      setArrayAdvert(arrayAdvert);
    } catch (error) {
      console.error('Error getting documents: ', error);
    }
  }

  function handleImageClick(value) {


    setDataDetailAdvert(value)
    setShowModalHomeAdvert(true)
  }

  const showToast = (type, message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
        toast.style.marginTop = "60px";
      }
    });
    Toast.fire({
      icon: type,
      title: message
    });
  };
  function handleShowModalChekinOff() {
    setShowModalCheckin(true);
  }

  const handleRecordLocation = async (type, title, detail) => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: currentLatitude, longitude: currentLongitude } = position.coords;
      const distance = calculateDistance(currentLatitude, currentLongitude, latitude, longitude);

      const responseCheckDate = await callApi("get", "/api/checkDateAttendance", { userId: userId, dateATD: format(dateNow, 'yyyy-MM-dd') })

      if (responseCheckDate.length > 0) {
        let dataUpdate = {};
        if (type === "checkin" || type === 'checkinOffSite') {
          dataUpdate.timeCheckIn = format(dateNow, 'HH:mm:ss');
        } else {
          dataUpdate.timeCheckOut = format(dateNow, 'HH:mm:ss');
        }
        callApi("patch", "/api/updateAttendance/" + responseCheckDate[0].atd_id, dataUpdate)
          .then((response) => {
            showToast("success", type === "checkin" ? "เช็คอินสำเร็จ" : "เช็คเอ้าสำเร็จ");
            fetchData();
          }).catch((err) => {
            console.log(err)
          })

      } else {
        let data = {
          userId: userId,
          dateATD: format(dateNow, 'yyyy-MM-dd'),
          latitude: currentLatitude,
          longitude: currentLongitude,
          typeCheckin: type === 'checkin' ? '0' : type === 'checkinOffSite' ? '1' : '',
          locationCheckin: type === 'checkin' ? titleCheckin : type === 'checkinOffSite' ? title : ''
        };
        if (type === "checkin") {
          data.timeCheckIn = format(dateNow, 'HH:mm:ss');

        } else if (type === 'checkinOffSite') {
          data.timeCheckIn = format(dateNow, 'HH:mm:ss');
          data.detail = detail
        } else {
          data.timeCheckOut = format(dateNow, 'HH:mm:ss');
        }
        if (distance <= 1000 || type === 'checkinOffSite') {
          callApi("post", "/api/insAttendance", data)
            .then(data => {
              showToast("success", type === "checkin" || type === 'checkinOffSite' ? "เช็คอินสำเร็จ" : "เช็คเอ้าสำเร็จ");
              fetchData();
            })
            .catch(error => {
              showToast("error", "มีข้อผิดพลาดเกิดขึ้น");
            });
        } else {
          showToast("error", "คุณต้องเข้าใกล้จุดเช็คอินมากกว่านี้");
        }
      }
    });
  };

  // ฟังก์ชันคำนวณระยะห่างระหว่างจุดทั้งสอง
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // รัศมีของโลกในหน่วยเมตร
    const Lat1 = (lat1 * Math.PI) / 180; // ละติจูดที่ 1 เป็นเรเดียน
    const Lat2 = (lat2 * Math.PI) / 180; // ละติจูดที่ 2 เป็นเรเดียน
    const Ledien = ((lat2 - lat1) * Math.PI) / 180; // การเปลี่ยนแปลงในเรเดียน
    const long = ((lon2 - lon1) * Math.PI) / 180; // การเปลี่ยนแปลงในลองจิจูด

    const a =
      Math.sin(Ledien / 2) * Math.sin(Ledien / 2) +
      Math.cos(Lat1) * Math.cos(Lat2) * Math.sin(long / 2) * Math.sin(long / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <>



      <Navbar />

      <CheckInModal
        openModal={showModalCheckin}
        onClose={() => { setShowModalCheckin(false) }}
        save={handleRecordLocation}
      />
      <HomeAdvertModal
        openModal={showModalHomeAdvert}
        onClose={() => { setShowModalHomeAdvert(false) }}
        dataDetailAdvert={dataDetailAdvert}
        setDataDetail={setDataDetailAdvert}
      />
      <div className="background-container-home">
        <div className="container-homepage" >
          <div className="div-homepage" >
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={true}
              modules={[EffectCoverflow, Pagination]}
              className="modal-swiper"
            >
              {arrayAdvert.map((value, index) => {
                const arrayFilename = value.adv_linkFile.split("||");

                return (
                  // <div style={{ width: "100%", height: "100%" }}>
                  <SwiperSlide key={value.adv_id}>

                    <img
                      className="img-advert"
                      src={arrayFilename[0]}
                      alt={index}
                      onClick={() => handleImageClick(value)}
                    />
                    <div className="slide-caption">{value.adv_title}</div>
                  </SwiperSlide>
                  // </div>
                );
              })}
            </Swiper>
          </div>


          <div className="div-homepage" >
            <center>
              <h2 style={{ color: "white" }}>บันทึกการ เช็คอิน-เช็คเอ้าท์</h2>
              <div className="div-btn-checkinout">


                <Button
                  className="btn-checkin"
                  type="primary"
                  onClick={() => { handleRecordLocation("checkin") }}
                  disabled={disableCheckIn ? true : false}   >
                  <div><img src='/img/checkin.png' alt="travel" style={{ width: "50px", color: "white" }} /></div>
                  <label style={{ color: "white" }}>เช็คอิน {titleCheckin}</label>
                </Button>

                <Button
                  className="btn-checkout"
                  type="primary"
                  onClick={() => { handleRecordLocation("checkout") }}>
                  <div><img src='/img/exit.png' alt="travel" style={{ width: "50px", }} /></div>
                  เช็คเอ้า
                </Button>
              </div>


              <div className="div-btn-chekinOutOffice">
                <Button
                  className="btn-chekinOutOffice"
                  type="primary"
                  onClick={() => { handleShowModalChekinOff("checkinOffSite") }}
                  disabled={disableCheckIn ? true : false}
                >
                  <div><img src='/img/travel.png' alt="travel" style={{ width: "70px", marginBottom: "-20px" }} /></div>
                  <label style={{ color: "white" }}>เช็คอิน นอกสถานที่</label>
                </Button>


                <Button
                  className="btn-dashboard"
                  type="primary"
                  onClick={() => { Navigate('/Dashboard'); }}>
                  <div><img src='/img/paper.png' alt="travel" style={{ width: "40px" }} /></div>
                  ดูประวัติเช็คอิน
                </Button>
              </div>
            </center>
          </div>



          <div className="div-homepage" >
            {latitude && longitude && (
              <center>
                <label style={{ fontSize: "18px", color: "white" }}>สถานที่บริษัท {titleCheckin}</label>
                <iframe
                  className="google-map"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`}
                  title="Map"
                >
                </iframe>
              </center>
            )}
            <br />
          </div>
        </div >
      </div >
    </>
  );
}

export default HomePage;
