"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GlobalContext } from "../GlobalContext";
import { useForm } from "react-hook-form";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";

function Dispatch() {
    const { 
        setDisptchedOpen, 
        bgPos, 
        setBgPos,
        selectedAwbs,
        setSelectedAwbs
    } = useContext(GlobalContext);
    const [pickupAddresses, setPickupAddresses] = useState([]);

    const { register, setValue, watch, formState: { errors } } = useForm();

    return (
        <>
            <div className="flex flex-col justify-between w-[40vw] gap-4 text-[#18181B] bg-white rounded-xl shadow-xl px-10 py-9 relative">

                {/* Switch */}
                <ManifestSwitch bgPos={bgPos} setBgPos={setBgPos} />

                {/* DROP / PICKUP BLOCK */}
                <div className="flex flex-col gap-2">

                    {bgPos ? (
                        <DropAtHub />
                    ) : (
                        <RequestPickup
                            register={register}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            pickupAddresses={pickupAddresses}
                            setPickupAddresses={setPickupAddresses}
                        />
                    )}

                    {/* INFO BOX */}
                    <div className="bg-[#FBF3E0] text-xs text-[#C3B600] rounded-md border border-[#F9F06D] 
                                    flex items-center pl-12 py-2 my-2 gap-3">
                        <Image src="/i_icon.svg" alt="Important information" height={20} width={20} />
                        <p>
                            2-3 working day. Please be informed Pick Up details will be shared on WhatsApp.
                        </p>
                    </div>
                </div>

                {/* Show selected AWBs count */}
                {selectedAwbs && selectedAwbs.length > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                        Selected {selectedAwbs.length} shipment(s) for dispatch
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <ManifestActionButtons
                    setDisptchedOpen={setDisptchedOpen}
                    ctaButtonLabel={bgPos ? "Dispatch" : "Send Pickup Request"}
                />
            </div>
        </>
    );
}

export default Dispatch;

function RequestPickup({ pickupAddresses, setPickupAddresses }) {
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const { addressData, setAddressData, server, selectedBranch, setSelectedBranch } = useContext(GlobalContext);
    const { data: session } = useSession();
    const accountCode = session?.user?.accountCode;

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get(
                    `${server}/portal/manage-pickup/getAddress?accountCode=${accountCode}`
                );

                console.log("pickup address", response);
                setPickupAddresses(response.data.data || response.data);
            } catch (error) {
                console.error("Error fetching addresses:", error);
            }
        };
        fetchAddresses();
    }, [accountCode, server, setPickupAddresses]);

    const handleChange = (e) => {
        setAddressData({ ...addressData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col gap-3 text-xs">
            <BranchDropdown
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
            />

            <div className="relative w-full">
                <div
                    className="w-full border border-[#979797] rounded-md h-12 px-6 py-3 flex justify-between items-center cursor-pointer bg-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedAddress
                        ? `${selectedAddress.city} , ${selectedAddress.state}, ${selectedAddress.pincode}`
                        : "Select Address"}
                    <span className="text-gray-600">{isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md z-10 max-h-60 overflow-y-auto">
                        {pickupAddresses.map((address, index) => (
                            <li
                                key={index}
                                onClick={() => {
                                    setSelectedAddress(address);
                                    setAddressData({
                                        addressLine1:
                                            address.city +
                                            ", " +
                                            address.state +
                                            ", " +
                                            address.pincode,
                                        addressLine2:
                                            address.city +
                                            ", " +
                                            address.state +
                                            ", " +
                                            address.pincode,
                                        city: address.city,
                                        state: address.state,
                                        pincode: address.pincode,
                                    });
                                    setIsOpen(false);
                                }}
                                className="cursor-pointer p-4 hover:bg-gray-100"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-red-600 font-semibold">
                                        <span className="font-medium text-base">
                                            Office #{index + 1}
                                        </span>
                                        <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded-md">
                                            {address.pincode}
                                        </span>
                                    </div>
                                    <p className="text-[#979797] text-sm">
                                        {address.addressLine1} {address.addressLine2},{" "}
                                        {address.city}, {address.state}, {address.pincode}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <InputField
                    label="Address Line 1"
                    name="addressLine1"
                    value={addressData.addressLine1}
                    handleChange={handleChange}
                />
                <div className="flex gap-9">
                    <InputField
                        label="Address Line 2"
                        name="addressLine2"
                        value={addressData.addressLine2}
                        handleChange={handleChange}
                        half
                    />
                    <InputField
                        label="City"
                        name="city"
                        value={addressData.city}
                        handleChange={handleChange}
                        half
                    />
                </div>
                <div className="flex gap-9">
                    <InputField
                        label="State"
                        name="state"
                        value={addressData.state}
                        handleChange={handleChange}
                        half
                    />
                    <InputField
                        label="Pincode"
                        name="pincode"
                        value={addressData.pincode}
                        handleChange={handleChange}
                        half
                    />
                </div>
            </div>
        </div>
    );
}

const InputField = ({ label, name, value, handleChange, half }) => (
    <div className={`flex flex-col ${half ? "w-1/2" : ""}`}>
        <label htmlFor={name} className="font-semibold text-xs mb-1">
            {label}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={handleChange}
            className="border border-[#979797] outline-none rounded-md h-12 px-6 py-4 w-full"
            placeholder={label}
        />
    </div>
);

function DropAtHub() {
    const { selectedBranch, setSelectedBranch } = useContext(GlobalContext);

    return (
        <div className="flex flex-col gap-3">
            <BranchDropdown
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
            />

            <h2 className="text-[#16110D] font-bold">Hub Details</h2>
            <div className="flex flex-col gap-2 font-semibold">
                <h3 className="text-[#18181B]">Address Details</h3>
                <p className="flex flex-col text-sm text-[#5B5E71]">
                    <span>{selectedBranch?.companyName}</span>
                    <span>{selectedBranch?.city}</span>
                    <span>{selectedBranch?.state}</span>
                    <span>{selectedBranch?.pincode}</span>
                </p>
                <Link
                    className="text-sm text-[var(--primary-color)] flex items-center gap-2"
                    target="_blank"
                    href={`https://www.google.com/maps/place/Bamnoli,+Sector+28+Dwarka,+Dwarka,+Delhi,+110061`}
                >
                    <Image src={`/map.svg`} height={24} width={24} alt="Map location icon" />
                    <span>View on Map</span>
                </Link>
            </div>
            <div className="flex flex-col gap-2 font-semibold">
                <h3 className="text-[#18181B]">Contact Details</h3>
                <p className="flex flex-col text-sm text-[#5B5E71]">
                    <span>{selectedBranch?.managerName}</span>
                    <span>{selectedBranch?.telephone}</span>
                </p>
            </div>
        </div>
    );
}

const ManifestActionButtons = ({ setDisptchedOpen, ctaButtonLabel }) => {
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const {
        addressData,
        setAddressData,
        setPickupAddresses,
        bgPos,
        selectedAwbs,
        setDisptchedSuccessModal,
        setManifestNumber,
        selectedBranch,
        selectedManifest,
        setSelectedAwbs // Add this to clear selected AWBs after dispatch
    } = useContext(GlobalContext);

    const handleSubmitManifest = async () => {
        if (!selectedAwbs || selectedAwbs.length === 0) {
            alert("Please select at least one shipment (AWB)");
            return;
        }

        const payload = {
            manifestNumber: selectedManifest,
            awbNumbers: selectedAwbs,
            pickupType: bgPos ? "drop" : "pending",
            pickupAddress: bgPos ? selectedBranch : addressData,
            accountCode: session?.user?.accountCode,
            status: bgPos ? "dispatched" : "pending"
        };

        console.log("Dispatching manifest with payload:", payload);

        try {
            // Always use PUT for dispatching (since we're updating)
            const res = await axios.put(
                `${server}/portal/manifest`,
                payload
            );
            
            setManifestNumber(res.data.manifest?.manifestNumber || selectedManifest);
            console.log("Manifest dispatched:", res.data);
            setDisptchedSuccessModal(true);
            setDisptchedOpen(false);
            
            // Clear selected AWBs after successful dispatch
            if (setSelectedAwbs) {
                setSelectedAwbs([]);
            }
        } catch (err) {
            console.error("Manifest dispatch failed:", err.response?.data || err.message);
            alert(`Failed to dispatch manifest: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleAddAddress = () => {
        if (
            addressData.addressLine2 &&
            addressData.city &&
            addressData.state &&
            addressData.pincode
        ) {
            setPickupAddresses((prev) => [...prev, addressData]);
            setAddressData({
                addressLine2: "",
                city: "",
                state: "",
                pincode: "",
                addressLine1: "",
            });
        }
    };

    return (
        <div className="flex w-full items-center justify-between gap-8 text-sm">
            <button
                className="border border-[var(--primary-color)] w-full text-[var(--primary-color)] font-semibold rounded-md px-12 py-3"
                onClick={() => setDisptchedOpen(false)}
            >
                Cancel
            </button>
            <button
                type="button"
                className="bg-[var(--primary-color)] w-full text-white font-semibold rounded-md px-12 py-3"
                onClick={() => {
                    if (bgPos) {
                        handleSubmitManifest();
                    } else {
                        handleAddAddress();
                        handleSubmitManifest();
                    }
                }}
                disabled={!selectedAwbs || selectedAwbs.length === 0}
            >
                {ctaButtonLabel}
            </button>
        </div>
    );
};

const ManifestSwitch = ({ bgPos, setBgPos }) => (
    <div className="flex items-center border border-[#979797] rounded-lg p-0.5 relative overflow-hidden mt-2">
        <div
            className={`transition-transform ${bgPos ? "translate-x-[98.5%]" : ""
                } bg-[var(--primary-color)] w-1/2 h-11 absolute rounded-lg -z-0`}
        ></div>
        <div
            onClick={() => setBgPos(false)}
            className={`flex items-center justify-center cursor-pointer w-1/2 h-11 text-center rounded-lg ${bgPos ? "text-[#979797]" : "text-white font-bold"
                } text-xs z-0 transition-colors`}
        >
            Request Pickup
        </div>
        <div
            onClick={() => setBgPos(true)}
            className={`flex items-center justify-center cursor-pointer w-1/2 h-11 text-center rounded-lg ${bgPos ? "text-white font-bold" : "text-[#979797]"
                } text-xs z-0 transition-colors`}
        >
            Drop at Hub
        </div>
    </div>
);

export const DisptchedSuccessModal = ({ manifestNumber, onClose }) => {
    const modalRef = useRef();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(manifestNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-lg text-center px-10 py-9 w-[622px] relative border-2 border-green-700 m-10"
            >
                <Image
                    src="/ManifestSuccess.svg"
                    alt="Manifest creation success illustration"
                    width={350}
                    height={350}
                    className="mx-auto"
                />

                <div className="flex flex-row items-center justify-center gap-3 mt-4">
                    <Image
                        src="/success-icon.svg"
                        alt="Success checkmark icon"
                        width={30}
                        height={30}
                        className="mb-2"
                    />
                    <h2 className="text-green-600 text-2xl font-semibold mb-2">
                        Manifest Dispatched
                    </h2>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <p className="text-xl font-medium">
                        Manifest Number: <span className="font-bold">{manifestNumber}</span>
                    </p>
                    <button onClick={handleCopy} title="Copy Manifest Number">
                        <Image
                            src="/solar_copy-linear.svg"
                            alt="Copy to clipboard"
                            width={20}
                            height={20}
                            className="mt-1"
                        />
                    </button>
                    {copied && (
                        <span className="text-green-500 text-xs font-medium mt-1">
                            Copied!
                        </span>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-center bg-yellow-50 px-4 py-2 rounded-md border border-yellow-400">
                    <Image src="/i_icon.svg" alt="Information icon" width={24} height={24} />
                    <div className="text-yellow-700 text-sm pl-4">
                        Your pickup is scheduled within the next 2 to 3 working days.
                    </div>
                </div>

                <div className="mt-6">
                    <button 
                        onClick={onClose}
                        className="bg-[var(--primary-color)] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
                    >
                        Back to Shipments Page
                    </button>
                </div>
            </div>
        </div>
    );
};

const BranchDropdown = ({ selectedBranch, setSelectedBranch }) => {
    const { server, addressData, setAddressData } = useContext(GlobalContext);

    const [branches, setBranches] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get(`${server}/branch-master`);
                const list = res.data;
                setBranches(list);
            } catch (err) {
                console.error("Error fetching branches:", err);
            }
        };
        fetchBranches();
    }, [server]);

    const handleSelect = (branch) => {
        setSelectedBranch(branch);
        setAddressData({
            ...addressData,
            branchCode: branch.code,
            companyName: branch.companyName,
        });
        setOpen(false);
    };

    return (
        <div className="relative w-full text-xs">
            <div className="font-semibold py-1">Branch Code</div>
            <div
                className="w-full border border-[#979797] rounded-md h-12 px-6 py-3 flex justify-between items-center cursor-pointer bg-white"
                onClick={() => setOpen(!open)}
            >
                {selectedBranch ? selectedBranch.code : "Select Branch"}
                <span className="text-gray-600">{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md z-10 max-h-60 overflow-y-auto">
                    {branches.map((branch, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(branch)}
                            className="cursor-pointer p-4 hover:bg-gray-100"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-base">{branch.branchName}</span>
                                <span className="text-xs text-[#979797]">
                                    {branch.code}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};