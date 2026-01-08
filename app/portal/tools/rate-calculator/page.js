"use client";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GlobalContext } from "../../GlobalContext";
import { useSession } from "next-auth/react";

const Page = () => {
  const { register, handleSubmit, reset } = useForm();
  const [volumetricWeight, setVolumetricWeight] = useState("0.00");
  const [chargeableWeight, setChargeableWeight] = useState("0.00");

  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [selectedServiceLocal, setSelectedServiceLocal] = useState();
  const [services, setServices] = useState([]);

  // 👉 1. Calculate volumetric & chargeable weight
  const onSubmit = async (data) => {
    const { length, width, height, actualWeight, sector, destinationCountry } = data;

    // 1️⃣ Calculate volumetric & chargeable weight
    const volumeWeight = (length * width * height) / 5000 || 0;
    const actual = parseFloat(actualWeight) || 0;
    const chargeable = Math.max(volumeWeight, actual, 0.5);

    setVolumetricWeight(volumeWeight.toFixed(2));
    setChargeableWeight(chargeable.toFixed(2));

    try {
      // 2️⃣ Get Zones
      const zoneRes = await axios.get(
        `${server}/zones?sector=${sector}&destination=${destinationCountry}`
      );
      const zoneData = zoneRes.data || [];
      const zoneServices = zoneData.map((z) => z.service);

      // 3️⃣ Get Shipper Tariff
      const tariffRes = await axios.get(
        `${server}/shipper-tariff?accountCode=${session?.user?.accountCode}`
      );
      const tariffServices = tariffRes.data || [];

      // 4️⃣ Find common services
      const common = tariffServices.filter((t) =>
        zoneServices.includes(t.service)
      );

      const finalRates = [];

      // 5️⃣ Loop through common services
      for (let srv of common) {
        // find zone details for this service
        const zoneInfo = zoneData.find((z) => z.service === srv.service);
        if (!zoneInfo) continue;

        // fetch ratesheet
        const rateRes = await axios.get(
          `${server}/rate-sheet?service=${srv.service}`
        );
        const rates = rateRes.data;

        // find matching row by chargeable weight
        const matchedRow = rates.find(
          (row) =>
            chargeable >= row.minWeight &&
            chargeable <= row.maxWeight
        );

        if (matchedRow) {
          const zoneRate = matchedRow[zoneInfo.zone];
          if (zoneRate) {
            let price = 0;
            if (matchedRow.type === "B") {
              price = zoneRate * chargeable;
            } else if (matchedRow.type === "S") {
              price = zoneRate;
            }

            finalRates.push({
              service: matchedRow.service,
              network: srv.network,
              type: matchedRow.type,
              grandTotal: price.toFixed(2),
              from: srv.from,   // 👈 from tariff API
              to: srv.to        // 👈 from tariff API
            });

          }
        }
      }

      setServices(finalRates);
      console.log("Final Rates:", finalRates);
    } catch (err) {
      console.error("Error calculating rates:", err);
    }
  };


  // 👉 Reset Button
  const handleReset = () => {
    reset();
    setVolumetricWeight("0.00");
    setChargeableWeight("0.00");
    setServices([]);
  };

  // 👉 Calculate duration (fixed)
  const calculateDuration = (from, to) => {
    if (!from || !to) return "N/A";
    const start = new Date(from);
    const end = new Date(to);
    let diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) diffDays = 1;
    return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;
  };


  return (
    <main className="w-full px-4 bg-[#f9fafb] flex flex-col gap-2">
      <h1 className="font-bold text-2xl text-[#18181B]">Rate Calculator</h1>

      {/* Form Section */}
      <div className="rounded-xl bg-white p-4 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Two Column Layout */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Column 1 */}
            <div className="flex flex-col gap-2 flex-1">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sector
                </label>
                <input
                  type="text"
                  placeholder="Eg. US"
                  {...register("sector")}
                  className="border border-gray-300 rounded-md h-12 px-4 text-sm w-full outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Actual Weight
                </label>
                <div className="relative border border-gray-300 rounded-md">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("actualWeight")}
                    className="w-full py-3 px-4 pr-12 text-sm outline-none rounded-md"
                  />
                  <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-sm text-gray-500 bg-[#F3F7FE] rounded-r-md">
                    Kg
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Note: minimum Chargeable weight is 0.500g.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Shipment Purpose
                </label>
                <select
                  {...register("shipmentPurpose")}
                  className="w-full h-12 px-3 border border-gray-300 rounded-md text-sm outline-none text-gray-400"
                >
                  <option value="Gift">Gift</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Sample">Sample</option>
                </select>
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex justify-between gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Destination Country
                  </label>
                  <input
                    type="text"
                    placeholder="Eg. Canada"
                    {...register("destinationCountry")}
                    className="border border-gray-300 rounded-md h-12 px-4 text-sm w-full outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Destination Zipcode
                  </label>
                  <input
                    type="text"
                    placeholder="Eg. V5K0A5"
                    {...register("destinationZipcode")}
                    className="border border-gray-300 rounded-md h-12 px-4 text-sm w-full outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Dimensions
                </label>
                <div className="flex gap-4">
                  {["length", "width", "height"].map((dim) => (
                    <div
                      key={dim}
                      className="relative w-full border border-gray-300 rounded-md"
                    >
                      <input
                        type="number"
                        placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
                        {...register(dim)}
                        className="w-full py-3 px-2 pr-10 text-sm outline-none rounded-md"
                      />
                      <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-sm text-gray-500 bg-[#F3F7FE] rounded-r-md">
                        cm
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Dimensional weight should greater than 0.50 cm.
                </p>
              </div>

              {/* Weight Result */}
              <div className="flex gap-4 pt-[30px]">
                <div className="bg-yellow-100 text-yellow-800 rounded px-4 py-2 flex items-center text-sm w-full md:w-auto">
                  <strong className="mr-1 font-medium">
                    Volumetric Weight :
                  </strong>
                  {volumetricWeight}kg <span className="ml-2">⚠️</span>
                </div>
                <div className="bg-green-100 text-green-800 rounded px-4 py-2 flex items-center text-sm w-full md:w-auto">
                  <strong className="mr-1 font-medium">
                    Chargeable Weight :
                  </strong>
                  {chargeableWeight}kg <span className="ml-2">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between w-full gap-4">
            <button
              type="submit"
              className="bg-[#EA2147] text-white py-2 px-10 rounded-md w-full"
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="border border-[#EA2147] text-[#EA2147] py-2 px-10 rounded w-full"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      {services.map((service, idx) => (
        <div
          key={idx}
          className={`bg-white border p-3 rounded-[10px] flex justify-between mt-2 ${selectedServiceLocal === service?.service
            ? "border-[var(--primary-color)]"
            : "border-[#E2E8F0]"
            }`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 ">
              <Image
                src="/select-service/bgplane.svg"
                alt="background plane icon"
                width={24}
                height={24}
              />
              <p className="font-semibold">{service?.service}</p>
            </div>

            <div className=" flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Image
                    src="/select-service/clock.svg"
                    alt="Clock Icon"
                    width={20}
                    height={20}
                  />
                  <span className="text-[#71717A] flex font-bold items-center gap-2 ">
                    {calculateDuration(service.from, service.to)}
                  </span>
                </div>

                <span className="text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md p-2.5 text-sm flex items-center font-semibold justify-center w-fit">
                  {service?.network}
                </span>
              </div>
            </div>
          </div>

          <div className=" flex flex-col items-end justify-between">
            <div className="flex flex-col items-end">
              <span className="font-bold text-2xl text-[var(--primary-color)]">
                ₹ {Number(service?.grandTotal || 0).toFixed(2)}
              </span>
              <span className="text-[var(--primary-color)] font-bold text-sm">
                (Incl. GST)
              </span>
            </div>

            <button
              type="button"
              className="bg-[var(--primary-color)] text-white text-sm font-bold rounded-md px-12 py-3.5 "
              onClick={() => setSelectedServiceLocal(service?.service)}
            >
              Book Now
            </button>
          </div>
        </div>
      ))}
    </main>
  );
};

export default Page;
