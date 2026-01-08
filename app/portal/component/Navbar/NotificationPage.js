"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { getNotifications } from "@/app/lib/notificationService";
import { useSession } from "next-auth/react";

// QR Code generation component
const QRCodeGenerator = ({ value }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white p-5 rounded-xl shadow-lg border">
        <QRCodeSVG value={value} size={220} />
      </div>
    </div>
  );
};


// NotificationPage Component
export function NotificationPage({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const { data: session } = useSession();

  // Fetch notifications on mount
  useEffect(() => {
    if (session?.user?.accountCode) {
      fetchNotifications();
    }
  }, [session, currentPage, filterType]);


  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await getNotifications({
        page: currentPage,
        filter: filterType,
        search: searchTerm,
        accountCode: session?.user?.accountCode,
      });

      if (!res || res.error) {
        console.error("Error:", res?.error);
        return;
      }

      setNotifications(res.notifications);
      setTotalPages(res.totalPages);

      if (res.notifications.length > 0 && !selectedNotification) {
        setSelectedNotification(res.notifications[0]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };


  // UPDATED ICONS
  const getNotificationIcon = (type) => {
    const base = "w-6 h-6 rounded-full flex items-center justify-center";

    switch (type) {
      case "Manifest Requested":
        return (
          <div className={`${base} bg-green-100`}>
            <Image src="/manifest.svg" height={20} width={20} alt="manifest" />
          </div>
        );

      case "Shipment Booked":
        return (
          <div className={`${base} bg-green-100`}>
            <Image src="/shipment-check.svg" height={20} width={20} alt="booked" />
          </div>
        );

      case "Shipment received at Hub":
        return (
          <div className={`${base} bg-green-100`}>
            <Image src="/shipment-download.svg" height={20} width={20} alt="hub" />
          </div>
        );

      case "Shipment Hold":
        return (
          <div className={`${base} bg-red-100`}>
            <Image src="/hold.svg" height={20} width={20} alt="hold" />
          </div>
        );

      default:
        return (
          <div className={`${base} bg-gray-100`}>
            <Image src="/manifest.svg" height={20} width={20} alt="default" />
          </div>
        );
    }
  };


  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownloadCode = () => {
    if (!selectedNotification) return;
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `barcode-${selectedNotification.awb}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedNotification) return;

    if (window.confirm("Are you sure you want to cancel this request?")) {
      try {
        alert("Request cancelled successfully");
        fetchNotifications();
      } catch (error) {
        console.error("Error cancelling request:", error);
        alert("Failed to cancel request");
      }
    }
  };

  const handleContactUs = () => {
    window.open(
      "mailto:support@example.com?subject=Notification Inquiry",
      "_blank"
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.awb.includes(searchTerm);
    const matchesFilter =
      filterType === "All" || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h2 className="font-semibold text-lg">Notifications</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDE */}
          <div className="w-[395px] border-r flex flex-col">
            <div className="flex items-center border border-[#DEDEDE] overflow-hidden px-6">
              <select
                className="bg-[#047857] text-white p-3 text-xs outline-none cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Manifest Requested">Manifest Requested</option>
                <option value="Shipment Booked">Shipment Booked</option>
                <option value="Shipment received at Hub">Received at Hub</option>
                <option value="Shipment Hold">Shipment Hold</option>
              </select>

              <div className="py-4 ml-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="text-gray-700 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No notifications found
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 border-b cursor-pointer hover:bg-[#F2F2F2] ${selectedNotification?.id === notification.id
                      ? "bg-[#FFFFFF]"
                      : ""
                      }`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <span className="text-[#979797] font-normal text-xs">
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-3 flex items-center justify-between bg-white sticky bottom-0">
              <button
                onClick={handlePrevPage}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
              >
                ←
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-[587px] p-6 overflow-y-auto">
            {selectedNotification && (
              <div>

                {/* SHOW HOLD IMAGE */}
                {selectedNotification.type === "Shipment Hold" && (
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/hold.svg"
                      alt="Hold Warning"
                      width={100}
                      height={100}
                    />
                  </div>
                )}

                <div className="flex gap-[10px]">
                  <div>
                    <Image
                      src="/roundlogo.svg"
                      alt="Company logo"
                      height={50}
                      width={50}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="font-medium">Dear Customer,</h3>
                    </div>

                    <div>
                      <p className="text-sm">
                        Your package has been successfully processed.
                      </p>
                      <p className="text-sm font-normal">
                        The manifest for AWB {selectedNotification.awb} is
                        requested for pickup at {selectedNotification.address}.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm">
                        Please use the following code for the pickup process:
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">

                      {/* QR + PICKUP SECTION (hidden for HOLD) */}
                      {selectedNotification.type !== "Shipment Hold" && (
                        <div className="flex flex-col gap-[22px] justify-center items-center">
                          <QRCodeGenerator
                            value={selectedNotification.awb}
                          />

                          <button className="bg-[#EA1B40] text-white px-6 py-2 rounded text-sm font-medium">
                            {selectedNotification.pickupCode}
                          </button>
                        </div>
                      )}

                      <div className="flex justify-start">
                        <p className="text-sm">
                          Kindly share this code only with the assigned pickup
                          partner. Pickup will be completed within 2-3 working
                          days.
                        </p>
                      </div>

                      <div className="flex justify-start">
                        <p className="text-xs text-gray-500">
                          {selectedNotification.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-[60px]">
                  <button
                    onClick={handleDownloadCode}
                    className="border border-[#EA1B40] text-[#EA1B40] px-4 py-2 rounded text-sm hover:bg-[#EA1B40] hover:text-white transition-colors"
                  >
                    Download Code
                  </button>
                  <button
                    onClick={handleCancelRequest}
                    className="border border-[#c86b7c] text-[#EA1B40] px-4 py-2 rounded text-sm hover:bg-[#c86b7c] hover:text-white transition-colors"
                  >
                    Cancel Request
                  </button>
                  <button
                    onClick={handleContactUs}
                    className="border border-[#EA1B40] text-[#EA1B40] px-4 py-2 rounded text-sm hover:bg-[#EA1B40] hover:text-white transition-colors"
                  >
                    Contact Us
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


