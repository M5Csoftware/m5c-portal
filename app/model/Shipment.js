import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
  {
    awbNo: { type: String, default: "", unique: true },
    accountCode: { type: String, required: true },

    status: { type: String, default: "Shipment Created!" },
    date: { type: Date, required: true },
    sector: { type: String, required: true },
    origin: { type: String, required: false },
    destination: { type: String, default: "" },
    reference: { type: String, default: "" },
    forwardingNo: { type: String, default: "" },
    forwarder: { type: String, default: "" },
    goodstype: { type: String, default: "" },
    payment: { type: String, default: "" },
    shipmentType: {
      type: String,
      required: true,
      enum: ["Document", "Non-Document"],
    },

    // Weights & Values
    totalActualWt: { type: Number, default: 0 },
    totalVolWt: { type: Number, default: 0 },
    totalInvoiceValue: { type: Number, default: 0 },
    content: { type: String, default: "" },

    // Flags
    operationRemark: { type: String, default: "" },
    automation: { type: Boolean, default: false },
    handling: { type: Boolean, default: false },
    csb: { type: Boolean, default: false },
    commercialShipment: { type: Boolean, default: false },
    isHold: { type: Boolean, default: false },
    holdReason: { type: String, default: "" },
    otherHoldReason: { type: String, default: "" },

    // Charges & Billing
    basicAmt: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalAmt: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountAmt: { type: Number, default: 0 },
    duty: { type: Number, default: 0 },
    fuelAmt: { type: Number, default: 0 },
    fuelPercentage: { type: Number, default: 0 },
    handlingAmount: { type: Number, default: 0 },
    hikeAmt: { type: Number, default: 0 },
    manualAmount: { type: Number, default: 0 },
    miscChg: { type: Number, default: 0 },
    miscChgReason: { type: String, default: "" },
    overWtHandling: { type: Number, default: 0 },
    volDisc: { type: Number, default: 0 },

    // References
    billNo: { type: String, default: "" },
    manifestNo: { type: String, default: "" },
    runNo: { type: String, default: "" },
    alMawb: { type: String, default: "" },
    bag: { type: String, default: "" },
    clubNo: { type: String, default: "" },
    company: { type: String, default: "" },
    currency: { type: String, default: "" },
    currencys: { type: String, default: "" },
    customer: { type: String, default: "" },
    flight: { type: String, default: "" },
    network: { type: String, default: "" },
    networkName: { type: String, default: "" },
    obc: { type: String, default: "" },
    service: { type: String, default: "" },

    pcs: { type: Number, default: 0 },
    boxes: { type: Array, default: [] },

    // Receiver (Consignee)
    receiverFullName: { type: String, default: "" },
    receiverPhoneNumber: { type: String, default: "" },
    receiverEmail: { type: String, default: "" },
    receiverAddressLine1: { type: String, default: "" },
    receiverAddressLine2: { type: String, default: "" },
    receiverCity: { type: String, default: "" },
    receiverState: { type: String, default: "" },
    receiverCountry: { type: String, default: "" },
    receiverPincode: { type: String, default: "" },

    // Shipper (Consignor)
    shipperFullName: { type: String, default: "" },
    shipperPhoneNumber: { type: String, default: "" },
    shipperEmail: { type: String, default: "" },
    shipperAddressLine1: { type: String, default: "" },
    shipperAddressLine2: { type: String, default: "" },
    shipperCity: { type: String, default: "" },
    shipperState: { type: String, default: "" },
    shipperCountry: { type: String, default: "" },
    shipperPincode: { type: String, default: "" },
    shipperKycType: { type: String, default: "other" },
    shipperKycNumber: { type: String, default: "" },

    // Invoice
    invoice: { type: Array, default: [] },

    shipmentAndPackageDetails: { type: Object, default: {} },
    coLoader: { type: String, default: "" },
    coLoaderNumber: { type: Number, default: 0 },

    //user
    insertUser: { type: String, default: "" },
    updateUser: { type: String, default: "" },

    //modified
    billingLocked: { type: Boolean, default: false }

  },
  { timestamps: true }
);

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
