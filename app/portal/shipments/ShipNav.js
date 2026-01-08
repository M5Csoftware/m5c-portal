"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { GlobalContext } from "../GlobalContext.js";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/custom-date-range-picker.css";

const ShipNav = ({ totalShipments = 0, onDownload, selectedCount = 0, onSearch }) => {
  const {
    setFilterShipmentWindow,
    selectedLi,
    setSelectedLi,
    statusFilter,
    setStatusFilter,
    toggleBulkUpload
  } = useContext(GlobalContext);
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const lineRef = useRef(null);
  const datePickerRef = useRef(null);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Rest of your existing useEffect and functions remain the same...
  useEffect(() => {
    if (lineRef.current) {
      const selectedElement = document.querySelector(
        `.list-none > li:nth-child(${selectedLi + 1})`
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
    setSelectedLi(index);
  };

  const handleFilter = () => {
    setFilterShipmentWindow(true);
  };

  const handleBulkUpload = () => { };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
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

  return (
    <div className="sticky top-[106px] bg-[#f8f9fa]">
      <div className="flex w-full justify-between items-baseline">
        <div className="w-full">
          <div className="flex justify-between">
            <ul className="list-none flex gap-6">
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 0
                    ? "text-[var(--primary-color)] "
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(0)}
              >
                All
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
                Latest
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 2
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(2)}
              >
                Ready to Ship
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 3
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(3)}
              >
                Manifest
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 4
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(4)}
              >
                In Transit
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 5
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(5)}
              >
                Hold Shipment
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 6
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(6)}
              >
                RTO
              </li>
              <li
                style={{ cursor: "pointer", fontSize: "14px" }}
                className={
                  selectedLi === 7
                    ? "text-[var(--primary-color)]"
                    : "text-[#A0AEC0]"
                }
                onClick={() => handleLiClick(7)}
              >
                Delivered
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
        <div className="flex items-center gap-3 text-[#A0AEC0]">
          <div className="flex  w-fit">
            <button
              onClick={toggleBulkUpload}
              className="flex items-center justify-center border-2 bg-white border-[#979797] w-12 h-9 px-2 rounded-lg"
            >
              <Image
                width={20}
                height={20}
                src="/bulk-upload.svg"
                alt="bulk upload"
              />
            </button>
          </div>
          <div className="flex">
            <Link href="./createshipment">
              <button className="border-2 bg-white border-[#979797] py-1 h-9 w-40 text-[#71717A] px-2 rounded-lg">
                <div className="flex gap-2">
                  <Image
                    width={20}
                    height={20}
                    src="/create-shipment-plus.svg"
                    alt="create shipment"
                  />
                  <span className="text-sm">Create Shipment</span>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 text-[#A0AEC0] mt-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 relative">
            {selectedLi == 3 && (
              <div className="flex w-[250px] h-[45px] border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setStatusFilter("All")}
                  className={`flex-1 text-center transition-all duration-200 m-1 rounded-lg ${statusFilter === "All"
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-200"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("Drop")}
                  className={`flex-1 text-center transition-all duration-200 m-1 rounded-lg ${statusFilter === "Drop"
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-200"
                    }`}
                >
                  Drop
                </button>
                <button
                  onClick={() => setStatusFilter("Pickup")}
                  className={`flex-1 text-center transition-all duration-200 m-1 rounded-lg ${statusFilter === "Pickup"
                    ? "bg-gray-200 text-black"
                    : "text-black hover:bg-gray-200"
                    }`}
                >
                  Pickup
                </button>
              </div>
            )}

            <button
              onClick={toggleDatePicker}
              className="flex justify-between gap-2 items-center border border-gray-300 px-4 py-2 rounded-lg bg-white"
            >
              <span className="text-[#2d3748]">Last 30 Days</span>
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
                className="absolute z-10 top-full left-0 mt-2 bg-white shadow-lg rounded-md overflow-hidden border border-[#E2E8F0]   custom-calendar"
              >
                <DateRangePicker
                  ranges={dateRange}
                  staticRanges={staticRanges}
                  onChange={handleDateChange}
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
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex">
              <button
                onClick={onDownload}
                className="border-2 bg-white border-[#979797] py-1 h-9 w-40 text-[#71717A] px-2 rounded-lg"
              >
                <div className="flex gap-4">
                  <Image
                    width={20}
                    height={20}
                    src="/arrow-right.svg"
                    alt="download_all"
                    className="rotate-90"
                  />
                  <span className="text-sm">
                    {selectedCount > 0 ? `Download (${selectedCount})` : 'Download All'}
                  </span>
                </div>
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFilter}
                type="button"
                className="flex  gap-[10px] items-center border border-[#979797] py-[6px] px-[11px] rounded-md bg-white "
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
        <div>
          {/* <p className="text-xs"> {totalShipments} done this month</p> */}
        </div>
      </div>
    </div>
  );
};

export default ShipNav;