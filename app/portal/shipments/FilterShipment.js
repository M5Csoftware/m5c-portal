import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../GlobalContext.js';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Slider } from '@mui/material';

function FilterShipment() {
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

    const { filterShipmentWindow, setFilterShipmentWindow } = useContext(GlobalContext);


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
        setFilterShipmentWindow(false)
       


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
            <div className="relative w-full text-sm  " >
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

            <div className={`transition-all duration-500 ease-in-out ${filterShipmentWindow ? 'max-w-[600px]' : 'max-w-0 opacity-0'}`}>
                <div className='flex justify-between p-6'>
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-xl text-[#18181B]'>Filters</h2>
                    </div>
                    <button className='flex' onClick={() => setFilterShipmentWindow(false)}>
                        <Image src={`/customer-support/close-button.svg`} alt='close window' width={24} height={24} />
                    </button>
                </div>
                <Image src={`/customer-support/window-line.svg`} alt='close window' width={600} height={0} />
                <div className='p-6'>
                    <form className='h-[80vh]' onSubmit={handleSubmit(onSubmit)}>
                        <div className='flex h-full flex-col justify-between gap-4 '>
                            <div className='text-sm w-full flex flex-col gap-6 '>
                                <div className='flex gap-6'>
                                    <label htmlFor='All'
                                        className={`flex gap-4  rounded-md  ${filterRadioButton === 'All'
                                            ? ' text-[#EA1B40]'
                                            : ' text-[#979797]'
                                            } cursor-pointer`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('FilterType')}
                                            value="All"
                                            id="All"
                                            defaultChecked
                                            className={`${filterRadioButton === 'All'
                                                ? ' accent-[#EA1B40]'
                                                : ' accent-[#979797]'
                                                } `}
                                        />
                                        <div>All</div>
                                    </label>
                                    <label htmlFor="Invoiced"
                                        className={`flex gap-4  rounded-md  ${filterRadioButton === 'Invoiced'
                                            ? ' text-[#EA1B40]'
                                            : ' text-[#979797]'
                                            } cursor-pointer`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('FilterType')}
                                            value="Invoiced"
                                            id="Invoiced"
                                            className={`${filterRadioButton === 'Invoiced'
                                                ? ' accent-[#EA1B40]'
                                                : ' accent-[#979797]'
                                                } `}
                                        />
                                        <div>Invoiced</div>
                                    </label>
                                    <label htmlFor="New"
                                        className={`flex gap-4  rounded-md  ${filterRadioButton === 'New'
                                            ? ' text-[#EA1B40]'
                                            : ' text-[#979797]'
                                            } cursor-pointer`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('FilterType')}
                                            value="New"
                                            id="New"
                                            className={`${filterRadioButton === 'New'
                                                ? ' accent-[#EA1B40]'
                                                : ' accent-[#979797]'
                                                } `}
                                        />
                                        <div >New</div>
                                    </label>
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <label htmlFor='m5-coin'
                                        className={`flex gap-4  rounded-md w-fit text-[#979797] cursor-pointer`}
                                    >
                                        <input
                                            type="checkbox"
                                            {...register('m5-coin')}
                                            value="m5-coin"
                                            id="m5-coin"

                                        />
                                        <div>Shipment with M5 Coin Discount</div>
                                    </label>
                                    <label htmlFor='rto'
                                        className={`flex gap-4  rounded-md w-fit text-[#979797] cursor-pointer`}
                                    >
                                        <input
                                            type="checkbox"
                                            {...register('rto')}
                                            value="rto"
                                            id="rto"

                                        />
                                        <div>Applied for RTO</div>
                                    </label>
                                    <label htmlFor='in-transit'
                                        className={`flex gap-4  rounded-md w-fit text-[#979797] cursor-pointer`}
                                    >
                                        <input
                                            type="checkbox"
                                            {...register('in-transit')}
                                            value="in-transit"
                                            id="in-transit"

                                        />
                                        <div>In-Transit Shipments</div>
                                    </label>
                                    <label htmlFor='delivered'
                                        className={`flex gap-4  rounded-md w-fit text-[#979797] cursor-pointer`}
                                    >
                                        <input
                                            type="checkbox"
                                            {...register('delivered')}
                                            value="delivered"
                                            id="delivered"

                                        />
                                        <div>Delivered Shipments</div>
                                    </label>
                                </div>
                                <div className='flex flex-col'>
                                    <div className="flex gap-12 items-center justify-between">
                                        <div className="text-sm text-[#979797]  min-w-52 max-w-54">
                                            Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                                        </div>
                                        <Slider

                                            value={priceRange}
                                            onChange={handlePriceChange}
                                            valueLabelDisplay="auto"
                                            min={0}
                                            max={5000}
                                            getAriaLabel={() => 'Price range'}
                                            disableSwap
                                            step={1}
                                            sx={{
                                                width: '100%',
                                                color: '#979797', // Customize the slider color
                                                '& .MuiSlider-thumb': {
                                                    outline: '2px solid #979797',
                                                    border: '6px solid #fff',
                                                    // boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)'


                                                }, '& .MuiSlider-thumb::before': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-12 items-center justify-between">
                                        <div className="text-sm text-[#979797]  min-w-52 max-w-56">
                                            Chargable Weight: {weightRange[0]}kg - {weightRange[1]}kg
                                        </div>
                                        <Slider

                                            value={weightRange}
                                            onChange={handleWeightChange}
                                            valueLabelDisplay="auto"
                                            min={0.5}
                                            max={12.0}
                                            getAriaLabel={() => 'Weight range'}
                                            disableSwap
                                            step={0.1}
                                            sx={{
                                                width: '100%',
                                                color: '#979797', // Customize the slider color
                                                '& .MuiSlider-thumb': {
                                                    outline: '2px solid #979797',
                                                    border: '6px solid #fff',
                                                    // boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)'


                                                }, '& .MuiSlider-thumb::before': {
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <CustomDropdown
                                        options={paymentMethod}
                                        selectedOption={paymentFilter}
                                        onSelect={setPaymentFilter}
                                        title="Filter by Payment Method"
                                        name="paymentFilter"
                                    />
                                    <CustomDropdown
                                        options={service}
                                        selectedOption={serviceFilter}
                                        onSelect={setServiceFilter}
                                        title="Filter by Forwarder or Service selected"
                                        name="serviceFilter"
                                    />
                                    <CustomDropdown
                                        options={country}
                                        selectedOption={countryFilter}
                                        onSelect={setCountryFilter}
                                        title="Filter by Delivery Country"
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

export default FilterShipment;
