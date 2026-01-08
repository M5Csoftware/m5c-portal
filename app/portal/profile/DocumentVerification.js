"use client";

import React, { useState, useContext } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";

const DocumentVerification = ({ businessType, onComplete }) => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  const [verificationType, setVerificationType] = useState(null); // 'digilocker' or 'manual'
  const [isExpressKYCOpen, setIsExpressKYCOpen] = useState(false);
  const [isManualKYCOpen, setIsManualKYCOpen] = useState(false);

  // DigiLocker/Aadhar OTP states
  const [aadharNumber, setAadharNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Manual upload states
  const [document1Type, setDocument1Type] = useState("");
  const [document2Type, setDocument2Type] = useState("");
  const [isDocument1Completed, setIsDocument1Completed] = useState(false);
  const [doc1Front, setDoc1Front] = useState(null);
  const [doc1Back, setDoc1Back] = useState(null);
  const [doc2Front, setDoc2Front] = useState(null);
  const [doc2Back, setDoc2Back] = useState(null);

  const documentOptions = ["Passport", "Driving License", "Aadhar Card", "PAN Card"];

  // Handle Aadhar OTP Send
  const handleSendOTP = async () => {
    if (aadharNumber.length !== 12) {
      alert("Please enter a valid 12-digit Aadhar number");
      return;
    }

    setLoading(true);
    try {
      const accountCode = session?.user?.accountCode;
      const response = await axios.post(`${server}/portal/kyc/send-otp`, {
        accountCode,
        aadharNumber,
        businessType,
      });

      if (response.data.success) {
        setOtpSent(true);
        alert("OTP sent successfully to your registered mobile/email");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const accountCode = session?.user?.accountCode;
      const response = await axios.post(`${server}/portal/kyc/verify-otp`, {
        accountCode,
        aadharNumber,
        otp,
        businessType,
      });

      if (response.data.success) {
        onComplete("digilocker");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle Document 1 Submit
  const handleDocument1Submit = async () => {
    if (!document1Type || !doc1Front || !doc1Back) {
      alert("Please select document type and upload both sides");
      return;
    }

    setLoading(true);
    try {
      const accountCode = session?.user?.accountCode;
      const formData = new FormData();
      formData.append("accountCode", accountCode);
      formData.append("businessType", businessType);
      formData.append("documentType", document1Type);
      formData.append("documentNumber", "1");

      // Convert base64 to blob for document front
      const doc1FrontBlob = await fetch(doc1Front).then(r => r.blob());
      formData.append("documentFront", doc1FrontBlob, "doc1_front.jpg");

      // Convert base64 to blob for document back
      const doc1BackBlob = await fetch(doc1Back).then(r => r.blob());
      formData.append("documentBack", doc1BackBlob, "doc1_back.jpg");

      const response = await axios.post(
        `${server}/portal/kyc/upload-document`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setIsDocument1Completed(true);
        alert("Document 1 uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  // Handle Complete KYC
  const handleCompleteKYC = async () => {
    if (!document2Type || !doc2Front || !doc2Back) {
      alert("Please complete Document 2 before submitting");
      return;
    }

    setLoading(true);
    try {
      const accountCode = session?.user?.accountCode;
      const formData = new FormData();
      formData.append("accountCode", accountCode);
      formData.append("businessType", businessType);
      formData.append("documentType", document2Type);
      formData.append("documentNumber", "2");

      const doc2FrontBlob = await fetch(doc2Front).then(r => r.blob());
      formData.append("documentFront", doc2FrontBlob, "doc2_front.jpg");

      const doc2BackBlob = await fetch(doc2Back).then(r => r.blob());
      formData.append("documentBack", doc2BackBlob, "doc2_back.jpg");

      const response = await axios.post(
        `${server}/portal/kyc/upload-document`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        onComplete("manual");
      }
    } catch (error) {
      console.error("Error completing KYC:", error);
      alert(error.response?.data?.message || "Failed to complete KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 px-2">
      <div className="flex flex-col gap-5 rounded-lg w-full">
        {/* Express KYC using Aadhar OTP */}
        <div className="border border-gray-300 rounded-[10px] p-6 bg-white">
          <div className="flex items-start justify-between cursor-pointer">
            <div className="flex flex-1">
              <div className="pl-4 pr-6">
                <Image
                  src={"/fingerprint.svg"}
                  alt="Fingerprint icon for KYC verification"
                  width={39}
                  height={43}
                  className="px-1 py-1"
                />
              </div>
              <div className="flex-1">
                <div className="flex gap-4 items-center">
                  <h2 className="text-[16px] font-bold">
                    Express KYC using Aadhar OTP
                  </h2>
                  <p className="text-sm text-[#A0AEC0]">
                    (No Document Upload Required)
                  </p>
                </div>
                <div className="mt-[10px]">
                  <span className="bg-[#FBF3E0] border-[0.5px] border-[#F9F06D] text-[#C7BA0E] p-[10px] rounded-md text-xs">
                    Instant verification using DigiLocker
                  </span>
                </div>

                {isExpressKYCOpen && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#000000]">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your 12-digit Aadhar number"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        className="border border-[#A0AEC0] p-2 rounded-md w-full mt-1"
                        disabled={otpSent}
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOTP}
                        disabled={loading || aadharNumber.length !== 12}
                        className={`px-[30px] py-2 rounded-md mt-2 ${
                          loading || aadharNumber.length !== 12
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[var(--primary-color)] text-white hover:bg-red-600"
                        }`}
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-[#000000]">
                            Enter OTP
                          </label>
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="border border-[#A0AEC0] p-2 rounded-md w-full mt-1"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            className={`px-[30px] py-2 rounded-md ${
                              loading || otp.length !== 6
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[var(--primary-color)] text-white hover:bg-red-600"
                            }`}
                          >
                            {loading ? "Verifying..." : "Verify OTP"}
                          </button>
                          <button
                            onClick={() => {
                              setOtpSent(false);
                              setOtp("");
                            }}
                            className="px-[30px] py-2 rounded-md border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-red-50"
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                setIsExpressKYCOpen(!isExpressKYCOpen);
                if (!isExpressKYCOpen) {
                  setIsManualKYCOpen(false);
                }
              }}
            >
              <span className="text-[var(--primary-color)] text-xl">
                {isExpressKYCOpen ? "▲" : "▼"}
              </span>
            </div>
          </div>
        </div>

        {/* OR Separator */}
        <div className="text-center text-gray-500 font-medium">OR</div>

        {/* Manual KYC by Documents */}
        <div className="border border-gray-300 rounded-[10px] p-6 bg-white">
          <div className="flex items-start justify-between cursor-pointer">
            <div className="flex flex-1">
              <div className="pl-4 pr-6">
                <Image
                  src={"/fingerprint.svg"}
                  alt="Fingerprint icon for document verification"
                  width={39}
                  height={43}
                  className="px-1 py-1"
                />
              </div>
              <div className="flex-1">
                <div className="flex gap-4 items-center">
                  <h2 className="text-[16px] font-bold">
                    KYC by uploading ID & Address Proofs
                  </h2>
                  <p className="text-sm text-[#A0AEC0]">(Documents Required)</p>
                </div>
                <div className="mt-[10px]">
                  <span className="bg-[#FBF3E0] border-[0.5px] border-[#F9F06D] text-[#C7BA0E] p-[10px] rounded-md text-xs">
                    KYC verification might take 2-3 days
                  </span>
                </div>

                {isManualKYCOpen && (
                  <div className="mt-6">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Document 1 */}
                      <div>
                        <h3 className="text-black text-sm font-semibold mb-2">
                          Document 1
                        </h3>
                        <select
                          value={document1Type}
                          onChange={(e) => setDocument1Type(e.target.value)}
                          className="w-full border border-[#A0AEC0] p-2 rounded-[4px] mb-4 text-[#000000] text-[14px]"
                        >
                          <option value="">Select Document Type</option>
                          {documentOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <UploadImage
                            label="Upload Front Side"
                            image={doc1Front}
                            setImage={setDoc1Front}
                          />
                          <UploadImage
                            label="Upload Back Side"
                            image={doc1Back}
                            setImage={setDoc1Back}
                          />
                        </div>

                        <button
                          onClick={handleDocument1Submit}
                          disabled={loading || !document1Type || !doc1Front || !doc1Back}
                          className={`w-full mt-6 py-2 rounded-md font-semibold ${
                            loading || !document1Type || !doc1Front || !doc1Back
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "border-2 border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-red-50"
                          }`}
                        >
                          {loading ? "Submitting..." : "Submit Document 1"}
                        </button>
                      </div>

                      {/* Document 2 */}
                      <div
                        className={`${
                          isDocument1Completed
                            ? ""
                            : "opacity-50 pointer-events-none"
                        } transition-all`}
                      >
                        <h3 className="text-black text-sm font-semibold mb-2">
                          Document 2
                        </h3>
                        <select
                          value={document2Type}
                          onChange={(e) => setDocument2Type(e.target.value)}
                          className="w-full border border-[#A0AEC0] p-2 rounded-[4px] mb-4 text-[#000000] text-[14px]"
                          disabled={!isDocument1Completed}
                        >
                          <option value="">Select Document Type</option>
                          {documentOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <UploadImage
                            label="Upload Front Side"
                            image={doc2Front}
                            setImage={setDoc2Front}
                          />
                          <UploadImage
                            label="Upload Back Side"
                            image={doc2Back}
                            setImage={setDoc2Back}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Complete KYC Button */}
                    {isDocument1Completed && document2Type && doc2Front && doc2Back && (
                      <button
                        onClick={handleCompleteKYC}
                        disabled={loading}
                        className={`mt-6 px-8 py-2 rounded-md font-bold ${
                          loading
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[var(--primary-color)] text-white hover:bg-red-600"
                        }`}
                      >
                        {loading ? "Submitting..." : "Complete KYC"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex justify-center items-center cursor-pointer"
              onClick={() => {
                setIsManualKYCOpen(!isManualKYCOpen);
                if (!isManualKYCOpen) {
                  setIsExpressKYCOpen(false);
                }
              }}
            >
              <span className="text-[var(--primary-color)] text-xl">
                {isManualKYCOpen ? "▲" : "▼"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadImage = ({ label, image, setImage }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only JPG, JPEG, or PNG images.");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-dashed border-2 border-[var(--primary-color)] rounded-md p-[10px] text-center cursor-pointer relative">
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleFileUpload}
      />

      {image ? (
        <Image
          src={image}
          alt="Uploaded document preview"
          width={200}
          height={200}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex flex-col gap-4 justify-center items-center py-6">
          <Image
            src="/upload_kyc.svg"
            alt="Upload document icon"
            width={32}
            height={32}
          />
          <p className="text-[var(--primary-color)] mt-2 px-2 text-xs">
            {label}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;