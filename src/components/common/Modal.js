import React from 'react';

const Modal = ({ onClose }) => {
    return (
        <div className="modal">
            <div className="modal-content">
                <h2>นี่คือ Modal</h2>
                <p>ข้อความภายใน Modal</p>
                <button onClick={onClose}>ปิด Modal</button>
            </div>
        </div>
    );
};

export default Modal;
