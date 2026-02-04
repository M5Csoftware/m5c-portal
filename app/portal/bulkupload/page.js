"use client";

import { TableWithSorting } from "@/app/components/Table";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useContext, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";

// List of common Indian zip code prefixes (first 2 digits) for accurate validation
const INDIAN_ZIP_PREFIXES = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "60",
  "61",
  "62",
  "63",
  "64",
  "65",
  "66",
  "67",
  "68",
  "69",
  "70",
  "71",
  "72",
  "73",
  "74",
  "75",
  "76",
  "77",
  "78",
  "79",
  "80",
  "81",
  "82",
  "83",
  "84",
  "85",
  "86",
  "87",
  "88",
  "89",
];
// Helper function to validate if a zip code is Indian
const isIndianZipCode = (zipCode) => {
  if (!zipCode) return false;

  const zipStr = zipCode.toString().trim();

  // Indian zip codes are EXACTLY 6 digits starting with 1-9
  const indianZipPattern = /^[1-9][0-9]{5}$/;

  if (!indianZipPattern.test(zipStr)) {
    return false;
  }

  // Additional check: Indian zip codes start with specific prefixes
  const prefix = zipStr.substring(0, 2);
  return INDIAN_ZIP_PREFIXES.includes(prefix);
};
const validateReceiverZipCode = (zipCode) => {
  if (!zipCode || zipCode.toString().trim() === "") {
    return {
      isValid: false,
      message: "❌ Receiver zip code is required",
    };
  }

  const zipStr = zipCode.toString().trim();

  // CRITICAL: Block Indian zip codes completely
  if (isIndianZipCode(zipStr)) {
    return {
      isValid: false,
      message: `🚫 INDIAN ZIP CODE DETECTED! We only ship internationally. Indian pincode "${zipStr}" is NOT allowed for receiver address.`,
    };
  }

  // Validate international zip code formats

  // US zip codes: 5 digits or 5+4 format
  if (/^\d{5}(-\d{4})?$/.test(zipStr)) {
    return {
      isValid: true,
      message: "✓ Valid US zip code",
    };
  }

  // Canadian postal codes: A1A 1A1 format (with or without space)
  if (/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(zipStr)) {
    return {
      isValid: true,
      message: "✓ Valid Canadian postal code",
    };
  }

  // UK postcodes: Various formats
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(zipStr)) {
    return {
      isValid: true,
      message: "✓ Valid UK postcode",
    };
  }

  // Australian postcodes: 4 digits
  if (/^\d{4}$/.test(zipStr)) {
    return {
      isValid: true,
      message: "✓ Valid Australian postcode",
    };
  }

  // European postcodes: Various formats (3-7 alphanumeric)
  if (/^[A-Z0-9]{3,7}$/i.test(zipStr) || /^\d{5}$/.test(zipStr)) {
    return {
      isValid: true,
      message: "✓ Valid European postal code",
    };
  }

  // Generic international: At least 3 characters, not matching Indian pattern
  if (zipStr.length >= 3) {
    return {
      isValid: true,
      message: "✓ Valid international zip code",
    };
  }

  return {
    isValid: false,
    message:
      "❌ Invalid zip code format. Must be a valid international postal code.",
  };
};
export default function BulkUploadPage() {
  const { register, setValue } = useForm();

  const fileInputRef = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const { server } = useContext(GlobalContext);
  const [validationErrors, setValidationErrors] = useState([]);
  const [sectorDestinationServiceErrors, setSectorDestinationServiceErrors] =
    useState([]);
  const { data: session, status } = useSession();
  const [accountCode, setAccountCode] = useState("");

  useEffect(() => {
    console.log("🔄 BulkUpload page loaded");
    console.log("Auth status:", status);
    console.log("Session:", session);
    console.log("User:", session?.user);

    // Get account code from session
    if (session?.user) {
      const userAccountCode = session.user.accountCode;
      console.log("AccountCode from session:", userAccountCode);
      setAccountCode(userAccountCode);

      // Also store in localStorage for backward compatibility
      if (typeof window !== "undefined") {
        localStorage.setItem("accountCode", userAccountCode || "DEFAULT");
      }
    }
  }, [session, status]);

  // Get account code from session or localStorage
  const getAccountCode = () => {
    // Priority 1: From session
    if (session?.user?.accountCode) {
      return session.user.accountCode;
    }

    // Priority 2: From state
    if (accountCode) {
      return accountCode;
    }

    // Priority 3: From localStorage (fallback)
    if (typeof window !== "undefined") {
      return localStorage.getItem("accountCode") || "DEFAULT";
    }

    return "DEFAULT";
  };

  const calculateVolumeWeight = (length, breadth, height) => {
    const volume =
      (Number(length) || 0) * (Number(breadth) || 0) * (Number(height) || 0);
    return Math.round((volume / 5000) * 100) / 100;
  };

  // Transform Excel row to Shipment JSON
  const transformExcelToShipment = (excelRow, index) => {
    const timestamp = Date.now() + index;
    const currentAccountCode = getAccountCode();

    // Parse comma-separated values
    const totalPcs = Number(excelRow.PCS) || 1;
    const excelTotalWeight = Number(excelRow.ActualWeight) || 0;
    const excelVolumeWeight = Number(excelRow.VolumeWeight) || 0;
    const excelChargeableWeight = Number(excelRow.ChargeableWeight) || 0;

    const parseCSV = (value) => {
      if (value === null || value === undefined || value === "") return [];
      if (Array.isArray(value)) return value;
      return value
        .toString()
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    };

    const lengths = parseCSV(excelRow.Length);
    const breadths = parseCSV(excelRow.Breadth);
    const heights = parseCSV(excelRow.Height);
    const weights = parseCSV(excelRow.ActualWeight);
    const contents = parseCSV(excelRow.ShipmentContent);
    const hsnCodes = parseCSV(excelRow.HSNCode);
    const quantities = parseCSV(excelRow.Quantity);
    const rates = parseCSV(excelRow.Rate);

    // Check if dimensions are provided
    const hasDimensions =
      lengths.some((v) => Number(v) > 0) &&
      breadths.some((v) => Number(v) > 0) &&
      heights.some((v) => Number(v) > 0);

    // Create boxes array
    const boxes = [];
    const maxBoxes = Math.max(
      lengths.length,
      breadths.length,
      heights.length,
      weights.length,
      totalPcs,
    );

    // FIXED: Proper weight distribution logic
    if (maxBoxes === 1 && totalPcs > 1) {
      // Single box type, multiple pieces
      const length = Number(lengths[0] || 0);
      const breadth = Number(breadths[0] || 0);
      const height = Number(heights[0] || 0);
      const weightPerPiece = excelTotalWeight / totalPcs;

      // Calculate volume weight per piece if dimensions exist
      const totalVolumeWeight = hasDimensions
        ? calculateVolumeWeight(length, breadth, height)
        : 0;
      const volumeWeightPerPiece = totalVolumeWeight / totalPcs;

      for (let i = 0; i < totalPcs; i++) {
        boxes.push({
          length: hasDimensions ? length.toString() : "0",
          width: hasDimensions ? breadth.toString() : "0",
          height: hasDimensions ? height.toString() : "0",
          pcs: 1,
          actualWt: weightPerPiece,
          volumeWeight: volumeWeightPerPiece,
          boxNo: i + 1,
        });
      }
    } else if (weights.length > 0 && weights.length === maxBoxes) {
      // Each box has specified weight
      for (let i = 0; i < maxBoxes; i++) {
        const length = Number(lengths[i] || lengths[0] || 0);
        const breadth = Number(breadths[i] || breadths[0] || 0);
        const height = Number(heights[i] || heights[0] || 0);
        const weight = Number(weights[i]) || 0;

        const volumeWeight = hasDimensions
          ? calculateVolumeWeight(length, breadth, height)
          : 0;

        boxes.push({
          length: hasDimensions ? length.toString() : "0",
          width: hasDimensions ? breadth.toString() : "0",
          height: hasDimensions ? height.toString() : "0",
          pcs: 1,
          actualWt: weight,
          volumeWeight: volumeWeight,
          boxNo: i + 1,
        });
      }
    } else {
      // Distribute total weight evenly across boxes
      const weightPerBox = excelTotalWeight / maxBoxes;

      for (let i = 0; i < maxBoxes; i++) {
        const length = Number(lengths[i] || lengths[0] || 0);
        const breadth = Number(breadths[i] || breadths[0] || 0);
        const height = Number(heights[i] || heights[0] || 0);

        const volumeWeight = hasDimensions
          ? calculateVolumeWeight(length, breadth, height)
          : 0;

        boxes.push({
          length: hasDimensions ? length.toString() : "0",
          width: hasDimensions ? breadth.toString() : "0",
          height: hasDimensions ? height.toString() : "0",
          pcs: 1,
          actualWt: weightPerBox,
          volumeWeight: volumeWeight,
          boxNo: i + 1,
        });
      }
    }

    // Create shipmentAndPackageDetails with items mapped to boxes
    const shipmentAndPackageDetails = {};

    const maxItems = Math.max(
      contents.length,
      hsnCodes.length,
      quantities.length,
      rates.length,
      1,
    );

    // Map items to boxes
    if (maxItems === boxes.length && maxItems > 1) {
      // One-to-one mapping: each item to its corresponding box
      for (let i = 0; i < maxItems; i++) {
        const quantity = Number(quantities[i] || quantities[0] || 1);
        const rate = Number(rates[i] || rates[0] || 0);
        const amount = (quantity * rate).toFixed(2);

        shipmentAndPackageDetails[i + 1] = [
          {
            id: `${timestamp}${i}`,
            context: contents[i] || contents[0] || "",
            sku: hsnCodes[i] || hsnCodes[0] || "",
            hsnNo: hsnCodes[i] || hsnCodes[0] || "",
            qty: quantity.toString(),
            rate: rate.toString(),
            amount: amount,
          },
        ];
      }
    } else if (maxItems > boxes.length && boxes.length > 1) {
      // More items than boxes: distribute items across boxes
      const itemsPerBox = Math.ceil(maxItems / boxes.length);

      for (let boxIdx = 0; boxIdx < boxes.length; boxIdx++) {
        const boxItems = [];
        const startIdx = boxIdx * itemsPerBox;
        const endIdx = Math.min(startIdx + itemsPerBox, maxItems);

        for (let i = startIdx; i < endIdx; i++) {
          const quantity = Number(quantities[i] || quantities[0] || 1);
          const rate = Number(rates[i] || rates[0] || 0);
          const amount = (quantity * rate).toFixed(2);

          boxItems.push({
            id: `${timestamp}${i}`,
            context: contents[i] || contents[0] || "",
            sku: hsnCodes[i] || hsnCodes[0] || "",
            hsnNo: hsnCodes[i] || hsnCodes[0] || "",
            qty: quantity.toString(),
            rate: rate.toString(),
            amount: amount,
          });
        }

        if (boxItems.length > 0) {
          shipmentAndPackageDetails[boxIdx + 1] = boxItems;
        }
      }
    } else {
      // Default: all items in box 1 (single box or fewer items than boxes)
      const packageItems = [];
      for (let i = 0; i < maxItems; i++) {
        const quantity = Number(quantities[i] || quantities[0] || 1);
        const rate = Number(rates[i] || rates[0] || 0);
        const amount = (quantity * rate).toFixed(2);

        packageItems.push({
          id: `${timestamp}${i}`,
          context: contents[i] || contents[0] || "",
          sku: hsnCodes[i] || hsnCodes[0] || "",
          hsnNo: hsnCodes[i] || hsnCodes[0] || "",
          qty: quantity.toString(),
          rate: rate.toString(),
          amount: amount,
        });
      }
      shipmentAndPackageDetails[1] = packageItems;
    }

    // Calculate totals from all items across all boxes
    let totalInvoiceValue = 0;
    Object.values(shipmentAndPackageDetails).forEach((boxItems) => {
      boxItems.forEach((item) => {
        totalInvoiceValue += parseFloat(item.amount);
      });
    });

    // FIXED: Proper weight calculations
    const totalActualWt = boxes.reduce((sum, box) => {
      return sum + (Number(box.actualWt) || 0);
    }, 0);

    const totalVolWt = boxes.reduce((sum, box) => {
      return sum + (Number(box.volumeWeight) || 0);
    }, 0);

    // FIXED: Chargeable weight logic
    let chargeableWt;
    if (hasDimensions && totalVolWt > 0) {
      chargeableWt =
        excelChargeableWeight > 0
          ? excelChargeableWeight
          : Math.max(totalActualWt, totalVolWt);
    } else {
      chargeableWt = totalActualWt;
    }
    chargeableWt = Math.ceil(chargeableWt);

    // Get first content for display
    const firstBoxItems =
      shipmentAndPackageDetails[1] ||
      Object.values(shipmentAndPackageDetails)[0] ||
      [];
    const contentArray =
      firstBoxItems.length > 0 ? [firstBoxItems[0].context] : [];

    // Get receiver zip code from Excel
    const receiverZipcode = excelRow.ConsigneeZipcode?.toString().trim() || "";

    // Validate receiver zip code is NOT Indian
    const zipValidation = validateReceiverZipCode(receiverZipcode);

    if (!zipValidation.isValid) {
      return {
        error: true,
        validationErrors: [
          {
            field: "ConsigneeZipcode",
            value: receiverZipcode,
            message: zipValidation.message,
            rowIndex: index + 2,
          },
        ],
        rawData: excelRow,
      };
    }

    // Generate a temporary AWB for portal
    const awbNo = `PORTAL-${Date.now()}-${index}`;

    // Determine country from zip code pattern
    let receiverCountry = "";
    if (/^\d{5}(-\d{4})?$/.test(receiverZipcode)) {
      receiverCountry = "USA";
    } else if (/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(receiverZipcode)) {
      receiverCountry = "CANADA";
    } else if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(receiverZipcode)) {
      receiverCountry = "UK";
    } else if (/^\d{4}$/.test(receiverZipcode)) {
      receiverCountry = "AUSTRALIA";
    } else if (
      /^\d{5}$/.test(receiverZipcode) ||
      /^[A-Z0-9]{3,7}$/i.test(receiverZipcode)
    ) {
      receiverCountry = "EUROPE";
    }

    // Create shipment object
    const shipment = {
      // AWB number for portal
      awbNo: awbNo,

      // Account and basic info - USING ACTUAL ACCOUNT CODE FROM SESSION
      accountCode: currentAccountCode,
      status: "Shipment Created!",
      date: new Date().toISOString(),
      sector: (excelRow.Sector?.toString().trim() || "").toUpperCase(),
      origin: excelRow.Origin?.toString().trim() || "",
      destination: (
        excelRow.Destination?.toString().trim() || ""
      ).toUpperCase(),
      reference: excelRow.ReferenceNo?.toString().trim() || "",
      forwardingNo: "",
      forwarder: "",
      goodstype: excelRow.GoodsType?.toString().trim() || "",
      payment: "Credit",

      // Weights
      boxes: boxes.map((box, idx) => ({
        ...box,
        length: Number(box.length) || 0,
        width: Number(box.width) || 0,
        height: Number(box.height) || 0,
        actualWt: Number(box.actualWt) || 0,
        volumeWeight: Number(box.volumeWeight) || 0,
        boxNo: idx + 1,
      })),
      chargeableWt: chargeableWt,
      totalActualWt: totalActualWt,
      totalVolWt: totalVolWt,
      pcs: totalPcs,

      // Financial amounts - WILL BE CALCULATED BY SERVER
      basicAmt: 0, // To be calculated
      sgst: 0, // To be calculated
      cgst: 0, // To be calculated
      igst: 0, // To be calculated
      totalAmt: 0, // To be calculated

      totalInvoiceValue: totalInvoiceValue,
      currency: excelRow.InvoiceCurrency?.toString().trim() || "INR",
      currencys: excelRow.InvoiceCurrency?.toString().trim() || "INR",
      content: contentArray,

      shipmentAndPackageDetails: shipmentAndPackageDetails,

      // Service from Excel - CRITICAL FIELD
      service: (excelRow.ServiceName?.toString().trim() || "").toUpperCase(),

      operationRemark: excelRow.OperationRemark?.toString().trim() || "",
      automation: false,
      handling: false,
      csb: excelRow.CSB === "Yes" || excelRow.CSB === true,
      commercialShipment: false,
      isHold: false, // PORTAL: No hold
      holdReason: "",
      otherHoldReason: "",

      // Financial placeholders
      discount: 0,
      discountAmt: 0,
      duty: 0,
      fuelAmt: 0,
      fuelPercentage: 0,
      handlingAmount: 0,
      hikeAmt: 0,
      manualAmount: 0,
      miscChg: 0,
      miscChgReason: "",
      overWtHandling: 0,
      volDisc: 0,
      cashRecvAmount: 0,

      // Other fields
      billNo: "",
      manifestNo: "",
      runNo: "",
      alMawb: "",
      bag: "",
      clubNo: "",
      company: "",
      customer: "",
      flight: "",
      network: "",
      networkName: "",
      obc: "",
      localMF: "",

      // Receiver details
      receiverFullName: excelRow.ConsigneeName?.toString().trim() || "",
      receiverPhoneNumber: excelRow.ConsigneeTelephone?.toString().trim() || "",
      receiverEmail: excelRow.ConsigneeEmailId?.toString().trim() || "",
      receiverAddressLine1:
        excelRow.ConsigneeAddressLine1?.toString().trim() || "",
      receiverAddressLine2:
        excelRow.ConsigneeAddressLine2?.toString().trim() || "",
      receiverCity: excelRow.ConsigneeCity?.toString().trim() || "",
      receiverState: excelRow.ConsigneeState?.toString().trim() || "",
      receiverCountry: receiverCountry,
      receiverPincode: receiverZipcode,

      // Shipper details
      shipperFullName: excelRow.ConsignorName?.toString().trim() || "",
      shipperPhoneNumber: excelRow.ConsignorTelephone?.toString().trim() || "",
      shipperEmail: "",
      shipperAddressLine1:
        excelRow.ConsignorAddressLine1?.toString().trim() || "",
      shipperAddressLine2:
        excelRow.ConsignorAddressLine2?.toString().trim() || "",
      shipperCity: excelRow.ConsignorCity?.toString().trim() || "",
      shipperState: excelRow.ConsignorState?.toString().trim() || "",
      shipperCountry: "INDIA",
      shipperPincode: excelRow.ConsignorPincode?.toString().trim() || "",
      shipperKycType: excelRow.ConsignorKycType?.toString().trim() || "",
      shipperKycNumber: excelRow.ConsignorKycNo?.toString().trim() || "",

      coLoader: "",
      coLoaderNumber: 0,
      insertUser: "11111111",
      updateUser: "11111111",
      billingLocked: false,
      awbStatus: "",
      isBilled: false,
      notifType: "",
      notifMsg: "",
      runDate: null,
      completeDataLock: false,
      gstNumber: "",
      adCode: "",
      termsOfInvoice: "",
      crnNumber: "",
      mhbsNumber: "",
      exportThroughEcommerce: false,
      meisScheme: false,
      shipmentType: "Non-Document",

      // Additional required fields
      codAmount: 0,
      codAmountCurrency: "INR",
      pickupDate: new Date().toISOString().split("T")[0],
      deliveryDate: "",
      expectedDeliveryDate: "",
      shipmentMode: "Air",
      shipmentCategory: "Commercial",
      insuranceAmount: 0,
      insuranceCurrency: "INR",
      insuranceRequired: false,
      dutyAmount: 0,
      dutyCurrency: "INR",
      dutyPaidBy: "Receiver",
      declaredValue: totalInvoiceValue,
      declaredValueCurrency:
        excelRow.InvoiceCurrency?.toString().trim() || "INR",
      dimensionalWeight: totalVolWt,
      packageType: "Box",
      customsInvoiceNumber: excelRow.InvoiceNo?.toString().trim() || "",
      customsInvoiceDate: new Date().toISOString().split("T")[0],
      termsOfDelivery: "DDP",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    // Add display fields for table
    shipment.contentDisplay = contentArray.length > 0 ? contentArray[0] : "";
    shipment.isValid = true;
    shipment.zipValidationStatus = zipValidation;

    // Add table display fields
    Object.assign(shipment, {
      origin: excelRow.Origin,
      sector: excelRow.Sector,
      destination: excelRow.Destination,
      service: excelRow.ServiceName,
      goodstype: excelRow.GoodsType,
      pcs: excelRow.PCS,
      totalActualWt: totalActualWt,
      totalVolWt: totalVolWt,
      chargeableWt: chargeableWt,
      totalInvoiceValue: excelRow.InvoiceValue,
      currency: excelRow.InvoiceCurrency,
      contentDisplay: contentArray.length > 0 ? contentArray[0] : "",
      receiverFullName: excelRow.ConsigneeName,
      receiverPhoneNumber: excelRow.ConsigneeTelephone,
      receiverEmail: excelRow.ConsigneeEmailId,
      receiverCity: excelRow.ConsigneeCity,
      receiverState: excelRow.ConsigneeState,
      receiverPincode: receiverZipcode,
      shipperFullName: excelRow.ConsignorName,
      shipperPhoneNumber: excelRow.ConsignorTelephone,
      shipperKycType: excelRow.ConsignorKycType,
      shipperKycNumber: excelRow.ConsignorKycNo,
      reference: excelRow.ReferenceNo,
      csb: excelRow.CSB === "Yes" || excelRow.CSB === true,
    });

    return shipment;
  };

  const bulkUploadColumns = [
    { key: "origin", label: "Origin" },
    { key: "sector", label: "Sector" },
    { key: "destination", label: "Destination" },
    { key: "service", label: "Service" },
    { key: "goodstype", label: "Goods Type" },
    { key: "pcs", label: "PCS" },
    { key: "totalActualWt", label: "Actual Weight" },
    { key: "totalVolWt", label: "Volume Weight" },
    { key: "chargeableWt", label: "Chargeable Wt" },
    { key: "totalInvoiceValue", label: "Invoice Value" },
    { key: "currency", label: "Currency" },
    { key: "contentDisplay", label: "Content" },

    { key: "receiverFullName", label: "Receiver Name" },
    { key: "receiverPhoneNumber", label: "Receiver Phone" },
    { key: "receiverEmail", label: "Receiver Email" },
    { key: "receiverCity", label: "Receiver City" },
    { key: "receiverState", label: "Receiver State" },
    { key: "receiverPincode", label: "Receiver Pincode (International)" },
    {
      key: "zipValidation",
      label: "Zip Code Status",
      render: (row) => {
        const validation = validateReceiverZipCode(row.receiverPincode);
        if (!validation.isValid) {
          return (
            <span
              style={{
                color: "#dc2626",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              {validation.message}
            </span>
          );
        }
        return (
          <span style={{ color: "#16a34a", fontSize: "12px" }}>
            {validation.message}
          </span>
        );
      },
    },

    { key: "shipperFullName", label: "Shipper Name" },
    { key: "shipperPhoneNumber", label: "Shipper Phone" },
    { key: "shipperKycType", label: "Shipper KYC Type" },
    { key: "shipperKycNumber", label: "Shipper KYC No" },

    { key: "reference", label: "Reference No" },
    { key: "csb", label: "CSB" },
  ];

  // ===== SAMPLE FILE DOWNLOAD (LOGIC ONLY)
  const handleSampleDownload = () => {
    const link = document.createElement("a");
    link.href = "/portal-bulkUpload.xlsx";
    link.download = "bulk_upload_sample@M5C.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===== BROWSE CLICK (LOGIC ONLY)
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Server rate calculation ONLY
  const calculateShipmentRates = async (shipments) => {
    try {
      console.log(
        "🔍 Preparing rate calculation for:",
        shipments.length,
        "shipments",
      );

      // Prepare shipment data for server
      const shipmentDataForServer = shipments.map((shipment) => ({
        awbNo: shipment.awbNo || `PORTAL-${Date.now()}`,
        sector: (shipment.sector || "").toUpperCase().trim(),
        destination: (shipment.destination || "").toUpperCase().trim(),
        service: (shipment.service || "").toUpperCase().trim(), // This is CRITICAL
        chargeableWt:
          Number(shipment.chargeableWt) || Number(shipment.totalActualWt) || 0,
        pcs: Number(shipment.pcs) || 1,
        totalInvoiceValue: Number(shipment.totalInvoiceValue) || 0,
        currency: shipment.currency || "INR",
        origin: (shipment.origin || "").toUpperCase().trim(),
        goodstype: shipment.goodstype || "",
        receiverPincode: shipment.receiverPincode || "",
        receiverCountry: shipment.receiverCountry || "",
      }));

      const currentAccountCode = getAccountCode();

      const payload = {
        shipments: shipmentDataForServer,
        accountCode: currentAccountCode,
      };

      console.log("📦 Sending to server for rate calculation:", {
        payloadSize: JSON.stringify(payload).length,
        sampleShipment: shipmentDataForServer[0],
        totalShipments: shipmentDataForServer.length,
        accountCode: currentAccountCode,
      });

      const response = await fetch(`${server}/bulk-upload/calculate-rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(
        "📊 Server response status:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Server response received:", {
        success: data.success,
        resultsCount: data.results?.length,
        summary: data.summary,
      });

      if (data.success && data.results && Array.isArray(data.results)) {
        // Map server results back to shipments
        return shipments.map((shipment) => {
          const calculated = data.results.find(
            (r) => r.awbNo === shipment.awbNo,
          );

          if (calculated && calculated.success) {
            console.log(`✅ Server calculated rate for ${shipment.awbNo}:`, {
              basicAmt: calculated.basicAmt,
              totalAmt: calculated.totalAmt,
              service: calculated.service,
            });

            return {
              ...shipment,
              basicAmt: calculated.basicAmt || 0,
              sgst: calculated.sgst || 0,
              cgst: calculated.cgst || 0,
              igst: calculated.igst || 0,
              totalAmt: calculated.totalAmt || 0,
              service: calculated.service || shipment.service,
              zone: calculated.zone || "",
              rateUsed: calculated.rateUsed || 0,
            };
          }

          // If server calculation failed for this shipment
          console.warn(
            `❌ Server calculation failed for ${shipment.awbNo}:`,
            calculated?.error,
          );
          throw new Error(
            `Rate calculation failed for ${shipment.awbNo}: ${calculated?.error || "No rate returned from server"}`,
          );
        });
      } else {
        throw new Error(data.message || "Server calculation failed");
      }
    } catch (error) {
      console.error("❌ Server rate calculation failed:", error.message);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  const handleExcelFile = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const excelRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Check for validation errors immediately
      const validationErrorsFound = [];

      excelRows.forEach((row, index) => {
        const zipcode = row.ConsigneeZipcode?.toString().trim() || "";
        const validation = validateReceiverZipCode(zipcode);
        if (!validation.isValid) {
          validationErrorsFound.push({
            row: index + 2,
            zipcode: zipcode,
            message: validation.message,
            isIndianZip: validation.message.includes("INDIAN ZIP CODE"),
          });
        }
      });

      setValidationErrors(validationErrorsFound);

      // Show validation results using alert
      if (validationErrorsFound.length > 0) {
        const indianZipErrors = validationErrorsFound.filter((err) =>
          err.message.includes("INDIAN ZIP CODE"),
        );

        const otherErrors = validationErrorsFound.filter(
          (err) => !err.message.includes("INDIAN ZIP CODE"),
        );

        let errorSummary = "";

        if (indianZipErrors.length > 0) {
          errorSummary += `INDIAN ZIP CODES DETECTED (${indianZipErrors.length} shipments):\n`;
          errorSummary += indianZipErrors
            .slice(0, 5)
            .map((err) => `   • Row ${err.row}: "${err.zipcode}"`)
            .join("\n");

          if (indianZipErrors.length > 5) {
            errorSummary += `\n   ...and ${indianZipErrors.length - 5} more Indian zip codes`;
          }
        }

        if (otherErrors.length > 0) {
          if (errorSummary) errorSummary += "\n\n";
          errorSummary += `OTHER ISSUES (${otherErrors.length} shipments):\n`;
          errorSummary += otherErrors
            .slice(0, 3)
            .map(
              (err) => `   • Row ${err.row}: "${err.zipcode}" - ${err.message}`,
            )
            .join("\n");

          if (otherErrors.length > 3) {
            errorSummary += `\n   ...and ${otherErrors.length - 3} more issues`;
          }
        }

        alert(
          `❌ VALIDATION FAILED!\n\n${errorSummary}\n\n⚠️ IMPORTANT: We only ship internationally!\nReceiver zip codes MUST be from: UK, USA, Canada, Australia, or Europe.\nIndian pincodes are NOT allowed.`,
        );
      } else {
        alert(
          `✅ Excel file loaded successfully!\n📦 ${excelRows.length} shipments found\n🌍 All receiver zip codes are valid international codes`,
        );
      }

      // For table display, keep simple mapping
      const mappedRows = excelRows.map((row, index) => {
        const transformed = transformExcelToShipment(row, index);

        // For table display, show calculated values
        return {
          origin: row.Origin,
          sector: row.Sector,
          destination: row.Destination,
          service: row.ServiceName,
          goodstype: row.GoodsType,
          pcs: row.PCS,
          totalActualWt: transformed.totalActualWt || row.ActualWeight,
          totalVolWt: transformed.totalVolWt || row.VolumeWeight,
          chargeableWt: transformed.chargeableWt || row.ChargeableWeight,
          totalInvoiceValue: row.InvoiceValue,
          currency: row.InvoiceCurrency,
          contentDisplay: row.ShipmentContent,

          receiverFullName: row.ConsigneeName,
          receiverPhoneNumber: row.ConsigneeTelephone,
          receiverEmail: row.ConsigneeEmailId,
          receiverCity: row.ConsigneeCity,
          receiverState: row.ConsigneeState,
          receiverPincode: row.ConsigneeZipcode,

          shipperFullName: row.ConsignorName,
          shipperPhoneNumber: row.ConsignorTelephone,
          shipperKycType: row.ConsignorKycType,
          shipperKycNumber: row.ConsignorKycNo,

          reference: row.ReferenceNo,
          csb: row.CSB,
        };
      });

      setExcelData(excelRows);
      setRowData(mappedRows);
    };

    reader.readAsArrayBuffer(file);
  };

  // ===== LOAD EXCEL → TABLE (LOGIC ONLY)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleExcelFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      handleExcelFile(file);
    }
  };

  const handleCancel = () => {
    setRowData([]);
    setExcelData([]);
    setFileName("");
    setValidationErrors([]);
    setSectorDestinationServiceErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== UPLOAD TO DATABASE
  const handleUpload = async () => {
    if (excelData.length === 0) {
      alert("Please select an Excel file first");
      return;
    }

    // Block if there are validation errors
    if (validationErrors.length > 0) {
      const indianZipCount = validationErrors.filter(
        (err) => err.isIndianZip,
      ).length;
      const otherErrorCount = validationErrors.length - indianZipCount;

      alert(
        `🚫 CANNOT PROCEED - INVALID ZIP CODES DETECTED!\n\n` +
          `❌ Total errors: ${validationErrors.length}\n` +
          (indianZipCount > 0
            ? `   • Indian pincodes: ${indianZipCount}\n`
            : "") +
          (otherErrorCount > 0
            ? `   • Other invalid formats: ${otherErrorCount}\n`
            : "") +
          `\n⚠️ ACTION REQUIRED:\n` +
          `1. Fix the invalid zip codes in your Excel file\n` +
          `2. Remove all Indian pincodes from ConsigneeZipcode column\n` +
          `3. Re-upload the corrected file\n\n` +
          `✓ We only accept international zip codes (UK, USA, Canada, Australia, Europe)`,
      );
      return;
    }

    try {
      setLoading(true);

      // Transform Excel data to full shipment objects
      const transformedResults = excelData.map((row, index) => {
        return transformExcelToShipment(row, index);
      });

      // Filter out any shipments with errors
      const validShipments = transformedResults.filter(
        (result) => !result.error && result.isValid,
      );

      if (validShipments.length === 0) {
        alert("❌ No valid shipments found after validation.");
        setLoading(false);
        return;
      }

      console.log(
        `📦 ${validShipments.length} valid shipments ready for upload`,
      );

      // STEP 1: CALCULATE RATES FOR ALL SHIPMENTS - SERVER ONLY
      alert(`📊 Calculating rates for ${validShipments.length} shipments...`);

      let shipmentsWithRates;

      try {
        shipmentsWithRates = await calculateShipmentRates(validShipments);
        alert(
          `✅ Successfully calculated rates for ${shipmentsWithRates.length} shipments`,
        );
      } catch (rateError) {
        console.error("Rate calculation error:", rateError);
        alert(
          `❌ Rate calculation failed: ${rateError.message}\n\nPlease check zone/service configuration and try again.`,
        );
        setLoading(false);
        return;
      }

      // Check for zero amounts
      const zeroAmountCount = shipmentsWithRates.filter(
        (s) => s.basicAmt === 0 && s.totalAmt === 0,
      ).length;

      if (zeroAmountCount > 0) {
        const continueAnyway = confirm(
          `${zeroAmountCount} shipments have ₹0 amounts.\n\n` +
            `This might be because:\n` +
            `1. Missing zone configuration\n` +
            `2. Missing service tariff\n` +
            `3. Invalid service/destination combination\n\n` +
            `Would you like to:\n` +
            `• Continue with upload (amounts can be adjusted later)\n` +
            `• Cancel and check service/destination configurations`,
        );

        if (!continueAnyway) {
          setLoading(false);
          return;
        }
      }

      // STEP 2: Prepare final payload
      const currentAccountCode = getAccountCode();
      const uploadPayload = {
        shipments: shipmentsWithRates,
        accountCode: currentAccountCode,
        timestamp: new Date().toISOString(),
        totalShipments: shipmentsWithRates.length,
      };

      console.log("🚀 Sending upload request:", {
        payloadSize: JSON.stringify(uploadPayload).length,
        shipmentCount: uploadPayload.shipments.length,
        accountCode: currentAccountCode,
      });

      // STEP 3: UPLOAD TO DATABASE
      const response = await fetch(`${server}/bulk-upload/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadPayload),
      });

      // Log response status
      console.log(
        "📡 Upload response status:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Upload error details:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            `Upload failed: ${errorData.message || response.status}`,
          );
        } catch (e) {
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("✅ Upload response data:", data);

      if (data.success) {
        const { newRecords, duplicates, balanceUpdate } = data;

        let successMessage = `✅ Upload completed!\n`;
        successMessage += `✓ New records: ${newRecords}\n`;

        if (duplicates > 0) {
          successMessage += `⚠️ Duplicates: ${duplicates}\n`;
        }

        if (balanceUpdate) {
          successMessage += `💰 Customer balance updated: ₹${balanceUpdate.newBalance.toFixed(2)}\n`;
          successMessage += `   (Change: ₹${balanceUpdate.difference > 0 ? "+" : ""}${balanceUpdate.difference.toFixed(2)})`;
        }

        alert(successMessage);

        if (newRecords > 0) {
          // Clear all data after successful upload
          setRowData([]);
          setExcelData([]);
          setFileName("");
          setValidationErrors([]);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else {
        alert(data.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Error uploading data: ${error.message}\n\nCheck console for details.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const totalErrors =
    validationErrors.length + sectorDestinationServiceErrors.length;
  const hasAnyErrors = totalErrors > 0;

  return (
    <>
      <div className="bg-[#f8f9fa]">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between  items-center mb-3">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-[#2D3748]">
                Bulk Upload Shipments
              </h1>
              <p className="tracking-wide text-[#A0AEC0]">
                Upload multiple shipments using Excel file
              </p>
              {/* Show current account code */}
              {accountCode && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Account:</span>{" "}
                    {accountCode}
                    {session?.user?.name && (
                      <span className="ml-4">
                        <span className="font-semibold">User:</span>{" "}
                        {session.user.name}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className=" flex items-end justify-end mt-4 pr-1">
              <button
                onClick={handleSampleDownload}
                className="flex items-center justify-center gap-2 border border-[#979797] w-40 py-1.5 rounded-lg text-[#71717A] hover:bg-gray-50"
              >
                <Image
                  src="/arrow-right.svg"
                  width={18}
                  height={18}
                  className="rotate-90"
                  alt=""
                />
                Sample File
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 max-w-screen flex gap-10">
            <div className="w-4/5">
              <div
                className="border-2 border-dashed flex justify-center items-center gap-4 border-[#CBD5E0] rounded-lg p-8 w-full bg-[#F8FAFC]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Image src="/bulk-upload.svg" width={20} height={20} alt="" />
                <div className="text-center">
                  {fileName ? (
                    <>
                      <p className="text-sm text-green-600 font-medium">
                        ✅ {fileName}
                      </p>
                      <p className="text-xs text-[#A0AEC0] mt-1">
                        {rowData.length} shipments loaded
                        {validationErrors.length > 0 && (
                          <span className="text-red-600">
                            {" "}
                            ({validationErrors.length} errors)
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#71717A]">
                        Drag & drop your Excel file here
                      </p>
                      <p className="text-xs text-[#A0AEC0] mt-1">
                        or click browse (.xlsx only)
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="w-1/5 flex flex-col gap-3 font-bold">
              <div className="flex items-start gap-4 w-full">
                <button
                  onClick={handleBrowseClick}
                  className="w-40 py-1.5 rounded-lg text-[--primary-color] bg-white border-[1px] border-[var(--primary-color)] hover:opacity-90"
                >
                  Browse
                </button>
                <button
                  onClick={handleCancel}
                  className="w-40 py-1.5 rounded-lg border border-[#979797] text-[#71717A] hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              <div className="flex items-start gap-4 w-full">
                <button
                  onClick={handleUpload}
                  disabled={loading || rowData.length === 0 || hasAnyErrors}
                  className="w-[98%] py-1.5 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div
              className="rounded-md p-4 mt-4 border-2"
              style={{
                backgroundColor: "#FEE2E2",
                borderColor: "#DC2626",
              }}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <h3
                    className="font-bold text-lg mb-2 flex items-center"
                    style={{ color: "#991B1B" }}
                  >
                    INVALID ZIP CODES - {validationErrors.length} Shipments
                    Blocked
                  </h3>
                  <div className="bg-white rounded p-3 mb-3 border border-red-300">
                    <p className="text-sm mb-2" style={{ color: "#DC2626" }}>
                      Indian pincodes (6-digit codes like 110001, 400001, etc.)
                      are <strong>NOT ALLOWED</strong> for receiver addresses.
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold mb-1"
                    style={{ color: "#991B1B" }}
                  >
                    ⚠️ Action Required: Fix these {validationErrors.length}{" "}
                    shipments in your Excel file:
                  </span>
                  <span className="text-xs ml-1" style={{ color: "#DC2626" }}>
                    These shipments will be automatically filtered out and NOT
                    processed.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white py-4 max-w-[1800px] rounded-xl border-[1px] mx-6">
        <div className="px-4 bg-[#F8FAFC]">
          <TableWithSorting
            register={register}
            setValue={setValue}
            columns={bulkUploadColumns}
            rowData={rowData}
            className="max-w-[90%]"
          />
        </div>
      </div>
    </>
  );
}
