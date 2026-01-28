"use client";
import React, { useEffect, useState, useRef, useContext } from "react";
import Image from "next/image";
import { DateRangePicker, defaultStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/custom-date-range-picker.css";
import Link from "next/link";
import ReportTable from "./ReportTable";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { downloadInvoicePDF } from "./InvoicePDFDownloader";
import * as XLSX from "xlsx";

const Report = () => {
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

  const [reportData, setReportData] = useState([]);
  const [filteredReportData, setFilteredReportData] = useState([]);
  const [shippingBills, setShippingBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});

  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const headers = [
    "AwbNo",
    "BookingDate",
    "FlightDate",
    "Branch",
    "OriginName",
    "Sector",
    "DestinationCode",
    "CustomerCode",
    "CustomerName",
    "ConsigneeName",
    "ConsigneeAddressLine1",
    "ConsigneeCity",
    "ConsigneeState",
    "ConsigneeZipCode",
    "ConsigneePhoneNo",
    "ServiceType",
    "Pcs",
    "GoodsDesc",
    "ActWeight",
    "VolWeight",
    "VolDiscount",
    "ChgWeight",
    "PaymentType",
    "BasicAmount",
    "SGST",
    "CGST",
    "IGST",
    "Mischg",
    "MiscRemark",
    "Fuel",
    "GrandTotal",
    "Currency",
    "BillNo",
  ];

  const saleSummaryHeaders = [
    "CustomerCode",
    "CustomerName",
    "Branch",
    "City",
    "SalePerson",
    "CountAwbNo",
    "Pcs",
    "ActWeight",
    "VolWeight",
    "ChgWeight",
    "BasicAmount",
    "SGST",
    "CGST",
    "IGST",
    "Mischg",
    "Fuel",
    "GrandTotal",
    "TotalOutStanding",
  ];

  const shippingBillHeaders = [
    "AwbNo",
    "CustomerName",
    "FileName",
    "FileSize",
    "UploadedAt",
    "Status",
    "Actions",
  ];

  const invoiceHeaders = [
    "InvoiceNumber",
    "InvoiceDate",
    "CustomerName",
    "TotalAWBs",
    "GrandTotal",
    "Status",
    "Actions",
  ];

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch shipping bills
  const fetchShippingBills = async () => {
    if (!session?.user?.accountCode || isLoadingBills) return;

    setIsLoadingBills(true);
    try {
      const res = await axios.get(
        `${server}/upload-shipping-bill?accountCode=${session.user.accountCode}`,
      );

      if (res.data.success) {
        const bills = res.data.data.map((bill) => ({
          AwbNo: bill.awbNo || "",
          CustomerName: bill.customerName || "",
          FileName: bill.pdfFile.fileName || "",
          FileSize: formatFileSize(bill.pdfFile.fileSize || 0),
          UploadedAt: formatDate(bill.pdfFile.uploadedAt),
          Status: bill.status || "uploaded",
          FileUrl: bill.pdfFile.fileUrl || "",
          DownloadUrl: bill.pdfFile.downloadUrl || bill.pdfFile.fileUrl || "",
          PublicId: bill.pdfFile.publicId || "",
          Actions: bill.pdfFile.fileUrl || "",
        }));
        setShippingBills(bills);
        console.log(`✅ Loaded ${bills.length} shipping bills`);
      }
    } catch (error) {
      console.error("Error fetching shipping bills:", error.message);
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Fetch invoices - ONLY show invoices where isExcel is true
  const fetchInvoices = async () => {
    if (!session?.user?.accountCode || isLoadingInvoices) return;

    setIsLoadingInvoices(true);
    try {
      // Using unified endpoint with accountCode parameter
      const res = await axios.get(
        `${server}/portal/billing-invoice-software?accountCode=${session.user.accountCode}`,
      );

      if (res.data.success) {
        // The backend already filters for isExcel=true
        const invoicesList = res.data.data.map((invoice) => ({
          InvoiceNumber: invoice.invoiceNumber || "",
          InvoiceDate: formatDate(invoice.invoiceDate),
          CustomerName: invoice.customer?.name || "",
          TotalAWBs: invoice.shipments?.length || 0,
          GrandTotal: invoice.invoiceSummary?.grandTotal?.toFixed(2) || "0.00",
          Status: invoice.qrCodeData?.[0]?.irnNumber ? "Generated" : "Pending",
          InvoiceData: invoice,
        }));

        setInvoices(invoicesList);
        console.log(
          `✅ Loaded ${invoicesList.length} invoices with isExcel=true`,
        );
      }
    } catch (error) {
      console.error("Error fetching invoices:", error.message);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  // Download Shipping Bill PDF
  const handleDownloadShippingBillPDF = async (awbNo, fileName) => {
    try {
      console.log("📥 Downloading Shipping Bill:", { awbNo, fileName });

      const downloadUrl = `${server}/upload-shipping-bill/download-pdf?awbNo=${encodeURIComponent(awbNo)}&fileName=${encodeURIComponent(fileName)}`;

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Download failed: ${response.status}`,
        );
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty (0 bytes)");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      console.log("✅ Shipping Bill downloaded successfully");
    } catch (error) {
      console.error("❌ Error downloading shipping bill:", error);
      alert(`Failed to download PDF: ${error.message}`);
    }
  };

  // Download Invoice PDF
  const handleDownloadInvoicePDF = async (invoiceNumber) => {
    try {
      console.log("📥 Downloading Invoice:", invoiceNumber);

      // Show loading notification
      const loadingToast = document.createElement("div");
      loadingToast.id = "invoice-loading-toast";
      loadingToast.textContent = "⏳ Generating PDF...";
      loadingToast.style.cssText =
        "position:fixed;top:20px;right:20px;background:#333;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-family:Arial;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
      document.body.appendChild(loadingToast);

      // Call the downloadInvoicePDF function
      await downloadInvoicePDF(server, invoiceNumber);

      // Remove loading toast
      const toast = document.getElementById("invoice-loading-toast");
      if (toast) document.body.removeChild(toast);

      // Show success notification
      const successToast = document.createElement("div");
      successToast.textContent = "✅ Invoice downloaded successfully!";
      successToast.style.cssText =
        "position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-family:Arial;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
      document.body.appendChild(successToast);

      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);

      console.log("✅ Invoice downloaded successfully");
    } catch (error) {
      // Remove loading toast if exists
      const toast = document.getElementById("invoice-loading-toast");
      if (toast) document.body.removeChild(toast);

      console.error("❌ Error downloading invoice:", error);
      alert(`Failed to download invoice: ${error.message}`);
    }
  };

  // View Shipping Bill PDF
  const handleViewShippingBillPDF = (fileUrl) => {
    console.log("👁️ Viewing Shipping Bill:", fileUrl);
    window.open(fileUrl, "_blank");
  };

  // View Invoice
  const handleViewInvoice = async (invoiceNumber) => {
    try {
      console.log("👁️ Viewing Invoice:", invoiceNumber);

      // Fetch the invoice data using unified endpoint
      const response = await fetch(
        `${server}/portal/billing-invoice-software?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
      );

      if (!response.ok) {
        throw new Error("Invoice not found");
      }

      const invoiceData = await response.json();

      // Store invoice data in sessionStorage for viewer page
      sessionStorage.setItem("viewInvoiceData", JSON.stringify(invoiceData));

      // Open viewer in new tab
      window.open(
        `/view-invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
        "_blank",
      );
    } catch (error) {
      console.error("❌ Error viewing invoice:", error);
      alert(`Failed to view invoice: ${error.message}`);
    }
  };

  // Download All functionality - Only for Sale Report and Sale Summary Report
  const handleDownloadAll = () => {
    // Only work for Sale Report (index 0) and Sale Summary Report (index 1)
    if (selectedLi !== 0 && selectedLi !== 1) {
      return;
    }

    // Get selected row indices
    const selectedIndices = Object.keys(selectedRows).filter(
      (key) => selectedRows[key],
    );

    if (selectedIndices.length === 0) {
      alert("Please select at least one row to download");
      return;
    }

    // Get the selected data
    const selectedData = selectedIndices.map(
      (index) => filteredReportData[parseInt(index)],
    );

    // Prepare data for Excel
    const excelData = selectedData.map((row) => {
      const rowData = {};
      tableHeaders.forEach((header) => {
        rowData[header] = row[header] || "";
      });
      return rowData;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const sheetName = selectedLi === 0 ? "Sale Report" : "Sale Summary Report";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${sheetName}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    console.log(
      `✅ Downloaded ${selectedIndices.length} records to ${filename}`,
    );

    // Show success notification
    const successToast = document.createElement("div");
    successToast.textContent = `✅ Downloaded ${selectedIndices.length} records successfully!`;
    successToast.style.cssText =
      "position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;z-index:9999;font-family:Arial;box-shadow:0 4px 12px rgba(0,0,0,0.15);";
    document.body.appendChild(successToast);

    setTimeout(() => {
      document.body.removeChild(successToast);
    }, 3000);
  };

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      if (!session?.user?.accountCode || isLoadingReports) return;

      setIsLoadingReports(true);
      try {
        const res = await axios.get(
          `${server}/portal/get-shipments?accountCode=${session.user.accountCode}`,
        );

        const transform = (item) => ({
          AwbNo: item.awbNo || "",
          BookingDate: item.date || "",
          FlightDate: item.date || "",
          Branch: item.receiverState || "",
          OriginName: item.shipperCity || "",
          Sector: item.sector || "",
          DestinationCode: item.destination || "",
          CustomerCode: item.accountCode || "",
          CustomerName: item.shipperFullName || "",
          ConsigneeName: item.receiverFullName || "",
          ConsigneeAddressLine1: item.receiverAddressLine1 || "",
          ConsigneeCity: item.receiverCity || "",
          ConsigneeState: item.receiverState || "",
          ConsigneeZipCode: item.receiverPincode || "",
          ConsigneePhoneNo: item.receiverPhoneNumber || "",
          ServiceType: item.service || "",
          Pcs: item.pcs?.toString() || "0",
          GoodsDesc: item.content || item.goodstype || "",
          ActWeight: item.totalActualWt?.toString() || "0",
          VolWeight: item.totalVolWt?.toString() || "0",
          VolDiscount: "0",
          ChgWeight: item.totalActualWt?.toString() || "0",
          PaymentType: item.payment || "",
          BasicAmount: item.basicAmt?.toString() || "0",
          SGST: item.sgst?.toString() || "0",
          CGST: item.cgst?.toString() || "0",
          IGST: "0",
          Mischg: "0",
          MiscRemark: "",
          Fuel: "0",
          GrandTotal: item.totalAmt?.toString() || "0",
          Currency: "INR",
          BillNo: item.billNo || "",
          salePerson: "",
          totalOutstanding: "0",
        });

        const transformed = Array.isArray(res.data.shipments)
          ? res.data.shipments.map(transform)
          : [];

        setReportData(transformed);
        setTableHeaders(headers);
        setFilteredReportData(transformed);
        console.log(`✅ Loaded ${transformed.length} shipment records`);
      } catch (error) {
        console.error("Error fetching report data:", error.message);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReportData();
  }, [session?.user?.accountCode, server]);

  // Fetch shipping bills
  useEffect(() => {
    fetchShippingBills();
  }, [session?.user?.accountCode, server]);

  // Fetch invoices
  useEffect(() => {
    fetchInvoices();
  }, [session?.user?.accountCode, server]);

  const getSaleSummaryData = (shipments) => {
    const summaryMap = {};

    shipments.forEach((item) => {
      const key = `${item.CustomerCode}-${item.CustomerName}`;

      if (!summaryMap[key]) {
        summaryMap[key] = {
          CustomerCode: item.CustomerCode || "",
          CustomerName: item.CustomerName || "",
          Branch: item.Branch || "",
          City: item.ConsigneeCity || "",
          SalePerson: item.salesPersonName || "",
          CountAwbNo: 0,
          Pcs: 0,
          ActWeight: 0,
          VolWeight: 0,
          ChgWeight: 0,
          BasicAmount: 0,
          SGST: 0,
          CGST: 0,
          IGST: 0,
          Mischg: 0,
          Fuel: 0,
          GrandTotal: 0,
          TotalOutStanding: 0,
        };
      }

      const entry = summaryMap[key];
      entry.CountAwbNo += 1;
      entry.Pcs += parseFloat(item.Pcs) || 0;
      entry.ActWeight += parseFloat(item.ActWeight) || 0;
      entry.VolWeight += parseFloat(item.VolWeight) || 0;
      entry.ChgWeight += parseFloat(item.ChgWeight) || 0;
      entry.BasicAmount += parseFloat(item.BasicAmount) || 0;
      entry.SGST += parseFloat(item.SGST) || 0;
      entry.CGST += parseFloat(item.CGST) || 0;
      entry.IGST += parseFloat(item.IGST) || 0;
      entry.Mischg += parseFloat(item.Mischg) || 0;
      entry.Fuel += parseFloat(item.Fuel) || 0;
      entry.GrandTotal += parseFloat(item.GrandTotal) || 0;
      entry.TotalOutStanding += parseFloat(item.totalOutstanding) || 0;
    });

    return Object.values(summaryMap);
  };

  const handleLiClick = (index) => {
    setSelectedLi(index);
    setCurrentPage(1);
    setSelectedRows({}); // Clear selected rows when switching tabs

    if (index === 0) {
      // Sale Report
      setTableHeaders(headers);
      setFilteredReportData(reportData);
    } else if (index === 1) {
      // Sale Summary
      const summaryData = getSaleSummaryData(reportData);
      setTableHeaders(saleSummaryHeaders);
      setFilteredReportData(summaryData);
    } else if (index === 2) {
      // Shipping Bill
      setTableHeaders(shippingBillHeaders);
      setFilteredReportData(shippingBills);
    } else if (index === 3) {
      // Invoice
      setTableHeaders(invoiceHeaders);
      setFilteredReportData(invoices);
    }
  };

  useEffect(() => {
    const selectedElement = document.querySelector(
      `.list-none > li:nth-child(${selectedLi + 1})`,
    );
    if (selectedElement && lineRef.current) {
      const ulElement = selectedElement.parentElement;
      setLineWidth(selectedElement.offsetWidth);
      setLineLeft(selectedElement.offsetLeft - ulElement.offsetLeft);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const handleDateChange = (item) => setDateRange([item.selection]);

  const getQuarterRange = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startMonth = Math.floor(currentMonth / 3) * 3;
    return {
      startDate: new Date(currentYear, startMonth, 1),
      endDate: new Date(currentYear, startMonth + 3, 0),
    };
  };

  const getFinancialYearRange = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (currentDate.getMonth() < 3) {
      return {
        startDate: new Date(currentYear - 1, 3, 1),
        endDate: new Date(currentYear, 2, 31),
      };
    }
    return {
      startDate: new Date(currentYear, 3, 1),
      endDate: new Date(currentYear + 1, 2, 31),
    };
  };

  const staticRanges = [
    ...defaultStaticRanges,
    {
      label: "This Quarter",
      range: getQuarterRange,
      isSelected: (range) => {
        const { startDate, endDate } = getQuarterRange();
        return (
          range.startDate.getTime() === startDate.getTime() &&
          range.endDate.getTime() === endDate.getTime()
        );
      },
    },
    {
      label: "This Financial Year",
      range: getFinancialYearRange,
      isSelected: (range) => {
        const { startDate, endDate } = getFinancialYearRange();
        return (
          range.startDate.getTime() === startDate.getTime() &&
          range.endDate.getTime() === endDate.getTime()
        );
      },
    },
  ];

  return (
    <div className="top-[106px] bg-[#f8f9fa] h-[600px] overflow-hidden">
      <div className="flex w-full justify-between items-baseline">
        <div className="w-full">
          <div className="flex justify-between">
            <ul className="list-none flex gap-6">
              {[
                "Sale Report",
                "Sale Summary Report",
                "Shipping Bill",
                "Invoice",
              ].map((label, i) => (
                <li
                  key={i}
                  className={`cursor-pointer text-sm ${
                    selectedLi === i
                      ? "text-[var(--primary-color)]"
                      : "text-[#A0AEC0]"
                  }`}
                  onClick={() => handleLiClick(i)}
                >
                  {label}
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
          {/* Only show Download All button for Sale Report and Sale Summary Report */}
          {(selectedLi === 0 || selectedLi === 1) && (
            <button
              onClick={handleDownloadAll}
              className="border-2 bg-white border-[#979797] py-1 h-9 w-40 text-[#71717A] px-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-4">
                <Image
                  width={20}
                  height={20}
                  src="/arrow-right.svg"
                  alt="download_all"
                  className="rotate-90"
                />
                <span className="text-sm">Download All</span>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-[#A0AEC0] my-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 relative">
            <button
              onClick={toggleDatePicker}
              className="flex justify-between gap-2 items-center border border-gray-300 px-4 py-2 rounded-lg bg-white"
            >
              <span className="text-[#2d3748]">Last 30 days</span>
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
                  classNames={{ dateRangePickerWrapper: "custom-calendar" }}
                />
              </div>
            )}
          </div>

          <div className="rounded-md flex items-center gap-2 bg-[#F1F0F5] px-[11px] py-[6px]">
            <Image width={20} height={20} src="/search.svg" alt="Search" />
            <input
              className="bg-transparent text-[#71717A] outline-none"
              type="text"
              placeholder="Search"
            />
          </div>
        </div>

        <div className="my-4">
          <p className="text-xs">{filteredReportData.length} records</p>
        </div>

        {cardShow ? (
          <div className="mt-[90px] absolute">
            <ReportTable
              headers={tableHeaders}
              reportData={filteredReportData}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
              onDownloadPDF={
                selectedLi === 2
                  ? handleDownloadShippingBillPDF
                  : handleDownloadInvoicePDF
              }
              onViewPDF={
                selectedLi === 2 ? handleViewShippingBillPDF : handleViewInvoice
              }
              isShippingBill={selectedLi === 2}
              isInvoice={selectedLi === 3}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-24 mt-28">
            <Link href="./createshipment">
              <Image src={"/ledger-img.svg"} alt="" width={206} height={185} />
              <p className="text-sm">
                Create your first shipment to get started
              </p>
              <div className="mt-4 justify-center flex">
                <button className="border-2 rounded-lg bg-[var(--primary-color)] px-6 py-2 text-white flex items-center gap-2">
                  <span className="text-sm">Create Shipment</span>
                </button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
