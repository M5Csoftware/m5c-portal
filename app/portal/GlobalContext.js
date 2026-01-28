"use client";
import React, { createContext, useState } from "react";

export const GlobalContext = createContext(); // Create the context

export const GlobalProvider = ({ children }) => {
  const [adding, setAdding] = useState(false); // Initialize adding state
  const server = process.env.NEXT_PUBLIC_SERVER;
  const [walletOpen, setWalletOpen] = useState(false);
  const [manifestOpen, setManifestOpen] = useState(false);
  const [dispatchOpen, setDisptchedOpen] = useState(false);
  const [disptchedSuccessModal, setDisptchedSuccessModal] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState(null);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [accountCode, setAccountCode] = useState();
  const [selectedLi, setSelectedLi] = useState(0);
  const [isEditingAddress, setIsEditingAddress] = useState(false); // Initialize isEditingAddress state
  const [raiseTicketWindow, setRaiseTicketWindow] = useState(false); // Initialize raiseTicketWindow state
  const [filterShipmentWindow, setFilterShipmentWindow] = useState(false); // Initialize filterShipmentWindow state
  const [filterCustomerSupportWindow, setFilterCustomerSupportWindow] =
    useState(false); // Initialize filterCustomerSupportWindow state
  const [contactToEdit, setContactToEdit] = useState(null); // State to store the contact being edited
  const [ticketRefreshTrigger, setTicketRefreshTrigger] = useState(false); // State to trigger ticket refresh
  const [ticketsData, setTicketsData] = useState([]);
  const [addressData, setAddressData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    branch: "",
  });
  const [pickupAddresses, setPickupAddresses] = useState([]);
  const [bgPos, setBgPos] = useState(false);
  const [selectedAwbs, setSelectedAwbs] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [manifestNumber, setManifestNumber] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [updateTicketRemark, setUpdateTicketRemark] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const toggleBulkUpload = () => {
    setShowBulkUpload(!showBulkUpload);
  };
  const [selectedBranch, setSelectedBranch] = useState(null);

  // ADD FILTER STATE HERE - This is the most important addition
  const [filters, setFilters] = useState({
    filterType: "All",
    m5Coin: false,
    rto: false,
    inTransit: false,
    delivered: false,
    priceRange: [0, 5000],
    weightRange: [0.5, 12.0],
    paymentMethod: null,
    service: null,
    country: null,
    consignmentType: null,
  });

  return (
    <GlobalContext.Provider
      value={{
        // Your existing values...
        sidebarHovered,
        setSidebarHovered,
        adding,
        setAdding,
        walletOpen,
        setWalletOpen,
        manifestOpen,
        setManifestOpen,
        raiseTicketWindow,
        setRaiseTicketWindow,
        isEditingAddress,
        setIsEditingAddress,
        contactToEdit,
        setContactToEdit,
        filterShipmentWindow,
        setFilterShipmentWindow,
        filterCustomerSupportWindow,
        setFilterCustomerSupportWindow,
        accountCode,
        setAccountCode,
        ticketRefreshTrigger,
        setTicketRefreshTrigger,
        ticketsData,
        setTicketsData,
        addressData,
        setAddressData,
        pickupAddresses,
        setPickupAddresses,
        bgPos,
        setBgPos,
        selectedAwbs,
        setSelectedAwbs,
        showSuccessModal,
        setShowSuccessModal,
        manifestNumber,
        setManifestNumber,
        selectedLi,
        setSelectedLi,
        statusFilter,
        setStatusFilter,
        server,
        updateTicketRemark,
        setUpdateTicketRemark,
        selectedTicket,
        setSelectedTicket,
        showBulkUpload,
        setShowBulkUpload,
        toggleBulkUpload,
        selectedBranch,
        setSelectedBranch,
        dispatchOpen,
        setDisptchedOpen,
        disptchedSuccessModal,
        setDisptchedSuccessModal,
        selectedManifest,
        setSelectedManifest,

        // ADD THESE TWO LINES - This makes filters available to all components
        filters,
        setFilters,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
