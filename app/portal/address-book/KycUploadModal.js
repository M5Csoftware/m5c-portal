import React, { useCallback, useContext, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";

const KycUploadModal = ({ onClose, onUploaded, accountCode }) => {
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { server } = useContext(GlobalContext);

    // FRONT DROPZONE
    const onDropFront = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setFrontFile(file);
        setFrontPreview(URL.createObjectURL(file));
    }, []);

    // BACK DROPZONE
    const onDropBack = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setBackFile(file);
        setBackPreview(URL.createObjectURL(file));
    }, []);

    const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } =
        useDropzone({ onDrop: onDropFront, accept: "image/*" });

    const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } =
        useDropzone({ onDrop: onDropBack, accept: "image/*" });

    /**
     * UPLOAD TO BACKEND → CLOUDINARY
     */
    const uploadToBackend = async () => {
        const form = new FormData();
        form.append("accountCode", accountCode);
        form.append("kycFront", frontFile);
        form.append("kycBack", backFile);

        const res = await axios.post(`${server}/portal/kyc-upload`, form);

        console.log(res.data.data);
        return res.data.data; // { kycFrontUrl, kycBackUrl }
    };

    const handleUpload = async () => {
        try {
            setUploading(true);

            const result = await uploadToBackend();

            onUploaded({
                kycFrontUrl: result.kycFrontUrl,
                kycBackUrl: result.kycBackUrl,
            });

            onClose();
        } catch (error) {
            console.error("KYC upload error:", error);
            alert("Error uploading KYC images");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-[40vw] shadow-2xl transform transition-all duration-300 scale-100">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">KYC Verification</h2>
                                <p className="text-red-100 text-sm mt-1">Upload both sides of your ID document</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 group"
                        >
                            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Front Side */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                Front Side
                            </label>
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">Required</span>
                        </div>
                        <div
                            {...getFrontRootProps()}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group ${frontPreview
                                ? "border-red-300 bg-red-25 shadow-md"
                                : "border-gray-300 hover:border-red-400 hover:bg-red-50 hover:shadow-lg"
                                }`}
                        >
                            <input {...getFrontInputProps()} />
                            <div className="absolute top-3 right-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            {frontPreview ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <img
                                            src={frontPreview}
                                            className="h-40 mx-auto rounded-xl object-cover shadow-md border"
                                            alt="Front preview"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300"></div>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Front side uploaded ✓</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-800">Upload Front Side</p>
                                        <p className="text-sm text-gray-500 mt-2">Drag & drop your file here or click to browse</p>
                                        <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back Side */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                Back Side
                            </label>
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">Required</span>
                        </div>
                        <div
                            {...getBackRootProps()}
                            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 group ${backPreview
                                ? "border-red-300 bg-red-25 shadow-md"
                                : "border-gray-300 hover:border-red-400 hover:bg-red-50 hover:shadow-lg"
                                }`}
                        >
                            <input {...getBackInputProps()} />
                            <div className="absolute top-3 right-3">
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            {backPreview ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <img
                                            src={backPreview}
                                            className="h-40 mx-auto rounded-xl object-cover shadow-md border"
                                            alt="Back preview"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-300"></div>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Back side uploaded ✓</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-800">Upload Back Side</p>
                                        <p className="text-sm text-gray-500 mt-2">Drag & drop your file here or click to browse</p>
                                        <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Requirements Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-800">Requirements</p>
                                <ul className="text-xs text-blue-600 mt-1 space-y-1">
                                    <li>• Ensure all text is clearly visible</li>
                                    <li>• File size should be less than 5MB</li>
                                    <li>• Image should be well-lit and not blurry</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Your documents are securely encrypted</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-w-[100px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!frontFile || !backFile || uploading}
                                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 min-w-[140px] flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KycUploadModal;