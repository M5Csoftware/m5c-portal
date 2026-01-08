"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

function RadioButton({
  id,
  name,
  register,
  setValue,
  selectedValue,
  setSelectedValue,
  label,
}) {
  const toggleSelected = () => {
    setSelectedValue(id);
    setValue(name, id);
  };

  return (
    <label
      onClick={toggleSelected}
      className={`flex  gap-3 items-center justify-center w-full cursor-pointer font-medium text-sm py-3 px-16 rounded-md ${
        selectedValue === id ? "bg-[#FFE5E9]" : "bg-[#F8F8F8]"
      }`}
      htmlFor={id}
    >
      <div
        className={`rounded-full w-5 h-5 border cursor-pointer select-none hover:opacity-80 flex items-center justify-center ${
          selectedValue === id
            ? "border-[#EA1B40] bg-white"
            : "border-[#979797]"
        }`}
      >
        {selectedValue === id && (
          <div className="w-2 h-2 bg-[#EA1B40] rounded-full"></div>
        )}

        <input
          id={id}
          name={name}
          type="radio"
          {...register(name)}
          checked={selectedValue === id}
          onChange={toggleSelected}
          className="hidden"
        />
      </div>
      <span
        className={`font-semibold ${
          selectedValue === id ? "text-[#EA1B40]" : "text-[#979797]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export default RadioButton;
