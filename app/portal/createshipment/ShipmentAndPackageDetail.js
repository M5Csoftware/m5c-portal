import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import Image from "next/image";
import { TableWithCTA } from "@/app/components/Table";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import { useFormData } from "./FormDataContext";

const ShipmentAndPackageDetail = ({
  register,
  onNext,
  onPrev,
  watch,
  setValue,
  step,
  totalActualWt,
  setTotalActualWt,
  totalVolumetricWt,
  setTotalVolumetricWt,
}) => {
  const selectedGoodstype = watch("goodstype", "Non-Document");
  const [boxCount, setBoxCount] = useState(1);
  const [selectedBox, setSelectedBox] = useState(1);
  const [tables, setTables] = useState({ 1: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [exportersDB, setExportersDB] = useState([]);
  const [exportersDBRef, setExportersDBRef] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const { server } = useContext(GlobalContext);
  const menuRef = useRef(null);
  const { data: session } = useSession();
  const accountCode = session?.user?.accountCode;

  const { formData } = useFormData();

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: "",
    message: "",
    onYes: null,
  });

  const openConfirm = ({ title, message, onYes }) => {
    setConfirmModal({
      open: true,
      title,
      message,
      onYes,
    });
  };

  const closeConfirm = () => {
    setConfirmModal({
      open: false,
      title: "",
      message: "",
      onYes: null,
    });
  };


  useEffect(() => {
    if (!formData || !formData.shipmentAndPackageDetails) return;

    console.log("Loading package data:", formData);

    const boxKeys = Object.keys(formData.shipmentAndPackageDetails);
    setBoxCount(boxKeys.length);
    setSelectedBox(1);

    setTables(formData.shipmentAndPackageDetails);

    if (formData.boxes) {
      setBoxes(formData.boxes);
    }

    if (formData.totalActualWt) setTotalActualWt(formData.totalActualWt);
    if (formData.totalVolWt) setTotalVolumetricWt(formData.totalVolWt);

    Object.keys(formData).forEach((key) => {
      setValue(key, formData[key]);
    });
  }, [formData]);

  const exportersOptions = exportersDB.map((exp) => ({
    label: exp.name,
    value: exp.name,
    extra: `KYC: ${exp.kyc} | IEC: ${exp.iec} | GST: ${exp.gst} | AD: ${exp.adCode}`,
  }));

  const termsOptions = [
    { label: "CIF", value: "CIF" },
    { label: "FOB", value: "FOB" },
  ];

  useEffect(() => {
    async function fetchExporters() {
      try {
        const res = await axios.get(`${server}/portal/csb-setting?accountCode=${accountCode}`);
        console.log(res.data.data);
        setExportersDB(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch exporters", err);
      }
    }
    fetchExporters();
  }, [accountCode, exportersDBRef]);

  useEffect(() => {
    const selectedName = watch("exporter");
    if (!selectedName) return;

    const selectedExp = exportersDB.find((e) => e.name === selectedName);
    if (!selectedExp) return;

    setValue("kycNumber", selectedExp.kyc || "");
    setValue("iec", selectedExp.iec || "");
    setValue("gstNumber", selectedExp.gst || "");
    setValue("adCode", selectedExp.adCode || "");
    setValue("termsOfInvoice", selectedExp.termsOfInvoice || "");
    setValue("crnNumber", selectedExp.crnNumber || "");
    setValue("mhbsNumber", selectedExp.mhbsNumber || "");
    setValue("exportThroughEcommerce", selectedExp.exportThroughEcommerce || false);
    setValue("meisScheme", selectedExp.meisScheme || false);

  }, [watch("exporter"), exportersDB]);

  const handleAddExporter = async () => {
    const name = watch("exporter");
    const kyc = watch("kycNumber");
    const iec = watch("iec");
    const gst = watch("gstNumber");
    const adCode = watch("adCode");
    const termsOfInvoice = watch("termsOfInvoice");
    const crnNumber = watch("crnNumber");
    const mhbsNumber = watch("mhbsNumber");
    const exportThroughEcommerce = watch("exportThroughEcommerce");
    const meisScheme = watch("meisScheme");

    if (!name || !kyc || !iec) {
      openConfirm({
        title: "Validation Error",
        message: "Name, KYC & IEC are required!",
        onYes: closeConfirm,
      });
      return;
    }

    const newExporter = {
      name,
      kyc,
      iec,
      gst,
      adCode,
      termsOfInvoice,
      crnNumber,
      mhbsNumber,
      accountCode,
      exportThroughEcommerce,
      meisScheme,
    };

    console.log("newExporterData", newExporter);

    try {
      const res = await axios.post(`${server}/portal/csb-setting`, newExporter);

      console.log(res.data);
      openConfirm({
        title: "Success",
        message: "Exporter saved successfully!",
        onYes: closeConfirm,
      });

      if (res.data) {
        setExportersDBRef(!exportersDBRef);

        setValue("kycNumber", "");
        setValue("iec", "");
        setValue("gstNumber", "");
        setValue("adCode", "");
        setValue("termsOfInvoice", "");
        setValue("crnNumber", "");
        setValue("mhbsNumber", "");
        setValue("exportThroughEcommerce", false);
        setValue("meisScheme", false);
      }

    } catch (err) {
      console.error("Failed to add exporter:", err);
      openConfirm({
        title: "Error",
        message: err?.response?.data?.error || "Failed to add exporter",
        onYes: closeConfirm,
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [boxes, setBoxes] = useState([
    {
      volumetricWeight: 0,
      totalWeight: 0,
      dimensionSummary: "",
      context: "",
      hsnNo: "",
      qty: 0,
      rate: 0,
      amount: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
  ]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const totalWt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.totalWeight || 0),
      0
    );
    setTotalActualWt(totalWt);
    setValue("totalActualWt", totalWt);
    const totalVolWt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.volumetricWeight || 0),
      0
    );
    setTotalVolumetricWt(totalVolWt);
    setValue("totalVolWt", totalVolWt);
    const totalAmt = boxes.reduce(
      (sum, box) => sum + parseFloat(box.amount || 0),
      0
    );
    setValue("totalInvoiceValue", totalAmt);
    setValue("boxes", boxes);
  }, [boxes, setTotalActualWt, setTotalVolumetricWt, setValue]);

  const calculateVolumetricWeight = (box) => {
    const length = parseFloat(box.length) || 0;
    const width = parseFloat(box.width) || 0;
    const height = parseFloat(box.height) || 0;

    if (length > 0 && width > 0 && height > 0) {
      return ((length * width * height) / 5000).toFixed(2);
    }
    return 0;
  };

  const calculateTotalWeight = (box) => {
    const weight = parseFloat(box.weight);
    return !isNaN(weight) ? weight.toFixed(2) : "0.00";
  };

  const calculateDimensionSummary = (box) => {
    const length = box.length || 0;
    const width = box.width || 0;
    const height = box.height || 0;
    return `${length} x ${width} x ${height} cm`;
  };

  const ResetInputs = () => {
    const resetBox = {
      volumetricWeight: 0,
      totalWeight: 0,
      dimensionSummary: "",
      context: "",
      hsnNo: "",
      qty: 0,
      rate: 0,
      amount: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    };

    setBoxes([resetBox]);
    setTotalAmount(0);

    setValue("weight", 0);
    setValue("length", 0);
    setValue("width", 0);
    setValue("height", 0);
  };

  useEffect(() => {
    if (tables[selectedBox]) {
      const invoiceValue = tables[selectedBox].reduce(
        (total, item) => total + (parseFloat(item.amount) || 0),
        0
      );
      setTotalAmount(invoiceValue);
    }
  }, [selectedBox, tables]);

  useEffect(() => {
    setValue("shipmentAndPackageDetails", tables);
  }, [tables, setValue]);

  const handleInputChange = (index, field, value) => {
    const newBoxes = [...boxes];
    newBoxes[index][field] = value;

    if (field === "qty" || field === "rate") {
      newBoxes[index].amount = (parseFloat(newBoxes[index].qty) || 0) * (parseFloat(newBoxes[index].rate) || 0);
    }

    newBoxes[index].volumetricWeight = calculateVolumetricWeight(
      newBoxes[index]
    );
    newBoxes[index].totalWeight = calculateTotalWeight(newBoxes[index]);
    newBoxes[index].dimensionSummary = calculateDimensionSummary(
      newBoxes[index]
    );

    setBoxes(newBoxes);
  };

  const addNewBox = () => {
    setBoxCount((prevBoxCount) => {
      const newBoxNumber = prevBoxCount + 1;
      setTables((prevTables) => ({
        ...prevTables,
        [newBoxNumber]: [],
      }));

      setBoxes((prevBoxes) => [
        ...prevBoxes,
        {
          volumetricWeight: 0,
          totalWeight: 0,
          dimensionSummary: "",
          context: "",
          hsnNo: "",
          qty: 0,
          rate: 0,
          amount: 0,
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
        },
      ]);

      setSelectedBox(newBoxNumber);
      return newBoxNumber;
    });
  };

  const handleAddRow = () => {
    if (editingItem !== null) {
      // Update existing item
      setTables((prevTables) => {
        const updatedTables = { ...prevTables };
        updatedTables[selectedBox][editingItem] = {
          context: boxes[0].context,
          hsnNo: boxes[0].hsnNo,
          qty: parseFloat(boxes[0].qty) || 0,
          rate: parseFloat(boxes[0].rate) || 0,
          amount: (parseFloat(boxes[0].qty) || 0) * (parseFloat(boxes[0].rate) || 0),
        };
        return updatedTables;
      });
      setEditingItem(null);
    } else {
      // Add new item
      const newRow = {
        context: boxes[0].context,
        hsnNo: boxes[0].hsnNo,
        qty: parseFloat(boxes[0].qty) || 0,
        rate: parseFloat(boxes[0].rate) || 0,
        amount: (parseFloat(boxes[0].qty) || 0) * (parseFloat(boxes[0].rate) || 0),
      };

      setTables((prevTables) => {
        const updatedTables = { ...prevTables };
        if (!updatedTables[selectedBox]) {
          updatedTables[selectedBox] = [];
        }
        updatedTables[selectedBox] = [...updatedTables[selectedBox], newRow];
        return updatedTables;
      });
    }

    setBoxes((prevBoxes) => [
      { ...prevBoxes[0], context: "", hsnNo: "", qty: 0, rate: 0 },
      ...prevBoxes.slice(1),
    ]);

    console.log(tables[selectedBox]);
  };

  // Handle item edit
  const handleEditItem = (index) => {
    const item = tables[selectedBox][index];
    setBoxes((prevBoxes) => [
      {
        ...prevBoxes[0],
        context: item.context,
        hsnNo: item.hsnNo,
        qty: item.qty,
        rate: item.rate
      },
      ...prevBoxes.slice(1),
    ]);
    setEditingItem(index);

    // Scroll to the input section
    document.getElementById('context')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Handle item delete
  // const handleDeleteItem = (index) => {
  //   if (confirm("Are you sure you want to delete this item?")) {
  //     setTables((prevTables) => {
  //       const updatedTables = { ...prevTables };
  //       updatedTables[selectedBox] = updatedTables[selectedBox].filter((_, i) => i !== index);
  //       return updatedTables;
  //     });

  //     // Clear editing state if we're editing this item
  //     if (editingItem === index) {
  //       setEditingItem(null);
  //       setBoxes((prevBoxes) => [
  //         { ...prevBoxes[0], context: "", hsnNo: "", qty: 0, rate: 0 },
  //         ...prevBoxes.slice(1),
  //       ]);
  //     }
  //   }
  // };

  const handleDeleteItem = (index) => {
    openConfirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      onYes: () => {
        setTables((prevTables) => {
          const updated = { ...prevTables };
          updated[selectedBox] = updated[selectedBox].filter((_, i) => i !== index);
          return updated;
        });

        if (editingItem === index) {
          setEditingItem(null);
          setBoxes((prev) => [
            { ...prev[0], context: "", hsnNo: "", qty: 0, rate: 0 },
            ...prev.slice(1),
          ]);
        }

        closeConfirm();
      },
    });
  };


  // Handle duplicate box
  const handleDuplicateBox = () => {
    const currentBoxData = boxes[selectedBox - 1];
    const currentTableData = tables[selectedBox] || [];

    setBoxCount((prevBoxCount) => {
      const newBoxNumber = prevBoxCount + 1;

      setTables((prevTables) => ({
        ...prevTables,
        [newBoxNumber]: [...currentTableData],
      }));

      setBoxes((prevBoxes) => [
        ...prevBoxes,
        { ...currentBoxData },
      ]);

      setSelectedBox(newBoxNumber);
      return newBoxNumber;
    });

    setIsOpen(false);
  };

  // Handle delete box
  const handleDeleteBox = () => {
    if (boxCount === 1) {
      openConfirm({
        title: "Action Not Allowed",
        message: "You cannot delete the last box.",
        onYes: closeConfirm,
      });
      return;
    }


    openConfirm({
      title: `Delete Box ${selectedBox}`,
      message: "This action cannot be undone. Do you want to continue?",
      onYes: () => {
        setBoxes((prev) =>
          prev.filter((_, idx) => idx !== selectedBox - 1)
        );

        setTables((prev) => {
          const updated = { ...prev };
          delete updated[selectedBox];

          const reindexed = {};
          let i = 1;
          Object.keys(updated)
            .sort((a, b) => Number(a) - Number(b))
            .forEach((k) => {
              reindexed[i++] = updated[k];
            });

          return reindexed;
        });

        setBoxCount((p) => p - 1);
        setSelectedBox(1);
        setIsOpen(false);
        closeConfirm();
      },
    });

  };

  // Handle edit box details
  const handleEditBoxDetails = () => {
    openConfirm({
      title: "Edit Box",
      message: "Edit box details functionality can be implemented here.",
      onYes: closeConfirm,
    });
    setIsOpen(false);
  };

  const columns = () => [
    { key: "context", label: "Description" },
    { key: "hsnNo", label: "HSN Code" },
    { key: "qty", label: "Qty" },
    { key: "rate", label: "Rate" },
    { key: "amount", label: "Amt (₹)" },
  ];

  return (
    <div className="bg-white flex flex-col gap-2 rounded-3xl p-10">
      <div className="flex gap-2 items-center">
        <div className="relative w-9 h-9">
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step <= 4 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/4.svg"
            alt="Step 4 indicator"
            width={36}
            height={36}
          />
          <Image
            className={`absolute left-0 right-0 top-0 bottom-0 transition-opacity duration-500 ${step > 4 ? "opacity-100" : "opacity-0"
              }`}
            src="/create-shipment/done-red.svg"
            alt="Step 4 completed"
            width={36}
            height={36}
          />
        </div>
        <h2 className="text-base px-2 font-bold">
          Shipment and Package Details
        </h2>
      </div>

      <div
        className={`flex gap-2 items-start overflow-hidden transition-max-height duration-500 ease-in-out ${step === 4 ? "max-h-[10000px]" : "max-h-0"
          }`}
      >
        <div className="w-full flex flex-col gap-2 text-xs">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold">Shipment Type</h4>
              <div className="flex gap-4">
                {["Non-Document", "Document", "Commercial (CSBV)"].map((type) => (
                  <label
                    key={type}
                    className={`flex font-medium gap-4 text-xs py-[15px] px-[39px] rounded-md cursor-pointer ${selectedGoodstype === type
                      ? "bg-[#FFE5E9] text-[#EA1B40]"
                      : "bg-[#F8F8F8] text-[#979797]"
                      }`}
                  >
                    <input
                      type="radio"
                      {...register("goodstype")}
                      value={type}
                      defaultChecked={type === "Non-Document"}
                      className={`${selectedGoodstype === type
                        ? " accent-[#EA1B40]"
                        : " accent-[#979797]"
                        } `}
                    />
                    <div>{type}</div>
                  </label>
                ))}
              </div>

              {selectedGoodstype === "Commercial (CSBV)" && (
                <div className="flex flex-col gap-8 mt-6">
                  <div className="flex gap-6 w-full">
                    <div className="flex w-1/3 flex-row gap-2">
                      <CustomDropdown
                        label="Select Exporter"
                        options={exportersOptions}
                        value={watch("exporter")}
                        onChange={(val) => setValue("exporter", val)}
                      />
                      <button
                        type="button"
                        className="pt-6"
                        onClick={() => {
                          handleAddExporter();
                        }}
                      >
                        <Image src="/create-shipment/Icon.svg" width={45} height={45} alt="Upload" />
                      </button>
                    </div>

                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">KYC Number</label>
                      <input
                        {...register("kycNumber")}
                        placeholder="ABCDE1234F"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>

                    <div className="w-1/3"></div>
                  </div>

                  <div className="flex gap-6 w-full">
                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">IEC (Import Export Code)</label>
                      <input
                        {...register("iec")}
                        placeholder="0512345678"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>

                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">GST Number</label>
                      <input
                        {...register("gstNumber")}
                        placeholder="29ABCDE1234F1Z5"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>

                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">AD Code</label>
                      <input
                        {...register("adCode")}
                        placeholder="1234567"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 w-full">
                    <div className="flex w-1/3 flex-col gap-2">
                      <CustomDropdown
                        label="Terms of Invoice"
                        options={termsOptions}
                        value={watch("termsOfInvoice")}
                        onChange={(v) => setValue("termsOfInvoice", v)}
                      />
                    </div>

                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">CRN Number</label>
                      <input
                        {...register("crnNumber")}
                        placeholder="M518059622"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>

                    <div className="flex w-1/3 flex-col gap-2">
                      <label className="text-xs font-semibold">MHBS Number</label>
                      <input
                        {...register("mhbsNumber")}
                        placeholder="1234567"
                        className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-10 w-full">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" {...register("exportThroughEcommerce")} className="accent-[#EA1B40]" />
                      Export through E-commerce
                    </label>

                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" {...register("meisScheme")} className="accent-[#EA1B40]" />
                      MEIS Scheme
                    </label>

                    <button
                      type="button"
                      className="ml-auto flex items-center gap-2 border border-[var(--primary-color)] text-[var(--primary-color)] px-4 py-2 rounded-md text-xs font-semibold"
                    >
                      <Image src="/uplode_kyc.svg" width={14} height={14} alt="Upload" />
                      Upload Invoice
                    </button>
                  </div>

                  <hr />
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex gap-4 text-center items-center">
                  <div>
                    <Image
                      src={`/create-shipment/box-logo-step3.svg`}
                      alt="Box icon"
                      width={36}
                      height={36}
                    />
                  </div>

                  {boxCount > 0 && (
                    <div>
                      <select
                        value={selectedBox || ""}
                        onChange={(e) => {
                          setSelectedBox(Number(e.target.value));
                          setEditingItem(null); // Clear editing state when switching boxes
                        }}
                        className="ml-2 text-xl font-bold text-red-600 px-1 py-1 rounded-md"
                      >
                        {Array.from({ length: boxCount }).map((_, index) => {
                          const boxIndex = index + 1;
                          return (
                            <option key={boxIndex} value={boxIndex}>
                              Box {boxIndex}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div className="bg-[#D8F3E0] text-xs text-[#979797] px-[16px] py-[15px] rounded-md gap-2 flex ">
                    <div className="flex gap-3">
                      <span>Total Vol. Weight:</span>
                      <div className="flex gap-3">
                        <div>{totalVolumetricWt.toFixed(2)}</div>
                        <span>Kg</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#D8F3E0] text-xs text-[#979797] p-4 rounded-md gap-2 flex ">
                    <div className="flex gap-3">
                      <span>Total Actual Weight:</span>
                      <div className="flex gap-3">
                        <div>{totalActualWt.toFixed(2)}</div>
                        <span>Kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gap-4 flex flex-col">
              <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                  <div className="flex w-full gap-28">
                    <div className="flex w-full flex-col gap-2">
                      <h3 className="font-semibold">Actual Weight of Box</h3>
                      <div className="relative overflow-hidden rounded-md w-[20vw] border-[#979797] border">
                        <input
                          type="number"
                          {...register(`weight`)}
                          onChange={(e) =>
                            handleInputChange(
                              selectedBox - 1,
                              "weight",
                              e.target.value
                            )
                          }
                          value={boxes[selectedBox - 1]?.weight || 0}
                          placeholder="Weight"
                          className="rounded-md px-2 w-full py-3 outline-none"
                        />
                        <div className="bg-[#F3F7FE] text-[#979797] w-10 flex items-center justify-center absolute top-0 bottom-0 right-0">
                          Kg
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold">Dimensions of the Box</h3>
                      <div className="flex gap-4">
                        {["length", "width", "height"].map((dimension) => (
                          <div
                            key={dimension}
                            className="relative overflow-hidden w-[10vw] rounded-md border-[#979797] border"
                          >
                            <input
                              type="number"
                              {...register(`${dimension}`)}
                              onChange={(e) =>
                                handleInputChange(
                                  selectedBox - 1,
                                  dimension,
                                  e.target.value
                                )
                              }
                              value={boxes[selectedBox - 1]?.[dimension] || 0}
                              placeholder={
                                dimension.charAt(0).toUpperCase() +
                                dimension.slice(1)
                              }
                              className="rounded-md px-2 py-3 w-24 outline-none"
                            />
                            <div className="bg-[#F3F7FE] text-[#979797] w-10 flex items-center justify-center absolute top-0 bottom-0 right-0">
                              cm
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-wrap justify-between">
                <div id="context" className="flex w-[20vw] flex-col gap-2">
                  <h3>Package Description</h3>
                  <input
                    type="text"
                    value={boxes[0]?.["context"] || ""}
                    onChange={(e) =>
                      handleInputChange(0, "context", e.target.value)
                    }
                    placeholder="Item Name"
                    className="border-[#979797] border rounded-md px-2 py-3 w-full outline-none"
                  />
                </div>

                <div className="flex gap-4 items-end">
                  {["hsnNo", "qty", "rate"].map((field) => (
                    <div key={field} className="flex flex-col gap-2 w-full">
                      <h3>
                        {field === "hsnNo"
                          ? "HSN Code"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </h3>

                      {field === "qty" ? (
                        <div className="flex items-stretch overflow-hidden border-[#979797] border rounded-md">
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                0,
                                field,
                                Math.max(0, (parseFloat(boxes[0]?.[field]) || 0) - 1)
                              )
                            }
                            className="px-2 bg-[#F3F7FE] w-10 text-base font-bold text-[#979797]"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={(boxes[0]?.[field] || 0) < 1 ? "" : boxes[0]?.[field] || ""}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : Math.max(0, parseFloat(e.target.value) || 0);
                              handleInputChange(0, field, value);
                            }}
                            placeholder="0"
                            className="px-2 py-3 w-12 outline-none text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange(
                                0,
                                field,
                                (parseFloat(boxes[0]?.[field]) || 0) + 1
                              )
                            }
                            className="px-2 bg-[#F3F7FE] w-10 text-base font-bold text-[#979797]"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field === "hsnNo" ? "text" : "number"}
                          value={boxes[0]?.[field] || ""}
                          onChange={(e) =>
                            handleInputChange(0, field, e.target.value)
                          }
                          placeholder={
                            field === "hsnNo" ? "Eg. 540710" : "0"
                          }
                          className="border-[#979797] border rounded-md px-2 py-3 w-[14.5vw] outline-none"
                        />
                      )}
                    </div>
                  ))}

                  <div className="w-[100px]">
                    <button
                      onClick={handleAddRow}
                      type="button"
                      className="h-10 w-[100px] border border-red-600 text-[var(--primary-color)] font-bold rounded-md hover:bg-red-50 transition-colors"
                    >
                      {editingItem !== null ? "Update" : "Add Item"}
                    </button>
                  </div>

                  {editingItem !== null && (
                    <div className="w-[100px]">
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setBoxes((prevBoxes) => [
                            { ...prevBoxes[0], context: "", hsnNo: "", qty: 0, rate: 0 },
                            ...prevBoxes.slice(1),
                          ]);
                        }}
                        type="button"
                        className="h-10 w-[100px] border border-gray-400 text-gray-600 font-bold rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={addNewBox}
                className="flex justify-start w-fit"
              >
                <div className="flex gap-3 items-center rounded border border-[var(--primary-color)] p-2 hover:bg-red-50 transition-colors">
                  <div>
                    <Image
                      src={`/create-shipment/box-logo-step3.svg`}
                      alt="Add new box icon"
                      width={16}
                      height={18}
                    />
                  </div>

                  <span className="text-[var(--primary-color)] text-nowrap font-bold text-base rounded-md">
                    Add New Box
                  </span>
                </div>
              </button>

              <div>
                {selectedBox && tables[selectedBox] !== undefined && (
                  <div className="mt-4 border p-5 rounded-lg">
                    <div className="flex justify-between gap-2 mb-9 items-center">
                      <div className="flex bg-[#FFE5E9] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-xl text-red-600 font-bold">
                          Box
                        </span>
                        <span className="text-xl text-red-600 font-bold">
                          {selectedBox}
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Actual Weight:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.totalWeight || 0} Kg
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Dimensions:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.dimensionSummary || "0 x 0 x 0 cm"}
                        </span>
                      </div>
                      <div className="flex bg-[#7676801F] px-4 py-2 text-sm gap-1 items-center rounded-md">
                        <span className="text-[#667085]">Volume Weight:</span>
                        <span className="text-[#667085]">
                          {boxes[selectedBox - 1]?.volumetricWeight || 0} Kg
                        </span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex bg-[#F8F8F8] px-4 py-2 text-sm gap-1 items-center rounded-md">
                          <span className="text-[#EA1B40]">
                            Invoice Value:
                          </span>
                          <span className="text-[#EA1B40]">
                            ₹ {totalAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="relative z-10">
                          <div
                            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                          >
                            <Image
                              src="/menu_bar.svg"
                              alt="Menu options"
                              width={5}
                              height={17}
                            />
                          </div>

                          {isOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 mt-2 w-[230px] bg-white shadow-xl rounded-md p-2 border border-gray-200"
                            >
                              <ul className="text-sm flex flex-col gap-1">
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#F3F7FE] rounded transition-colors"
                                  onClick={() => {
                                    document.getElementById('context')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    setIsOpen(false);
                                  }}
                                >
                                  <Image
                                    src="/box_logo.svg"
                                    alt="Add items icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium">
                                    Add Items
                                  </span>
                                </li>
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#F3F7FE] rounded transition-colors"
                                  onClick={handleEditBoxDetails}
                                >
                                  <Image
                                    src="/Edit.svg"
                                    alt="Edit icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium">
                                    Edit Box Details
                                  </span>
                                </li>
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#F3F7FE] rounded transition-colors"
                                  onClick={handleDuplicateBox}
                                >
                                  <Image
                                    src="/box_logo.svg"
                                    alt="Duplicate box icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium">
                                    Duplicate Box {selectedBox}
                                  </span>
                                </li>
                                <li
                                  className="flex gap-3 py-2 px-3 cursor-pointer hover:bg-[#FFE5E9] rounded transition-colors"
                                  onClick={handleDeleteBox}
                                >
                                  <Image
                                    src="/red_logo.svg"
                                    alt="Delete box icon"
                                    width={16}
                                    height={18}
                                  />
                                  <span className="text-base font-medium text-[#EA1B40]">
                                    Delete Box {selectedBox}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <TableWithCTA
                      register={register}
                      setValue={setValue}
                      name={`shipmentAndPackageDetails`}
                      columns={columns(selectedBox)}
                      rowData={tables[selectedBox] || []}
                      handleEdit={handleEditItem}
                      handleDelete={handleDeleteItem}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end items-center">
              <div className="flex gap-4">
                <button
                  className="border border-[var(--primary-color)] text-[var(--primary-color)] font-semibold rounded-md px-12 py-3 hover:bg-red-50 transition-colors"
                  type="button"
                  onClick={onPrev}
                >
                  Back
                </button>
                <button
                  className="bg-[var(--primary-color)] text-white font-semibold rounded-md px-12 py-3 hover:bg-red-700 transition-colors"
                  type="button"
                  onClick={onNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onYes={confirmModal.onYes}
        onNo={closeConfirm}
      />

    </div>
  );
};

export default ShipmentAndPackageDetail;

const CustomDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSearch(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return localOptions.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, localOptions]);

  const handleSelect = (val) => {
    onChange(val);
    setSearch(val);
    setOpen(false);
  };

  const handleAddNew = () => {
    const newOption = { label: search, value: search };
    setLocalOptions((prev) => [...prev, newOption]);
    onChange(search);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative w-full flex flex-col gap-2 text-xs">
      {label && <label className="font-semibold">{label}</label>}

      <div className="border border-[#979797] rounded-md flex items-center">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!filteredOptions.length) {
                handleAddNew();
              } else if (filteredOptions.length === 1) {
                handleSelect(filteredOptions[0].value);
              }
            }
          }}
          className="px-3 py-3 text-xs w-full outline-none rounded-l-md"
          placeholder="Type or select exporter"
        />

        <div className="px-3 cursor-pointer" onClick={() => setOpen(!open)}>
          <Image
            src="/create-shipment/Vector.svg"
            width={12}
            height={12}
            alt="arrow"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className="absolute z-30 top-full left-0 mt-1 w-full bg-white shadow-xl rounded-md max-h-60 overflow-y-auto border border-gray-200">
          {filteredOptions.length === 0 ? (
            <div
              className="px-4 py-3 cursor-pointer hover:bg-[#F3F7FE] text-xs text-blue-600"
              onClick={handleAddNew}
            >
              Add &quot;<span className="font-medium">{search}</span>&quot;
            </div>
          ) : (
            filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option.value)}
                className="px-4 py-3 cursor-pointer hover:bg-[#F3F7FE] text-xs leading-5 transition-colors"
              >
                {!option.extra ? (
                  option.label
                ) : (
                  <>
                    <div className="font-medium text-gray-800">{option.label}</div>
                    <div className="text-gray-500 text-[11px] mt-1">{option.extra}</div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ConfirmModal = ({ open, title, message, onYes, onNo }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-[360px] p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onNo}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            No
          </button>
          <button
            onClick={onYes}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
