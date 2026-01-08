"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        emailId: data.emailId,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (!result.error) {
        router.push("/portal");
      } else {
        router.push(`/api/auth/error?error=${result.error}`);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/portal" });
  };

  return (
    <div className="flex flex-col gap-10 mx-[74px] py-[36px] w-full h-[100vh]">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="font-black text-3xl text-[#333333]">
          Login to M5C Account
        </h2>
        <p className="text-[#979797]">
          Welcome back! Please enter your credentials to access your logistics dashboard. <br />
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
          <input
            type="text"
            placeholder="Enter your Account Code, Email ID or Phone Number"
            {...register("emailId", { required: true })}
            className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full text-sm"
            disabled={isLoading}
          />

          {/* Password Input */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              {...register("password", { required: true })}
              className="border border-gray-300 outline-none rounded-md h-12 px-6 w-full text-sm pr-10"
              disabled={isLoading}
            />

            {/* Show/Hide Password */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => {
                setShowPassword((prev) => !prev);
                setTimeout(() => setShowPassword(false), 1000);
              }}
              disabled={isLoading}
            >
              {showPassword ? <Image src={`hide-password.svg`} alt="hide-password" width={24} height={24} /> : <Image src={`show-password.svg`} alt="show-password" width={24} height={24} />}
            </button>
          </div>
        </div>

        {/* Remember Me + Recover */}
        <div className="flex justify-between items-center text-sm text-[#979797]">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="w-4 h-4"
              disabled={isLoading}
            />
            <span>Remember me</span>
          </label>

          <span className="text-[#EA1B40] cursor-pointer">
            Recover Password?
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-md text-lg font-semibold transition-colors ${isLoading
            ? "bg-green-700 text-white cursor-not-allowed"
            : "bg-[#EA1B40] text-white hover:bg-[#d01636]"
            }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex flex-col gap-10">
        <div className="text-center text-gray-500 relative">
          <span className="bg-white px-4">or continue with</span>
          <div className="bg-[#E2E8F0] w-full h-[2px] -z-10 absolute top-3.5 rounded-full"></div>
        </div>

        {/* Google Login */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex items-center justify-center w-48 py-3 rounded-md border border-gray-300"
            disabled={isLoading}
          >
            <Image src="/google.svg" alt="Google" width={22} height={22} />
            <span className="text-gray-500 text-sm font-medium ml-2">
              Google
            </span>
          </button>
        </div>

        {/* Signup */}
        <p className="text-center text-gray-500">
          New to M5C?{" "}
          <Link href="/auth/signup">
            <span className="text-[#EA1B40] cursor-pointer">Sign Up Now</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
