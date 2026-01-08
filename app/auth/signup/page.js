"use client";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import RadioButton from "@/app/portal/RadioButton";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/app/portal/GlobalContext";
import { signIn } from "next-auth/react";

function SignUpPage() {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  const [demoRadio, setDemoRadio] = useState("Business");
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");
  const router = useRouter();
  const { server } = useContext(GlobalContext);

  // Watch selected account type
  const selectedAccountType = watch("accountType", demoRadio);
  const password = watch("password");

  const fetchAddress = async (zipCode) => {
    try {
      setIsLoading(true);
      clearErrors("zipCode"); // Clear any previous errors

      const response = await axios.get(`/api/pincode?zipCode=${zipCode}`);
      const data = response.data;

      if (data.Status === "Success" && data.PostOffice?.length > 0) {
        const { District, State, Country } = data.PostOffice[0];

        setValue("city", District);
        setValue("state", State);
        setValue("country", Country);
      } else {
        setError("zipCode", {
          type: "manual",
          message: "Invalid pincode or no post office data found",
        });
        setValue("city", null);
        setValue("state", null);
        setValue("country", null);
      }
    } catch (error) {
      console.error("Error fetching address:", error.message);
      setError("zipCode", {
        type: "manual",
        message: "Error fetching address. Please try again.",
      });
      setValue("city", null);
      setValue("state", null);
      setValue("country", null);
    } finally {
      setIsLoading(false);
    }
  };



  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        accountType:
          selectedAccountType === "on" ? "Individual" : selectedAccountType,
      };

      // 1️⃣ Register user
      const response = await axios.post(`${server}/portal/auth/register`, formData);

      if (response.data?.user) {
        console.log("Register successful:", response.data.user._id);

        // 2️⃣ Send verification email
        const res = await axios.post("/api/auth/sendVerification", {
          email: formData.emailId,
          fullName: formData.fullName,
          userId: response.data.user._id,
        });

        console.log("Verification email response:", res.data);

        // 3️⃣ Automatically sign in the new user
        const loginResult = await signIn("credentials", {
          redirect: false, // Prevent NextAuth from redirecting automatically
          emailId: formData.emailId,
          password: formData.password,
        });

        if (loginResult.error) {
          console.error("Auto login failed:", loginResult.error);
          setServerErrorMsg("Auto login failed. Please login manually.");
        } else {
          console.log("Auto login success:", loginResult);
          router.push("/auth/verifyPage"); // Redirect to verification page
        }
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setServerErrorMsg("Email is already registered. Please use a different email.");
      } else {
        setServerErrorMsg(
          error.response?.data?.message || "Registration failed. Please try again."
        );
      }
      console.error("Registration failed:", error);
    }
  };



  return (
    <div className="flex flex-col gap-8 mx-[74px] py-[36px]  w-full h-[100vh]">
      <div className="flex flex-col gap-4">
        <h2 className="font-black text-3xl text-[#333333]">
          Apply for M5C Account
        </h2>
        <p className="text-[#979797]">
          Sign up to access our logistics management portal. Fill in your details and get started with seamless tracking and shipment management.
        </p>
      </div>
      <form
        className="flex flex-col gap-3 w-full text-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Radio Button Selection */}
        <div className="flex flex-row-reverse w-full gap-3 justify-between">
          <RadioButton
            id="Individual"
            label="Individual"
            name="accountType"
            register={register}
            setValue={setValue}
            selectedValue={demoRadio}
            setSelectedValue={setDemoRadio}
          />
          <RadioButton
            id="Business"
            label="Business"
            name="accountType"
            register={register}
            setValue={setValue}
            selectedValue={demoRadio}
            setSelectedValue={setDemoRadio}
          />
        </div>

        {/* Form Fields */}
        <div className="relative w-full flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <div className="flex gap-5">
              <div className="flex flex-col w-full gap-1">
                <input
                  {...register("fullName", { required: "Full Name is required" })}
                  type="text"
                  placeholder="Full Name"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
                {errors.fullName && <p className="text-red-500 text-sm pl-1">{errors.fullName.message}</p>}
              </div>

              <div className="w-full">
                <input
                  {...register("companyName")}
                  type="text"
                  placeholder="Company Name"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex flex-col w-full gap-1">
                <input
                  {...register("emailId", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                  })}
                  type="email"
                  placeholder="Email ID"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
                {serverErrorMsg && <p className="text-red-500 text-sm text-center">{serverErrorMsg}</p>}

                {errors.emailId && <p className="text-red-500 text-sm">{errors.emailId.message}</p>}
              </div>
              <div className="flex flex-col w-full gap-1">
                <input
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: { value: /^[0-9]{10}$/, message: "Invalid mobile number (10 digits required)" },
                  })}
                  type="text"
                  placeholder="Mobile Number"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>}
              </div>
            </div>




            <div className="flex gap-5">
              <div className="flex flex-col w-full gap-1">
                <input
                  {...register("addressLine1", { required: "Address Line 1 is required" })}
                  type="text"
                  placeholder="Address Line 1"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
                {errors.addressLine1 && <p className="text-red-500 text-sm">{errors.addressLine1.message}</p>}
              </div>
              <div className="w-full"><input
                {...register("addressLine2")}
                type="text"
                placeholder="Address Line 2"
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
              /></div>
            </div>

            <div className="flex gap-5">
              <div className="flex flex-col w-full gap-1">
                <input
                  {...register("zipCode", {
                    required: "Zipcode is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "Zipcode must be a 6-digit number",
                    },
                  })}
                  type="text"
                  onChange={(e) => {
                    const zip = e.target.value;
                    if (/^\d{6}$/.test(zip)) {
                      fetchAddress(zip);
                    } else {
                      clearErrors("zipCode");
                      setValue("city", null);
                      setValue("state", null);
                      setValue("country", null);
                    }
                  }}
                  placeholder="Zip-Code"
                  className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
                />
                {isLoading && <p className="text-blue-500 text-sm">Fetching address...</p>}
                {errors.zipCode && (
                  <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                )}
              </div>
              <div className="w-full">
                <input
                  {...register("city")}
                  type="text"
                  placeholder="City"
                  disabled
                  className="border  border-gray-300 bg-[#F0F0F0] outline-none rounded-md h-12 px-6 w-full"
                />
              </div>
            </div>

            <div className="flex gap-5">
              <input
                {...register("state")}
                type="text"
                placeholder="State"
                disabled
                className="border  border-gray-300 bg-[#F0F0F0] outline-none rounded-md h-12 px-6 w-full"
              />
              <input
                {...register("country")}
                type="text"
                placeholder="Country"
                disabled
                className="border  border-gray-300 bg-[#F0F0F0] outline-none rounded-md h-12 px-6 w-full"
              />
            </div>

            {demoRadio === "Business" && (
              <input
                {...register("gstNumber")}
                type="text"
                placeholder="GST Number"
                autoComplete="off"
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
              />
            )}
            {/* <input
              {...register("shipmentFrequency")}
              type="text"
              placeholder="How often do you ship?"
              className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
            /> */}
            {/* Turnover Dropdown */}
            <select
              {...register("turnover")}
              defaultValue={``}
              className="w-full border border-gray-300 outline-none rounded-md h-12 px-6"
            >
              <option value="" disabled>How much sale you generate per month?</option>
              <option value="Less than ₹50,000">Less than ₹50,000</option>
              <option value="₹50,000 - 1 Lakh">₹50,000 - 1 Lakh</option>
              <option value="₹1 Lakh - 5 Lakh">₹1 Lakh - 5 Lakh</option>
              <option value="₹5 Lakh - 10 Lakh">₹5 Lakh - 10 Lakh</option>
              <option value="More than 10 Lakh ">More than 10 Lakh </option>
            </select>
            <div className="flex flex-col gap-3">
              <input
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters long" } })}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

              <input
                {...register("confirmPassword", {
                  required: "Confirm Password is required",
                  validate: (value) => value === password || "Passwords do not match",
                })}
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>
            <label className="flex items-center space-x-2">
              <input {...register("receiveEmails")} type="checkbox" className="w-4 h-4 rounded-sm" />
              <span className="text-xs text-gray-500">Receive emails about news and updates from M5C</span>
            </label>
          </div>

          <button className="w-full bg-[#EA1B40] text-white py-3 rounded-md text-lg font-semibold" type="submit">
            Apply for M5 Account
          </button>
        </div>
      </form>

      <div className="text-center pb-4 text-gray-500">
        Already a user? <Link href="/auth/login"><span className="text-[#EA1B40] cursor-pointer">Login</span></Link>
      </div>
    </div>
  );
}

export default SignUpPage;
