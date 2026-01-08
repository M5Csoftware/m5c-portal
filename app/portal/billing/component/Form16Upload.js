"use client";

import { useState, useContext, useEffect } from "react";
import { Upload, X, FileText, Download, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import NotificationFlag from "../../component/NotificationFlag";

export default function Form16Upload() {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingFile, setExistingFile] = useState(null);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  useEffect(() => {
    fetchExistingFile();
  }, [session]);

  const fetchExistingFile = async () => {
    try {
      const accountCode = session?.user?.accountCode;
      if (!accountCode) return;

      const response = await axios.get(
        `${server}/portal/setting-billing?accountCode=${accountCode}&type=form16`
      );

      if (response.data.success && response.data.data?.fileUrl) {
        setExistingFile(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching existing file:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only PDF or DOC files.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("accountCode", accountCode);
      formData.append("file", selectedFile);

      const response = await axios.post(
        `${server}/portal/setting-billing`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setExistingFile(response.data.data);
        setSelectedFile(null);

        setNotification({
          visible: true,
          message: "Form 16 Uploaded",
          subMessage: "Your Form 16 has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const accountCode = session?.user?.accountCode;
    if (!accountCode) {
      alert("Session expired. Please login again.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${server}/portal/setting-billing?accountCode=${accountCode}&type=form16`
      );

      setExistingFile(null);

      setNotification({
        visible: true,
        message: "Form 16 Deleted",
        subMessage: "Your Form 16 has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <div className="w-full flex items-center justify-center">
        <div className="w-full py-4 px-6">
          {/* Header */}
          <div className="w-full px-6 py-1 text-center">
            <h2 className="text-lg font-bold text-gray-800">Upload Form 16</h2>
          </div>

          {/* Existing File Display */}
          {existingFile && existingFile.fileUrl && (
            <div className="p-6">
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-green-600" size={32} />
                    <div>
                      <p className="font-medium text-gray-800">
                        {existingFile.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(existingFile.fileSize)} • Uploaded on{" "}
                        {new Date(existingFile.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={existingFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 w-[10vw] bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </a>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-5 py-2.5 w-[10vw] bg-red-600 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="p-1 w-full">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed border-[#979797] rounded-lg py-2 text-center transition-colors ${isDragging ? "border-red-400 bg-red-50" : ""
                }`}
            >
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx"
              />

              <div className="flex flex-col items-center justify-center space-y-4">
                {/* Upload Icon */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <Upload className="px-6 py-2 text-red-500" />
                </div>

                {/* Text */}
                <div className="space-y-6">
                  <p className="text-[#A0AEC0] text-xs">
                    Drag & Drop to Upload File
                  </p>
                  <p className="text-gray-400 text-sm">OR</p>
                </div>

                {/* Browse Button */}
                <label
                  htmlFor="fileInput"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-600 text-white rounded-md cursor-pointer transition-colors font-medium w-[10vw]"
                >
                  Browse File
                </label>

                <p className="text-xs text-gray-400">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 w-full max-w-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-700 font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-gray-200 py-4 px-1 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium w-[10vw]"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || loading}
              className={`px-5 py-2.5  w-[10vw] rounded-md font-medium transition-colors ${selectedFile && !loading
                ? "bg-[#EA1B40] hover:bg-red-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      <NotificationFlag
        message={notification.message}
        subMessage={notification.subMessage}
        visible={notification.visible}
        setVisible={(visible) =>
          setNotification((prev) => ({ ...prev, visible }))
        }
      />
    </>
  );
}