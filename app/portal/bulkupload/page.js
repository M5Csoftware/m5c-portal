"use client";

import Table, { TableWithSorting } from "@/app/components/Table";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function BulkUploadPage() {
  const { register, setValue } = useForm();

  // ===== NEW: state + ref (NO UI CHANGE)
  const fileInputRef = useRef(null);
  const [rowData, setRowData] = useState([]);

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

  const handleExcelFile = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const excelRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const mappedRows = excelRows.map((row) => ({
        origin: row.Origin,
        sector: row.Sector,
        destination: row.Destination,
        service: row.ServiceName,
        goodstype: row.GoodsType,
        pcs: row.PCS,
        totalActualWt: row.ActualWeight,
        totalVolWt: row.VolumeWeight,
        chargeableWt: row.ChargeableWeight,
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
      }));

      setRowData(mappedRows);
    };

    reader.readAsArrayBuffer(file);
  };

  // ===== LOAD EXCEL → TABLE (LOGIC ONLY)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleExcelFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleExcelFile(file);
  };

  const handleCancel = () => {
    setRowData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
                <p className="text-sm text-[#71717A]">
                  Drag & drop your Excel file here
                </p>
                <p className="text-xs text-[#A0AEC0] mt-1">
                  or click browse (.xlsx only)
                </p>

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
                <button className="w-[98%] py-1.5 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90">
                  Upload
                </button>
              </div>
            </div>
          </div>
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
