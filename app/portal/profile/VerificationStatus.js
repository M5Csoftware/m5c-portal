"use client";
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Link from "next/link";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const VerificationStatus = ({ accountCode, verificationType, onComplete }) => {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/kyc/upload-document?accountCode=${accountCode}`
        );
        if (response.data.success) {
          setKycStatus(response.data.data);

          // Update onboarding progress if verified
          if (response.data.data.status === "verified") {
            await updateOnboardingProgress();
          }
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
      } finally {
        setLoading(false);
      }
    };

    const updateOnboardingProgress = async () => {
      try {
        await axios.put(`${server}/api/user/update-onboarding`, {
          email: session?.user?.email,
          field: "kycCompleted",
          value: true,
        });
      } catch (error) {
        console.error("Error updating onboarding:", error);
      }
    };

    if (accountCode) {
      fetchKycStatus();
    }
  }, [accountCode, server, session]);

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const isDigiLocker = verificationType === "digilocker" || kycStatus?.method === "digilocker";
  const isVerified = kycStatus?.status === "verified";
  const isRejected = kycStatus?.status === "rejected";
  const isUnderReview = kycStatus?.status === "under_review";

  return (
    <div className="max-w-[800px] mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="text-center">
        {/* Success Icon - DigiLocker or Verified */}
        {(isDigiLocker && isVerified) && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              KYC Verification Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your KYC has been verified successfully using DigiLocker. You can
              now access all features.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Verification Method:</strong> DigiLocker (Instant)
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Business Type:</strong> {kycStatus?.businessType || "N/A"}
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Status:</strong> Verified
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Verified On:</strong>{" "}
                {kycStatus?.verifiedAt
                  ? new Date(kycStatus.verifiedAt).toLocaleString()
                  : new Date().toLocaleString()}
              </p>
            </div>
          </>
        )}

        {/* Manual Verification - Verified */}
        {!isDigiLocker && isVerified && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              KYC Verification Approved!
            </h2>
            <p className="text-gray-600 mb-6">
              Your documents have been reviewed and approved. You can now access
              all features.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Verification Method:</strong> Manual Document Upload
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Business Type:</strong> {kycStatus?.businessType || "N/A"}
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Status:</strong> Verified
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Verified On:</strong>{" "}
                {new Date(kycStatus.verifiedAt).toLocaleString()}
              </p>
              {kycStatus.verifiedBy && (
                <p className="text-sm text-green-800 mt-2">
                  <strong>Verified By:</strong> {kycStatus.verifiedBy}
                </p>
              )}
            </div>
          </>
        )}

        {/* Manual Verification - Under Review */}
        {isUnderReview && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Documents Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your documents have been submitted for verification. Our team will
              review them shortly.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Verification Method:</strong> Manual Document Upload
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>Business Type:</strong> {kycStatus?.businessType || "N/A"}
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>Status:</strong> Under Review
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>Estimated Time:</strong> 2-3 Business Days
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>Submitted On:</strong>{" "}
                {kycStatus?.submittedAt
                  ? new Date(kycStatus.submittedAt).toLocaleString()
                  : new Date().toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 text-left list-disc list-inside space-y-1">
                <li>Our team will verify your submitted documents</li>
                <li>
                  You&apos;ll receive an email notification once verification is complete
                </li>
                <li>You can check your verification status in your dashboard</li>
              </ul>
            </div>
          </>
        )}

        {/* Rejected Status */}
        {isRejected && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              KYC Verification Rejected
            </h2>
            <p className="text-gray-600 mb-6">
              Your KYC verification has been rejected. Please review the reason
              below and resubmit.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Status:</strong> Rejected
              </p>
              <p className="text-sm text-red-800 mt-2">
                <strong>Rejected On:</strong>{" "}
                {new Date(kycStatus.rejectedAt).toLocaleString()}
              </p>
              <p className="text-sm text-red-800 mt-2">
                <strong>Rejection Reason:</strong>
              </p>
              <p className="text-sm text-red-800 mt-1 bg-white p-3 rounded">
                {kycStatus.rejectionReason || "No reason provided"}
              </p>
            </div>
            <Link href="/portal/kyc">
              <button className="px-8 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-md hover:bg-red-600 transition-colors mb-4">
                Resubmit Documents
              </button>
            </Link>
          </>
        )}

        {/* Back to Homepage Button */}
        {!isRejected && (
          <Link href="/portal">
            <button className="px-8 py-3 bg-[var(--primary-color)] rounded-lg text-white font-semibold hover:bg-red-600 transition-colors">
              Back to Homepage
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerificationStatus;