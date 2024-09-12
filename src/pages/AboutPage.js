
import React, { useState, useRef } from 'react';
import Navbar from '../components/common/Navbar';

function AboutPage() {
    const [imageUrl, setImageUrl] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const captureImage = () => {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const url = canvasRef.current.toDataURL('image/png');
        setImageUrl(url);
    };
    return (
        <>
            <Navbar />
            <div>
                <button onClick={startCamera}>Start Camera</button>
                <button onClick={captureImage}>Capture Image</button>
                <video ref={videoRef} width="640" height="480" autoPlay muted style={{ display: imageUrl ? 'none' : 'block' }}></video>
                {imageUrl && <img src={imageUrl} alt="Captured" />}
                <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
            </div>
        </>
    );
}

export default AboutPage;
