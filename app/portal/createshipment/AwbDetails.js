"use client"
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useFormData } from "./FormDataContext";

function AwbDetails({
  register,
  errors,
  onNext,
  watch,
  setValue,
  getValue,
  step,
  sectors,
  trigger,
}) {
  const { server } = useContext(GlobalContext);
  const { formData } = useFormData();
  const [isEditMode, setIsEditMode] = useState(true);
  const [awbExists, setAwbExists] = useState(null);
  const [isCheckingAwb, setIsCheckingAwb] = useState(false);
  const [awbError, setAwbError] = useState("");
  
  // Local state for destinations
  const [localDestinations, setLocalDestinations] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  const awbNo = watch("awbNo");
  const selectedSector = watch("sector");
  const selectedDestination = watch("destination");

  // Prefill form data
  useEffect(() => {
    if (!formData) return;
    Object.keys(formData).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData, setValue]);

  // Fetch zones and destinations when sector changes
  useEffect(() => {
    const fetchDestinations = async () => {
      if (!selectedSector || !server) {
        setLocalDestinations([]);
        setZones([]);
        setValue("destination", "");
        return;
      }

      setIsLoadingDestinations(true);
      try {
        console.log("Fetching destinations for sector:", selectedSector);
        
        const response = await axios.get(
          `${server}/portal/create-shipment/get-zones?sector=${selectedSector}`
        );

        const zoneData = response.data || [];
        setZones(zoneData);
        console.log("Zones fetched:", zoneData);

        if (!Array.isArray(zoneData)) {
          console.error("Zones data is missing or not an array");
          setLocalDestinations([]);
          return;
        }

        // Extract unique destinations for this sector
        const filteredDestinations = [...new Set(
          zoneData
            .filter((zone) => zone.sector === selectedSector)
            .map((zone) => zone.destination)
        )].sort();

        console.log("Filtered Destinations:", filteredDestinations);
        setLocalDestinations(filteredDestinations);
        
        // Clear destination when sector changes (unless editing)
        if (!formData?.destination) {
          setValue("destination", "");
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setLocalDestinations([]);
        setZones([]);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, [selectedSector, server, setValue]);

  // Check AWB existence
  const checkAwbExists = async (awbNumber) => {
    if (!awbNumber || awbNumber.trim() === "") {
      setAwbExists(false);
      setAwbError("");
      return;
    }

    setIsCheckingAwb(true);
    setAwbError("");

    try {
      const response = await axios.get(
        `${server}/portal/get-shipments?awbNo=${awbNumber}`
      );
      if (response.data) {
        setAwbExists(true);
        setAwbError("This AWB number already exists in the system");
      } else {
        setAwbExists(false);
        setAwbError("");
      }
    } catch (error) {
      console.error("Error checking AWB:", error);
      setAwbExists(false);
    } finally {
      setIsCheckingAwb(false);
    }
  };

  // Debounce AWB check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (awbNo && !isEditMode) {
        checkAwbExists(awbNo);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [awbNo, isEditMode]);

  const handleNext = async () => {
    const isValid = await trigger([
      "awbNo",
      "sector",
      "destination"
    ]);

    if (!isValid) return;

    if (awbExists) {
      setAwbError("This AWB number already exists in the system");
      return;
    }

    onNext();
  };

  return (
    <div className="bg-white rounded-3xl p-10">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step <= 1 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/1.svg"
            alt="step 1"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${
              step > 1 ? "opacity-100" : "opacity-0"
            }`}
            src="/create-shipment/done-red.svg"
            alt="step 1"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">AirwayBill Details</h2>
      </div>
      
      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${
          step === 1 ? "max-h-[10000px]" : "max-h-0"
        }`}
      >
        <Image
          className="py-6"
          src="/create-shipment/shipper.svg"
          alt="step 1"
          width={36}
          height={36}
        />
        <div className="w-full text-xs">
          <div className="py-6 px-2 gap-5 flex flex-col items-center">
            <div className="items-center w-full flex justify-between gap-6">
              <div className="w-1/2 items-center relative">
                <input
                  type="text"
                  placeholder="AWB"
                  disabled={isEditMode}
                  className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
                  {...register("awbNo", {
                    required: "AWB is required",
                  })}
                />
                {errors.awbNo && (
                  <p className="text-red-500 text-xs">{errors.awbNo.message}</p>
                )}

                <div
                  className="absolute top-[15px] right-2"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode && (
                    <Image src="/addEdit.svg" width={20} height={20} alt="edit" />
                  )}
                </div>
                
                {isCheckingAwb && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-black rounded-full"></div>
                  </div>
                )}
                
                {!isCheckingAwb && awbExists === false && (
                  <div className="absolute right-3 top-[16px]">
                    <Image
                      src="/green-tick.svg"
                      alt="check"
                      width={15}
                      height={15}
                    />
                  </div>
                )}
                
                {awbError && (
                  <p className="text-red-500 text-xs absolute">{awbError}</p>
                )}
              </div>
              
              <div className={`w-1/2 items-center ${errors.awbNo && "pb-4"}`}>
                <input
                  {...register("reference")}
                  placeholder="Reference"
                  className="block border mb-2 border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
                />
              </div>
            </div>
            
            <div className="items-center w-full flex justify-between gap-6">
              <div className="w-1/2 items-center">
                <select
                  className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
                  {...register("sector", {
                    required: "Sector is required",
                  })}
                >
                  <option value="">Select Sector</option>
                  {sectors.map((sector, idx) => (
                    <option key={idx} value={sector.code}>
                      {sector.name}
                    </option>
                  ))}
                </select>

                {errors.sector && (
                  <p className="text-red-500 text-xs">{errors.sector.message}</p>
                )}
              </div>
              
              <div className="w-1/2 items-center">
                <select
                  className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
                  {...register("destination", {
                    required: "Destination is required",
                  })}
                  disabled={!selectedSector || isLoadingDestinations}
                >
                  <option value="">
                    {!selectedSector
                      ? "Select Sector First"
                      : isLoadingDestinations
                      ? "Loading destinations..."
                      : localDestinations.length === 0
                      ? "No destinations available"
                      : "Select Destination"}
                  </option>
                  {localDestinations.map((destination, idx) => (
                    <option key={idx} value={destination}>
                      {destination}
                    </option>
                  ))}
                </select>

                {errors.destination && (
                  <p className="text-red-500 text-xs">
                    {errors.destination.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end items-center">
            <button
              className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 disabled:opacity-50"
              onClick={handleNext}
              type="button"
              disabled={isCheckingAwb || awbExists}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AwbDetails;