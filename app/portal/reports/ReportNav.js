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
  const [saleSummaryData, setSaleSummaryData] = useState([]);
  const [filteredSaleSummaryData, setFilteredSaleSummaryData] = useState([]);
  const [shippingBills, setShippingBills] = useState([]);
  const [filteredShippingBills, setFilteredShippingBills] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [selectedRows, setSelectedRows] = useState({});

  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for button label
  const [selectedRangeLabel, setSelectedRangeLabel] = useState("Last 30 days");

  const headers = [
    "AwbNo",
    "BookingDate",
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

  // Parse date for comparison
  const parseDateForComparison = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // Return date at midnight for comparison
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } catch (error) {
      return null;
    }
  };

  // Filter data by date range
  const filterByDateRange = (data, dateField) => {
    if (!data || data.length === 0) return data;

    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    // Normalize dates to midnight for comparison
    const normStartDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const normEndDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    return data.filter((item) => {
      const itemDate = parseDateForComparison(item[dateField]);
      if (!itemDate) return false;

      return itemDate >= normStartDate && itemDate <= normEndDate;
    });
  };

  // Filter data by search term
  const filterBySearch = (data) => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase().trim();
    return data.filter((item) => {
      return Object.values(item).some((value) => {
        if (typeof value === "string" || typeof value === "number") {
          return String(value).toLowerCase().includes(term);
        }
        return false;
      });
    });
  };

  // Generate Sale Summary Data from report data
  const generateSaleSummaryData = (shipments) => {
    if (!shipments || shipments.length === 0) return [];

    const summaryMap = new Map();

    shipments.forEach((item) => {
      const customerCode = item.CustomerCode || "N/A";
      const customerName = item.CustomerName || "N/A";
      const key = `${customerCode}-${customerName}`;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          CustomerCode: customerCode,
          CustomerName: customerName,
          Branch: item.Branch || "N/A",
          City: item.ConsigneeCity || "N/A",
          SalePerson: item.salePerson || "N/A",
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
          // Store BookingDate from first item for date filtering
          BookingDate: item.BookingDate,
          BookingDateOriginal: item.BookingDateOriginal,
        });
      }

      const entry = summaryMap.get(key);
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

      // Format numbers to 2 decimal places
      entry.Pcs = Number(entry.Pcs.toFixed(2));
      entry.ActWeight = Number(entry.ActWeight.toFixed(2));
      entry.VolWeight = Number(entry.VolWeight.toFixed(2));
      entry.ChgWeight = Number(entry.ChgWeight.toFixed(2));
      entry.BasicAmount = Number(entry.BasicAmount.toFixed(2));
      entry.SGST = Number(entry.SGST.toFixed(2));
      entry.CGST = Number(entry.CGST.toFixed(2));
      entry.IGST = Number(entry.IGST.toFixed(2));
      entry.Mischg = Number(entry.Mischg.toFixed(2));
      entry.Fuel = Number(entry.Fuel.toFixed(2));
      entry.GrandTotal = Number(entry.GrandTotal.toFixed(2));
      entry.TotalOutStanding = Number(entry.TotalOutStanding.toFixed(2));
    });

    return Array.from(summaryMap.values());
  };

  // Apply all filters based on selected tab
  const applyFilters = () => {
    if (selectedLi === 0) {
      // Sale Report - filter using original date field
      const filtered = filterByDateRange(reportData, "BookingDateOriginal");
      return filterBySearch(filtered);
    } else if (selectedLi === 1) {
      // Sale Summary Report
      // First generate summary from filtered report data using original date
      const filteredShipments = filterByDateRange(
        reportData,
        "BookingDateOriginal",
      );
      const summary = generateSaleSummaryData(filteredShipments);
      // Apply search filter to summary data
      return filterBySearch(summary);
    } else if (selectedLi === 2) {
      // Shipping Bill
      const filtered = filterByDateRange(shippingBills, "UploadedAtOriginal");
      return filterBySearch(filtered);
    } else if (selectedLi === 3) {
      // Invoice
      const filtered = filterByDateRange(invoices, "InvoiceDateOriginal");
      return filterBySearch(filtered);
    }
    return [];
  };

  // Update filtered data when dependencies change
  useEffect(() => {
    const filtered = applyFilters();

    // Set the appropriate state based on selected tab
    if (selectedLi === 0) {
      setFilteredReportData(filtered);
    } else if (selectedLi === 1) {
      setFilteredSaleSummaryData(filtered);
    } else if (selectedLi === 2) {
      setFilteredShippingBills(filtered);
    } else if (selectedLi === 3) {
      setFilteredInvoices(filtered);
    }

    setCurrentPage(1); // Reset to first page
    setSelectedRows({}); // Clear selected rows
  }, [dateRange, searchTerm, selectedLi, reportData, shippingBills, invoices]);

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
          UploadedAtOriginal: bill.pdfFile.uploadedAt, // Keep original date
          Status: bill.status || "uploaded",
          FileUrl: bill.pdfFile.fileUrl || "",
          DownloadUrl: bill.pdfFile.downloadUrl || bill.pdfFile.fileUrl || "",
          PublicId: bill.pdfFile.publicId || "",
          Actions: bill.pdfFile.fileUrl || "",
        }));
        setShippingBills(bills);
        setFilteredShippingBills(bills);
        console.log(`✅ Loaded ${bills.length} shipping bills`);
      }
    } catch (error) {
      console.error("Error fetching shipping bills:", error.message);
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Fetch invoices - ONLY show invoices where isExcel is true
  // Fetch invoices - ONLY show invoices where isExcel is true AND match accountCode
  const fetchInvoices = async () => {
    if (!session?.user?.accountCode || isLoadingInvoices) return;

    setIsLoadingInvoices(true);
    try {
      // Using unified endpoint
      const res = await axios.get(`${server}/billing-invoice/invoice`);

      if (res.data.success) {
        // Filter invoices by accountCode from session
        const filteredInvoices = res.data.invoices
          .filter((invoice) => {
            // Check if customer exists and accountCode matches
            return invoice.customer?.accountCode === session.user.accountCode;
          })
          .map((invoice) => ({
            InvoiceNumber: invoice.invoiceNumber || "",
            InvoiceDate: formatDate(invoice.invoiceDate),
            InvoiceDateOriginal: invoice.invoiceDate, // Keep original date
            CustomerName: invoice.customer?.name || "N/A",
            TotalAWBs: invoice.totalAwb || 0,
            GrandTotal:
              invoice.invoiceSummary?.grandTotal?.toFixed(2) || "0.00",
            Status: invoice.qrCodeData?.[0]?.irnNumber ? "Generated" : "Billed",
            InvoiceData: invoice,
          }));

        setInvoices(filteredInvoices);
        setFilteredInvoices(filteredInvoices);
        console.log(
          `✅ Loaded ${filteredInvoices.length} invoices for account ${session.user.accountCode}`,
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
        `${server}/billing-invoice/invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
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

    // Get the current data based on selected tab
    const currentData =
      selectedLi === 0 ? filteredReportData : filteredSaleSummaryData;

    // Get selected row indices
    const selectedIndices = Object.keys(selectedRows).filter(
      (key) => selectedRows[key],
    );

    // Determine which data to download
    let dataToDownload;
    let recordCount;

    if (selectedIndices.length === 0) {
      // No rows selected - download all filtered data
      dataToDownload = currentData;
      recordCount = currentData.length;
    } else {
      // Rows selected - download only selected rows
      dataToDownload = selectedIndices.map(
        (index) => currentData[parseInt(index)],
      );
      recordCount = selectedIndices.length;
    }

    // Check if there's data to download
    if (recordCount === 0) {
      alert("No data available to download");
      return;
    }

    // Determine which headers to use
    const headersToUse = selectedLi === 0 ? headers : saleSummaryHeaders;

    // Helper function to format date for Excel
    const formatDateForExcel = (dateString) => {
      if (!dateString) return "";

      // Check if it's an ISO date string
      if (typeof dateString === "string" && dateString.includes("T")) {
        try {
          const date = new Date(dateString);
          // Format as DD-MMM-YYYY (e.g., 08-Dec-2025)
          return date
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .replace(/-/g, "-");
        } catch (e) {
          return dateString;
        }
      }
      return dateString;
    };

    // Prepare data for Excel with formatted dates
    const excelData = dataToDownload.map((row) => {
      const rowData = {};

      headersToUse.forEach((header) => {
        let value = row[header] || "";

        // Format date fields specifically
        if (
          header === "BookingDate" ||
          header === "InvoiceDate" ||
          header.includes("Date")
        ) {
          value = formatDateForExcel(value);
        }

        // Format numeric values to ensure they're readable
        if (typeof value === "number") {
          value = value.toString();
        }

        rowData[header] = value;
      });
      return rowData;
    });

    // Create worksheet with column widths
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = headersToUse.map((header) => ({
      wch: Math.max(header.length, 15), // Minimum width of 15 characters
    }));
    worksheet["!cols"] = colWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const sheetName = selectedLi === 0 ? "Sale Report" : "Sale Summary Report";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date()
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/-/g, "-");
    const filename = `${sheetName}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    console.log(`✅ Downloaded ${recordCount} records to ${filename}`);

    // Show success notification
    const successToast = document.createElement("div");
    successToast.textContent = `✅ Downloaded ${recordCount} records successfully!`;
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
          BookingDate: item.date ? formatDate(item.date) : "",
          BookingDateOriginal: item.date || "",
          FlightDate: item.date ? formatDate(item.date) : "",
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
        setFilteredReportData(transformed);

        // Generate and set sale summary data
        const summary = generateSaleSummaryData(transformed);
        setSaleSummaryData(summary);
        setFilteredSaleSummaryData(summary);

        setTableHeaders(headers);

        console.log(`✅ Loaded ${transformed.length} shipment records`);
        console.log(`✅ Generated ${summary.length} sale summary records`);
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

  const handleLiClick = (index) => {
    setSelectedLi(index);
    setCurrentPage(1);
    setSelectedRows({}); // Clear selected rows when switching tabs

    if (index === 0) {
      setTableHeaders(headers);
    } else if (index === 1) {
      setTableHeaders(saleSummaryHeaders);
    } else if (index === 2) {
      setTableHeaders(shippingBillHeaders);
    } else if (index === 3) {
      setTableHeaders(invoiceHeaders);
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

  // Update button label when date changes
  const handleDateChange = (item) => {
    setDateRange([item.selection]);

    // Update button label
    const startDate = item.selection.startDate;
    const endDate = item.selection.endDate;

    // Check if it matches predefined ranges
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    // Helper to compare dates
    const isSameDate = (date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    if (isSameDate(startDate, today) && isSameDate(endDate, today)) {
      setSelectedRangeLabel("Today");
    } else if (
      isSameDate(startDate, yesterday) &&
      isSameDate(endDate, yesterday)
    ) {
      setSelectedRangeLabel("Yesterday");
    } else if (isSameDate(startDate, last7Days) && isSameDate(endDate, today)) {
      setSelectedRangeLabel("Last 7 days");
    } else if (
      isSameDate(startDate, last30Days) &&
      isSameDate(endDate, today)
    ) {
      setSelectedRangeLabel("Last 30 days");
    } else {
      // Custom range
      const formatShortDate = (date) => {
        return date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
      };
      setSelectedRangeLabel(
        `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`,
      );
    }
  };

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

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get current data based on selected tab
  const getCurrentData = () => {
    if (selectedLi === 0) return filteredReportData;
    if (selectedLi === 1) return filteredSaleSummaryData;
    if (selectedLi === 2) return filteredShippingBills;
    if (selectedLi === 3) return filteredInvoices;
    return [];
  };

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
              <span className="text-[#2d3748]">{selectedRangeLabel}</span>
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
                  moveRangeOnFirstSelection={false}
                  months={2}
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
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="my-4">
          <p className="text-xs">{getCurrentData().length} records</p>
        </div>

        {cardShow ? (
          <div className="mt-[90px] absolute">
            <ReportTable
              headers={tableHeaders}
              reportData={getCurrentData()}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setItemsPerPage={setItemsPerPage}
              setCurrentPage={setCurrentPage}
              onDownloadPDF={
                selectedLi === 2
                  ? handleDownloadShippingBillPDF
                  : selectedLi === 3
                    ? handleDownloadInvoicePDF
                    : null
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
