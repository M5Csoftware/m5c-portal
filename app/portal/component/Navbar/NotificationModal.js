"use client";
import { useState, useRef, useEffect } from "react";
import { NotificationPage } from "./NotificationPage";
import Image from "next/image";
import { getNotifications } from "@/app/lib/notificationService";
import { useSession } from "next-auth/react";

const NotificationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const modalRef = useRef(null);
  const bellRef = useRef(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.accountCode) {
      fetchRecentNotifications();
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // if dropdown is open AND clicked outside BOTH the dropdown & the bell icon → close it
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchRecentNotifications = async () => {
    try {
      const res = await getNotifications({
        page: 1,
        limit: 3,
        filter: "All",
        search: "",
        accountCode: session?.user?.accountCode,
      });

      if (!res || res.error) return;

      setNotifications(res.notifications);
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    setTimeout(() => setShowFullPage(true), 180);
  };

  const handleCloseFullPage = () => {
    setShowFullPage(false);
  };

  return (
    <div className="relative">
      {/* BELL BUTTON */}
      <div ref={bellRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer relative">
        <Image width={25} height={25} src="/notification_bell.svg" alt="Notification Bell" />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </div>

      {/* DROPDOWN MODAL */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 top-10 w-80 bg-white shadow-lg rounded-lg p-4 z-50"
        >
          <h3 className="font-semibold text-gray-800">Notifications</h3>

          <div className="mt-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 p-3">No notifications found.</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification._id} className="p-2 border-b">
                  <p className="text-sm font-medium">{notification.title}</p>
                  <span className="text-xs text-gray-500">
                    {notification.description}
                  </span>
                </div>
              ))
            )}

            <div
              onClick={handleViewAll}
              className="p-2 text-center text-[#EA1B40] cursor-pointer hover:underline"
            >
              View All
            </div>
          </div>
        </div>
      )}

      {/* FULL PAGE MODAL */}
      {showFullPage && <NotificationPage onClose={handleCloseFullPage} />}
    </div>
  );
};

export default NotificationModal;
