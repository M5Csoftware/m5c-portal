"use client";
import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import Image from "next/image";

const PhotoIdentification = ({ onNext, selfieImage, setSelfieImage }) => {
    const webcamRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraAvailable, setCameraAvailable] = useState(true);

    const enableCamera = () => {
        setCameraOn(true);
    };

    const captureSelfie = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setSelfieImage(imageSrc);
        setCameraOn(false);
    };

    const retakeSelfie = () => {
        setSelfieImage(null);
        setCameraOn(true);
    };

    const handleUserMediaError = (error) => {
        console.log('Error accessing camera:', error);
        setCameraAvailable(false);
    };

    return (
        <div className='flex flex-col gap-8 bg-white p-6 rounded-lg'>
            <h3 className='font-medium text-lg'>Photo Identification</h3>
            <div className="flex flex-col items-center">
                {/* Selfie Capture Area */}
                <div className="relative border-2 border-dashed border-[var(--primary-color)] rounded-lg w-[535px] h-[387px] flex items-center justify-center bg-gray-50">
                    {cameraAvailable ? (
                        cameraOn && !selfieImage ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full rounded-lg object-cover"
                                onUserMediaError={handleUserMediaError}
                            />
                        ) : selfieImage ? (
                            <Image
                                src={selfieImage}
                                alt="Captured selfie for photo identification"
                                className="w-full h-full rounded-lg object-cover"
                                fill
                                sizes="535px"
                            />
                        ) : (
                            <p className="text-gray-500 text-sm text-center px-4">
                                *Switch ON Camera to take your selfie for photo Identification
                            </p>
                        )
                    ) : (
                        <p className="text-[var(--primary-color)] text-sm text-center px-4">
                            No camera detected. Please check your camera.
                        </p>
                    )}
                </div>

                {/* Control Buttons */}
                <div className="mt-6 flex justify-center space-x-4">
                    {!cameraOn && !selfieImage && cameraAvailable && (
                        <button
                            onClick={enableCamera}
                            className="px-6 py-2 border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-bold rounded-md hover:bg-red-50 transition-colors"
                        >
                            Switch ON Camera
                        </button>
                    )}

                    {cameraOn && !selfieImage && cameraAvailable && (
                        <button
                            onClick={captureSelfie}
                            className="px-6 py-2 border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-bold rounded-md hover:bg-red-50 transition-colors"
                        >
                            Take a Selfie
                        </button>
                    )}

                    {selfieImage && (
                        <>
                            <button
                                onClick={retakeSelfie}
                                className="px-6 py-2 border-2 border-[var(--primary-color)] text-[var(--primary-color)] font-bold rounded-md hover:bg-red-50 transition-colors"
                            >
                                Retake
                            </button>
                            <button
                                onClick={onNext}
                                className="px-6 py-2 bg-[var(--primary-color)] text-white font-bold rounded-md hover:bg-red-600 transition-colors"
                            >
                                Next
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoIdentification;