"use client";
import { useState, useRef, useEffect } from "react";
import { NotificationPage } from "./NotificationPage";
import Image from "next/image";
import { getNotifications } from "@/app/lib/notificationService";
import { useSession } from "next-auth/react";
import axios from "axios";
import { ExternalLinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const NotificationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullPage, setShowFullPage] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const modalRef = useRef(null);
  const bellRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();
  const prevCountRef = useRef(0);
  const [loading, setLoading] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [initialNotification, setInitialNotification] = useState(null);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    notificationSoundRef.current = new Audio("/notifications.mp3");
  }, []);

  useEffect(() => {
    if (session?.user?.accountCode) {
      fetchRecentNotifications();
      fetchUnreadCount();
    }
  }, [session?.user?.accountCode]);

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

  useEffect(() => {
    if (!session?.user?.accountCode) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [session?.user?.accountCode]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_SERVER}/notifications`, {
        id,
        isRead: true,
      });

      fetchRecentNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoading(true);

    try {
      const res = await getNotifications({
        page: 1,
        limit: 15,
        filter: "All",
        search: "",
        accountCode: session?.user?.accountCode,
      });

      if (!res || res.error) return;

      setNotifications(res.notifications);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/notifications/unread-count`,
        {
          params: {
            accountCode: session?.user?.accountCode,
          },
        },
      );

      setUnreadCount(res.data.count);

      if (res.data.count > prevCountRef.current) {
        notificationSoundRef.current?.play().catch(() => {});
      }

      prevCountRef.current = res.data.count;
    } catch (err) {
      console.error("Unread count error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER}/notifications/mark-all`,
        { accountCode: session?.user?.accountCode },
      );

      fetchRecentNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    setInitialNotification(null);
    setTimeout(() => setShowFullPage(true), 180);
  };

  const handleCloseFullPage = () => {
    setShowFullPage(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      fetchRecentNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // sort unread first
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);
  const sortedNotifications = [...unread, ...read];

  return (
    <div className="relative">
      {/* 🔔 BELL BUTTON */}
      <div
        ref={bellRef}
        onClick={() => {
          if (!isOpen) {
            fetchRecentNotifications();
            fetchUnreadCount();
          }
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer relative"
      >
        <Image
          width={25}
          height={25}
          src="/notification_bell.svg"
          alt="Notification Bell"
        />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#EA1B40] text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 🔔 DROPDOWN */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 top-12 w-[420px] bg-white shadow-2xl rounded-2xl z-50 border border-gray-200 table-scrollbar animate-fade-in"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b bg-gradient-to-r from-[#fff5f7] to-white flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 text-base">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#EA1B40] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Scrollable List */}
          <div className="max-h-[420px] overflow-y-auto table-scrollbar px-4 py-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No notifications found.
              </p>
            ) : (
              sortedNotifications.map((notification) => {
                const date = new Date(notification.createdAt);

                const formattedDateTime = date.toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={notification._id}
                    onClick={() => {
                      markAsRead(notification._id);
                      setInitialNotification(notification);
                      setIsOpen(false);
                      setTimeout(() => setShowFullPage(true), 180);
                    }}
                    className={`p-4 pb-2  rounded-l-lg border-l-0 rounded-xl cursor-pointer transition-all border relative ${
                      notification.isRead
                        ? "bg-white border-gray-200 hover:bg-gray-50"
                        : "bg-[#fff0f3] border-[#ffd4dc] hover:bg-[#ffe3e8]"
                    }`}
                  >
                    <div
                      className={`absolute left-[1px] top-0 h-full w-1 rounded-l-lg ${
                        notification.priority === "high"
                          ? "bg-red-500"
                          : notification.priority === "low"
                            ? "bg-green-400"
                            : notification.priority === "medium"
                              ? "bg-yellow-400"
                              : "bg-gray-300"
                      }`}
                    />

                    {/* Title + Time */}
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-extrabold tracking-normal text-gray-700 leading-snug">
                        {notification.event}
                      </p>
                      <span className="text-[11px] text-gray-400 ml-3 whitespace-nowrap">
                        {formattedDateTime}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-gray-800 mt-1">
                        {notification.description}
                      </p>
                      <span className="text-xs tracking-wide leading-tight">
                        {notification.message}
                      </span>
                    </div>

                    {/* Red indicator for unread */}
                    <div className="flex justify-between group mt-1">
                      {notification.link && (
                        <div className="flex gap-1 text-[#EA1B40] items-center text-xs mt-1">
                          <span className="font-semibold tracking-wide">
                            Action link
                          </span>
                          <ExternalLinkIcon width={12} height={12} />
                        </div>
                      )}

                      {!notification.isRead && (
                        <div className=" flex justify-end items-center gap-2">
                          <span className="w-2 h-2 bg-[#EA1B40] rounded-full"></span>
                          <span className="text-xs text-[#EA1B40] font-medium">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            onClick={handleViewAll}
            className="text-center py-3 text-sm text-[#EA1B40] font-medium border-t cursor-pointer hover:bg-gray-50 transition"
          >
            View All Notifications
          </div>
        </div>
      )}

      {/* FULL PAGE MODAL */}
      {showFullPage && (
        <NotificationPage
          onClose={handleCloseFullPage}
          initialNotification={initialNotification}
        />
      )}
    </div>
  );
};

export default NotificationModal;
