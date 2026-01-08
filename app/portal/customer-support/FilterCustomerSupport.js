import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../GlobalContext.js';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Slider } from '@mui/material';

function FilterCustomerSupport() {
    const paymentMethod = [
        {
            value: 'credit',
            label: 'Credit Card',
        },
        {
            value: 'debit',
            label: 'Debit Card',
        },
        {
            value: 'paypal',
            label: 'PayPal',
        },
        {
            value: 'netbanking',
            label: 'Net Banking',
        },
        {
            value: 'upi',
            label: 'UPI',
        },
        {
            value: 'cash',
            label: 'Cash on Delivery',
        }

    ];
    const service = [
        {
            value: 'fedx',
            label: 'Fedx',
        },
        {
            value: 'cp',
            label: 'Courier Please',
        },

    ];
    const country = [
        {
            value: 'usa',
            label: 'USA',
        },
        {
            value: 'ind',
            label: 'India',
        },
        {
            value: 'uk',
            label: 'UK',
        },
        {
            value: 'canada',
            label: 'Canada',
        },
        {
            value: 'aus',
            label: 'Australia',
        },
        {
            value: 'ind',
            label: 'India',
        },

    ];
    const consignment = [
        {
            value: 'consignee',
            label: 'Consignee',
        },
        {
            value: 'consigner',
            label: 'Consigner',
        }

    ];

    const [paymentFilter, setPaymentFilter] = useState(null);
    const [serviceFilter, setServiceFilter] = useState(null);
    const [countryFilter, setCountryFilter] = useState(null);
    const [consignmentFilter, setConsignmentFilter] = useState(null);

    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();

    const { filterCustomerSupportWindow, setFilterCustomerSupportWindow } = useContext(GlobalContext);


    const filterRadioButton = watch('FilterType', 'All');

    const [priceRange, setPriceRange] = useState([0, 5000]);
    const [weightRange, setWeightRange] = useState([0.5, 12.0]);

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };
    const handleWeightChange = (event, newValue) => {
        setWeightRange(newValue);
    };


    const onSubmit = async (data) => {
        console.log({
            ...data,

        });
        setFilterCustomerSupportWindow(false)



    };
    const onReset = () => {
        reset(); // Resets the form fields
        setValue('FilterType', 'All'); // Reset the radio button to "All"
        setPaymentFilter(null);
        setServiceFilter(null);
        setCountryFilter(null);
        setConsignmentFilter(null);
        setPriceRange([0, 5000]);
        setWeightRange([0.5, 12]);
    };

    const CustomDropdown = ({ options, selectedOption, onSelect, title }) => {
        const [isOpen, setIsOpen] = useState(false);

        const handleSelect = (option) => {
            onSelect(option);
            setIsOpen(false);
        };

        return (
            <div className="relative w-full text-sm">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="border border-[#979797] rounded-[4px] text-[#979797] px-6 py-4 cursor-pointer"
                >
                    {selectedOption ? selectedOption.label : `${title}`}
                </div>
                {isOpen && (
                    <div className="absolute z-10 w-full max-h-40 shadow-md overflow-y-auto bg-white rounded-[4px] mt-1">
                        {options.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelect(option)}
                                className=" px-6 py-4 hover:bg-gray-100 cursor-pointer flex flex-col"
                            >
                                <span className="text-xs">{option.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Function to check if the form is valid
    const isFormValid = () => {
        return watch('awbNumber');
    };

    return (
        <div className='relative'>

            <div className={`transition-all duration-500 ease-in-out ${filterCustomerSupportWindow ? 'max-w-[600px]' : 'max-w-0 opacity-0'}`}>
                <div className='flex justify-between p-6'>
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-xl text-[#18181B]'>Filters</h2>
                    </div>
                    <button className='flex' onClick={() => setFilterCustomerSupportWindow(false)}>
                        <Image src={`/customer-support/close-button.svg`} alt='close window' width={24} height={24} />
                    </button>
                </div>
                <Image src={`/customer-support/window-line.svg`} alt='close window' width={600} height={0} />
                <div className='p-6'>
                    <form className='h-[80vh]' onSubmit={handleSubmit(onSubmit)}>
                        <div className='flex h-full flex-col justify-between gap-4 '>
                            <div className='text-sm w-full flex flex-col gap-6 '>

                                <div className='flex flex-col gap-4'>

                                    <CustomDropdown
                                        options={country}
                                        selectedOption={countryFilter}
                                        onSelect={setCountryFilter}
                                        title="Filter by Destination"
                                        name="countryFilter"
                                    />
                                    <CustomDropdown
                                        options={consignment}
                                        selectedOption={consignmentFilter}
                                        onSelect={setConsignmentFilter}
                                        title="Filter by Consignee/Consignor"
                                        name="consignmentFilter"
                                    />
                                </div>

                            </div>
                            <div className='flex gap-2 '>
                                <button
                                    type='submit'
                                    className={`w-full text-white text-sm rounded-md px-12 py-[14px] transition-all duration-500 bg-[var(--primary-color)] font-semibold`}
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type='button'
                                    onClick={onReset}
                                    className={`w-full text-[#979797] text-sm rounded-md px-12 py-[14px] border border-[#979797] transition-all duration-500  font-semibold`}
                                >
                                    Reset Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>


        </div>
    );
}

export default FilterCustomerSupport;
