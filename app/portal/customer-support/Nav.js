"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Image from "next/image";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import "../styles/custom-date-range-picker.css";
import { GlobalContext } from "../GlobalContext.js";

const Nav = ({ onStatusChange, selectedLi, onLiChange }) => {
  const searchParams = useSearchParams();
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)),
  );
  const [endDate, setEndDate] = useState(new Date());
  const datePickerRef = useRef(null);
  const op = ["Open", "Closed", "In Progress"];

  const { setRaiseTicketWindow, ticketsData } = useContext(GlobalContext);
  const { adding, setAdding } = useContext(GlobalContext);
  const { setFilterCustomerSupportWindow } = useContext(GlobalContext);

  // Handle query parameters to switch tabs
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "help-articles") {
      onLiChange(1); // Switch to Help Articles tab (index 1)
    }
  }, [searchParams, onLiChange]);

  const handleNew = () => {
    setAdding(!adding);
  };

  useEffect(() => {
    if (lineRef.current) {
      const selectedElement = document.querySelector(
        `.list-none > li:nth-child(${selectedLi + 1})`,
      );
      if (selectedElement) {
        const ulElement = selectedElement.parentElement;
        setLineWidth(selectedElement.offsetWidth);
        setLineLeft(selectedElement.offsetLeft - ulElement.offsetLeft);
      }
    }
  }, [selectedLi]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLiClick = (index) => {
    onLiChange(index);
  };

  const handleStatusFilter = (e) => {
    onStatusChange(e.target.value);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleFilter = () => {
    setFilterCustomerSupportWindow(true);
  };

  const handleDateChange = (item) => {
    setDateRange([item.selection]);
  };

  const getQuarterRange = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startMonth = Math.floor(currentMonth / 3) * 3;
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, startMonth + 3, 0);
    return { startDate, endDate };
  };

  const customQuarterRange = {
    label: "This Quarter",
    range: getQuarterRange,
    isSelected: (range) => {
      const { startDate, endDate } = getQuarterRange();
      return (
        range.startDate.getTime() === startDate.getTime() &&
        range.endDate.getTime() === endDate.getTime()
      );
    },
  };

  const getFinancialYearRange = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let startDate, endDate;

    if (currentDate.getMonth() < 3) {
      startDate = new Date(currentYear - 1, 3, 1);
      endDate = new Date(currentYear, 2, 31);
    } else {
      startDate = new Date(currentYear, 3, 1);
      endDate = new Date(currentYear + 1, 2, 31);
    }

    return { startDate, endDate };
  };

  const customFinancialYearRange = {
    label: "This Financial Year",
    range: getFinancialYearRange,
    isSelected: (range) => {
      const { startDate, endDate } = getFinancialYearRange();
      return (
        range.startDate.getTime() === startDate.getTime() &&
        range.endDate.getTime() === endDate.getTime()
      );
    },
  };

  const staticRanges = [
    ...defaultStaticRanges,
    customQuarterRange,
    customFinancialYearRange,
  ];

  const TicketStatus = (props) => {
    return (
      <div className="border-2 border-[#E2E8F0] flex items-center justify-between w-full bg-white rounded-lg py-2 px-4">
        <div className="flex gap-2">
          <Image
            src={`/customer-support/${props.img}.svg`}
            alt="ticket status"
            width={24}
            height={24}
          />
          <span className="font-bold text-[#2D3748]">{props.label}</span>
        </div>
        <div className="bg-[var(--primary-color)] rounded-lg h-9 w-9 flex items-center justify-center text-white font-bold">
          {props.qty}
        </div>
      </div>
    );
  };

  // Add debug logging
  useEffect(() => {
    console.log("Nav - ticketsData:", ticketsData);
    console.log("Nav - Open tickets:", countOpenTickets(ticketsData));
    console.log(
      "Nav - In Progress tickets:",
      countInProgressTickets(ticketsData),
    );
    console.log("Nav - Closed tickets:", countClosedTickets(ticketsData));
  }, [ticketsData]);

  return (
    <div className="relative">
      <div className="flex w-full justify-between items-end h-10">
        <div className="w-full">
          <div className="flex justify-between">
            <ul className="list-none flex gap-4 font-bold">
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 0
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(0)}
              >
                Tickets
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 1
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(1)}
              >
                Help Articles
              </li>
            </ul>
          </div>

          <div className="relative mt-1">
            <Image
              className=""
              layout="responsive"
              width={1000}
              height={24}
              src={"/line-address.svg"}
              alt="Line"
            />
            <div
              ref={lineRef}
              className="transition-all duration-400 rounded-t-lg absolute bottom-[1px] bg-[var(--primary-color)]"
              style={{ width: lineWidth, height: "3px", left: lineLeft }}
            ></div>
          </div>
        </div>
        <div
          className={`flex bg-[var(--primary-color)] text-white rounded-lg w-fit ${
            selectedLi !== 0 && "hidden"
          }`}
        >
          <button
            onClick={() => {
              setRaiseTicketWindow(true);
            }}
            className="px-4 w-32 py-2 text-sm font-bold"
          >
            Raise a Ticket
          </button>
        </div>
      </div>
      <div
        className={`mt-6 flex justify-between gap-4 ${
          selectedLi !== 0 && "hidden"
        }`}
      >
        <TicketStatus
          label="Open Tickets"
          img="open"
          qty={countOpenTickets(ticketsData)}
        />
        <TicketStatus
          label="In-Progress Tickets"
          img="in-progress"
          qty={countInProgressTickets(ticketsData)}
        />
        <TicketStatus
          label="Closed Tickets"
          img="closed"
          qty={countClosedTickets(ticketsData)}
        />
        <TicketStatus
          label="Total Tickets"
          img="total"
          qty={totaltickets(ticketsData)}
        />
      </div>

      <div
        className={`flex flex-col gap-6 text-[#A0AEC0] mt-6 ${
          selectedLi !== 0 && "hidden"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center relative">
            <div>
              <select
                onChange={handleStatusFilter}
                className="w-full outline-none border border-[#979797] rounded-md p-2"
              >
                <option value="">All</option>
                {op.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={toggleDatePicker}
              className="flex justify-between gap-2 items-center border border-gray-300 px-4 py-2 rounded-lg bg-white"
            >
              <span className="text-[#2d3748]">Date</span>
              <Image
                width={20}
                height={20}
                src="/calendar.svg"
                alt="calendar_icon"
              />
            </button>
            {showDatePicker && (
              <div
                ref={datePickerRef}
                className="absolute z-50 top-full left-0 mt-2 bg-white shadow-lg border border-[#E2E8F0] custom-calendar"
              >
                <DateRangePicker
                  ranges={dateRange}
                  onChange={handleDateChange}
                  staticRanges={staticRanges}
                  classNames={{
                    dateRangePickerWrapper: "custom-calendar",
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 relative">
            <div className="rounded-md flex items-center gap-2 bg-[#F1F0F5] px-[11px] py-[6px]">
              <Image
                className=""
                width={20}
                height={20}
                src="/search.svg"
                alt="Search"
              />
              <input
                className="bg-transparent text-[#71717A] outline-none"
                type="text"
                placeholder="Search"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFilter}
                type="button"
                className="flex gap-[10px] items-center border border-[#979797] py-[6px] px-[11px] rounded-md bg-white"
              >
                <Image
                  className="w-fit"
                  width={24}
                  height={24}
                  src="/filters.svg"
                  alt="Filters"
                />
                <span className="text-[#2D3748] text-sm">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function totaltickets(data) {
  return Array.isArray(data) ? data.length : 0;
}

export function countInProgressTickets(data) {
  if (!Array.isArray(data)) return 0;
  const count = data.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    return (
      status === "in progress" ||
      status === "in-progress" ||
      status === "pending"
    );
  }).length;
  console.log(
    "In Progress count:",
    count,
    "from data:",
    data.map((t) => t.status),
  );
  return count;
}

export function countOpenTickets(data) {
  if (!Array.isArray(data)) return 0;
  const count = data.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    return status === "open";
  }).length;
  console.log(
    "Open count:",
    count,
    "from data:",
    data.map((t) => t.status),
  );
  return count;
}

export function countClosedTickets(data) {
  if (!Array.isArray(data)) return 0;
  const count = data.filter((ticket) => {
    const status = ticket.status?.toLowerCase();
    return status === "closed" || status === "resolved";
  }).length;
  console.log(
    "Closed count:",
    count,
    "from data:",
    data.map((t) => t.status),
  );
  return count;
}

export default Nav;
