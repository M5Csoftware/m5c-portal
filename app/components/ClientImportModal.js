'use client';
import React, { useContext, useState } from "react";
import axios from "axios";
import Image from "next/image";
import classNames from "classnames";
import { GlobalContext } from "../portal/GlobalContext";

const ClientImportModal = ({ onClose, onComplete }) => {
    const [fileUploaded, setFileUploaded] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const { server } = useContext(GlobalContext);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        validateFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        validateFile(file);
    };

    const validateFile = (file) => {
        if (file && (file.type === "text/csv" || file.name.endsWith(".xlsx"))) {
            setSelectedFile(file);
            setFileUploaded(true);
            setError("");
        } else {
            setError("Please select a valid .csv or .xlsx file.");
            setFileUploaded(false);
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setUploading(true);
            const response = await axios.post(`${server}/portal/address-book/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log("Upload Progress:", percent, "%");
                },
            });

            console.log("records uploaded.");
            onComplete?.();
            onClose?.();
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSampleDownload = () => {
        const link = document.createElement("a");
        link.href = "/sample-clients.csv";
        link.download = "sample-clients.csv";
        link.click();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-50">
            <div className="bg-white px-36 flex flex-col gap-4 items-center p-6 rounded-lg shadow-lg max-w-2xl">
                {/* Header */}
                <div className="flex justify-between items-center w-full">
                    <h2 className="font-bold text-xl">
                        Bulk Upload Client Directory via CSV
                    </h2>
                </div>

                {/* Info Banner */}
                <div className="flex px-4 py-2 gap-2 bg-[#FBF3E0] border-2 border-[#F9F06D] rounded-lg text-[#C3B600] text-xs w-full">
                    <Image src="/i_icon.svg" width={16} height={16} alt="" />
                    <h3>Download the Sample file to upload the client details.</h3>
                </div>

                {/* Download Sample Button */}
                <button
                    className="flex px-4 py-2 gap-2 text-[var(--primary-color)] text-xs hover:opacity-80 transition-opacity"
                    onClick={handleSampleDownload}
                >
                    <Image src="/download_red.svg" width={16} height={16} alt="" />
                    <h3>Download Sample CSV File</h3>
                </button>

                {/* File Upload Area */}
                <div
                    className={classNames(
                        "file-input-wrapper border-2 border-dashed rounded-lg w-full",
                        dragging ? "border-[var(--primary-color)]" : "border-[#979797]"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <label
                        htmlFor="file-upload"
                        className={classNames(
                            "file-input-label bg-[#FAFAFA] rounded-lg flex flex-col gap-2 w-full h-40 justify-center items-center cursor-pointer",
                            "text-[#A0AEC0]"
                        )}
                    >
                        {!fileUploaded ? (
                            <Image src="/upload_file.svg" width={24} height={24} alt="" />
                        ) : (
                            <Image src="/file-uploaded.svg" width={36} height={36} alt="" />
                        )}
                        <span className="text-sm font-medium">
                            {fileUploaded ? selectedFile.name : "Drag & Drop to Upload File"}
                        </span>
                        {!fileUploaded && <span className="text-[#A0AEC0] text-sm">OR</span>}
                        {!fileUploaded && (
                            <span className="bg-[var(--primary-color)] rounded-lg px-6 py-2 text-white text-sm font-semibold hover:bg-red-600">
                                Browse File
                            </span>
                        )}
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Error Message */}
                {error && <p className="text-red-500 text-xs">{error}</p>}

                {/* Why We Need This */}
                <div className="flex flex-col gap-2 bg-[#FBF3E0] border-2 border-[#F9F06D] rounded-lg px-4 py-3 w-full">
                    <h3 className="text-[#C3B600] font-semibold text-sm">Why we need this?</h3>
                    <p className="text-[#C3B600] text-xs leading-relaxed">
                        We need these details to automatically build your address book, so you can easily access and use it during shipment booking.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onComplete}
                        className="flex-1 border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-6 py-2 rounded-lg font-semibold hover:bg-[var(--primary-color)]/5 transition-colors"
                    >
                        Skip for Now
                    </button>
                    <button
                        disabled={!fileUploaded || uploading}
                        onClick={handleUpload}
                        className={`flex-1 px-6 py-2 rounded-lg font-semibold transition-colors ${fileUploaded && !uploading
                            ? "bg-[var(--primary-color)] hover:bg-[#C50B31] text-white cursor-pointer"
                            : "bg-[#979797] text-white cursor-not-allowed opacity-50"
                            }`}
                    >
                        {uploading ? "Uploading..." : "Upload File"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientImportModal;
