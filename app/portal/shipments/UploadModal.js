'use client'
import React, { useState } from "react";
import Image from "next/image";
import classNames from "classnames";

const UploadModal = ({ onClose }) => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateFile(file);
  };

  const handleSampleDownload = () => {
    const link = document.createElement("a");
    link.href = "/sample data.csv"; // Path to your sample CSV file in the public folder
    link.download = "sample-data.csv";
    link.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
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
    if (file && file.type === "text/csv") {
      console.log("File selected:", file);
      setFileUploaded(true);
      setError("");
    } else {
      setError("Please select a valid .csv file.");
      setFileUploaded(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-50">
      <div className="bg-white px-36 flex flex-col gap-4 items-center p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm">Bulk Upload New Orders via CSV</h2>
        </div>
        <div className="flex px-4 py-2 gap-2 bg-[#FBF3E0] border-2 border-[#F9F06D] rounded-lg text-[#C3B600] text-xs">
          <Image src="/i_icon.svg" width={16} height={16} alt="" />
          <h3>Download the Sample file to upload the shipment details.</h3>
        </div>
        <div className="">
          <button
            className="flex px-4 py-2 gap-2 text-[var(--primary-color)] text-xs"
            onClick={handleSampleDownload}
          >
            <Image src="/download_red.svg" width={16} height={16} alt="" />
            <h3>Download Sample CSV File</h3>
          </button>
        </div>
        <div
          className={classNames(
            "file-input-wrapper border-2 border-dashed rounded-lg",
            dragging ? "border-[var(--primary-color)]" : "border-[#979797]"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label
            htmlFor="file-upload"
            className={classNames(
              "file-input-label bg-[#FAFAFA] rounded-lg flex flex-col gap-2 w-72 h-40 justify-center items-center cursor-pointer",
              "text-[#A0AEC0]"
            )}
          >
            {!fileUploaded ? (
              <Image src="/upload_file.svg" width={24} height={24} alt="" />
            ) : (
              <Image src="/file-uploaded.svg" width={36} height={36} alt="" />
            )}
            <span>
              {fileUploaded ? "File Uploaded" : "Drag & Drop to Upload File"}
            </span>
            {!fileUploaded && <span className="text-[#A0AEC0]">OR</span>}
            {!fileUploaded && (
              <span className="bg-[var(--primary-color)] rounded-lg px-6 py-2 text-white">
                Browse File
              </span>
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-6 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={!fileUploaded}
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${fileUploaded
              ? "bg-[var(--primary-color)] hover:bg-[#C50B31]"
              : "bg-[#979797]"
              } text-white`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
