import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useFormData } from "./FormDataContext";

const SelectService = ({
  step,
  onPrev,
  onNext,
  filteredServices,
  chargeableWt,
  selectedServiceLocal,
  setSelectedServiceLocal,
  setValue,
  watch,
  destination,
  destinationFlag,
  trigger,
  register,
  errors,
}) => {

  const { formData } = useFormData();

  useEffect(() => {
    setValue("service", selectedServiceLocal);
  }, [selectedServiceLocal, setValue]);


  useEffect(() => {
    if (!formData) return;

    // Prefill weight
    if (formData.chargeableWt) {
      setValue("chargeableWt", formData.chargeableWt);
    }

    // Prefill service
    if (formData.service) {
      setSelectedServiceLocal(formData.service);
      setValue("service", formData.service);
    }
  }, [formData]);

  useEffect(() => {
    register("service", {
      required: "Please select a service",
    });
  }, [register]);

  const handleNext = async () => {
    const isValid = await trigger(["service"]);
    if (!isValid) return;
    onNext();
  };


  return (
    <div className="bg-white rounded-3xl p-10 max-w-full">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 5 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/5.svg"
            alt="step 1"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 5 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="step 1"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">Service Selection</h2>
      </div>

      <div
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${step === 5 ? `max-h-[10000px]` : "max-h-0"
          }`}
      >
        <div className="flex items-center gap-8 px-2 py-6  justify-between w-full">
          {/* Left Flag (India) */}
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/flags/india.svg"
              alt="India Flag"
              width={96}
              height={68}
            />
            <p className="text-xl text-[#979797] font-semibold">India</p>
          </div>

          <div className="relative flex items-center  w-full ">
            <div className="border-2  w-full border-dashed absolute -top-3"></div>
            {/* Plane Icon in the Middle */}
            <div className="absolute left-1/2 flex flex-col items-center gap-2 -top-7">
              <Image
                src="/select-service/plane.svg"
                alt="Plane Icon"
                width={40}
                height={40}
              />
              {/* Weight Label below the Plane */}
              <div className="">
                <p className="text-[#979797] text-sm text-center ">
                  {chargeableWt}
                </p>
                <p className="text-gray-400 text-[10px] text-center">
                  Chargeable Weight
                </p>
              </div>
            </div>
          </div>

          {/* Right Flag (Canada) */}
          <div className="flex flex-col items-center gap-3">
            <Image
              src={`/flags/${destinationFlag}.svg`}
              alt={`${destination} Flag`}
              width={96}
              height={68}
            />
            <p className="text-xl text-nowrap text-[#979797] font-semibold">{destination}</p>
          </div>
        </div>

        <div className="text-xs">
          <div className="flex flex-col gap-4 px-2  ">
            {filteredServices.map((service, idx) => (
              <div
                key={idx}
                className={`bg-[#F8F9FA] border border-[#E2E8F0] p-5 rounded-[10px] flex justify-between  ${selectedServiceLocal === service.service
                  ? "border-[var(--primary-color)]"
                  : "border-[#E2E8F0]"
                  }`}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 ">
                    <div className="w-6 h-6">
                      <Image
                        src="/select-service/bgplane.svg"
                        alt="background plane icon"
                        width={24}
                        height={24}
                      />
                    </div>
                    <p className="font-semibold">{service.service}</p>
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
                          {/* {service.duration} */} 10-12 Days
                        </span>
                      </div>

                      <span className="text-[var(--primary-color)] border border-[var(--primary-color)] rounded-md p-2.5 text-sm flex items-center font-semibold justify-center w-fit">
                        {service.shipper}
                      </span>
                    </div>
                    {service.previousBooked && (
                      <div className="border rounded-sm  bg-[#EAFBF0] text-[#71717A] flex items-center pl-1 gap-2 text-xs">
                        <Image
                          src="/select-service/think.svg"
                          alt="Clock Icon"
                          width={14}
                          height={14}
                        />
                        <p>Previously booked by you</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className=" flex flex-col items-end justify-between">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-2xl text-[var(--primary-color)]">
                      ₹ {Number(service.grandTotal).toFixed(2)}
                    </span>
                    <span className="text-[var(--primary-color)] font-bold text-sm">
                      (Incl. GST)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="bg-[var(--primary-color)] text-white text-sm font-bold rounded-md px-12 py-3.5 "
                    onClick={() => {
                      setSelectedServiceLocal(service.service);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
            {errors.service && (
              <p className="text-red-600 text-sm px-2 mt-2">
                {errors.service.message}
              </p>
            )}

          </div>

          <div className="flex justify-end mt-6 mr-2">
            <div className="flex gap-4">
              <button
                className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3"
                type="button"
                onClick={onPrev}
              >
                Back
              </button>
              <button
                className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 disabled:opacity-50"
                type="button"
                disabled={!selectedServiceLocal}
                onClick={handleNext}
              >
                Next
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectService;
