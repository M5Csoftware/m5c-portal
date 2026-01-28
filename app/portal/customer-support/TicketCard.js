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
    updatedAt,
    priorityStatus = "Normal",
  } = ticketData;

  // Use displayTicketId first, then fallback to ticketId
  const displayId = displayTicketId || ticketId || "N/A";

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
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

  const handleResolve = async () => {
    try {
      setLoading(true);
      const res = await axios.put(`${server}/portal/ticket`, {
        awbNumber: awbNumber,
        updates: {
          status: "Resolved",
          isResolved: true,
        },
      });

      if (res.data.success) {
        console.log("Ticket resolved:", awbNumber, res.data);
        setTicketRefreshTrigger((prev) => !prev);
      } else {
        console.error(res.data.error);
      }
    } catch (err) {
      console.error("Resolve error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
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

  return (
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
          {status === "Resolved" ? (
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
        <li className="">{formatDate(resolutionDate)}</li>
        <li className="flex flex-col cursor-pointer gap-2 items-center end relative">
          <button
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

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-8 bg-white border rounded shadow-lg w-48 p-2 z-10 text-black"
            >
              <button
                onClick={handleResolve}
                disabled={status === "Resolved" || loading}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Resolve Issue"}
              </button>
              <button
                onClick={() => {
                  setUpdateTicketRemark(true);
                  setSelectedTicket(ticketData);
                  setRaiseTicketWindow(true);
                  setShowMenu(false);
                }}
                disabled={status === "Resolved"}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                Update Remarks
              </button>

              <button
                onClick={confirmIncreasePriority}
                disabled={
                  status === "Resolved" || priorityStatus === "Prioritized"
                }
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                Prioritize Ticket
              </button>
              <hr className="my-1" />
              <button
                onClick={() => setShowDeleteModal(true)}
                className="block w-full text-left px-3 py-2 hover:bg-red-100 text-red-600"
              >
                Delete Ticket
              </button>
            </div>
          )}
        </li>
      </ul>

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
    </div>
  );
};

export default TicketCard;
