"use client";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { GlobalContext } from "@/app/portal/GlobalContext";
import NotificationFlag from "@/app/portal/component/NotificationFlag";

export default function LoginPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoverStep, setRecoverStep] = useState(1);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [notification, setNotification] = useState({
    type: "success",
    message: "",
    visible: false,
  });
  const [rememberedEmail, setRememberedEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { server } = useContext(GlobalContext);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check for auto-login on mount
  useEffect(() => {
    const checkAutoLogin = async () => {
      const autoLogin = localStorage.getItem("autoLogin");
      const savedEmail = localStorage.getItem("rememberedEmail");

      if (autoLogin === "true" && savedEmail && session?.user) {
        // Session is valid, redirect to portal
        router.push("/portal");
      }
    };

    if (status !== "loading") {
      checkAutoLogin();
    }
  }, [router, session, status]);

  // Load remembered email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setRememberedEmail(savedEmail);
      setRememberMe(true);
      setValue("emailId", savedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const showNotification = (type, message) => {
    setNotification({ type, message, visible: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Handle Remember Me
      if (data.rememberMe) {
        localStorage.setItem("rememberedEmail", data.emailId);
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("autoLogin", "true"); // Enable auto-login
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("autoLogin"); // Disable auto-login
      }

      const result = await signIn("credentials", {
        redirect: false,
        emailId: data.emailId,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (!result.error) {
        router.push("/portal");
      } else {
        // Read remaining attempts from cookie set by middleware
        const cookies = document.cookie.split(';');
        const remainingCookie = cookies.find(c => c.trim().startsWith('ratelimit_remaining='));
        const remaining = remainingCookie ? remainingCookie.split('=')[1] : null;

        let msg = result.error === "CredentialsSignin" ? "Invalid credentials" : result.error;
        if (remaining !== null) {
          msg += `. ${remaining} attempts left.`;
        }
        
        showNotification("error", msg || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/portal" });
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
    }
  };

  // Handle backspace in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Clear remembered email
  const handleClearRemembered = () => {
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("autoLogin");
    setRememberedEmail("");
    setRememberMe(false);
    setValue("emailId", "");
    setValue("rememberMe", false);
  };

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    if (!recoverEmail) {
      showNotification("error", "Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(recoverEmail)) {
      showNotification("error", "Please enter a valid email");
      return;
    }

    setRecoverLoading(true);
    try {
      const response = await axios.post(
        `${server}/portal/recover-password/forgot-password`,
        {
          emailId: recoverEmail,
        },
      );

      if (response.data.success) {
        setRecoverStep(2);
        showNotification("success", "OTP sent to your email");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setRecoverLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setOtpError("Please enter complete 6-digit OTP");
      return;
    }

    setRecoverLoading(true);
    try {
      const response = await axios.post(
        `${server}/portal/recover-password/verify-otp`,
        {
          emailId: recoverEmail,
          otp: otpString,
        },
      );

      if (response.data.success) {
        setRecoverStep(3);
        showNotification("success", "OTP verified successfully");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setOtpError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setRecoverLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    // Validate passwords
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setRecoverLoading(true);

    try {
      const response = await axios.post(
        `${server}/portal/recover-password/reset-password`,
        {
          emailId: recoverEmail,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        },
      );

      if (response.data.success) {
        showNotification("success", response.data.message);

        // Clear remembered email if it was the same email
        if (rememberedEmail === recoverEmail) {
          handleClearRemembered();
        }

        // Close modal and reset state after 2 seconds
        setTimeout(() => {
          setShowRecoverModal(false);
          setRecoverStep(1);
          setRecoverEmail("");
          setOtp(["", "", "", "", "", ""]);
          setNewPassword("");
          setConfirmPassword("");
        }, 2000);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setPasswordError(
        error.response?.data?.message || "Failed to reset password",
      );
    } finally {
      setRecoverLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setRecoverLoading(true);
    try {
      const response = await axios.post(
        `${server}/portal/recover-password/forgot-password`,
        {
          emailId: recoverEmail,
        },
      );

      if (response.data.success) {
        showNotification("success", "New OTP sent to your email");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Failed to resend OTP",
      );
    } finally {
      setRecoverLoading(false);
    }
  };

  // Close modal and reset
  const handleCloseModal = () => {
    setShowRecoverModal(false);
    setRecoverStep(1);
    setRecoverEmail("");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA1B40]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-10 mx-[74px] py-[36px] w-full h-[100vh]">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h2 className="font-black text-3xl text-[#333333]">
            Login to M5C Account
          </h2>
          <p className="text-[#979797]">
            Welcome back! Please enter your credentials to access your logistics
            dashboard. <br />
            Need help? Contact support or reset your password.
          </p>
        </div>

        {/* Form */}
        <form
          className="relative z-10 bg-white flex flex-col w-full gap-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-6">
            {/* Email / Phone / Account Code */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your Account Code, Email ID or Phone Number"
                {...register("emailId", { required: true })}
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full text-sm pr-12"
                disabled={isLoading}
              />
              {rememberedEmail && watch("emailId") && (
                <button
                  type="button"
                  onClick={handleClearRemembered}
                  aria-label="Clear remembered email"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear remembered email"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Password Input */}
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                {...register("password", { required: true })}
                className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full text-sm pr-12"
                disabled={isLoading}
              />

              {/* Show/Hide Password - Eye Icon */}
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me + Recover */}
          <div className="flex justify-between items-center text-sm text-[#979797]">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                {...register("rememberMe")}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  if (!e.target.checked && rememberedEmail) {
                    handleClearRemembered();
                  }
                }}
                className="w-4 h-4 cursor-pointer accent-[#EA1B40]"
                disabled={isLoading}
              />
              <span className="group-hover:text-gray-900 transition-colors">
                Remember me
              </span>
            </label>

            <span
              className="text-[#EA1B40] cursor-pointer hover:underline transition-colors"
              onClick={() => setShowRecoverModal(true)}
            >
              Recover Password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md text-lg font-semibold transition-all transform hover:scale-[1.02] ${
              isLoading
                ? "bg-green-600 text-white cursor-not-allowed opacity-70"
                : "bg-[#EA1B40] text-white hover:bg-[#d01636] shadow-md hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex flex-col gap-10">
          <div className="text-center text-gray-500 relative">
            <span className="bg-white px-4 text-sm">or continue with</span>
            <div className="bg-[#E2E8F0] w-full h-[2px] -z-10 absolute top-3.5 rounded-full"></div>
          </div>

          {/* Google Login */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex items-center justify-center w-48 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-all hover:shadow-md disabled:opacity-50"
              disabled={isLoading}
            >
              <Image src="/google.svg" alt="Google" width={22} height={22} />
              <span className="text-gray-600 text-sm font-medium ml-2">
                Google
              </span>
            </button>
          </div>

          {/* Signup */}
          <p className="text-center text-gray-500">
            New to M5C?{" "}
            <Link href="/auth/signup">
              <span className="text-[#EA1B40] cursor-pointer hover:underline font-medium">
                Sign Up Now
              </span>
            </Link>
          </p>
        </div>
      </div>

      {/* Recover Password Modal */}
      {showRecoverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative animate-fadeIn shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#333333]">
                {recoverStep === 1 && "Reset Password"}
                {recoverStep === 2 && "Verify OTP"}
                {recoverStep === 3 && "Create New Password"}
              </h3>
              <p className="text-sm text-[#979797] mt-1">
                {recoverStep === 1 && "Enter your email to receive OTP"}
                {recoverStep === 2 &&
                  `Enter the 6-digit OTP sent to ${recoverEmail}`}
                {recoverStep === 3 && "Enter your new password"}
              </p>
            </div>

            {/* Step 1: Email Input */}
            {recoverStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full border border-gray-300 outline-none rounded-md h-12 px-4 text-sm focus:ring-2 focus:ring-[#EA1B40] focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={recoverLoading || !recoverEmail}
                  className="w-full bg-[#EA1B40] text-white py-3 rounded-md font-semibold hover:bg-[#d01636] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {recoverLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {recoverStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Enter OTP
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-semibold focus:ring-2 focus:ring-[#EA1B40] focus:border-transparent outline-none transition-all"
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {otpError}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={recoverLoading}
                  className="w-full bg-[#EA1B40] text-white py-3 rounded-md font-semibold hover:bg-[#d01636] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {recoverLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Did not receive OTP?{" "}
                    <button
                      onClick={handleResendOtp}
                      disabled={recoverLoading}
                      className="text-[#EA1B40] hover:underline font-medium disabled:opacity-50 transition-colors"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {recoverStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Enter new password"
                      className="w-full border border-gray-300 outline-none rounded-md h-12 px-4 text-sm pr-12 focus:ring-2 focus:ring-[#EA1B40] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Confirm new password"
                      className="w-full border border-gray-300 outline-none rounded-md h-12 px-4 text-sm pr-12 focus:ring-2 focus:ring-[#EA1B40] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-600 text-xs flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {passwordError}
                  </p>
                )}

                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Password must be at least 6 characters
                  </p>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={recoverLoading || !newPassword || !confirmPassword}
                  className="w-full bg-[#EA1B40] text-white py-3 rounded-md font-semibold hover:bg-[#d01636] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {recoverLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      <NotificationFlag
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        setVisible={(v) => setNotification({ ...notification, visible: v })}
      />

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
