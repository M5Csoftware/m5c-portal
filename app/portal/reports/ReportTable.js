import React, { useState } from "react";
import Image from "next/image";

const ReportTable = ({
  headers,
  reportData,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
  onDownloadPDF,
  onViewPDF,
  isShippingBill = false,
  isInvoice = false,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});

  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  const paginatedData = reportData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCheckboxToggle = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedRows = {};
    if (newSelectAll) {
      paginatedData.forEach((_, idx) => {
        const globalIndex = (currentPage - 1) * itemsPerPage + idx;
        newSelectedRows[globalIndex] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  const handleRowCheckboxChange = (index) => {
    const newSelectedRows = { ...selectedRows };
    if (newSelectedRows[index]) {
      delete newSelectedRows[index];
    } else {
      newSelectedRows[index] = true;
    }
    setSelectedRows(newSelectedRows);

    const totalSelectedOnPage = paginatedData.filter(
      (_, idx) => newSelectedRows[(currentPage - 1) * itemsPerPage + idx]
    ).length;

    setSelectAll(totalSelectedOnPage === paginatedData.length);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const renderCellContent = (header, data) => {
    // Handle Invoice Actions
    if (isInvoice && header === "Actions") {
      const invoiceNumber = data.InvoiceNumber;
      
      return (
        <div className="flex gap-2 items-center justify-center">
          {/* <button
            onClick={() => onViewPDF(invoiceNumber)}
            className="px-3 py-1 border w-full transition-all border-red-900 text-red-900 font-semibold text-xs rounded-md hover:bg-red-50"
            title="View Invoice"
          >
            View
          </button> */}
          <button
            onClick={() => onDownloadPDF(invoiceNumber)}
            className="px-3 py-1 bg-[#EA1B40] text-white text-xs rounded hover:bg-[#d01636] transition-all"
            title="Download Invoice PDF"
          >
            Download
          </button>
        </div>
      );
    }

    // Handle Invoice Status
    if (isInvoice && header === "Status") {
      const statusColors = {
        Generated: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Draft: "bg-gray-100 text-gray-800",
      };
      const status = data[header] || "Pending";
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      );
    }

    // Handle Shipping Bill Actions
    if (isShippingBill && header === "Actions") {
      const viewUrl = data.FileUrl;
      const awbNo = data.AwbNo;
      const fileName = data.FileName;
      
      return (
        <div className="flex gap-2 items-center justify-center">
          {/* <button
            onClick={() => onViewPDF(viewUrl)}
            className="px-3 py-1 border w-full transition-all border-red-900 text-red-900 font-semibold text-xs rounded-md hover:bg-red-50"
            title="View PDF"
          >
            View
          </button> */}
          <button
            onClick={() => onDownloadPDF(awbNo, fileName)}
            className="px-3 py-1 bg-[#EA1B40] text-white text-xs rounded hover:bg-[#d01636] transition-all"
            title="Download PDF"
          >
            Download
          </button>
        </div>
      );
    }

    // Handle Shipping Bill Status
    if (isShippingBill && header === "Status") {
      const statusColors = {
        uploaded: "bg-green-100 text-green-800",
        processing: "bg-yellow-100 text-yellow-800",
        completed: "bg-blue-100 text-blue-800",
        failed: "bg-red-100 text-red-800",
      };
      const status = data[header] || "uploaded";
      return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    }

    return data[header];
  };

  return (
    <div className="w-full">
      {/* Scrollable Table Container */}
      <div className="overflow-x-auto scrollbar-hide w-[91vw]">
        <div className="min-w-max">
          {/* Header */}
          <ul className="flex sticky top-0 bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm p-4 text-[#A0AEC0] text-sm font-semibold items-center text-center">
            <li className="w-[10px] bg-white mr-12">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                onChange={handleCheckboxToggle}
                checked={selectAll}
              />
            </li>
            {headers.map((header, i) => (
              <li
                key={i}
                className={`${
                  (isShippingBill || isInvoice) && header === "Actions" 
                    ? "w-[150px]" 
                    : "w-[100px]"
                } h-[20px] mr-4 truncate`}
              >
                {header}
              </li>
            ))}
          </ul>

          {/* Data Rows */}
          <div className="overflow-y-auto overflow-x-hidden max-h-[308px] pt-2 scrollbar-hide">
            {paginatedData.length > 0 ? (
              paginatedData.map((data, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;

                return (
                  <ul
                    key={index}
                    className="flex bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm p-4 text-[#71717A] text-sm font-normal items-center mb-2 text-center hover:bg-gray-50 transition-colors"
                  >
                    <li className="w-[10px] bg-white mr-12">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        onChange={() => handleRowCheckboxChange(globalIndex)}
                        checked={!!selectedRows[globalIndex]}
                      />
                    </li>
                    {headers.map((header, i) => (
                      <li
                        key={i}
                        className={`${
                          (isShippingBill || isInvoice) && header === "Actions"
                            ? "w-[150px]"
                            : "w-[100px]"
                        } h-[20px] mr-4 ${
                          header === "Actions" ? "" : "truncate"
                        }`}
                      >
                        {renderCellContent(header, data)}
                      </li>
                    ))}
                  </ul>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[#A0AEC0]">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm font-medium">
                  {isInvoice
                    ? "No invoices available"
                    : isShippingBill
                    ? "No shipping bills uploaded yet"
                    : "No data available"}
                </p>
                <p className="text-xs mt-2">
                  {isInvoice
                    ? "Invoices with Excel data will appear here"
                    : isShippingBill
                    ? "Upload shipping bills to see them here"
                    : "Data will appear here once available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {paginatedData.length > 0 && (
        <div className="shadow-md flex sticky bottom-2 left-0 right-0 justify-between items-center my-4 text-[#A0AEC0] px-4 py-1 text-sm rounded-lg bg-white w-[91vw]">
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="text-[#A0AEC0] mr-2">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EA1B40]"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="text-[#A0AEC0] px-4 py-2 rounded mr-2 disabled:opacity-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="text-[#A0AEC0] px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-100 transition cursor-pointer"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;