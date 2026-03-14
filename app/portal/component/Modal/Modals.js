import { useEffect, useState } from "react";
import Image from "next/image";
import React from "react";
// ExcelJS imported dynamically

export const Modal = ({
  isOpen,
  onClose,
  children,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ title, subtitle, icon }) => (
  <div className="p-6 border-b border-gray-200">
    <div className="flex items-start gap-4">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-[#2D3748]">{title}</h2>
        {subtitle && <p className="text-sm text-[#A0AEC0] mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export const ModalBody = ({ children }) => (
  <div className="p-6">{children}</div>
);

export const ModalFooter = ({ children }) => (
  <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
    {children}
  </div>
);

// Predefined modal types
export const SuccessModal = ({ isOpen, onClose, title, message, details }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalHeader
      title={title}
      icon={
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
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
      }
    />
    <ModalBody>
      <p className="text-[#2D3748] mb-4">{message}</p>
      {details && (
        <div className="bg-green-50 rounded-lg p-4 space-y-2">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span className="text-sm text-[#2D3748]">{detail}</span>
            </div>
          ))}
        </div>
      )}
    </ModalBody>
    <ModalFooter>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 font-semibold"
      >
        OK
      </button>
    </ModalFooter>
  </Modal>
);

export const ErrorModal = ({ isOpen, onClose, title, message, errors }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalHeader
      title={title}
      icon={
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600"
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
      }
    />
    <ModalBody>
      <p className="text-[#2D3748] mb-4">{message}</p>
      {errors && errors.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">✗</span>
              <span className="text-sm text-[#2D3748]">{error}</span>
            </div>
          ))}
        </div>
      )}
    </ModalBody>
    <ModalFooter>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
      >
        Close
      </button>
    </ModalFooter>
  </Modal>
);

