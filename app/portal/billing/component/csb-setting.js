"use client";
import axios from "axios";
import Image from "next/image";
import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../GlobalContext";
import { useSession } from "next-auth/react";

const CsbSetting = () => {
    const [showModal, setShowModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const accountCode = session?.user?.accountCode;

    const [formData, setFormData] = useState({
        name: "",
        kyc: "",
        iec: "",
        gst: "",
        adCode: "",
        termsOfInvoice: "",
        crnNumber: "",
        mhbsNumber: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    `${server}/portal/csb-setting?accountCode=${accountCode}`
                );
                setAddresses(res.data.data || []);
            } catch (err) {
                console.error("Fetch failed:", err);
            }
        };
        fetchData();
    }, [accountCode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData, accountCode };
            let res;

            if (editingId) {
                res = await axios.put(`${server}/portal/csb-setting?id=${editingId}`, payload);
            } else {
                res = await axios.post(`${server}/portal/csb-setting`, payload);
            }

            const savedData = res.data.data;

            setAddresses((prev) =>
                editingId
                    ? prev.map((a) => (a._id === editingId ? savedData : a))
                    : [...prev, savedData]
            );

            resetForm();
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            kyc: "",
            iec: "",
            gst: "",
            adCode: "",
            termsOfInvoice: "",
            crnNumber: "",
            mhbsNumber: "",
        });
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${server}/portal/csb-setting?id=${id}`);
            setAddresses((prev) => prev.filter((a) => a._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedIds.map((id) =>
                    axios.delete(`${server}/portal/csb-setting?id=${id}`)
                )
            );

            setAddresses((prev) => prev.filter((a) => !selectedIds.includes(a._id)));
            setSelectedIds([]);
        } catch (err) {
            console.error("Bulk delete failed:", err);
        }
    };

    return (
        <div className="flex flex-col">
            {/* HEADER */}
            <h1 className="px-6 font-bold text-2xl">CSB V Settings</h1>

            <div className="flex justify-between px-6 items-center">
                <h3 className="text-[10px] text-[#A0AEC0] font-bold">
                    {addresses.length} record(s) found
                </h3>

                {/* Search + Delete */}
                <div className="flex items-center gap-2 p-2 rounded-md">
                    <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
                        <Image width={20} height={20} src="/search.svg" alt="Search" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="ml-2 bg-transparent outline-none text-gray-700"
                        />
                    </div>

                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedIds.length === 0}
                        className={`flex items-center gap-1 border rounded-md px-4 py-2 text-[#EA1B40] border-[#EA1B40] hover:bg-red-100
              ${selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        Delete ({selectedIds.length})
                    </button>
                </div>
            </div>

            {/* CARDS */}
            <div className="p-6">
                <div className="grid grid-cols-5">

                    {/* ADD NEW CARD */}
                    <div
                        className="w-[260px] h-[190px] border border-[#E2E8F0] rounded-lg 
                 flex justify-center items-center cursor-pointer bg-white"
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        <Image width={60} height={60} src="/plus-red.svg" alt="Add" />
                    </div>

                    {/* DATA CARDS */}
                    {addresses.map((item, index) => (
                        <div
                            key={item._id}
                            className="w-[260px] h-[190px] border border-[#E2E8F0] rounded-lg 
                   p-4 bg-white flex flex-col justify-between"
                        >

                            <div className="flex justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item._id)}
                                        onChange={(e) =>
                                            setSelectedIds((prev) =>
                                                e.target.checked
                                                    ? [...prev, item._id]
                                                    : prev.filter((x) => x !== item._id)
                                            )
                                        }
                                        className="w-[16px] h-[16px]"
                                    />
                                    <h3 className="text-sm font-semibold text-[#EA1B40]">
                                        {item.name}
                                    </h3>
                                </div>

                                <span className="text-[10px] bg-red-100 text-[#EA1B40] px-2 py-1 rounded-md border border-[#EA1B40]">
                                    {item.kyc}
                                </span>
                            </div>

                            <div className="text-[11px] text-gray-700 leading-4 mt-2">
                                <p>IEC: {item.iec}</p>
                                <p>GST: {item.gst || "—"}</p>
                                <p>AD Code: {item.adCode || "—"}</p>
                                <p>CRN: {item.crnNumber || "—"}</p>
                                <p>MHBS: {item.mhbsNumber || "—"}</p>
                            </div>

                            <div className="flex justify-between pt-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="border border-[#EA1B40] text-[#EA1B40] 
                       text-[11px] px-3 py-1 rounded-md"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="border border-[#EA1B40] text-[#EA1B40] 
                       text-[11px] px-3 py-1 rounded-md"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 w-[900px] rounded-lg shadow-lg">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                {editingId ? "Edit CSB V" : "Add CSB V"}
                            </h2>
                            <button
                                className="text-[#EA1B40] text-xl"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries({
                                name: "Exporter Name",
                                kyc: "KYC",
                                iec: "IEC",
                                gst: "GST Number",
                                adCode: "AD Code",
                                crnNumber: "CRN Number",
                                mhbsNumber: "MHBS Number",
                            }).map(([key, label]) => (
                                <input
                                    key={key}
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    placeholder={label}
                                    className="border p-2 rounded-md"
                                />
                            ))}

                            <select
                                name="termsOfInvoice"
                                value={formData.termsOfInvoice}
                                onChange={handleChange}
                                className="border p-2 rounded-md col-span-2"
                            >
                                <option value="">Select Terms</option>
                                <option value="FOB">FOB</option>
                                <option value="CIF">CIF</option>
                                <option value="EXW">EXW</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="border border-[#EA1B40] text-[#EA1B40] px-4 py-2 rounded-md"
                                onClick={resetForm}
                            >
                                Close
                            </button>
                            <button
                                className="bg-[#EA1B40] text-white px-4 py-2 rounded-md"
                                onClick={handleSave}
                            >
                                {editingId ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CsbSetting;
