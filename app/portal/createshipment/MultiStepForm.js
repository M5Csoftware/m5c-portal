"use client";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ShipperDetail from "./ShipperDetail";
import ReceiverDetail from "./ReceiverDetail";
import ShipmentAndPackageDetail from "./ShipmentAndPackageDetail";
import SelectService from "./SelectService";
import Checkout from "./Checkout";
import Image from "next/image";
import AwbDetails from "./AwbDetails";
import axios from "axios";
import NotificationFlag from "../component/NotificationFlag";
import { GlobalContext } from "../GlobalContext";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Layers3Icon } from "lucide-react";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestinations] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedServiceLocal, setSelectedServiceLocal] = useState(null);
  const [successAwbNo, setSuccessAwbNo] = useState("");
  const [filteredServicesWithRates, setFilteredServicesWithRates] = useState([]);
  const [zones, setZones] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [totalActualWt, setTotalActualWt] = useState(0.0);
  const [totalVolumetricWt, setTotalVolumetricWt] = useState(0.0);
  const [chargeableWt, setChargeableWt] = useState(0.0);
  const [visibleFlag, setVisibleFlag] = useState(false);
  const [creditLimitError, setCreditLimitError] = useState("");
  const [isShipmentOnHold, setIsShipmentOnHold] = useState(false);
  const [holdMessage, setHoldMessage] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const editAwb = searchParams.get("editAwb");
  const isEditMode = Boolean(editAwb);

  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
    trigger,
  } = useForm();

  // flags
  const [destination, setDestination] = useState("N/A");
  const [destinationFlag, setDestinationFlag] = useState("");

  // GST Setting
  const cgst = 9.0;
  const sgst = 9.0;

  // Set destination flags based on sector
  useEffect(() => {
    const sector = watch("sector");
    const watchedDestination = watch("destination");
    setValue("date", new Date().toISOString().split("T")[0]);

    if (sector === "USA") {
      setDestination("United States");
      setDestinationFlag("usa");
    } else if (sector === "CA") {
      setDestination("Canada");
      setDestinationFlag("canada");
    } else if (sector === "UK") {
      if (
        watchedDestination === "USA" ||
        watchedDestination === "United States"
      ) {
        setDestination("United States");
        setDestinationFlag("usa");
      } else {
        setDestination("United Kingdom");
        setDestinationFlag("uk");
      }
    } else if (sector === "NZ") {
      setDestination("New Zealand");
      setDestinationFlag("new-zealand");
    } else if (sector === "EU") {
      setDestination("Europe");
      setDestinationFlag("europe");
    } else if (sector === "AUS") {
      setDestination("Australia");
      setDestinationFlag("australia");
    }
  }, [watch, setValue, watch("sector")]);

  // Fetch initial data: Sectors and Zones
  useEffect(() => {
    const fetchEntity = async (entityType) => {
      try {
        const response = await axios.get(`${server}/entity-manager`, {
          params: { entityType },
        });

        if (response.status === 200) {
          const extractedData = response.data.map((item) => ({
            code: item.code,
            name: item.name,
          }));

          if (entityType === "Sector") {
            setSectors(extractedData);
          }
        } else {
          if (entityType === "Sector") {
            setSectors([]);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${entityType}:`, error);
        if (entityType === "Sector") {
          setSectors([]);
        }
        setRefetch(!refetch);
      }
    };
    fetchEntity("Sector");
  }, [refetch, server]);

  useEffect(() => {
    const selectedSectorCode = watch("sector");
    const fetchZones = async () => {
      try {
        const res = await axios.get(
          `${server}/zones?sector=${selectedSectorCode || ""}`
        );
        setZones(res.data);
        console.log("Fetched zones:", res.data);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      }
    };
    fetchZones();
  }, [watch("sector"), server]);

  // Form submission
  const onSubmit = async (data) => {
    try {
      setCreditLimitError("");
      setIsShipmentOnHold(false);
      setHoldMessage("");

      if (isEditMode) {
        // PUT update existing shipment
        console.log(data);
        const response = await axios.put(
          `${server}/portal/create-shipment?awbNo=${editAwb}`,
          {
            ...data,
            source: "Portal",
          }
        );

        if (response.data.isHold) {
          setIsShipmentOnHold(true);
          setHoldMessage(response.data.message || "Shipment updated but placed on hold due to insufficient credit");
        }

        alert(response.data.message || "Shipment Updated Successfully!");
        console.log("Updated:", response.data);

        // Redirect to shipments page
        router.push("/portal/shipments");
        return;
      }

      // POST create route
      const payload = {
        ...data,
        accountCode: session?.user?.accountCode,
        customerName: session?.user?.name,
        source: "Portal",
        entryType: "Portal",
        userId: session?.user?.id,
        chargeableWt: chargeableWt,
      };

      // Get the shipment amount from the selected service
      const selectedRate = filteredServicesWithRates.find(
        (r) => r.service === selectedServiceLocal
      );

      if (!selectedRate) {
        alert("Please select a service before creating shipment");
        return;
      }

      const shipmentAmount = Number(selectedRate.grandTotal) || 0;

      // Check and update balance BEFORE creating shipment
      try {
        console.log("Updating balance for amount:", shipmentAmount);
        const balanceResponse = await axios.post(`${server}/portal/update-balance`, {
          accountCode: session?.user?.accountCode,
          shipmentAmount: shipmentAmount,
        });

        if (!balanceResponse.data.success) {
          alert(balanceResponse.data.message);
          return;
        }

        console.log("Balance updated successfully:", balanceResponse.data.data);

        // Refresh balance in Checkout component
        if (typeof window !== 'undefined' && window.refreshBalance) {
          window.refreshBalance();
        }
      } catch (balanceError) {
        console.error("Balance update error:", balanceError);

        if (balanceError.response?.data?.message) {
          // Show credit limit exceeded message
          if (balanceError.response.data.message.includes("Insufficient")) {
            setCreditLimitError("⚠️ Credit Limit Exceeded! Your shipment will be placed on hold.");
            // Allow the shipment creation to continue - it will be placed on hold
          } else {
            alert(balanceError.response.data.message);
            return;
          }
        } else {
          alert("Failed to update balance. Please try again.");
          return;
        }
      }

      // Continue with shipment creation (even if balance update failed due to credit limit)
      console.log("Creating shipment with payload:", payload);

      const newShipment = await axios.post(
        `${server}/portal/create-shipment`,
        payload
      );

      const successAwb = newShipment.data.awbNo;
      console.log("Shipment Created", successAwb);

      // Check if shipment was placed on hold
      if (newShipment.data.isHold) {
        setIsShipmentOnHold(true);
        setHoldMessage(newShipment.data.message || "Shipment created but placed on hold due to insufficient credit");
        setCreditLimitError("⚠️ " + (newShipment.data.message || "Credit Limit Exceeded! Shipment placed on hold."));
      }

      setSuccessAwbNo(successAwb);

      // Don't reset the form if on hold - keep the data visible
      if (!newShipment.data.isHold) {
        reset();
        setValue("accountCode", session?.user?.accountCode);
        setStep(1);
      }

      setVisibleFlag(true);

      setTimeout(() => {
        setVisibleFlag(false);
        // Only redirect if not on hold, or after showing hold message
        if (!newShipment.data.isHold) {
          router.push("/portal/shipments");
        }
      }, 3000);

    } catch (error) {
      console.error("Error Creating/Updating shipment:", error);

      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Something went wrong! Please try again.");
      }
    }
  };

  // Update destinations when sector changes
  useEffect(() => {
    const selectedSectorCode = watch("sector");
    console.log("Selected sector code:", selectedSectorCode);
    setSelectedSector(selectedSectorCode);

    if (!zones || !Array.isArray(zones) || !selectedSectorCode) {
      setDestinations([]);
      return;
    }

    const filteredDestinations = zones
      .filter((zone) => zone.sector === selectedSectorCode)
      .map((zone) => zone.destination);

    // Remove duplicates
    const uniqueDestinations = [...new Set(filteredDestinations)];
    setDestinations(uniqueDestinations);
  }, [watch("sector"), zones]);

  // Update selected destination
  useEffect(() => {
    const watchedDestination = watch("destination");
    setSelectedDestinations(watchedDestination);
  }, [watch("destination")]);

  // Calculate chargeable weight
  useEffect(() => {
    const actualWtValue = Number(totalActualWt) || 0;
    const volWtValue = Number(totalVolumetricWt) || 0;

    if (actualWtValue > 0 && volWtValue > 0) {
      const maxWt = Math.max(actualWtValue, volWtValue);
      setChargeableWt(maxWt.toFixed(2));
    } else {
      setChargeableWt(0.0);
    }
  }, [totalActualWt, totalVolumetricWt]);

  // Update form values when service is selected
  useEffect(() => {
    if (selectedServiceLocal && filteredServicesWithRates.length > 0) {
      const selectedRate = filteredServicesWithRates.find(
        (r) => r.service === selectedServiceLocal
      );

      if (selectedRate) {
        setValue("basicAmt", Number(selectedRate.basicAmt));
        setValue("cgst", Number(selectedRate.cgstAmt));
        setValue("sgst", Number(selectedRate.sgstAmt));
        setValue("totalAmt", Number(selectedRate.grandTotal));
        setValue("service", selectedRate.service);
        setValue("network", selectedRate.network);
      }
    }
  }, [selectedServiceLocal, filteredServicesWithRates, setValue]);

  // Set account code on mount
  useEffect(() => {
    setValue("accountCode", session?.user?.accountCode);
  }, [session?.user?.accountCode, setValue]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStep = () => {
    return (
      <div className="flex flex-col gap-4 pb-3">
        <div className="flex justify-between items-center">
          <div className="sticky top-20 bg-[#f8f9fa] z-10 flex flex-col gap-4 py-2">
            <h1 className="font-bold text-2xl text-[#18181B]">
              Create Shipment
            </h1>

            {/* Credit Limit Error Message */}
            {creditLimitError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{creditLimitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Shipment On Hold Message */}
            {isShipmentOnHold && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-medium">{holdMessage || "Shipment is on hold due to insufficient credit"}</p>
                    <p className="text-xs text-yellow-600 mt-1">AWB Number: {successAwbNo}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Breadcrumbs */}
            <ul className="flex text-xs gap-2 text-[#979797] w-fit rounded-md">
              {[
                { num: 1, label: "AirwayBill Details" },
                { num: 2, label: "Shipper Details" },
                { num: 3, label: "Receiver Details" },
                { num: 4, label: "Shipment and Package Details" },
                { num: 5, label: "Select Service" },
                { num: 6, label: "Checkout" },
              ].map((item, idx) => (
                <li
                  key={item.num}
                  onClick={() => setStep(item.num)}
                  className={`flex items-center gap-1 cursor-pointer transition-colors ${step === item.num && "text-[var(--primary-color)]"
                    }`}
                >
                  <span>{item.label}</span>
                  {idx < 5 && (
                    <Image
                      src={`/right_arrow_${step === item.num ? "red" : "gray"}.svg`}
                      alt="Navigation arrow"
                      width={7}
                      height={7}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <button
              onClick={() => router.push("/portal/bulkupload")}
              className="p-1 px-4 flex gap-1 items-center justify-center border-gray-400 border-[2px] border-opacity-75 rounded-lg bg-slate-100 text-gray-500 hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)] transition-all duration-300 ease-in-out font-bold text-sm tracking-wide"
            >
              <Layers3Icon size={18} />
              Bulk Upload
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AwbDetails
            register={register}
            errors={errors}
            onNext={nextStep}
            watch={watch}
            setValue={setValue}
            getValue={getValues}
            step={step}
            sectors={sectors}
            destinations={destinations}
            trigger={trigger}
          />
          <ShipperDetail
            register={register}
            errors={errors}
            onNext={nextStep}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            step={step}
            onPrev={prevStep}
            trigger={trigger}
          />
          <ReceiverDetail
            register={register}
            errors={errors}
            onPrev={prevStep}
            onNext={nextStep}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            step={step}
            trigger={trigger}
          />
          <ShipmentAndPackageDetail
            register={register}
            errors={errors}
            onPrev={prevStep}
            onNext={nextStep}
            watch={watch}
            setValue={setValue}
            step={step}
            totalActualWt={totalActualWt}
            setTotalActualWt={setTotalActualWt}
            totalVolumetricWt={totalVolumetricWt}
            setTotalVolumetricWt={setTotalVolumetricWt}
            trigger={trigger}
          />
          <SelectService
            register={register}
            errors={errors}
            onPrev={prevStep}
            onNext={nextStep}
            watch={watch}
            setValue={setValue}
            step={step}
            filteredServices={filteredServicesWithRates}
            setSelectedServiceLocal={setSelectedServiceLocal}
            selectedServiceLocal={selectedServiceLocal}
            chargeableWt={chargeableWt}
            destination={destination}
            destinationFlag={destinationFlag}
            trigger={trigger}
            setFilteredServicesWithRates={setFilteredServicesWithRates}
          />
          <Checkout
            register={register}
            errors={errors}
            onPrev={prevStep}
            watch={watch}
            setValue={setValue}
            step={step}
            selectedServiceLocal={selectedServiceLocal}
            filteredServicesWithRates={filteredServicesWithRates}
            cgst={cgst}
            sgst={sgst}
            destination={destination}
            destinationFlag={destinationFlag}
            isEditMode={isEditMode}
            trigger={trigger}
            creditLimitError={creditLimitError}
            isShipmentOnHold={isShipmentOnHold}
          />
        </form>
      </div>
    );
  };

  return (
    <div className="relative flex justify-center">
      <div className="w-full max-w-[80vw]">
        <NotificationFlag
          message={isShipmentOnHold ? "Shipment Created (On Hold)!" : "Shipment Created!"}
          subMessage={`AWB No. ${successAwbNo} ${isShipmentOnHold ? "- On Hold" : ""}`}
          visible={visibleFlag}
          setVisible={setVisibleFlag}
        />
        {renderStep()}
      </div>
    </div>
  );
};

export default MultiStepForm;