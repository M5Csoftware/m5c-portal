"use client";
import React, { useState, useEffect, useContext } from "react";
import TicketCard from "./TicketCard";
import "./style.css";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

const Tickets = ({ statusFilter }) => {
  const [selectedtickets, setSelectedtickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { ticketRefreshTrigger, ticketsData, setTicketsData, server } = useContext(GlobalContext);
  const { data: session } = useSession();

  // Fetching tickets from backend using Axios
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/ticket/get-ticket?accountCode=${session?.user?.accountCode}`
        );
        const allTickets = response.data.data.map((ticket) => ({
          ...ticket
        }));
        if (statusFilter) {
          const filteredTickets = allTickets.filter(
            (ticket) => ticket.status === statusFilter
          );

          console.log("Filtered Tickets:", filteredTickets);
          setTicketsData(filteredTickets);
        } else {
          setTicketsData(allTickets);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [statusFilter, ticketRefreshTrigger]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ticketsData.slice(indexOfFirstItem, indexOfLastItem);

  // Checkbox logic
  const handleCheckboxChange = (id) => {
    setSelectedtickets((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((ticketId) => ticketId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = () => {
    setTicketsData((prevTickets) =>
      prevTickets.filter((ticket) => !selectedtickets.includes(ticket._id))
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
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div>
        <ul className="ticket-detail-ul flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm shipment-detail-ul p-4 text-[#A0AEC0] text-sm items-center">
          <li style={{ width: "42px" }}>
            <input
              type="checkbox"
              name="select-all"
              id="select-all"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedtickets(ticketsData.map((ticket) => ticket._id));
                } else {
                  setSelectedtickets([]);
                }
              }}
            />
          </li>
          <li>Ticket ID</li>
          <li>AWB Number</li>
          <li>Sub Category</li>
          <li>Status</li>
          <li>Last Updated</li>
          <li>Resolution Date</li>
          <li className="end"></li>
        </ul>
      </div>

      {/* Ticket Cards */}
      <div className="flex flex-col gap-2 text-sm h-[180px] overflow-x-auto scrollbar-hide">
        {currentItems.map((ticket, index) => (
          <TicketCard
            key={ticket._id}
            ticketData={{
              ...ticket,
              // ticketId: `TCKT-${(indexOfFirstItem + index + 1)
              //   .toString()
              //   .padStart(3, "0")}`,
            }}
            selected={selectedtickets.includes(ticket._id)}
            onCheckboxChange={handleCheckboxChange}
          />
        ))}
      </div>

      {/* Pagination Controls */}
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
        </div>
        <div className="flex items-center">
          <button
            className="px-4 py-2 rounded mr-2 disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={
              currentPage === Math.ceil(ticketsData.length / itemsPerPage)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
