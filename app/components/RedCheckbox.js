import React, { useState } from 'react';
import Image from 'next/image';

function RedCheckbox({ id, register, setValue, isChecked, setChecked, label, disabled = false }) {

  const toggleChecked = () => {
    setChecked((prev) => !prev); // Toggle the state
    setValue(id, isChecked)
  };

  return (
    <label
      onClick={toggleChecked}
      className='flex gap-2.5 items-center cursor-pointer select-none'
      htmlFor={id}
    >
      <div className={`rounded w-4 h-4 border cursor-pointer select-none hover:opacity-80 flex items-center justify-center ${isChecked ? 'border-red bg-[#EA2147]' : 'border-[#EA2147]'
        }`}>
        <Image className={`${isChecked ? '' : 'hidden'}`} src={`/redCheck.svg`} alt='check' width={12} height={12} />
        <input
          id={id}
          type="checkbox"
          {...register(id)}
          checked={isChecked}
          onChange={toggleChecked} // Ensure state is updated correctly
          className="hidden"
          disabled={disabled}
        />
      </div>
      <span className='text-xs text-[#EA2147] font-semibold'>{label}</span>

    </label>
  );
}

export default RedCheckbox;