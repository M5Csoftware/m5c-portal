'use client'
import React, { useState, useContext } from "react";
import Image from "next/image";
import classNames from "classnames";
import { GlobalContext } from "../GlobalContext.js";
import * as XLSX from 'xlsx';
import axios from 'axios';

const UploadModal = ({ onClose }) => {
  const { server } = useContext(GlobalContext);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    validateFile(file);
  };

  const handleSampleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Shipment_bulk_upload.xlsx";
    link.download = "Shipment_bulk_upload.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const validateFile = async (file) => {
    if (file) {
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (validExtensions.includes(`.${fileExtension}`)) {
        console.log("File selected:", file);
        setFileUploaded(file);
        setError("");
        
        // Read and preview file data
        await previewFileData(file);
      } else {
        setError("Please select a valid .csv or Excel file.");
        setFileUploaded(false);
        setPreviewData(null);
        setShowPreview(false);
      }
    }
  };

  const previewFileData = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        // Get column headers
        const headers = Object.keys(jsonData[0]);
        
        setPreviewData({
          headers,
          rows: jsonData,
          totalRows: jsonData.length
        });
        setShowPreview(true);
      } else {
        setError("File is empty or has no valid data.");
        setPreviewData(null);
        setShowPreview(false);
      }
    } catch (err) {
      console.error("Error reading file:", err);
      setError("Error reading file. Please check the file format.");
      setPreviewData(null);
      setShowPreview(false);
    }
  };

  const handleUpload = async () => {
    if (!fileUploaded) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", fileUploaded);

    try {
      const response = await axios.post(`${server}/bulk-upload/csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Axios automatically parses JSON responses
      const result = response.data;

      if (result.success) {
        setUploadResult({
          success: true,
          message: result.message,
          details: result.details,
        });
        // Reset file input and preview
        setFileUploaded(false);
        setPreviewData(null);
        setShowPreview(false);
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      // Handle axios error response
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your connection.");
      } else {
        // Something else happened
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPreview = () => {
    setFileUploaded(false);
    setPreviewData(null);
    setShowPreview(false);
    setError("");
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-50">
      <div className={classNames(
        "bg-white px-8 py-6 flex flex-col gap-4 items-center rounded-lg shadow-lg w-full",
        showPreview ? "max-w-6xl max-h-[90vh] overflow-hidden" : "max-w-md"
      )}>
        <div className="flex justify-between items-center w-full">
          <h2 className="font-bold text-lg">
            {showPreview ? "Preview & Confirm Upload" : "Bulk Upload New Orders via CSV/Excel"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Image src="/close-button.svg" width={20} height={20} alt="Close" />
          </button>
        </div>
        
        {uploadResult?.success ? (
          <div className="w-full">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Image src="/check-circle.svg" width={20} height={20} alt="Success" />
                <h3 className="font-semibold">Upload Successful!</h3>
              </div>
              <p className="text-green-600 text-sm">{uploadResult.message}</p>
              {uploadResult.details && (
                <div className="mt-2 text-xs text-green-700">
                  <p>Records added: {uploadResult.details.newRecords}</p>
                  <p>Duplicates skipped: {uploadResult.details.duplicates}</p>
                  <p>AWB Range: {uploadResult.details.awbRange}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setUploadResult(null);
                  onClose();
                }}
                className="border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-6 py-2 rounded-lg hover:bg-red-50"
              >
                Close
              </button>
            </div>
          </div>
        ) : showPreview && previewData ? (
          <>
            <div className="flex px-4 py-2 gap-2 bg-[#E8F5E9] border-2 border-[#4CAF50] rounded-lg text-[#2E7D32] text-sm w-full">
              <Image src="/i_icon.svg" width={16} height={16} alt="Info" />
              <h3>Review the data below before uploading. Total rows: {previewData.totalRows}</h3>
            </div>

            <div className="w-full overflow-auto max-h-[60vh] border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold border-b">#</th>
                    {previewData.headers.map((header, idx) => (
                      <th key={idx} className="px-3 py-2 text-left font-semibold border-b whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50 border-b">
                      <td className="px-3 py-2 text-gray-600">{rowIdx + 1}</td>
                      {previewData.headers.map((header, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 whitespace-nowrap">
                          {row[header] !== null && row[header] !== undefined ? String(row[header]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-4 w-full">
              <button
                onClick={handleCancelPreview}
                className="flex-1 border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  !loading
                    ? "bg-[var(--primary-color)] hover:bg-[#C50B31]"
                    : "bg-[#979797] cursor-not-allowed"
                }`}
              >
                {loading ? "Uploading..." : "Confirm & Upload"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex px-4 py-2 gap-2 bg-[#FBF3E0] border-2 border-[#F9F06D] rounded-lg text-[#C3B600] text-sm w-full">
              <Image src="/i_icon.svg" width={16} height={16} alt="Info" />
              <h3>Download the Sample file to upload the shipment details.</h3>
            </div>
            
            <div className="w-full">
              <button
                className="flex items-center gap-2 text-[var(--primary-color)] text-sm hover:underline"
                onClick={handleSampleDownload}
              >
                <Image src="/download_red.svg" width={16} height={16} alt="Download" />
                <span>Download Sample Excel File</span>
              </button>
            </div>

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
                  <Image src="/upload_file.svg" width={36} height={36} alt="Upload" />
                ) : (
                  <Image src="/file-uploaded.svg" width={48} height={48} alt="Uploaded" />
                )}
                <span className="font-medium">
                  {fileUploaded ? fileUploaded.name : "Drag & Drop to Upload File"}
                </span>
                {!fileUploaded && <span className="text-[#A0AEC0]">OR</span>}
                {!fileUploaded && (
                  <span className="bg-[var(--primary-color)] rounded-lg px-6 py-2 text-white hover:bg-[#C50B31]">
                    Browse File
                  </span>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="flex gap-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-[var(--primary-color)] text-[var(--primary-color)] px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!fileUploaded || loading}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                  fileUploaded && !loading
                    ? "bg-[var(--primary-color)] hover:bg-[#C50B31]"
                    : "bg-[#979797] cursor-not-allowed"
                }`}
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadModal;