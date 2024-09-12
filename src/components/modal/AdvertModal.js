import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Modal, Button, Upload, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { format } from 'date-fns';
import dayjs from 'dayjs';
const { Dragger } = Upload;
const AdvertModal = ({ clickSource, openModal, onSave, onClose, dataEdit }) => {
    const [form] = Form.useForm(); // เรียกใช้ hook Form
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [fileIns2DB, setFileIns2DB] = useState([]);

    useEffect(() => {
        if (clickSource === "edit") {
            form.setFieldsValue({ nameAdvert: dataEdit.adv_title })
            const startDate = dayjs(format(dataEdit.adv_date_start, 'dd-MM-yyyy'), "DD/MM/YYYY")
            const endDate = dayjs(format(dataEdit.adv_date_end, 'dd-MM-yyyy'), "DD/MM/YYYY")
            form.setFieldsValue({ startDate });
            form.setFieldsValue({ endDate });
            form.setFieldsValue({ detail: dataEdit.adv_detail })
            const arrayLinkfile = dataEdit.adv_linkfile.split("||");
            const arrayFilename = dataEdit.adv_filename.split("||");
            const arrayFileList = [];
            arrayLinkfile.forEach((value, index) => {
                arrayFileList.push({
                    uid: arrayFilename[index],
                    name: arrayFilename[index],
                    status: 'done',
                    url: value, // URL ของไฟล์ที่อัปโหลด
                    thumbUrl: value, // URL ของรูปขนาดย่อ (ถ้ามี)
                })

            });
            setFileList(arrayFileList)
            setFileIns2DB(arrayFileList)
            form.setFieldsValue({ imageAdvert: arrayFileList });
        }
        // eslint-disable-next-line
    }, [clickSource, dataEdit])

    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };
    const handleChangeImage = async ({ fileList: newFileList, file: typeFile }) => {

        const arrayData = [];
        await Promise.all(newFileList.map(async (data) => {
            if (data.response) {
                arrayData.push(data.response.arrayFile[0]);
                form.setFieldsValue({ imageAdvert: [...fileIns2DB, ...arrayData] })
            }
        }));

        setFileList(newFileList);
    };


    const handleRemove = async (file) => {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList);
        setFileIns2DB(newFileList)
        form.setFieldsValue({ imageAdvert: newFileList });
    };


    const handleSave = () => {
        form.validateFields().then((values) => {
            if (clickSource === "edit" && dataEdit.adv_id) {
                values = { ...values, advId: dataEdit.adv_id };
            }
            onSave(values, clickSource); // ส่งข้อมูลไปยังฟังก์ชัน onSave
            setFileList([]);
            form.resetFields();
        }).catch((error) => {
            console.error('Validation failed:', error);
        });
    };
    const handleClose = () => {
        form.resetFields();
        setFileList([]);
        onClose();
    };
    const handleStartDateChange = (dateStart) => {

        const endDateValue = form.getFieldValue('endDate');
        if (dateStart && endDateValue && dateStart > endDateValue) {
            form.setFieldsValue({ endDate: dateStart })
        }
    };

    const handleEndDateChange = (dateEnd) => {
        const startDateValue = form.getFieldValue('startDate');
        if (dateEnd && startDateValue && dateEnd < startDateValue) {
            form.setFieldsValue({ startDate: dateEnd })
        }
    };

    return (
        <Modal
            title={clickSource === 'add' ? 'เพิ่มข้อมูลโฆษณา' : 'แก้ไขข้อมูลโฆษณา'}
            open={openModal}
            onCancel={handleClose}
            maskClosable={false} // ไม่ปิด Modal เมื่อคลิกที่พื้นที่ว่าง
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

                <Form.Item label="กรุณากรอกชื่อโฆษณา" name="nameAdvert" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกชื่อโฆษณา' }]}>
                    <Input placeholder="กรุณากรอกชื่อโฆษณา" />
                </Form.Item>
                <div className='modal-advert-datepicker'>
                    <div style={{ width: '50%', marginRight: '5px' }}>
                        <Form.Item label="วันที่เริ่มต้น" name="startDate" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกวันที่เริ่มต้น' }]}>
                            <DatePicker
                                onChange={handleStartDateChange}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }} // กำหนดความกว้างและความสูงเป็น 100%
                            />
                        </Form.Item>
                    </div>
                    <div style={{ width: '50%' }}>
                        <Form.Item label="วันที่สิ้นสุด" name="endDate" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกวันที่สิ้นสุด' }]}>
                            <DatePicker

                                onChange={handleEndDateChange}
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }} // กำหนดความกว้างและความสูงเป็น 100%
                            />
                        </Form.Item>
                    </div>
                </div>

                <Form.Item label="รายละเอียดโฆษณา" name="detail" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกรายละเอียดโฆษณา' }]}>
                    <TextArea
                        placeholder="กรุณากรอกรายละเอียดโฆษณา"
                        style={{ height: '100px' }}
                    />
                </Form.Item>
                <Form.Item label="อัพโหลดรูปโฆษณา" name="imageAdvert" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'กรุณาอัพโหลดรูปโฆษณา' }]}>
                    <Dragger
                        action="http://localhost:5000/api/uploadImage2Firebase/advert"
                        listType="picture"
                        fileList={fileList}
                        onChange={handleChangeImage}
                        onRemove={handleRemove}
                        accept=".jpg,.png"
                        multiple={true}
                        maxCount={5}
                        onPreview={handlePreview}
                        name="imageAdvert"
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">คลิกหรือลากรูปที่นี่เพื่ออัพโหลด สูงสุด (5ไฟล์)</p>
                        <p className="ant-upload-hint">รองรับการอัพโหลดเป็นไฟล์เดี่ยวหรือหลายไฟล์ สามารถลากและวางไฟล์ลงในพื้นที่นี้ได้</p>
                    </Dragger>


                    {/* <Upload
                        action="https://backend-zagj.onrender.com/api/uploadImage2Firebase/advert"
                        listType="picture"
                        fileList={fileList}
                        name="imageAdvert"
                        onPreview={handlePreview}
                        onChange={handleChangeImage}
                        onRemove={handleRemove}
                        accept=".jpg,.png"
                        maxCount={5}

                    >
                        <Button icon={<UploadOutlined />}>Upload max(5)</Button>
                    </Upload> */}
                    {previewImage && (
                        <Image
                            wrapperStyle={{
                                display: 'none',
                            }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                        />
                    )}
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default AdvertModal;
