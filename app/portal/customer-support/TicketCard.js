import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./style.css";
import { GlobalContext } from "../GlobalContext";
import axios from "axios";

const TicketCard = ({ ticketData, selected, onCheckboxChange }) => {
  // Destructure the data - ticketData already has displayTicketId
  const {
    _id,
    displayTicketId,
    ticketId,
    awbNumber,
    subCategory,
    status,
    resolutionDate,
    estimatedResolutionDate,
    updatedAt,
    priorityStatus = "Normal",
    history = [],
  } = ticketData;

  // Use displayTicketId first, then fallback to ticketId
  const displayId = displayTicketId || ticketId || "N/A";

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const {
    server,
    setTicketRefreshTrigger,
    setUpdateTicketRemark,
    setSelectedTicket,
    setRaiseTicketWindow,
  } = useContext(GlobalContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Calculate menu position when opening
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 10, // Position above the button with some spacing
        right: window.innerWidth - rect.right,
      });
    }
  }, [showMenu]);

  const handleClose = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${server}/portal/ticket`, {
        awbNumber: awbNumber,
        updates: {
          status: "Closed",
          isResolved: true,
        },
      });

      if (res.data.success) {
        console.log("Ticket closed:", awbNumber, res.data);
        setTicketRefreshTrigger((prev) => !prev);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error("Close error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setShowCloseModal(false);
      setShowMenu(false);
    }
  };

  const confirmIncreasePriority = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${server}/portal/ticket`, {
        awbNumber: awbNumber,
        updates: { priorityStatus: "Prioritized" },
      });

      if (res.data.success) {
        console.log("Priority increased:", awbNumber);
        setTicketRefreshTrigger((prev) => !prev);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error("Priority error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(`${server}/portal/ticket`, {
        data: { awbNumber: awbNumber },
      });

      if (res.data.success) {
        console.log("Ticket deleted:", awbNumber);
        setTicketRefreshTrigger((prev) => !prev);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <>
      <div
        className={`bg-white ${selected ? "bg-gray-100" : ""} text-[#71717A] relative`}
      >
        <ul className="flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] shipment-detail-ul p-4 text-[#A0AEC0] text-sm items-center ticket-detail-ul">
          <li style={{ width: "0px" }}>
            <input
              type="checkbox"
              name="shipment-detail"
              id={_id}
              checked={selected}
              onChange={() => onCheckboxChange(_id)}
              className="cursor-pointer"
            />
          </li>
          <li className="flex flex-col gap-1">
            <div className="font-medium text-gray-800">{displayId}</div>
            <div>
              {priorityStatus === "Prioritized" && (
                <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-md">
                  {priorityStatus}
                </span>
              )}
            </div>
          </li>

          <li className="font-medium">{awbNumber || "N/A"}</li>
          <li className="">{subCategory || "N/A"}</li>
          <li className="">
            {status === "Closed" ? (
              <span className="px-4 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-md">
                {status}
              </span>
            ) : status === "Resolved" ? (
              <span className="px-4 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-md">
                {status}
              </span>
            ) : (
              <span
                className={`px-4 py-1 text-xs font-semibold rounded-md ${
                  status === "Open"
                    ? "text-blue-600 bg-blue-100"
                    : status === "Pending"
                      ? "text-yellow-600 bg-yellow-100"
                      : "text-gray-600 bg-gray-100"
                }`}
              >
                {status || "Unknown"}
              </span>
            )}
          </li>

          <li className="">{formatDate(updatedAt)}</li>
          <li className="">
            {status === "Resolved" ? "" : formatDate(estimatedResolutionDate)}
          </li>
          <li className="">
            {status === "Resolved"
              ? `${formatFullDate(resolutionDate)}`
              : formatDate(resolutionDate)}
          </li>
          <li>
            <button
              onClick={() => setShowProgressModal(true)}
              className="text-xs px-3 py-1 rounded-full border border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-colors duration-200 whitespace-nowrap"
            >
              View Progress
            </button>
          </li>
          <li>
            <button
              ref={buttonRef}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Image
                src="/customer-support/option.svg"
                alt="Options"
                width={4}
                height={4}
                className="cursor-pointer select-none"
              />
            </button>
          </li>
        </ul>
      </div>

      {/* Dropdown menu rendered outside table with fixed positioning */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-300 rounded shadow-xl w-48 p-2 text-black"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            transform: "translateY(-100%)",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => {
              setShowCloseModal(true);
              setShowMenu(false);
            }}
            disabled={status === "Closed" || status === "Resolved" || loading}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
          >
            Close Ticket
          </button>
          <button
            onClick={() => {
              setUpdateTicketRemark(true);
              setSelectedTicket(ticketData);
              setRaiseTicketWindow(true);
              setShowMenu(false);
            }}
            disabled={status === "Resolved" || status === "Closed"}
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 rounded text-sm"
          >
            Update Remarks
          </button>

          <button
            onClick={confirmIncreasePriority}
            disabled={
              status === "Resolved" ||
              status === "Closed" ||
              priorityStatus === "Prioritized"
            }
            className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 rounded text-sm"
          >
            Prioritize Ticket
          </button>
          <hr className="my-1" />
          <button
            onClick={() => setShowDeleteModal(true)}
            className="block w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 rounded text-sm"
          >
            Delete Ticket
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete ticket <b>{displayId}</b> (AWB:{" "}
              {awbNumber})?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-2">Close Ticket</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to close ticket <b>{displayId}</b> (AWB:{" "}
              {awbNumber})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowCloseModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 rounded bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Closing..." : "Close Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress / History Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex justify-between items-center w-full">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Ticket Progress
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {displayId} · AWB: {awbNumber || "N/A"}
                  </p>
                </div>
                <div className="mr-6 text-right">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    Resolution Status
                  </p>
                  <p className="text-sm font-medium text-[var(--primary-color)]">
                    {status === "Resolved" || status === "Closed" ? (
                      <span className="text-green-600 font-bold">Resolved</span>
                    ) : estimatedResolutionDate || resolutionDate ? (
                      <span className="text-xs font-semibold">
                        EST Resolution Date:{" "}
                        {formatDate(estimatedResolutionDate || resolutionDate)}
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        Resolution in progress...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none"
              >
                ✕
              </button>
            </div>

            {/* Timeline Body */}
            <div className="overflow-y-auto px-6 py-5 flex-1">
              {history.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Ticket Progress will be displayed here, once progress has been
                  made
                </p>
              ) : (
                <ol className="relative border-l border-gray-200 ml-3">
                  {history.map((entry, idx) => {
                    const isLast = idx === history.length - 1;
                    const statusColor =
                      entry.statusHistory === "Resolved" ||
                      entry.statusHistory === "Closed"
                        ? "bg-green-100 text-green-700"
                        : entry.statusHistory === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : entry.statusHistory === "Open"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-[var(--primary-color)] text-white";
                    const dotColor =
                      entry.statusHistory === "Resolved" ||
                      entry.statusHistory === "Closed"
                        ? "bg-green-500"
                        : entry.statusHistory === "In Progress"
                          ? "bg-yellow-400"
                          : entry.statusHistory === "Open"
                            ? "bg-blue-500"
                            : "bg-[var(--primary-color)]";

                    return (
                      <li
                        key={idx}
                        className={`mb-6 ml-5 ${isLast ? "mb-0" : ""}`}
                      >
                        {/* Timeline dot */}
                        <span
                          className={`absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white ${dotColor}`}
                        />
                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                          {/* Action + status badge */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {entry.action}
                            </p>
                            {entry.statusHistory && (
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor}`}
                              >
                                {entry.statusHistory}
                              </span>
                            )}
                          </div>
                          {/* Meta row */}
                          <div className="flex justify-between gap-x-4 gap-y-1 text-[11px] text-gray-400">
                            {entry.date && (
                              <span>
                                🕒 {new Date(entry.date).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t flex justify-end">
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketCard;
