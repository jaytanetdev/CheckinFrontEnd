import { Form, Input, Modal, Button } from 'antd';
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const LocationModal = ({ clickSource, openModal, onSave, onClose, dataEdit }) => {
    const [form] = Form.useForm(); // เรียกใช้ hook Form
    const [position, setPosition] = useState(null); // เก็บตำแหน่งของหมุด
    const [defaultPosition, setDefaultPosition] = useState({}); // ค่าเริ่มต้นถ้าไม่สามารถหาตำแหน่งได้


    useEffect(() => {

        if (clickSource === "edit") {
            const arrayMap = { 
                lat: Number(dataEdit.lo_latitude), 
                lng: Number(dataEdit.lo_longitude) // Corrected the property name
              };
            form.setFieldsValue({ title: dataEdit.lo_title })
            setPosition(arrayMap);
            setDefaultPosition(arrayMap)
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setDefaultPosition({ lat: latitude, lng: longitude }); 
                        setPosition({ lat: latitude, lng: longitude });
                    },
                    (error) => {
                        console.error("Error getting geolocation: ", error);
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
            }
        }
        // eslint-disable-next-line
    }, [clickSource, dataEdit])




    const handleSave = () => {
        form.validateFields().then((values) => {
            if (clickSource === "edit" && dataEdit.lo_id) {
                values = { ...values, loId: dataEdit.lo_id };
            }
            values = { ...values, position };
            onSave(values, clickSource); // ส่งข้อมูลไปยังฟังก์ชัน onSave

            form.resetFields();
        }).catch((error) => {
            console.error('Validation failed:', error);
        });
    };
    const handleClose = async () => {
        await onClose();
        form.resetFields();

    };

    const containerStyle = {
        width: '100%',
        height: '400px',
    };


    useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_API_KEY_GOOGLE, // ใส่ API Key ของคุณที่นี่
    });


    const onClickMap = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setPosition({ lat, lng });
        console.log("Latitude:", lat, "Longitude:", lng); // ดึงค่า lat, lng แล้วแสดงใน console
    }, []);


    return (

        <Modal
            title={clickSource === 'add' ? 'เพิ่มสถานที่เช็คอิน' : 'แก้ไขสถานที่เช็คอิน'}
            open={openModal}
            onCancel={handleClose}

            footer={[
                <Button key="cancel" onClick={handleClose}>
                    ยกเลิก
                </Button>,
                <Button key="submit" type="primary" onClick={handleSave}>
                    บันทึก
                </Button>,
            ]}
        >
            <Form
                style={{ marginTop: 30 }}
                form={form}
                layout="vertical"
                initialValues={{ remember: true }} // ตั้งค่าเริ่มต้นให้ฟอร์ม
            >

                <Form.Item label="ชื่อสถานที่" name="title" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอชื่อสถานที่' }]}>
                    <Input placeholder="กรุณากรอชื่อสถานที่" />
                </Form.Item>


                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultPosition}
                    zoom={15}
                    onClick={onClickMap} // เมื่อคลิกบนแผนที่จะเรียกฟังก์ชันนี้
                >
                    {position && (
                        <Marker position={position} /> // วางหมุดในตำแหน่งที่คลิก
                    )}
                </GoogleMap>




            </Form>
        </Modal>

    );
};

export default LocationModal;
