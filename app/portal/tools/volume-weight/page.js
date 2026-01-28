"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Page = () => {
  const { register, handleSubmit, reset } = useForm();
  const [volumeWeight, setVolumeWeight] = useState("0.00");

  const onSubmit = (data) => {
    const { length, width, height } = data;
    const calculatedWeight = (length * width * height) / 5000;
    setVolumeWeight(calculatedWeight.toFixed(2));
  };

  const handleReset = () => {
    reset({
      length: "",
      width: "",
      height: "",
    });
    setVolumeWeight("0.00"); // Reset the displayed result to "0.00"
  };

  return (
    <main className="flex w-full mt-10 items-center gap-10 justify-center">
      {/*  bg-[#f9fafb] */}
      <div className="max-w-7xl px-4  flex flex-col gap-10 bg-gray-100 p-4 rounded-lg">
        <h1 className="font-bold text-2xl text-[#18181B]">
          Volumetric Weight Calculator
        </h1>
        <div className="rounded-xl bg-white p-4 flex flex-col gap-20">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex justify-center items-center  gap-24"
          >
            {/* Inputs */}
            <div className="flex flex-col gap-10">
              {["Length", "Width", "Height"].map((dimension) => (
                <div
                  key={dimension}
                  className="flex items-center border-2 border-gray-300 rounded-lg"
                >
                  <input
                    type="number"
                    placeholder={dimension}
                    {...register(dimension.toLowerCase())}
                    className="py-3 px-4 w-80 text-xs outline-none text-gray-800 rounded-lg"
                  />
                  <span className="p-3 bg-[#F3F7FE] text-xs text-[#979797] rounded-r-lg">
                    cm
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="bg-[#EA2147] text-white py-2 px-10 rounded-md"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="border border-[#EA2147] text-[#EA2147] py-2 px-10 rounded"
              >
                Reset
              </button>
            </div>

            {/* Result */}
            <div className="flex flex-col items-center bg-[#EA2147] text-white gap-4 px-6 py-10 rounded-md">
              <p className="text-sm">Volume Weight of your Package</p>
              <div className="w-full py-2">
                <h2 className="text-3xl font-bold">{volumeWeight} Kg</h2>
              </div>
            </div>
          </form>

          {/* Informational Section */}
          <div className="text-[#C3B600] bg-[#FBF3E0] p-4 border-2 border-[#C3B600] rounded-md flex flex-col gap-3">
            <h2 className="text-xs">Why Calculate Volume weight?</h2>
            <p className="text-[10px]">
              It helps us know the space your package will occupy in the
              container.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
