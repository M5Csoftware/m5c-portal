"use client";
import React, { use, useContext, useEffect, useState } from "react";
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
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
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
        const res = await axios.get(`${server}/zones?sector=${selectedSectorCode || ""}`);
        setZones(res.data);
        console.log("Fetched zones:", res.data);
      } catch (error) {
        console.error("Failed to fetch zones:", error);
      }
    };
    fetchZones();
  }, [watch("sector")]);


  // Form submission
  const onSubmit = async (data) => {
    try {
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

        alert("Shipment Updated Successfully!");
        console.log("Updated:", response.data);
        return;
      }

      // POST create route
      const payload = {
        ...data,
        accountCode: session?.user?.accountCode,
        customerName: session?.user?.name,
        source: "Portal",
        userId: session?.user?.id,
        chargeableWt: chargeableWt,
      };

      const newShipment = await axios.post(
        `${server}/portal/create-shipment`,
        payload
      );

      const successAwb = newShipment.data.awbNo;
      console.log("Shipment Created", successAwb);
      setSuccessAwbNo(successAwb);

      reset();
      setValue("accountCode", session?.user?.accountCode);
      setStep(1);
      setVisibleFlag(true);

      setTimeout(() => setVisibleFlag(false), 5000);

    } catch (error) {
      console.error("Error Creating/Updating shipment:", error);
      alert("Something went wrong!");
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

  // Fetch services with rates (Main logic)
  useEffect(() => {
    const fetchServicesWithRates = async () => {
      if (!chargeableWt || chargeableWt <= 0 || !selectedSector || !selectedDestination) {
        setFilteredServicesWithRates([]);
        return;
      }

      try {
        // Get Zones for selected sector and destination
        const zoneRes = await axios.get(
          `${server}/zones?sector=${selectedSector}&destination=${selectedDestination}`
        );
        const zoneData = zoneRes.data || [];
        const zoneServices = zoneData.map((z) => z.service);

        console.log("zone", zoneServices);

        // Get Shipper Tariff
        const tariffRes = await axios.get(
          `${server}/shipper-tariff?accountCode=${session?.user?.accountCode}`
        );
        const tariffServices = tariffRes.data || [];

        console.log("tariffServices", tariffRes);

        // Find common services
        const commonServices = tariffServices.filter((t) =>
          zoneServices.includes(t.service)
        );

        console.log("commonServices", commonServices);
        const finalRates = [];


        // Calculate rates for each service
        for (let srv of commonServices) {
          const zoneInfo = zoneData.find((z) => z.service === srv.service);
          if (!zoneInfo) continue;

          const rateRes = await axios.get(
            `${server}/rate-sheet?service=${srv.service}`
          );
          const ratesData = rateRes.data;

          console.log("rateRes", ratesData, chargeableWt);

          const matchedRow = ratesData.find(
            (row) => chargeableWt >= row.minWeight && chargeableWt <= row.maxWeight
          );

          console.log("matchedRow", matchedRow);

          if (matchedRow) {
            const zoneRate = matchedRow[zoneInfo.zone];

            if (zoneRate) {
              let basicAmt = 0.0;

              if (matchedRow.type === "B") {
                basicAmt = zoneRate * chargeableWt;
              } else if (matchedRow.type === "S") {
                basicAmt = zoneRate;
              }

              const cgstAmt = (basicAmt * cgst) / 100;
              const sgstAmt = (basicAmt * sgst) / 100;
              const grandTotal = basicAmt + cgstAmt + sgstAmt;

              finalRates.push({
                service: matchedRow.service,
                zone: zoneInfo.zone,
                rate: zoneRate,
                shipper: matchedRow.shipper,
                type: matchedRow.type,
                network: srv.network,
                basicAmt: basicAmt.toFixed(2),
                cgstAmt: cgstAmt.toFixed(2),
                sgstAmt: sgstAmt.toFixed(2),
                grandTotal: grandTotal.toFixed(2),
                from: srv.from,
                to: srv.to,
              });
            }
          }
        }

        // Remove duplicates
        const uniqueResults = finalRates.filter(
          (result, index, self) =>
            index === self.findIndex((r) => r.service === result.service)
        );

        setFilteredServicesWithRates(uniqueResults);
        console.log("Filtered Services with Rates:", uniqueResults);
      } catch (error) {
        console.error("Error fetching services with rates:", error);
        setFilteredServicesWithRates([]);
      }
    };

    fetchServicesWithRates();
  }, [
    chargeableWt,
    selectedSector,
    selectedDestination,
    session?.user?.accountCode,
    server,
    cgst,
    sgst,
  ]);

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

        <div className="sticky top-20 bg-[#f8f9fa] z-10 flex flex-col gap-4 py-2">
          <h1 className="font-bold text-2xl text-[#18181B]">
            Create Shipment
          </h1>

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
          />
        </form>
      </div>
    );
  };

  return (
    <div className="relative flex justify-center">
      <div className="w-full max-w-[80vw]">
        <NotificationFlag
          message={"Shipment Created!"}
          subMessage={`AWB No. ${successAwbNo}`}
          visible={visibleFlag}
          setVisible={setVisibleFlag}
        />
        {renderStep()}
      </div>
    </div>

  );
};

export default MultiStepForm;