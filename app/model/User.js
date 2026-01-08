import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  accountType: {
    type: String,
    required: true,
  },
  accountCode: {
    type: String,
    default: null,
    unique: true,
    sparse: true,
  },
  fullName: { type: String, required: true },
  status: {
    type: String,
    enum: ["approved", "rejected", "pending"],
    default: "pending",
  },
  onboardingProgress: {
    passwordSet: { type: Boolean, default: false },
    companyProfileCompleted: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: true },
    clientsImported: { type: Boolean, default: false },
    shipmentCreated: { type: Boolean, default: false },
  },
  companyName: { type: String },
  emailId: { type: String, required: true, unique: true },
  mobileNumber: { type: String },
  addressLine1: { type: String },
  addressLine2: { type: String },
  zipCode: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  gstNumber: { type: String },
  sector: { type: String },
  receiveEmails: { type: Boolean, default: false },
  password: { type: String }, // made optional for Google users
  turnover: { type: String },
  verified: { type: String, default: false },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
