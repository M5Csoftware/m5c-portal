"use client";
import React, { useState, useEffect, useContext } from "react";
import TicketCard from "./TicketCard";
import "./style.css";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const Tickets = ({
  statusFilter,
  dateRange,
  searchTerm,
  filters, // ADDED: filters prop
}) => {
  const [selectedtickets, setSelectedtickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState([]); // Store all tickets
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

          setAllTickets(allTickets);
        } else {
          console.error("Invalid data format:", response.data);
          setAllTickets([]);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setAllTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accountCode) {
      fetchTickets();
    }
  }, [ticketRefreshTrigger, session?.user?.accountCode, server]);

  // Apply all filters whenever any filter changes
  useEffect(() => {
    let filteredTickets = [...allTickets];

    console.log("Applying filters:", {
      statusFilter,
      dateRange,
      searchTerm,
      filters,
    });

    // Apply status filter
    if (statusFilter && statusFilter !== "All" && statusFilter !== "") {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Apply date range filter
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      filteredTickets = filteredTickets.filter((ticket) => {
        const ticketDate = new Date(ticket.updatedAt || ticket.createdAt);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return ticketDate >= startDate && ticketDate <= endDate;
      });
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredTickets = filteredTickets.filter((ticket) => {
        const searchableFields = [
          ticket.ticketId || "",
          ticket.displayTicketId || "",
          ticket.awbNo || "",
          ticket.subCategory || "",
          ticket.status || "",
          ticket.priority || "",
          ticket.issueType || "",
          ticket.description || "",
          ticket.comments || "",
        ];

        return searchableFields.some((field) =>
          field.toString().toLowerCase().includes(searchLower),
        );
      });
    }

    // Apply advanced filters from FilterCustomerSupport
    // Apply advanced filters from FilterCustomerSupport
    if (filters) {
      // Filter by Ticket ID
      if (filters.ticketId) {
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            ticket.ticketId === filters.ticketId.value ||
            ticket.displayTicketId === filters.ticketId.value,
        );
      }

      // Filter by AWB Number
      if (filters.awbNumber) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.awbNo === filters.awbNumber.value,
        );
      }

      // Filter by Sub Category
      if (filters.subCategory) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.subCategory === filters.subCategory.value,
        );
      }

      // Filter by Status
      if (filters.status) {
        filteredTickets = filteredTickets.filter(
          (ticket) =>
            ticket.status?.toLowerCase() ===
            filters.status.value?.toLowerCase(),
        );
      }

      // Filter by destination (country)
      if (filters.destination) {
        filteredTickets = filteredTickets.filter((ticket) => {
          const destinationValue = filters.destination.value?.toLowerCase();
          return (
            ticket.destinationCountry?.toLowerCase() === destinationValue ||
            ticket.country?.toLowerCase() === destinationValue ||
            ticket.destination?.toLowerCase() === destinationValue
          );
        });
      }

      // Filter by consignment type
      if (filters.consignmentType) {
        filteredTickets = filteredTickets.filter((ticket) => {
          if (filters.consignmentType.value === "consignee") {
            return ticket.consigneeName || ticket.consignee;
          } else if (filters.consignmentType.value === "consigner") {
            return ticket.consignerName || ticket.consignor;
          }
          return true;
        });
      }
    }

    console.log("Final filtered tickets:", filteredTickets.length);
    setTicketsData(filteredTickets);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    allTickets,
    statusFilter,
    dateRange,
    searchTerm,
    filters,
    setTicketsData,
  ]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ticketsData.slice(indexOfFirstItem, indexOfLastItem);

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
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedtickets.length === currentItems.length) {
      setSelectedtickets([]);
    } else {
      const currentIds = currentItems.map((ticket) => ticket._id);
      setSelectedtickets(currentIds);
    }
  };

  const areAllSelected =
    currentItems.length > 0 &&
    currentItems.every((ticket) => selectedtickets.includes(ticket._id));

  // Helper function to get active filter count
  // Helper function to get active filter count
  const getActiveFilterCount = () => {
    if (!filters) return 0;
    let count = 0;
    if (filters.ticketId) count++;
    if (filters.awbNumber) count++;
    if (filters.subCategory) count++;
    if (filters.status) count++;
    if (filters.destination) count++;
    if (filters.consignmentType) count++;
    return count;
  };

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
        | Status: {statusFilter || "All"} |
        {searchTerm ? ` Search: "${searchTerm}" | ` : ""}
        {getActiveFilterCount() > 0
          ? ` Active Filters: ${getActiveFilterCount()} | `
          : ""}
        Date Range:{" "}
        {dateRange
          ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
          : "All Time"}
      </div>

      {/* Search Results Header */}
      {searchTerm && ticketsData.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-blue-700">
              Found <strong>{ticketsData.length}</strong> tickets matching
              <strong>{searchTerm}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Filters Applied Header */}
      {getActiveFilterCount() > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-700">
                <strong>{getActiveFilterCount()}</strong> active filters applied
              </span>
            </div>
          </div>
        </div>
      )}

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
      <div className="flex flex-col gap-2 text-sm h-[180px] overflow-x-auto overflow-y-auto table-scrollbar">
        {currentItems.length > 0 ? (
          currentItems.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticketData={ticket}
              selected={selectedtickets.includes(ticket._id)}
              onCheckboxChange={handleCheckboxChange}
              searchTerm={searchTerm}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white border rounded">
            {allTickets.length === 0
              ? "No tickets found"
              : searchTerm
                ? `No tickets matching "${searchTerm}"`
                : statusFilter && statusFilter !== "All"
                  ? `No ${statusFilter} tickets found`
                  : getActiveFilterCount() > 0
                    ? "No tickets match the selected filters"
                    : "No tickets found"}
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
              {searchTerm && ` matching "${searchTerm}"`}
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
