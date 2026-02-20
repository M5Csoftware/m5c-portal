"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { getNotifications, updateNotification } from "@/app/lib/notificationService";
import { useSession } from "next-auth/react";


// NotificationPage Component
export function NotificationPage({ onClose, initialNotification }) {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(initialNotification || null);
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
  }, [session, currentPage, filterType, searchTerm]);

  // Sync selection if initialNotification prop changes
  useEffect(() => {
    if (initialNotification) {
      setSelectedNotification(initialNotification);
      setFilterType("All");
    }
  }, [initialNotification]);

  // Mark as read when selected
  useEffect(() => {
    if (selectedNotification && !selectedNotification.isRead) {
      handleMarkAsRead(selectedNotification._id || selectedNotification.id);
    }
  }, [selectedNotification]);

  const handleMarkAsRead = async (id) => {
    try {
      await updateNotification({ id, isRead: true });
      // Update local state to reflect read status
      setNotifications(prev => prev.map(n =>
        (n._id === id || n.id === id) ? { ...n, isRead: true } : n
      ));
      if (selectedNotification?._id === id || selectedNotification?.id === id) {
        setSelectedNotification(prev => ({ ...prev, isRead: true }));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };


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
    const eventType = type || "";

    switch (eventType) {
      case "Manifest Requested":
        return (
          <div className={`${base} bg-green-100`}>
            <Image src="/manifest.svg" height={20} width={20} alt="manifest" />
          </div>
        );

      case "Shipment Booked":
      case "Shipment Status":
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

      case "New Invoice Generated":
      case "Rate Hike":
        return (
          <div className={`${base} bg-blue-100`}>
            <Image src="/invoice.svg" height={20} width={20} alt="invoice" />
          </div>
        );

      case "Payment Due Reminder":
      case "Credit Limit Exceeded Alert":
        return (
          <div className={`${base} bg-orange-100`}>
            <Image src="/billing.svg" height={20} width={20} alt="billing" />
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

  const handleDownloadInvoice = () => {
    if (!selectedNotification || !selectedNotification.link) return;
    window.open(selectedNotification.link, "_blank");
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
    const title = (notification.event || notification.title || "").toLowerCase();
    const awb = (notification.awbNo || notification.awb || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();

    const matchesSearch =
      title.includes(search) ||
      awb.includes(search);

    const matchesFilter =
      filterType === "All" || (notification.event || notification.type) === filterType;
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
                  <div key={notification.id || notification._id}
                    className={`p-6 border cursor-pointer transition-all duration-200 ${selectedNotification?.id === (notification.id || notification._id) || selectedNotification?._id === (notification.id || notification._id)
                      ? "bg-red-50/50 border-l-4 border-[#EA1B40] translate-x-1"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.event || notification.type)}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {notification.event || notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 bg-[#EA1B40] rounded-full"></span>
                            )}
                          </div>
                          <span className="text-[#979797] font-normal text-xs">
                            {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : notification.timestamp}
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
          <div className="w-[587px] p-8 overflow-y-auto bg-gray-50/30">
            {selectedNotification ? (
              <div className="flex flex-col h-full">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex p-3 bg-red-50 rounded-xl">
                      <Image
                        src="/roundlogo.svg"
                        alt="Company logo"
                        height={40}
                        width={40}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">{selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : selectedNotification.timestamp}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{selectedNotification.event || selectedNotification.type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Hello {selectedNotification.name || "Customer"},</h3>

                    <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                      <p>{selectedNotification.message || selectedNotification.description}</p>

                      {/* CATEGORY SPECIFIC DETAILS */}

                      {/* SHIPMENT DETAILS */}
                      {(selectedNotification.event?.includes("Shipment") || selectedNotification.type?.includes("Shipment") || selectedNotification.event === "Manifest Requested" || selectedNotification.type === "Manifest Requested") && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 mt-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">AWB Number</span>
                            <span className="font-semibold text-gray-800">{selectedNotification.awbNo || selectedNotification.awb || "N/A"}</span>
                          </div>
                          {selectedNotification.status && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Current Status</span>
                              <span className="text-blue-600 font-medium">{selectedNotification.status}</span>
                            </div>
                          )}
                          {selectedNotification.address && (
                            <div className="pt-2 border-t border-gray-100">
                              <span className="text-xs text-gray-400 block mb-1">Pickup Address</span>
                              <span className="text-xs text-gray-700">{selectedNotification.address}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* BILLING DETAILS */}
                      {(selectedNotification.event?.includes("Invoice") || selectedNotification.type?.includes("Invoice") || selectedNotification.event?.includes("Payment") || selectedNotification.type?.includes("Payment") || selectedNotification.event?.includes("Credit") || selectedNotification.type?.includes("Credit")) && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 mt-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reference #</span>
                            <span className="font-semibold text-gray-800">{selectedNotification.invoiceNo || selectedNotification.awbNo || selectedNotification.awb || "N/A"}</span>
                          </div>
                          {selectedNotification.amount && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Amount</span>
                              <span className="text-red-600 font-bold">₹{selectedNotification.amount}</span>
                            </div>
                          )}
                          {selectedNotification.dueDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Due Date</span>
                              <span className="text-orange-600 font-medium">{selectedNotification.dueDate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col gap-3">
                    {selectedNotification.link ? (
                      <button
                        onClick={() => window.open(selectedNotification.link, "_blank")}
                        className="w-full bg-[#EA1B40] text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                      >
                        {((selectedNotification.event || selectedNotification.type)?.includes("Invoice")) ? "View Invoice" :
                          ((selectedNotification.event || selectedNotification.type)?.includes("Shipment")) ? "Track Shipment" : "View Details"}
                      </button>
                    ) : (
                      <button
                        onClick={handleContactUs}
                        className="w-full bg-[#EA1B40] text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-100"
                      >
                        Contact Support
                      </button>
                    )}

                    <div className="flex justify-between items-center px-1">
                      <button
                        onClick={handleContactUs}
                        className="text-xs font-medium text-gray-500 hover:text-[#EA1B40] transition-colors"
                      >
                        Need help? Contact Us
                      </button>
                      <button
                        onClick={handleCancelRequest}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[2px]">M5C Logistics Portal Notification System</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h4 className="text-gray-800 font-semibold mb-2">Select a notification</h4>
                <p className="text-gray-500 text-sm">Select a notification from the list to view its complete details and available actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


