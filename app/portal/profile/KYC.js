"use client";

import Image from "next/image";
import React, { useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import DocumentVerification from "./DocumentVerification";
import BusinessType from "./BusinessType";
import PhotoIdentification from "./PhotoIdentification";
import VerificationStatus from "./VerificationStatus";

function KYC() {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState("");
  const [selfieImage, setSelfieImage] = useState(null);
  const [verificationType, setVerificationType] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing KYC data on mount
  useEffect(() => {
    const fetchKycData = async () => {
      if (!session?.user?.accountCode) return;

      try {
        const response = await axios.get(
          `${server}/portal/kyc/upload-document?accountCode=${session.user.accountCode}`
        );

        if (response.data.success && response.data.data) {
          const kyc = response.data.data;
          setKycData(kyc);

          // Populate existing data
          if (kyc.businessType) {
            setSelectedBusinessType(kyc.businessType);
          }
          if (kyc.selfieImageUrl) {
            setSelfieImage(kyc.selfieImageUrl);
          }
          if (kyc.method) {
            setVerificationType(kyc.method);
          }

          // Determine which step to show based on status
          if (kyc.status === "verified" || kyc.status === "rejected" || kyc.status === "under_review") {
            setStep(4); // Show verification status
          } else if (kyc.documents && kyc.documents.length > 0) {
            setStep(3); // Show document verification
          } else if (kyc.selfieImageUrl) {
            setStep(3); // Show document verification
          } else if (kyc.businessType) {
            setStep(2); // Show photo identification
          }
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKycData();
  }, [session, server]);

  const handleDocumentComplete = async (type) => {
    setVerificationType(type);
    setStep(4);

    // Update onboarding progress if verified via DigiLocker
    if (type === "digilocker") {
      try {
        await axios.put(`${server}/user/update-onboarding`, {
          email: session?.user?.email,
          field: "kycCompleted",
          value: true,
        });
      } catch (error) {
        console.error("Error updating onboarding:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  const steps = [
    {
      component: (
        <BusinessType
          onNext={() => setStep(2)}
          selectedType={selectedBusinessType}
          setSelectedType={setSelectedBusinessType}
        />
      ),
      label: "Business Type",
    },
    {
      component: (
        <PhotoIdentification
          onNext={() => setStep(3)}
          selfieImage={selfieImage}
          setSelfieImage={setSelfieImage}
        />
      ),
      label: "Photo Identification",
    },
    {
      component: (
        <DocumentVerification
          businessType={selectedBusinessType}
          onComplete={handleDocumentComplete}
        />
      ),
      label: "Document Verification",
    },
    {
      component: (
        <VerificationStatus
          accountCode={session?.user?.accountCode}
          verificationType={verificationType}
          onComplete={() => window.location.href = "/dashboard"}
        />
      ),
      label: "Verification Status",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 p-6">
      {/* Step Navigation */}
      <div className="relative flex items-center border rounded-[25px] px-11 py-6 max-w-[100vw] bg-[#FFFFFF]">
        <div className="absolute left-20 right-24 border-t-2 border-dashed border-gray-500 transform -translate-y-1/2 mb-6" />
        <div className="flex justify-between w-full">
          {steps.map((stepObj, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${step === index + 1 ? "font-semibold" : "text-gray-500"
                } ${index < step ? "cursor-pointer" : "cursor-default"}`}
              onClick={() => index < step && setStep(index + 1)}
              aria-current={step === index + 1 ? "step" : undefined}
              aria-label={`Step ${index + 1}: ${stepObj.label}`}
            >
              <div className="relative w-9 h-9">
                <Image
                  className={`absolute inset-0 transition-opacity duration-500 ${step > index + 1 ? "opacity-0" : "opacity-100"
                    }`}
                  src={`/create-shipment/${index + 1}.svg`}
                  alt={`Step ${index + 1}`}
                  width={36}
                  height={36}
                />
                <Image
                  className={`absolute inset-0 transition-opacity duration-500 ${step > index + 1 ? "opacity-100" : "opacity-0"
                    }`}
                  src="/create-shipment/done-red.svg"
                  alt={`Step ${index + 1} Completed`}
                  width={36}
                  height={36}
                />
              </div>
              <span className="text-sm font-semibold mt-2">
                {stepObj.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full">{steps[step - 1]?.component}</div>
    </div>
  );
}

export default KYC;