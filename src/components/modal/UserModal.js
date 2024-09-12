import React, { useEffect } from 'react';
import { Form, Input, Modal, Button } from 'antd';

const UserModal = ({ clickSource, openModal, onSave, onClose, dataEdit }) => {
    const [form] = Form.useForm(); // เรียกใช้ hook Form

    useEffect(() => {
        if (clickSource === "edit") {
            form.setFieldsValue({ username: dataEdit.username })
            form.setFieldsValue({ name: dataEdit.name })
            form.setFieldsValue({ lastname: dataEdit.lastname })
        }
        // eslint-disable-next-line
    }, [clickSource, dataEdit])


    const handleSave = () => {
        form.validateFields().then((values) => {
            if (clickSource === "edit" && dataEdit.user_id) {
                values = { ...values, userId: dataEdit.user_id };
            }
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


    return (
        <Modal
            title={clickSource === 'add' ? 'เพิ่มข้อมูลผู้ใช้งาน' : 'แก้ไขข้อมูลผู้ใช้งาน'}
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

                <Form.Item label="ชื่อผู้ใช้" name="username" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
                    <Input placeholder="กรุณากรอกชื่อผู้ใช้" />
                </Form.Item>

                {clickSource === "add" ? <Form.Item label="รหัสผ่าน" name="password" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>

                    <Input.Password
                        placeholder="กรุณากรอกรหัสผ่าน"
                    />
                </Form.Item>
                    : ""}


                <Form.Item label="ชื่อพนักงาน" name="name" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกชื่อพนักงาน' }]}>
                    <Input placeholder="กรุณากรอกชื่อพนักงาน" />
                </Form.Item>

                <Form.Item label="นามสกุลพนักงาน" name="lastname" style={{ marginBottom: 5 }} rules={[{ required: true, message: 'กรุณากรอกนามสกุลพนักงาน' }]}>
                    <Input placeholder="กรุณากรอกนามสกุลพนักงาน" />
                </Form.Item>





            </Form>
        </Modal>
    );
};

export default UserModal;
