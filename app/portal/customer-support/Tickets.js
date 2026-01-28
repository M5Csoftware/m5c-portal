"use client";
import React, { useState, useEffect, useContext } from "react";
import TicketCard from "./TicketCard";
import "./style.css";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const Tickets = ({ statusFilter, dateRange }) => {
  const [selectedtickets, setSelectedtickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const { ticketRefreshTrigger, ticketsData, setTicketsData, server } =
    useContext(GlobalContext);
  const { data: session } = useSession();

  // Fetching tickets from backend using Axios
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${server}/portal/ticket/get-ticket?accountCode=${session?.user?.accountCode}`,
        );

        console.log("API Response:", response.data);

        if (response.data.data && Array.isArray(response.data.data)) {
          const allTickets = response.data.data.map((ticket, index) => ({
            ...ticket,
            displayTicketId:
              ticket.ticketId ||
              `TCKT-${(index + 1).toString().padStart(3, "0")}`,
          }));

          console.log("Processed tickets:", allTickets);
          console.log("Status filter:", statusFilter);
          console.log("Date range:", dateRange);

          let filteredTickets = allTickets;

          // Apply status filter
          if (statusFilter && statusFilter !== "All" && statusFilter !== "") {
            filteredTickets = filteredTickets.filter(
              (ticket) =>
                ticket.status?.toLowerCase() === statusFilter.toLowerCase(),
            );
            console.log(`Filtered by status ${statusFilter}:`, filteredTickets);
          }

          // Apply date range filter
          if (dateRange && dateRange.startDate && dateRange.endDate) {
            filteredTickets = filteredTickets.filter((ticket) => {
              // Check both createdAt and updatedAt fields
              const ticketDate = new Date(ticket.updatedAt || ticket.createdAt);
              const startDate = new Date(dateRange.startDate);
              const endDate = new Date(dateRange.endDate);

              // Set time to start/end of day for accurate comparison
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);

              const isInRange =
                ticketDate >= startDate && ticketDate <= endDate;

              console.log(`Ticket ${ticket.displayTicketId}:`, {
                ticketDate: ticketDate.toLocaleDateString(),
                startDate: startDate.toLocaleDateString(),
                endDate: endDate.toLocaleDateString(),
                isInRange,
              });

              return isInRange;
            });
            console.log(`Filtered by date range:`, filteredTickets);
          }

          console.log(
            `Available statuses:`,
            allTickets.map((t) => t.status),
          );
          setTicketsData(filteredTickets);
        } else {
          console.error("Invalid data format:", response.data);
          setTicketsData([]);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTicketsData([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accountCode) {
      fetchTickets();
    }
  }, [
    statusFilter,
    dateRange,
    ticketRefreshTrigger,
    session?.user?.accountCode,
    server,
    setTicketsData,
  ]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ticketsData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [ticketsData.length, statusFilter, dateRange]);

  // Checkbox logic
  const handleCheckboxChange = (id) => {
    setSelectedtickets((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((ticketId) => ticketId !== id)
        : [...prevSelected, id],
    );
  };

  const handleDeleteSelected = () => {
    setTicketsData((prevTickets) =>
      prevTickets.filter((ticket) => !selectedtickets.includes(ticket._id)),
    );
    setSelectedtickets([]);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(ticketsData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);

    // Recalculate current page to keep showing the same items
    const newPage = Math.ceil((indexOfFirstItem + 1) / newItemsPerPage);
    setCurrentPage(newPage || 1);
  };

  const handleSelectAll = () => {
    if (selectedtickets.length === currentItems.length) {
      // If all current items are selected, deselect all
      setSelectedtickets([]);
    } else {
      // Select all current items
      const currentIds = currentItems.map((ticket) => ticket._id);
      setSelectedtickets(currentIds);
    }
  };

  // Calculate if all current items are selected
  const areAllSelected =
    currentItems.length > 0 &&
    currentItems.every((ticket) => selectedtickets.includes(ticket._id));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Debug info */}
      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
        Total Tickets: {ticketsData.length} | Showing: {currentItems.length} |
        Page: {currentPage}/{Math.ceil(ticketsData.length / itemsPerPage) || 1}{" "}
        | Filter: {statusFilter || "All"} | Date Range:{" "}
        {dateRange
          ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
          : "All Time"}
      </div>

      {/* Header */}
      <div>
        <ul className="ticket-detail-ul flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm shipment-detail-ul p-4 text-[#A0AEC0] text-sm items-center">
          <li style={{ width: "0px" }}>
            <input
              type="checkbox"
              name="select-all"
              id="select-all"
              checked={areAllSelected}
              onChange={handleSelectAll}
            />
          </li>
          <li>Ticket ID</li>
          <li>AWB Number</li>
          <li>Sub Category</li>
          <li>Status</li>
          <li>Last Updated</li>
          <li>Resolution Date</li>
          <li className="end">Actions</li>
        </ul>
      </div>

      {/* Ticket Cards */}
      <div className="flex flex-col gap-2 text-sm h-[180px] overflow-x-auto scrollbar-hide">
        {currentItems.length > 0 ? (
          currentItems.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticketData={ticket}
              selected={selectedtickets.includes(ticket._id)}
              onCheckboxChange={handleCheckboxChange}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white border rounded">
            {ticketsData.length === 0
              ? statusFilter && statusFilter !== "All"
                ? `No ${statusFilter} tickets found${dateRange ? " in the selected date range" : ""}`
                : dateRange
                  ? "No tickets found in the selected date range"
                  : "No tickets found"
              : "No tickets on this page. Try going to the first page."}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {ticketsData.length > 0 && (
        <div className="flex justify-between items-center my-4 text-[#A0AEC0] px-4 py-1 text-sm rounded-lg bg-white shadow-md">
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
            <span className="ml-4">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, ticketsData.length)} of{" "}
              {ticketsData.length} tickets
            </span>
          </div>
          <div className="flex items-center">
            <button
              className="px-4 py-2 rounded mr-2 disabled:opacity-50 hover:bg-gray-100"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="mx-2">
              Page {currentPage} of{" "}
              {Math.ceil(ticketsData.length / itemsPerPage) || 1}
            </span>
            <button
              className="px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-100"
              onClick={handleNextPage}
              disabled={
                currentPage === Math.ceil(ticketsData.length / itemsPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Selected Button */}
      {selectedtickets.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleDeleteSelected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Delete Selected ({selectedtickets.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default Tickets;
