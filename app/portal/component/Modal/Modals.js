import { useEffect } from "react";
import Image from "next/image";

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
        className={`px-6 py-2 rounded-lg text-white font-semibold ${
          isDestructive
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

// Add this to your Modals.js file

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