export const WarningModal = ({ isOpen, onClose, title, message, warnings }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalHeader
      title={title}
      icon={
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      }
    />
    <ModalBody>
      <p className="text-[#2D3748] mb-4">{message}</p>
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">⚠</span>
              <span className="text-sm text-[#2D3748]">{warning}</span>
            </div>
          ))}
        </div>
      )}
    </ModalBody>
    <ModalFooter>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 font-semibold"
      >
        Understood
      </button>
    </ModalFooter>
  </Modal>
);

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalHeader
      title={title}
      icon={
        <div
          className={`w-12 h-12 rounded-full ${isDestructive ? "bg-red-100" : "bg-blue-100"} flex items-center justify-center`}
        >
          <svg
            className={`w-6 h-6 ${isDestructive ? "text-red-600" : "text-blue-600"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      }
    />
    <ModalBody>
      <p className="text-[#2D3748]">{message}</p>
    </ModalBody>
    <ModalFooter>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg border border-gray-300 text-[#71717A] hover:bg-gray-50 font-semibold"
      >
        {cancelText}
      </button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`px-6 py-2 rounded-lg text-white font-semibold ${isDestructive
          ? "bg-red-600 hover:bg-red-700"
          : "bg-[var(--primary-color)] hover:opacity-90"
          }`}
      >
        {confirmText}
      </button>
    </ModalFooter>
  </Modal>
);

export const InfoModal = ({ isOpen, onClose, title, message, info }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalHeader
      title={title}
      icon={
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      }
    />
    <ModalBody>
      <p className="text-[#2D3748] mb-4">{message}</p>
      {info && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          {info.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">ℹ</span>
              <span className="text-sm text-[#2D3748]">{item}</span>
            </div>
          ))}
        </div>
      )}
    </ModalBody>
    <ModalFooter>
      <button
        onClick={onClose}
        className="px-6 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 font-semibold"
      >
        OK
      </button>
    </ModalFooter>
  </Modal>
);

// Validation Error Modal (specific for bulk upload)
export const ValidationErrorModal = ({ isOpen, onClose, validationErrors }) => {
  const indianZipErrors = validationErrors.filter((err) =>
    err.message.includes("INDIAN ZIP CODE"),
  );
  const otherErrors = validationErrors.filter(
    (err) => !err.message.includes("INDIAN ZIP CODE"),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title="Validation Failed"
        subtitle={`${validationErrors.length} shipment(s) have invalid zip codes`}
        icon={
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        }
      />
      <ModalBody>
        <div className="space-y-4">
          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Important</p>
                <p className="text-sm text-blue-800">
                  We only ship internationally. Receiver zip codes MUST be from
                  UK, USA, Canada, Australia, or Europe. Indian pincodes are NOT
                  allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Indian Zip Code Errors */}
          {indianZipErrors.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                  {indianZipErrors.length}
                </span>
                Indian Zip Codes Detected
              </h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {indianZipErrors.slice(0, 10).map((err, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-red-600 font-bold flex-shrink-0">
                      Row {err.row}:
                    </span>
                    <span className="text-red-900 font-mono bg-red-100 px-2 py-0.5 rounded">
                      {err.zipcode}
                    </span>
                  </div>
                ))}
                {indianZipErrors.length > 10 && (
                  <p className="text-xs text-red-700 italic">
                    ...and {indianZipErrors.length - 10} more Indian zip codes
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Other Validation Errors */}
          {otherErrors.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">
                  {otherErrors.length}
                </span>
                Other Issues
              </h3>
              <div className="bg-orange-50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {otherErrors.slice(0, 5).map((err, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-orange-600 font-bold">
                      Row {err.row}:
                    </span>
                    <span className="text-orange-900 ml-2 font-mono bg-orange-100 px-2 py-0.5 rounded">
                      {err.zipcode}
                    </span>
                    <p className="text-orange-700 ml-2 mt-1">{err.message}</p>
                  </div>
                ))}
                {otherErrors.length > 5 && (
                  <p className="text-xs text-orange-700 italic">
                    ...and {otherErrors.length - 5} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
        >
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export function ZoneValidationErrorModal({ isOpen, onClose, zoneErrors }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-lg w-full max-w-4xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-amber-100 p-2 rounded-full mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-amber-800">
              Zone Configuration Validation Failed
            </h3>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              The following shipments have invalid sector-destination-service
              combinations that do not exist in the zone matrix:
            </p>

            <div className="bg-amber-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-amber-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Row
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      AWB
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                      Service
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {zoneErrors.map((error, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {error.index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-800">
                        {error.awbNo}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {error.sector}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {error.destination}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {error.service}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-100 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-amber-800 mb-2">How to fix:</h4>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
              <li>
                Check your Excel file for correct Sector, Destination, and
                Service values
              </li>
              <li>
                Ensure the combination exists in the Zone Matrix configuration
              </li>
              <li>
                Contact your administrator if you need to add new zone
                combinations
              </li>
              <li>Correct these values in your Excel file and re-upload</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SectorDestinationValidationModal = ({
  isOpen,
  onClose,
  validationErrors = [],
}) => {
  if (!isOpen) return null;

  const groupedErrors = validationErrors.reduce((acc, error) => {
    const key = `${error.sector}|${error.destination}|${error.service}`;
    if (!acc[key]) {
      acc[key] = {
        sector: error.sector,
        destination: error.destination,
        service: error.service,
        rowIndices: error.rowIndices || [],
        message: error.message,
      };
    }
    return acc;
  }, {});

  const uniqueErrors = Object.values(groupedErrors);
  const totalAffectedRows = validationErrors.reduce(
    (sum, err) => sum + (err.rowIndices?.length || 1),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2">
              <Image
                src="/warning-icon.svg"
                width={24}
                height={24}
                alt="Warning"
                className="text-amber-600"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Invalid Zone Configuration
              </h2>
              <p className="text-amber-50 text-sm">
                {uniqueErrors.length} combination
                {uniqueErrors.length !== 1 ? "s" : ""} not found in your zone
                matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Summary Section */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
            <h3 className="font-semibold text-amber-900 mb-2">
              ⚠️ What does this mean?
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Your Excel file contains sector-destination-service combinations
              that don&apos;t exist in your zone configuration. This means rates
              cannot be calculated for these shipments.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded">
                <p className="text-amber-600 font-semibold">
                  Invalid Combinations
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {uniqueErrors.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-amber-600 font-semibold">
                  Affected Shipments
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {totalAffectedRows}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How to Fix This
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
              <li>
                <strong>Option 1:</strong> Update your Excel file to use valid
                sector-destination-service combinations from your zone matrix
              </li>
              <li>
                <strong>Option 2:</strong> Contact your administrator to add
                these combinations to the zone configuration
              </li>
              <li>
                <strong>Option 3:</strong> Check for typos in the Sector,
                Destination, or ServiceName columns (they are case-sensitive)
              </li>
            </ol>
          </div>

          {/* Error Details Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">
                Invalid Combinations Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Excel Rows
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uniqueErrors.map((error, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {error.sector || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {error.destination || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {error.service || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {error.rowIndices && error.rowIndices.length > 0 ? (
                          <span className="text-xs">
                            {error.rowIndices.length <= 3
                              ? error.rowIndices.join(", ")
                              : `${error.rowIndices.slice(0, 3).join(", ")} +${error.rowIndices.length - 3} more`}
                          </span>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">
              💡 Pro Tips:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                • Sector, Destination, and Service values are{" "}
                <strong>case-sensitive</strong> (USA ≠ usa)
              </li>
              <li>
                • Make sure there are no extra spaces before or after values
              </li>
              <li>
                • Check your zone configuration in the admin panel to see all
                valid combinations
              </li>
              <li>
                • You can export your current zone matrix to compare with your
                Excel file
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm"
          >
            I Understand - Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions — mirrors the sample Excel exactly (no Origin column)
// ─────────────────────────────────────────────────────────────────────────────
//
// Fill legend (from the original file):
//   RED    : FFC00000  → required field   → white font  (theme 0)
//   YELLOW : FFFFFF00  → optional field   → black font  (theme 1 → use "FF000000")
//   GREY   : theme-6   → dimension field  → yellow font (FFFFFF00)
//
// We replicate theme-6 as the closest standard grey: FF808080
// ExcelJS uses ARGB strings.

const COL_DEFS = [
  // header             key (on shipment obj)            fill          fontColor  width
  ["Sector", "sector", "RED", "WHITE", 18],
  ["Destination", "destination", "RED", "WHITE", 14],
  ["ServiceName", "service", "RED", "WHITE", 36.4],
  ["GoodsType", "goodstype", "RED", "WHITE", 19.3],
  ["PCS", "pcs", "RED", "WHITE", 8],
  ["Length", "__length", "GREY", "YELLOW", 21.9],
  ["Breadth", "__breadth", "GREY", "YELLOW", 14],
  ["Height", "__height", "GREY", "YELLOW", 14],
  ["ActualWeight", "__actualWeight", "GREY", "WHITE", 23.9],
  ["HSNCode", "__hsnCode", "GREY", "WHITE", 44],
  ["Quantity", "__quantity", "GREY", "WHITE", 22.3],
  ["Rate", "__rate", "GREY", "WHITE", 25.7],
  ["ConsignorName", "shipperFullName", "RED", "WHITE", 16.4],
  ["ConsignorAddressLine1", "shipperAddressLine1", "RED", "WHITE", 23.9],
  ["ConsignorAddressLine2", "shipperAddressLine2", "YELLOW", "BLACK", 25.9],
  ["ConsignorCity", "shipperCity", "RED", "WHITE", 14.3],
  ["ConsignorState", "shipperState", "RED", "WHITE", 15.6],
  ["ConsignorPincode", "shipperPincode", "RED", "WHITE", 18.6],
  ["ConsignorTelephone", "shipperPhoneNumber", "RED", "WHITE", 21.3],
  ["ConsignorKycType", "shipperKycType", "RED", "WHITE", 19.1],
  ["ConsignorKycNo", "shipperKycNumber", "RED", "WHITE", 17.3],
  ["ConsigneeName", "receiverFullName", "RED", "WHITE", 16.9],
  ["ConsigneeAddressLine1", "receiverAddressLine1", "RED", "WHITE", 24.3],
  ["ConsigneeAddressLine2", "receiverAddressLine2", "YELLOW", "BLACK", 25.9],
  ["ConsigneeCity", "receiverCity", "RED", "WHITE", 14],
  ["ConsigneeState", "receiverState", "RED", "WHITE", 14],
  ["ConsigneeZipcode", "receiverPincode", "RED", "WHITE", 14],
  ["ConsigneeTelephone", "receiverPhoneNumber", "RED", "WHITE", 14],
  ["ConsigneeEmailId", "receiverEmail", "YELLOW", "BLACK", 14],
  ["ReferenceNo", "reference", "YELLOW", "BLACK", 14],
  ["ShipmentContent", "__content", "RED", "WHITE", 20],
  ["InvoiceValue", "totalInvoiceValue", "RED", "WHITE", 23.6],
  ["InvoiceCurrency", "currency", "RED", "WHITE", 24.6],
];

const FILL_COLORS = {
  RED: "FFC00000",
  YELLOW: "FFFFFF00",
  GREY: "FF808080",
};

const FONT_COLORS = {
  WHITE: "FFFFFFFF",
  BLACK: "FF000000",
  YELLOW: "FFFFFF00",
};

const thin = { style: "thin" };

/**
 * Extract comma-separated box dimension / item values from a full shipment object.
 */
function extractShipmentFields(entry) {
  const boxes = Array.isArray(entry.boxes) ? entry.boxes : [];
  const allItems = Object.values(entry.shipmentAndPackageDetails || {}).flat();

  return {
    __length: boxes.map((b) => b.length ?? 0).join(","),
    __breadth: boxes.map((b) => b.width ?? 0).join(","),
    __height: boxes.map((b) => b.height ?? 0).join(","),
    __actualWeight: boxes.map((b) => b.actualWt ?? 0).join(","),
    __hsnCode: allItems.map((i) => i.hsnNo ?? "").join(","),
    __quantity: allItems.map((i) => i.qty ?? "").join(","),
    __rate: allItems.map((i) => i.rate ?? "").join(","),
    __content: allItems.map((i) => i.context ?? "").join(","),
  };
}

/**
 * Build and trigger download of a styled Excel file using ExcelJS.
 * Matches the original sample file styling exactly.
 */
async function downloadPendingShipmentsExcel(skippedEntries) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "M5C Portal";
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheet = workbook.addWorksheet("Pending Shipments");

  // ── 1. Define columns (sets widths) ──────────────────────────────────────
  sheet.columns = COL_DEFS.map(([header, , , , width]) => ({
    header: "",      // we'll style the header row manually
    width,
  }));

  // ── 2. Write & style header row ──────────────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.height = 20;

  COL_DEFS.forEach(([header, , fillKey, fontColorKey], colIdx) => {
    const cell = headerRow.getCell(colIdx + 1);
    cell.value = header;

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: FILL_COLORS[fillKey] },
    };

    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: FONT_COLORS[fontColorKey] },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: false,
    };

    cell.border = {
      top: thin,
      left: thin,
      bottom: thin,
      right: thin,
    };
  });

  // ── 3. Write data rows ───────────────────────────────────────────────────
  skippedEntries.forEach((entry) => {
    const extras = extractShipmentFields(entry);
    const merged = { ...entry, ...extras };

    const rowValues = COL_DEFS.map(([, key]) => {
      const val = merged[key];
      return val !== undefined && val !== null ? val : "";
    });

    const dataRow = sheet.addRow(rowValues);
    dataRow.height = 18;

    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: "Calibri",
        size: 11,
        bold: false,
      };
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: false,
      };
      cell.border = {
        top: thin,
        left: thin,
        bottom: thin,
        right: thin,
      };
    });
  });

  // ── 4. Freeze the header row ──────────────────────────────────────────────
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  // ── 5. Trigger browser download ───────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");

  link.href = url;
  link.download = `pending_shipments_${timestamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * InsufficientBalanceModal
 *
 * Props:
 *  isOpen          – boolean
 *  onClose         – () => void
 *  bookedCount     – number of shipments successfully booked
 *  skippedEntries  – array of full shipment objects that were NOT uploaded
 */
export const InsufficientBalanceModal = ({
  isOpen,
  onClose,
  bookedCount = 0,
  skippedEntries = [],
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (skippedEntries.length === 0) return;
    setDownloading(true);
    try {
      await downloadPendingShipmentsExcel(skippedEntries);
    } catch (err) {
      console.error("Excel download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Insufficient Balance — Upload Stopped
              </h2>
              <p className="text-orange-100 text-sm">
                {bookedCount} shipment{bookedCount !== 1 ? "s" : ""} booked •{" "}
                {skippedEntries.length} not uploaded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{bookedCount}</p>
              <p className="text-sm text-green-600 font-medium mt-1">
                ✓ Successfully Booked
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">
                {skippedEntries.length}
              </p>
              <p className="text-sm text-orange-600 font-medium mt-1">
                ✗ Not Uploaded (Insufficient Balance)
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-5">
            <p className="text-sm text-amber-800">
              <strong>Why did this happen?</strong> Your balance was insufficient
              to book the following shipments. Please top up your balance and
              re-upload these entries using the downloaded Excel file.
            </p>
          </div>

          {/* Skipped entries table */}
          {skippedEntries.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 text-sm">
                  Entries NOT Uploaded ({skippedEntries.length})
                </h3>
                {/* Download button — inside table header */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Excel
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receiver Name</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference No</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount (₹)</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {skippedEntries.map((entry, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-orange-50"}
                      >
                        <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800">
                          {entry.receiverFullName || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                          {entry.reference || "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-700 font-semibold">
                          {entry.totalAmt
                            ? `₹${Number(entry.totalAmt).toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-orange-700">
                          {entry.errorReason || "Insufficient balance"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          {/* Download button — in footer too for convenience */}
          <button
            onClick={handleDownload}
            disabled={downloading || skippedEntries.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating Excel…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Pending Shipments (.xlsx)
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-sm"
          >
            Understood — Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorDestinationValidationModal;