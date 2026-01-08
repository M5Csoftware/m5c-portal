import React, { useState, useContext, useEffect } from "react";
import { GlobalContext } from "../GlobalContext.js";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { countOpenTickets } from "./Nav.js";
import axios from "axios";
import { useSession } from "next-auth/react";


function RaiseTicket() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const { setTicketRefreshTrigger, raiseTicketWindow, setRaiseTicketWindow, server, updateTicketRemark, setUpdateTicketRemark, selectedTicket, setSelectedTicket } = useContext(GlobalContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [raised, setRaised] = useState(false);
  const { data: session } = useSession();


  const categories = [
    {
      value: "pickup_delivery",
      label: "Pickup and Delivery",
      description: "Pickup/delivery delay/mismatch tracking status, etc.",
    },
    {
      value: "shipment_ndr_and_rto",
      label: "Shipment NDR & RTO",
      description: "NDR reattempts, courier fake attempts, RTO requests",
    },
    {
      value: "shipment_dispute",
      label: "Shipment Dispute",
      description:
        "Issues related to delivered shipment, incorrect weight, etc,.",
    },
    {
      value: "finance",
      label: "Finance",
      description: "Remittance status, wallet management, recharge issues",
    },
    {
      value: "kyc_and_bank_verification",
      label: "KYC & Bank Verification",
      description: "Issues related to KYC and Account verification",
    },
  ];

  const subCategories = {
    pickup_delivery: [
      {
        value: "delay_fwd_del",
        label: "Delay in Forward Delivery",
        description: "",
      },
      {
        value: "delay_rto_del",
        label: "Delay in RTO Delivery",
        description: "",
      },
    ],
    shipment_ndr_and_rto: [
      {
        value: "ndr_attempts",
        label: "NDR Attempts",
        description: "",
      },
      {
        value: "fake_attempts",
        label: "Fake Attempts",
        description: "",
      },
    ],
    shipment_dispute: [
      {
        value: "incorrect_weight",
        label: "Incorrect Weight",
        description: "",
      },
      {
        value: "delivered_issues",
        label: "Delivered Issues",
        description: "",
      },
    ],
    finance: [
      {
        value: "wallet_issue",
        label: "Wallet Issue",
        description: "",
      },
      {
        value: "recharge_issue",
        label: "Recharge Issue",
        description: "",
      },
    ],
    kyc_and_bank_verification: [
      {
        value: "kyc_issue",
        label: "KYC Issue",
        description: "",
      },
      {
        value: "bank_verification_issue",
        label: "Bank Verification Issue",
        description: "",
      },
    ],
  };

  useEffect(() => {
    setSelectedSubCategory(null);
    setValue("subCategory", null);
  }, [selectedCategory, setValue]);


  useEffect(() => {
    if (updateTicketRemark && selectedTicket) {
      setValue("awbNumber", selectedTicket.awbNumber);
      setValue("remarks", selectedTicket.remarks || "");
      setSelectedCategory(
        categories.find(c => c.value === selectedTicket.category) || null
      );
      setSelectedSubCategory(
        subCategories[selectedTicket.category]?.find(s => s.value === selectedTicket.subCategory) || null
      );
    } else {
      reset(); // new ticket
    }
  }, [updateTicketRemark, selectedTicket]);

  const onSubmit = async (data) => {
    const payload = {
      awbNumber: data.awbNumber,
      remarks: data.remarks,
      category: selectedCategory?.value,
      subCategory: selectedSubCategory?.value,
      accountCode: session?.user?.accountCode,
    };

    try {
      if (updateTicketRemark && selectedTicket) {
        // Update existing ticket (PUT)
        const res = await axios.put(`${server}/portal/ticket`, {
          awbNumber: selectedTicket.awbNumber,
          updates: { remarks: data.remarks }
        });
        console.log("Ticket updated:", res.data);
        setUpdateTicketRemark(false);
      } else {
        // Create new ticket (POST)
        const res = await axios.post(`${server}/portal/ticket`, payload);
        console.log("Ticket raised:", res.data);
      }

      setTicketRefreshTrigger(prev => !prev);
      setRaised(true);
      reset();
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setTimeout(() => {
        setRaiseTicketWindow(false);
        setUpdateTicketRemark(false);
        setSelectedTicket(null);
      }, 4000);
      setTimeout(() => setRaised(false), 5000);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to process ticket");
    }
  };


  const CustomDropdown = ({
    options,
    selectedOption,
    onSelect,
    title,
    name,
    disabled,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
      onSelect(option);
      setValue(name, option.value); // Set the value in react-hook-form
      setIsOpen(false);
    };

    return (
      <div className="relative w-full">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`border border-[#979797] rounded-[4px] px-6 py-4 cursor-pointer ${disabled ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
        >
          {selectedOption ? selectedOption.label : `${title}`}
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full shadow-md bg-white rounded-[4px] mt-1">
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className="px-6 py-4 hover:bg-gray-100 cursor-pointer flex flex-col"
              >
                <span className="text-xs">{option.label}</span>
                <p className="text-[8px] text-gray-500">{option.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to check if the form is valid
  const isFormValid = () => {
    return watch("awbNumber") && selectedCategory && selectedSubCategory;
  };

  return (
    <div className="relative">
      <div
        className={`transition-all duration-500 ease-in-out ${raiseTicketWindow ? "max-w-[600px]" : "max-w-0 opacity-0"
          }`}
      >
        <div className="flex justify-between p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl text-[#18181B]">
              {updateTicketRemark ? "Update Ticket Remark" : "Raise a Ticket"}
            </h2>
            <p className="text-xs text-[#71717A]">
              {updateTicketRemark
                ? "Update the remark for your ticket"
                : "Raise a ticket by entering the following details"}
            </p>

          </div>
          <button className="flex" onClick={() => {
            setRaiseTicketWindow(false);
            setUpdateTicketRemark(false);
          }}>
            <Image
              src={`/customer-support/close-button.svg`}
              alt="close window"
              width={24}
              height={24}
            />
          </button>
        </div>
        <Image
          src={`/customer-support/window-line.svg`}
          alt="close window"
          width={600}
          height={0}
        />
        <div className="p-6">
          <form className="h-[80vh]" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex h-full flex-col justify-between">
              <div className="text-xs w-full flex flex-col gap-6">
                <div>
                  <input
                    {...register("awbNumber")}
                    placeholder="Enter AWB Number"
                    className="w-full border border-[#979797] rounded-[4px] px-6 py-4"
                  />
                </div>
                <div className="flex justify-between gap-6">
                  <div className="w-full">
                    <CustomDropdown
                      options={categories}
                      selectedOption={selectedCategory}
                      onSelect={(option) => {
                        setSelectedCategory(option);
                        setValue("category", option.value); // Update react-hook-form value
                      }}
                      title="Select Category"
                      name="category"
                    />
                    {errors.category && (
                      <span className="text-red-600">
                        {errors.category.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full">
                    <CustomDropdown
                      options={
                        selectedCategory
                          ? subCategories[selectedCategory.value] || []
                          : []
                      }
                      selectedOption={selectedSubCategory}
                      onSelect={(option) => {
                        setSelectedSubCategory(option);
                        setValue("subCategory", option.value); // Update react-hook-form value
                      }}
                      title="Select Sub-Category"
                      name="subCategory"
                      disabled={!selectedCategory} // Disable if no category is selected
                    />
                    {errors.subCategory && (
                      <span className="text-red-600">
                        {errors.subCategory.message}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    {...register("remarks")}
                    placeholder="Remarks"
                    className="w-full border border-[#979797] rounded-[4px] px-6 py-4"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full text-white text-sm rounded-[4px] px-12 py-[14px] transition-all duration-500 ${updateTicketRemark
                    ? "bg-[var(--primary-color)]"
                    : isFormValid()
                      ? "bg-[var(--primary-color)]"
                      : "bg-[#979797]"
                    }`}
                  disabled={!updateTicketRemark && !isFormValid()} // bypass validation if update mode
                >
                  {updateTicketRemark ? "Update Remarks" : "Raise Ticket"}
                </button>

              </div>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`transition-all absolute left-0 right-0 top-0 bottom-0  bg-white duration-500 ease-in-out h-[100vh] ${raised ? "max-w-[600px]  z-30" : "max-w-0 hidden -z-10"
          }`}
      >
        <div className="w-[600px] flex flex-col h-full items-center justify-center gap-6">
          <Image
            className={`${raised && "animate-breathing "}`}
            src={`/customer-support/open.svg`}
            alt=""
            width={172}
            height={172}
          />
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl text-[var(--primary-color)]">
              Ticket raised successfully
            </h2>
            <p className="text-base text-[#71717A]">
              Your ticket has been successfully raised
            </p>
            <p className="text-base text-[#71717A]">
              You have {countOpenTickets()} open ticket in total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RaiseTicket;
