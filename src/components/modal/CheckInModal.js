import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Input } from 'antd';
import TextArea from 'antd/es/input/TextArea';

const CheckInModal = ({ openModal, onClose, save }) => {

    // var userId = localStorage.getItem('userId');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [title, setTitle] = useState(null);
    const [detail, setDetail] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            var { latitude: currentLatitude, longitude: currentLongitude } = position.coords;
            setLatitude(currentLatitude);
            setLongitude(currentLongitude)
        })
    }, [openModal])

    async function handleSave() {
        await save("checkinOffSite", title, detail);
        handleClose();
    }
    async function handleClose() {
        await onClose();
    }

    return (
        <Modal
            title="เช็คอินนอกสถานที่"
            open={openModal}
            onCancel={() => { handleClose() }}
            footer={[
                <Button key="cancel" onClick={() => { handleClose() }}>
                    ปิด
                </Button>,
                <Button key="submit" type="primary" onClick={handleSave}>
                    บันทึก
                </Button>,
            ]}>
            <Form>

                <div className="div-homepage" >
                    {latitude && longitude && (
                        <>


                            <label >สถานที่เช็คอิน</label>
                            <Input
                                placeholder="กรุณากรอก สถานที่เช็คอิน"
                                value={title}
                                onChange={(e) => { setTitle(e.target.value) }}
                                style={{ marginTop: "5px", marginBottom: "5px", height: '40px' }}
                            />

                            <label >รายละเอียดเพิ่มเติม   </label>
                            <TextArea
                                placeholder="กรุณา รายละเอียดเพิ่มเติม"
                                value={detail}
                                onChange={(e) => { setDetail(e.target.value) }}
                                style={{ marginTop: "5px", height: '70px' }}
                            />

                            <center style={{ marginTop: "10px" }}>
                                <label style={{ fontSize: "18px", }}>ตำแหน่งที่คุณอยู่</label>
                                <iframe
                                    className="google-map"
                                    allowFullScreen
                                    src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed`}
                                    title="Map"
                                >
                                </iframe>
                            </center>
                        </>
                    )}
                    <br />
                </div>
            </Form>
        </Modal >
    );
};

export default CheckInModal;
