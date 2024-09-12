import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate } from 'react-router-dom';  // Import useNavigate มา
import callApi from '../service/callApi';
import "../styles/Login.css"
import Swal from 'sweetalert2'

const LoginPage = () => {
    const Navigate = useNavigate();  // สร้าง navigate function
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const changeData = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const checkLogin = () => {
        if (!formData.username || !formData.password) {
            return
        }
        callApi("get", "/api/getUser", { username: formData.username, password: formData.password })
            .then(data => {
                if (data.length > 0) {
                    localStorage.setItem('userId', data[0].user_id);
                    localStorage.setItem('nameUser', data[0].name);
                    localStorage.setItem('lastnameUser', data[0].lastname);
                    localStorage.setItem('type', data[0].type);
                    if (data[0].type === "0") {
                        Navigate('/Home');
                    } else if (data[0].type === "1") {
                        Navigate('/Dashboard');
                    }
                } else {
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
                        icon: "error",
                        title: "ล็อกอินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });


    };

    return (
        <div className="login-container"> {/* สร้าง container เพื่อจัดหน้า Login ไว้กึ่งกลาง */}
            <Form
                name="basic"
                initialValues={{ remember: true }}
                className="login-form" // เพิ่ม className เพื่อใช้ในการกำหนดสไตล์ของฟอร์ม
            >
                <img className="login-imglogo" src="/img/LogoB.png" alt="main_logo" />
                <Form.Item
                    label="Username"
                    name="username"
                    className="login-form-username  input-wrapper"
                    rules={[{ required: true, message: 'กรุณากรอก Username' }]}>
                    <Input
                        name="username"
                        value={formData.username}
                        onChange={changeData}
                    />
                </Form.Item>
                <div>
                    <Form.Item
                        label="Password"
                        name="password"
                        className="login-form-password  input-wrapper"
                        rules={[{ required: true, message: 'กรุณากรอก Password' }]}>
                        <Input.Password
                            name="password"
                            value={formData.password}
                            onChange={changeData}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    className="login-form-button" >
                    <Button
                        type="primary"
                        htmlType="submit"
                        onClick={checkLogin}
                        className="login-button" // เพิ่ม className เพื่อใช้ในการกำหนดสไตล์ของปุ่ม
                    >
                        Login
                    </Button>
                </Form.Item>

            </Form >
        </div >
    );
};

export default LoginPage;
