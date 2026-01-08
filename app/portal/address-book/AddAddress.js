import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { GlobalContext } from "../GlobalContext.js";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import KycUploadModal from "./KycUploadModal";


const AddAddress = () => {
  const { adding, setAdding, server } = useContext(GlobalContext);

  // ✅ set defaultValues so addressType defaults to Consignor
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      addressType: "Consignor",
    },
  });

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("Consignor");
  const { data: session } = useSession();
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycUploaded, setKycUploaded] = useState(false);



  const fetchLocationByPincode = async (pincode) => {
    setLoading(true);
    try {
      const apiKey = "839c0840-9051-11ef-a2c7-c5f8467f3319";
      const response = await axios.get(
        `https://app.zipcodebase.com/api/v1/search?apikey=${apiKey}&codes=${pincode}`
      );

      const locationData = response.data.results[pincode];

      if (locationData && locationData.length > 0) {
        const { province, state, country_code, postal_code } = locationData[0];
        setValue("city", province || "");
        setValue("state", state || "");
        setValue("country", country_code || "");
        setValue(
          "addressLine1",
          province + "," + state + "," + country_code + "," + postal_code
        );
      } else {
        alert("Invalid Pincode or no data available.");
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      accountCode: session?.user?.accountCode,
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.post(
        `${server}/portal/address-book`,
        payload
      );
      console.log("Address saved:", response.data);
      alert("Address Saved");
      reset();
      setSelected("Consignor"); // reset UI selection
      setAdding(false);
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  return (
    <div>
      <div>
        <button
          onClick={() => {
            setAdding(!adding);
          }}
        >
          <div className="flex items-center">
            <Image
              width={21}
              height={21}
              src={"/back-arrow.svg"}
              alt="back arrow"
            />
            <span className="text-xs font-medium text-[var(--primary-color)]">
              BACK TO ADDRESS BOOK
            </span>
          </div>
        </button>
        <Image
          className="-translate-x-4"
          layout="responsive"
          width={1000}
          height={24}
          src={"/line-address.svg"}
          alt="Line"
        />
      </div>
      <div className="text-xs">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 add-new-address"
        >
          <div className="py-4 gap-2 flex flex-col items-start">
            {/* Address Type Toggle */}
            <div className="flex bg-white border border-[#979797] rounded-full h-11 overflow-hidden relative w-[326px] mb-4">
              <label
                htmlFor="consignor"
                className={`relative z-10 px-6 py-2 cursor-pointer font-medium transition-all w-[163px] flex items-center justify-center ${selected === "Consignor" ? "text-white" : "text-[#979797]"
                  }`}
              >
                <input
                  type="radio"
                  id="consignor"
                  value="Consignor"
                  {...register("addressType")}
                  className="hidden"
                  checked={selected === "Consignor"}
                  onChange={() => {
                    setSelected("Consignor");
                    setValue("addressType", "Consignor"); // ✅ sync with form
                  }}
                />
                Consignor
                {selected === "Consignor" && (
                  <div className="absolute inset-0 bg-[#ea384c] rounded-full z-[-1]"></div>
                )}
              </label>

              <label
                htmlFor="consignee"
                className={`relative z-10 px-6 py-2 cursor-pointer font-medium transition-all w-[163px] flex items-center justify-center ${selected === "Consignee" ? "text-white" : "text-[#979797]"
                  }`}
              >
                <input
                  type="radio"
                  id="consignee"
                  value="Consignee"
                  {...register("addressType")}
                  className="hidden"
                  checked={selected === "Consignee"}
                  onChange={() => {
                    setSelected("Consignee");
                    setValue("addressType", "Consignee"); // ✅ sync with form
                  }}
                />
                Consignee
                {selected === "Consignee" && (
                  <div className="absolute inset-0 bg-[#ea384c] rounded-full z-[-1]"></div>
                )}
              </label>
            </div>

            {/* Name + KYC */}
            <div className="w-full flex gap-6">
              <div className="w-1/2">
                <input
                  {...register("fullName")}
                  placeholder="Full Name"
                  className="w-full border border-[#979797] outline-none mb-2 rounded-md h-12 px-6 py-4"
                />
              </div>

              <div className="w-1/2 flex items-center justify-betwee gap-2">
                <div className="w-full">
                  <input
                    {...register("kycType")}
                    placeholder="KYC Type"
                    disabled={selected === "Consignee"}
                    className={`w-full border border-[#979797] outline-none mb-2 rounded-md h-12 px-6 py-4 
    ${selected === "Consignee" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                  />

                </div>

                <div className="w-full">
                  <input
                    {...register("kycNumber")}
                    placeholder="KYC Number"
                    disabled={selected === "Consignee"}
                    className={`w-full border border-[#979797] outline-none mb-2 rounded-md h-12 px-6 py-4 
    ${selected === "Consignee" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                  />

                </div>

                <div className="w-full">
                  <input type="hidden" {...register("kycFrontUrl")} />
                  <input type="hidden" {...register("kycBackUrl")} />

                  <button
                    type="button"
                    disabled={selected === "Consignee"}
                    onClick={() => {
                      if (selected !== "Consignee") setShowKycModal(true);
                    }}
                    className={`cursor-pointer border border-[var(--primary-color)] text-[var(--primary-color)] rounded-md 
    h-12 px-5 py-3 w-full font-bold flex items-center justify-center gap-2 mb-2
    ${selected === "Consignee" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="rounded-lg shadow-sm p-1">
                      <Image
                        src={`/create-shipment/upload-kyc.svg`}
                        alt="Upload Icon"
                        width={13}
                        height={14}
                      />
                    </div>
                    <span>{kycUploaded ? "Uploaded" : "Upload KYC Photo"}</span>
                  </button>


                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="flex w-full gap-6">
              <input
                {...register("email")}
                placeholder="Email"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
              />
              <input
                {...register("phoneNumber")}
                placeholder="Phone Number"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
              />
            </div>

            {/* Address Lines */}
            <input
              {...register("addressLine1")}
              placeholder="Address Line 1"
              className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
            />
            <input
              {...register("addressLine2")}
              placeholder="Address Line 2 (optional)"
              className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
            />

            {/* Country + Pincode */}
            <div className="flex gap-6 items-center w-full">
              <input
                {...register("country")}
                placeholder="Country"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
              />
              <input
                {...register("pincode")}
                placeholder="Pincode"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
                onBlur={(e) => fetchLocationByPincode(e.target.value)}
              />
            </div>
            {loading && <p>Fetching location...</p>}

            {/* City + State */}
            <div className="flex gap-6 items-center w-full">
              <input
                {...register("city")}
                placeholder="City"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
              />
              <input
                {...register("state")}
                placeholder="State"
                className="w-full border border-[#979797] block outline-none mb-2 rounded-md h-12 px-6 py-4"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[var(--primary-color)] text-white text-xs font-bold py-[13.5px] rounded-md w-[326px]"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
      {showKycModal && (
        <KycUploadModal
          accountCode={session?.user?.accountCode}
          onClose={() => setShowKycModal(false)}
          onUploaded={({ kycFrontUrl, kycBackUrl }) => {
            setValue("kycFrontUrl", kycFrontUrl);
            setValue("kycBackUrl", kycBackUrl);
            setKycUploaded(true);
          }}
        />

      )}

    </div>
  );
};

export default AddAddress;
