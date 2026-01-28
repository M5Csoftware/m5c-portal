"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import ShipmentCard from "./ShipmentCard";
import "./style.css";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";

const Shipments = ({
  setTotalShipments,
  searchTerm,
  onDownloadSetup,
  onSelectedCountChange,
}) => {
  const [shipmentsData, setShipmentsData] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const { setAccountCode, setSelectedAwbs, server, selectedLi, filters } =
    useContext(GlobalContext);
  const { data: session } = useSession();

  // Calculate the index range for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Search and filter logic - SIMPLIFIED
  const filteredShipments = useMemo(() => {
    let filtered = shipmentsData.filter((shipment) => {
      // 1. Status filtering based on selectedLi (TABS - All, Ready to Ship, Hold, etc.)
      let statusMatch = true;
      switch (selectedLi) {
        case 0: // All
        case 1: // maybe same as All?
          statusMatch = true;
          break;
        case 2:
          statusMatch = shipment.status === "Ready to Ship";
          break;
        case 4:
          statusMatch = shipment.status === "In Transit";
          break;
        case 5: // HOLD TAB - SHOW ALL HOLD SHIPMENTS
          statusMatch = shipment.status === "Hold";
          break;
        case 6:
          statusMatch = shipment.status === "RTO";
          break;
        case 7:
          statusMatch = shipment.status === "Delivered";
          break;
        default:
          statusMatch = true;
      }

      // If the tab filter doesn't match, skip this shipment
      if (!statusMatch) return false;

      // 2. Search filtering
      const searchMatch =
        searchTerm === "" ||
        shipment.awbNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.receiverFullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      // 3. Apply filters from FilterShipment panel ONLY ON "ALL" TAB
      // ON HOLD TAB AND OTHER TABS: IGNORE ALL FILTERS FROM FILTER PANEL
      if (selectedLi === 0 || selectedLi === 1) {
        // Only apply filters when on "All" tab

        // Filter by type (All, Invoiced, New)
        if (filters.filterType !== "All") {
          if (filters.filterType === "Invoiced" && !shipment.invoiced) {
            return false;
          }
          if (filters.filterType === "New" && !shipment.isNew) {
            return false;
          }
        }

        // Filter by M5 Coin Discount
        if (filters.m5Coin && !shipment.m5CoinDiscount) {
          return false;
        }

        // Filter by RTO
        if (filters.rto && !shipment.appliedForRTO) {
          return false;
        }

        // Filter by in-transit from panel
        if (filters.inTransit && shipment.status !== "In Transit") {
          return false;
        }

        // Filter by delivered from panel
        if (filters.delivered && shipment.status !== "Delivered") {
          return false;
        }

        // Filter by price range
        if (shipment.totalAmt) {
          const price = parseFloat(shipment.totalAmt);
          if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
            return false;
          }
        }

        // Filter by weight range
        if (shipment.chargeableWt) {
          const weight = parseFloat(shipment.chargeableWt);
          if (
            weight < filters.weightRange[0] ||
            weight > filters.weightRange[1]
          ) {
            return false;
          }
        }

        // Filter by payment method
        if (
          filters.paymentMethod &&
          shipment.paymentDetails?.mode !== filters.paymentMethod.value
        ) {
          return false;
        }

        // Filter by service
        if (filters.service && shipment.service !== filters.service.value) {
          return false;
        }

        // Filter by country
        if (
          filters.country &&
          shipment.receiverCountry !== filters.country.value
        ) {
          return false;
        }

        // Filter by consignment type
        if (filters.consignmentType) {
          if (
            filters.consignmentType.value === "consignee" &&
            !shipment.isConsignee
          ) {
            return false;
          }
          if (
            filters.consignmentType.value === "consigner" &&
            !shipment.isConsigner
          ) {
            return false;
          }
        }
      }

      // All filters passed!
      return true;
    });

    return filtered;
  }, [shipmentsData, selectedLi, searchTerm, filters]);

  const currentItems = filteredShipments.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Update selected count when selection changes
  useEffect(() => {
    if (onSelectedCountChange) {
      onSelectedCountChange(selectedShipments.length);
    }
  }, [selectedShipments, onSelectedCountChange]);

  const handleCheckboxChange = (id) => {
    setSelectedShipments((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((shipmentId) => shipmentId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Download functionality
  const downloadExcel = () => {
    // Determine which shipments to download
    const shipmentsToDownload =
      selectedShipments.length > 0
        ? shipmentsData.filter((shipment) =>
            selectedShipments.includes(shipment._id),
          )
        : filteredShipments;

    if (shipmentsToDownload.length === 0) {
      alert("No shipments to download");
      return;
    }

    // Prepare data for Excel
    const excelData = shipmentsToDownload.map((shipment) => ({
      "AWB Number": shipment.awbNo || "",
      "Created Date": shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleDateString()
        : "",
      Service: shipment.service || "",
      "Total Boxes": shipment.pcs || "",
      "Chargeble Weight": `${shipment.chargeableWt || 0} kg`,
      "Actual Weight": `${shipment.totalActualWt || 0} kg`,
      "Volume Weight": `${shipment.totalVolWt || 0} kg`,
      "Invoice Value": `₹${shipment.totalInvoiceValue || 0}`,
      "Consignor Name": shipment.shipperFullName || "",
      "Consignor Phone": shipment.shipperPhoneNumber || "",
      "Consignor Address": shipment.shipperAddressLine1 || "",
      "Consignor City": shipment.shipperCity || "",
      "Consignee Name": shipment.receiverFullName || "",
      "Consignee Phone": shipment.receiverPhoneNumber || "",
      "Consignee Address": shipment.receiverAddressLine1 || "",
      "Consignee City": shipment.receiverCity || "",
      Status: shipment.status || "",
      "Total Amount": `₹${shipment.totalAmt || 0}`,
      "Payment Mode": shipment.paymentDetails?.mode || "Pending",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Shipments");

    // Generate Excel file and download
    const fileName =
      selectedShipments.length > 0
        ? `Selected_Shipments_${new Date().toISOString().split("T")[0]}.xlsx`
        : `All_Shipments_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // Pass download function to parent
  useEffect(() => {
    if (onDownloadSetup) {
      onDownloadSetup(downloadExcel);
    }
  }, [onDownloadSetup, downloadExcel]);

  // Rest of your existing functions remain the same...
  const handleDeleteSelected = () => {
    setShipmentsData((prevShipments) =>
      prevShipments.filter(
        (shipment) => !selectedShipments.includes(shipment._id),
      ),
    );
    setSelectedShipments([]);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredShipments.length / itemsPerPage)) {
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
    setCurrentPage(1);
  };

  useEffect(() => {
    setAccountCode(session?.user?.accountCode);
    const fetchShipments = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/get-shipments?accountCode=${session?.user?.accountCode}`,
        );
        const shipments = response.data.shipments;
        console.log(shipments);
        setShipmentsData(shipments);
        setTotalShipments(shipments.length);
      } catch (error) {
        console.error(
          "Error fetching shipments:",
          error.response?.data || error.message,
        );
      }
    };
    fetchShipments();
  }, [server, session?.user?.accountCode, setAccountCode, setTotalShipments]);

  useEffect(() => {
    const selectedAWBNumbers = shipmentsData
      .filter((shipment) => selectedShipments.includes(shipment._id))
      .map((shipment) => shipment.awbNo);

    setSelectedAwbs(selectedAWBNumbers);
  }, [selectedShipments, shipmentsData, setSelectedAwbs]);

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="sticky top-[150px] bg-[#f8f9fa] z-0">
        <ul
          style={{ boxShadow: "0 2px 10px 0px rgba(0, 0, 0, 0.1)" }}
          className="flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] shipment-detail-ul text-left p-4 text-[#A0AEC0] text-sm items-center"
        >
          <li style={{ width: "10px" }}>
            <input
              type="checkbox"
              name="select-all"
              id="select-all"
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedShipments(
                    shipmentsData.map((shipment) => shipment._id),
                  );
                } else {
                  setSelectedShipments([]);
                }
              }}
            />
          </li>
          <li className="text-center">AWB Number</li>
          <li>Shipment Details</li>
          <li>Consignor Details</li>
          <li>Consignee Details</li>
          <li>Package Details</li>
          <li className="text-center">Payment Details</li>
          <li className="text-center">Status</li>
          <li className="text-center">Action</li>
          <span className="px-4"></span>
        </ul>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide h-[310px]">
        {currentItems.length > 0 ? (
          currentItems.map((shipment) => (
            <ShipmentCard
              key={shipment._id}
              shipmentData={shipment}
              selected={selectedShipments.includes(shipment._id)}
              onCheckboxChange={handleCheckboxChange}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            {searchTerm
              ? "No shipments match your search."
              : "No shipments found."}
          </p>
        )}
      </div>
      <div
        style={{ boxShadow: "0 0 10px 1px rgba(0, 0, 0, 0.1)" }}
        className="shadow-md flex sticky bottom-2 left-0 right-0 justify-between items-center my-4 text-[#A0AEC0] px-4 py-1 text-sm rounded-lg bg-white"
      >
        <div className="flex items-center">
          <label htmlFor="itemsPerPage" className="text-[#A0AEC0] mr-2">
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
          <span className="ml-4 text-sm">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredShipments.length)} of{" "}
            {filteredShipments.length} shipments
          </span>
        </div>
        <div className="flex items-center">
          <button
            className="text-[#A0AEC0] px-4 py-2 rounded mr-2 disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="text-[#A0AEC0] px-4 py-2 rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={
              currentPage === Math.ceil(filteredShipments.length / itemsPerPage)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
