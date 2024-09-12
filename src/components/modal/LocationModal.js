import { Modal, Button } from 'antd';
import React, { useState } from 'react';

const LocationModal = () => {
    const [visible, setVisible] = useState(false);

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = () => {
        console.log('Clicked OK');
        setVisible(false);
    };

    const handleCancel = () => {
        console.log('Clicked Cancel');
        setVisible(false);
    };

    return (
        <div>
            <Button type="primary" onClick={showModal}>
                Open Modal
            </Button>
            <Modal
                title="Basic Modal"
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </div>
    );
};

export default LocationModal;
