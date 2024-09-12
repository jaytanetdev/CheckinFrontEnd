import React, { useState, useEffect } from 'react';
import { Form, Modal, Button } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import "../../styles/swiper.css"
import { EffectCoverflow, Pagination } from 'swiper/modules';

const HomeAdvertModal = ({ openModal, onClose, dataDetailAdvert, setDataDetail }) => {
    const [arrayDataLink, setArrayDataLink] = useState([]);

    useEffect(() => {
        if (openModal) {
            if (dataDetailAdvert.adv_linkFile) {
                const arrayDetailDataLink = dataDetailAdvert.adv_linkFile.split("||")
                setArrayDataLink(arrayDetailDataLink)
            }
       
        }

        // eslint-disable-next-line
    }, [openModal, dataDetailAdvert])


    async function handleClose() {
        await onClose();
        setArrayDataLink([]);
        setDataDetail([]);
    }
    return (
        <Modal
            title={dataDetailAdvert.adv_title}
            open={openModal}
            onCancel={() => { handleClose() }}

            footer={[
                <Button key="cancel" onClick={() => { handleClose() }}>
                    ปิด
                </Button>,

            ]}>

            <Form>
                <hr />
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
                    {arrayDataLink.length > 0 ?
                        arrayDataLink.map((value, index) => {
                            return (
                                <SwiperSlide key={index} className="modal-swiper-slide" >
                                    <img
                                        className="modal-swiper-slide-img "
                                        src={value}
                                        style={{ width: "100%", height: "100%" }}
                                        alt={index}
                                    />
                                </SwiperSlide>
                            );
                        })
                        : ""}
                    <br />  <br />
                </Swiper>
                <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "10px" }}>
                    <label style={{ fontSize: "16px" }}> {dataDetailAdvert.adv_detail}</label>
                </div>

            </Form>
        </Modal >
    );
};

export default HomeAdvertModal;
