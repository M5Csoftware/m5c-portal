'use client'
import React, { useState } from 'react';
import Image from 'next/image';

const CustomDropdown = ({ options, selectedOption, onSelect, title }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="border border-[#979797] rounded-[4px]  px-6 py-4 cursor-pointer"
            >
                {selectedOption ? selectedOption.label : `${title}`}
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full shadow-md bg-white rounded-[4px] mt-1">
                    {options.map((option, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelect(option)}
                            className=" px-6 py-4 hover:bg-gray-100 cursor-pointer flex flex-col"
                        >
                            <span className="text-xs">{option.label}</span>
                            <p className="text-[8px] text-gray-500">{option.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
