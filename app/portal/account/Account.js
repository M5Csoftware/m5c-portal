"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { GlobalContext } from "../GlobalContext.js";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/custom-date-range-picker.css";
import Link from "next/link";
import AccountTable from "./AccountTable";
import { useSession } from "next-auth/react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Account = () => {
  const { server } = useContext(GlobalContext);
  const [cardShow, setCardShow] = useState(true);
  const [selectedLi, setSelectedLi] = useState(0);
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRowsGlobal, setSelectedRowsGlobal] = useState([]);
  const [selectedCount, setSelectedCount] = useState(0);

  const [accountData, setAccountData] = useState([]);
  const [dataOne, setDataOne] = useState(null);

  const [openingBalance, setOpeningBalance] = useState(0);

  // -----------------------------------
  // TABLE HEADERS - EXACTLY MATCHING FRONTEND UI
  // -----------------------------------
  const headers = [
    "AWB",
    "Sale Type",
    "Date",
    "Consignee Name",
    "Forwarder",
    "Forwarding Number",
    "RunNo",
    "Sector",
    "Destination",
    "City",
    "ZipCode",
    "Service",
    "Pcs",
    "Actual Weight",
    "Vol Weight",
    "Chargeable Wgt",
    "Sale Amount",
    "Discount Per Kg",
    "Discount Amount",
    "Rate Hike",
    "SGST",
    "CGST",
    "IGST",
    "Misc Chg",
    "Fuel",
    "Non Taxable",
    "Grand Total",
    "Rcv Amt",
    "Debit Amt",
    "Credit Amt",
    "Balance",
  ];

  // Count selected rows
  useEffect(() => {
    setSelectedCount(selectedRowsGlobal.length);
  }, [selectedRowsGlobal]);

  // -----------------------------------
  // SEARCH FILTER + TAB FILTER
  // -----------------------------------
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    let result = accountData;

    // First apply tab filter
    if (selectedLi === 1) {
      // Hold Shipment tab
      result = result.filter((item) => item.isHold === true);
    } else if (selectedLi === 2) {
      // RTO tab
      result = result.filter((item) => item["Sale Type"] === "RTO");
    }
    // selectedLi === 0 is "All", so no additional filter needed

    // Then apply search filter
    result = result.filter((item) => {
      return (
        item.AWB?.toLowerCase().includes(query) ||
        item["Consignee Name"]?.toLowerCase().includes(query)
      );
    });

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchQuery, accountData, selectedLi]);

  // -----------------------------------
  // FETCH ACCOUNT LEDGER FROM DEDICATED ROUTE
  // -----------------------------------
  useEffect(() => {
    const fetchLedger = async () => {
      if (!session?.user?.accountCode) return;

      try {
        // Fetch from new dedicated account-ledger route
        const url = `${server}/ledger/portal?accountCode=${session.user.accountCode}`;
        const res = await axios.get(url);

        // Fetch customer account info for opening balance
        const urlTwo = `${server}/customer-account?accountCode=${session.user.accountCode}`;
        const resTwo = await axios.get(urlTwo);

        console.log(resTwo.data);
        setOpeningBalance(resTwo.data.openingBalance);

        setDataOne(res.data);
        console.log("ledgerData", res.data);

        const ledger = res.data.entries || [];

        // Transform backend fields → UI table
        const transformed = ledger.map((e) => ({
          AWB: e.AwbNo || "",
          "Sale Type": e.SaleType || "",
          Date: e.Date ? e.Date.split("T")[0] : "",
          "Consignee Name": e.Consignee || "",
          Forwarder: e.Forwarder || "",
          "Forwarding Number": e.ForwarderNo || "",
          RunNo: e.RunNo || "",
          Sector: e.Sector || "",
          Destination: e.Destination || "",
          City: e.City || "",
          ZipCode: e.ZipCode || "",
          Service: e.Service || "",
          Pcs: e.Pcs || "",
          "Actual Weight": e.ActualWeight || "",
          "Vol Weight": e.VolWeight || "",
          "Chargeable Wgt": e.ChgWeight || "",
          "Sale Amount": e.SaleAmount || "",
          "Discount Per Kg": e.DiscountPerKg || "",
          "Discount Amount": e.DiscountAmount || "",
          "Rate Hike": e.RateHike || "",
          SGST: e.SGST || "",
          CGST: e.CGST || "",
          IGST: e.IGST || "",
          "Misc Chg": e.Mischg || "",
          Fuel: e.Fuel || "",
          "Non Taxable": e.NonTaxable || "",
          "Grand Total": e.GrandTotal || "",
          "Rcv Amt": e.RcvAmount || "",
          "Debit Amt": e.DebitAmount || "",
          "Credit Amt": e.CreditAmount || "",
          Balance: e.RemainingBalance || "",
          isHold: e.isHold || false, // Add isHold field for filtering
        }));

        setAccountData(transformed);
        setFilteredData(transformed);
      } catch (error) {
        console.error(
          "Error fetching ledger:",
          error.response?.data || error.message,
        );
      }
    };

    fetchLedger();
  }, [server, session?.user?.accountCode]);

  // -----------------------------------
  // TAB INDICATOR LINE
  // -----------------------------------
  useEffect(() => {
    const selectedElement = document.querySelector(
      `.list-none > li:nth-child(${selectedLi + 1})`,
    );
    if (selectedElement && lineRef.current) {
      const ul = selectedElement.parentElement;
      setLineWidth(selectedElement.offsetWidth);
      setLineLeft(selectedElement.offsetLeft - ul.offsetLeft);
    }
  }, [selectedLi]);

  // -----------------------------------
  // DATEPICKER OUTSIDE CLICK
  // -----------------------------------
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!dateRange?.[0]) return;

    const { startDate, endDate } = dateRange[0];

    const filtered = accountData.filter((item) => {
      if (!item.Date) return false;

      const rowDate = new Date(item.Date);
      return rowDate >= startDate && rowDate <= endDate;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [dateRange, accountData]);

  // -----------------------------------
  // DOWNLOAD EXCEL
  // -----------------------------------
  const downloadExcel = () => {
    const rows = selectedRowsGlobal.length
      ? selectedRowsGlobal.map((i) => filteredData[i])
      : filteredData;

    if (!rows.length) return alert("No data to download");

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AccountData");

    const excelBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const fileName = selectedRowsGlobal.length
      ? `Selected_Account_Data.xlsx`
      : `All_Account_Data.xlsx`;

    saveAs(new Blob([excelBuffer]), fileName);
  };

  // -----------------------------------
  // UI RENDER
  // -----------------------------------
  return (
    <div className="top-[106px] bg-[#f8f9fa] h-[600px] overflow-hidden">
      <div className="flex w-full justify-between items-baseline">
        <div className="w-full">
          <div className="flex justify-between">
            <ul className="list-none flex gap-6">
              {["All", "Hold Shipment", "RTO"].map((tab, i) => (
                <li
                  key={i}
                  style={{ cursor: "pointer", fontSize: "14px" }}
                  className={
                    selectedLi === i
                      ? "text-[var(--primary-color)]"
                      : "text-[#A0AEC0]"
                  }
                  onClick={() => setSelectedLi(i)}
                >
                  {tab}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-1">
            <Image
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

        <div className="flex">
          <button
            onClick={downloadExcel}
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
                {selectedCount > 0
                  ? `Download (${selectedCount})`
                  : "Download All"}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[#A0AEC0] my-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex gap-2 items-center text-black border border-gray-300 px-2 py-1 rounded-lg bg-white">
              <span>Opening Balance:</span>
              <span className="font-semibold">{openingBalance || 0}</span>
            </div>

            <div className="flex gap-3 relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex justify-between gap-2 items-center border border-gray-300 px-4 py-2 rounded-lg bg-white"
              >
                <span className="text-[#2d3748]">Last 30 Days</span>
                <Image
                  width={20}
                  height={20}
                  src="/calendar.svg"
                  alt="calendar"
                />
              </button>

              {showDatePicker && (
                <div
                  ref={datePickerRef}
                  className="absolute z-50 top-full left-0 mt-2 bg-white shadow-lg border"
                >
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={(range) => setDateRange([range.selection])}
                    staticRanges={defaultStaticRanges}
                    classNames={{
                      dateRangePickerWrapper: "custom-calendar",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 relative">
            <div className="rounded-md flex items-center gap-2 bg-[#F1F0F5] px-[11px] py-[6px]">
              <Image width={20} height={20} src="/search.svg" alt="Search" />
              <input
                className="bg-transparent text-[#71717A] outline-none"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="my-4">
          <p className="text-xs">Showing {filteredData.length} records</p>
        </div>

        {cardShow ? (
          <div className="mt-[90px] absolute">
            <AccountTable
              headers={headers}
              AccountData={filteredData}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
              setGlobalSelectedRows={setSelectedRowsGlobal}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center mt-28">
            <Link href="./createshipment">
              <Image src={"/ledger-img.svg"} alt="" width={206} height={185} />
              <p className="text-sm">Create your first shipment</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
