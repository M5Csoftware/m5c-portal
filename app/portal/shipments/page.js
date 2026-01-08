"use client";
import { useContext, useState, useRef } from "react";
import ShipNav from "./ShipNav";
import Shipments from "./Shipments";
import FilterShipment from "./FilterShipment";
import { GlobalContext } from "../GlobalContext";
import Manifest, {
  ManifestSuccessModal,
} from "../component/Create Manifest/Manifest";
import PickupAndManifest from "./PickupAndManifest";
import UploadModal from "./UploadModal";
import Dispatch, { DisptchedSuccessModal } from "../component/Dispatch";

const Page = () => {
  const {
    showSuccessModal,
    setShowSuccessModal,
    manifestNumber,
    manifestOpen,
    selectedLi,
    showBulkUpload,
    toggleBulkUpload,
    dispatchOpen,
    setDisptchedSuccessModal,
    disptchedSuccessModal,
  } = useContext(GlobalContext);
  const [totalShipments, setTotalShipments] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Create ref for the download function
  const downloadExcelRef = useRef(null);

  // Handler for search from ShipNav
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  // Handler for setting up download function from Shipments
  const handleDownloadSetup = (downloadFunction) => {
    downloadExcelRef.current = downloadFunction;
  };

  // Handler for download button click
  const handleDownload = () => {
    if (downloadExcelRef.current) {
      downloadExcelRef.current();
    }
  };

  // Handler for selected count update
  const handleSelectedCountChange = (count) => {
    setSelectedCount(count);
  };

  return (
    <main className="w-full px-9 flex flex-col relative">
      <h1 className="font-bold text-2xl text-[#18181B] sticky top-[74px] bg-[#f8f9fa]">
        Shipments
      </h1>
      
      {/* Pass search handler and download handler to ShipNav */}
      <ShipNav 
        totalShipments={totalShipments} 
        onDownload={handleDownload}
        selectedCount={selectedCount}
        onSearch={handleSearch}
      />
      
      {selectedLi == 3 ? (
        <PickupAndManifest statusFilter={"drop"} />
      ) : (
        <Shipments 
          setTotalShipments={setTotalShipments}
          searchTerm={searchTerm}
          onDownloadSetup={handleDownloadSetup}
          onSelectedCountChange={handleSelectedCountChange}
        />
      )}

      <div className="bg-white shadow-lg rounded-lg z-[100] fixed top-0 bottom-0 right-0 ">
        <FilterShipment />
      </div>
      
      {manifestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <Manifest />
        </div>
      )}

      {dispatchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <Dispatch />
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <ManifestSuccessModal
            manifestNumber={manifestNumber}
            onClose={() => setShowSuccessModal(false)}
          />
        </div>
      )}
      
      {disptchedSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100]">
          <DisptchedSuccessModal
            manifestNumber={manifestNumber}
            onClose={() => setDisptchedSuccessModal(false)}
          />
        </div>
      )}

      {showBulkUpload && <UploadModal onClose={toggleBulkUpload} />}
    </main>
  );
};

export default Page;