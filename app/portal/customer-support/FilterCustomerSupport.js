import React, { useState, useContext, useEffect } from 'react';
import { GlobalContext } from '../GlobalContext.js';
import Image from 'next/image';
import { useForm } from 'react-hook-form';

function FilterCustomerSupport({ onApplyFilters }) {
    const { ticketsData } = useContext(GlobalContext); // Get tickets data from context
    
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

    // Extract unique values from tickets data for new filters
    const [ticketIdOptions, setTicketIdOptions] = useState([]);
    const [awbNumberOptions, setAwbNumberOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    // Populate dropdown options from tickets data
    useEffect(() => {
        if (ticketsData && Array.isArray(ticketsData)) {
            // Get unique ticket IDs
            const uniqueTicketIds = [...new Set(ticketsData.map(ticket => ticket.ticketId || ticket.displayTicketId).filter(Boolean))];
            setTicketIdOptions(uniqueTicketIds.map(id => ({ value: id, label: id })));

            // Get unique AWB numbers
            const uniqueAwbNumbers = [...new Set(ticketsData.map(ticket => ticket.awbNo).filter(Boolean))];
            setAwbNumberOptions(uniqueAwbNumbers.map(awb => ({ value: awb, label: awb })));

            // Get unique sub categories
            const uniqueSubCategories = [...new Set(ticketsData.map(ticket => ticket.subCategory).filter(Boolean))];
            setSubCategoryOptions(uniqueSubCategories.map(cat => ({ value: cat, label: cat })));

            // Get unique statuses
            const uniqueStatuses = [...new Set(ticketsData.map(ticket => ticket.status).filter(Boolean))];
            setStatusOptions(uniqueStatuses.map(status => ({ value: status, label: status })));
        }
    }, [ticketsData]);

    const [countryFilter, setCountryFilter] = useState(null);
    const [consignmentFilter, setConsignmentFilter] = useState(null);
    
    // New state for additional filters
    const [ticketIdFilter, setTicketIdFilter] = useState(null);
    const [awbNumberFilter, setAwbNumberFilter] = useState(null);
    const [subCategoryFilter, setSubCategoryFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);

    const { register, handleSubmit, setValue, reset, watch } = useForm();

    const { filterCustomerSupportWindow, setFilterCustomerSupportWindow } = useContext(GlobalContext);

    const onSubmit = async (data) => {
        // Create filters object with all selected filters
        const filters = {
            destination: countryFilter,
            consignmentType: consignmentFilter,
            ticketId: ticketIdFilter,
            awbNumber: awbNumberFilter,
            subCategory: subCategoryFilter,
            status: statusFilter,
            ...data
        };
        
        console.log('Applying filters:', filters);
        
        // Pass filters to parent component
        if (onApplyFilters) {
            onApplyFilters(filters);
        }
        
        setFilterCustomerSupportWindow(false);
    };

    const onReset = () => {
        reset();
        setValue('FilterType', 'All');
        setCountryFilter(null);
        setConsignmentFilter(null);
        setTicketIdFilter(null);
        setAwbNumberFilter(null);
        setSubCategoryFilter(null);
        setStatusFilter(null);
        
        // Clear filters in parent
        if (onApplyFilters) {
            onApplyFilters(null);
        }
    };

    const CustomDropdown = ({ options, selectedOption, onSelect, title }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');

        const filteredOptions = options.filter(option => 
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleSelect = (option) => {
            onSelect(option);
            setIsOpen(false);
            setSearchTerm('');
        };

        return (
            <div className="relative w-full text-sm">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="border border-[#979797] rounded-[4px] text-[#979797] px-6 py-4 cursor-pointer flex justify-between items-center"
                >
                    <span>{selectedOption ? selectedOption.label : `${title}`}</span>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                {isOpen && (
                    <div className="absolute z-10 w-full max-h-60 shadow-md overflow-hidden bg-white rounded-[4px] mt-1 border border-gray-200">
                        <div className="p-2 border-b">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelect(option)}
                                        className="px-6 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    >
                                        <span className="text-sm">{option.label}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-3 text-gray-400 text-center">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
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
                    <form className='h-[80vh] overflow-y-auto' onSubmit={handleSubmit(onSubmit)}>
                        <div className='flex h-full flex-col justify-between gap-4'>
                            <div className='text-sm w-full flex flex-col gap-6'>
                                <div className='flex flex-col gap-4'>
                                    {/* Ticket Information Filters */}
                                    <h3 className="font-semibold text-gray-700 mt-2">Ticket Information</h3>
                                    
                                    <CustomDropdown
                                        options={ticketIdOptions}
                                        selectedOption={ticketIdFilter}
                                        onSelect={setTicketIdFilter}
                                        title="Filter by Ticket ID"
                                    />
                                    
                                    <CustomDropdown
                                        options={awbNumberOptions}
                                        selectedOption={awbNumberFilter}
                                        onSelect={setAwbNumberFilter}
                                        title="Filter by AWB Number"
                                    />
                                    
                                    <CustomDropdown
                                        options={subCategoryOptions}
                                        selectedOption={subCategoryFilter}
                                        onSelect={setSubCategoryFilter}
                                        title="Filter by Sub Category"
                                    />
                                    
                                    <CustomDropdown
                                        options={statusOptions}
                                        selectedOption={statusFilter}
                                        onSelect={setStatusFilter}
                                        title="Filter by Status"
                                    />

                                    <h3 className="font-semibold text-gray-700 mt-4">Additional Filters</h3>

                                    <CustomDropdown
                                        options={country}
                                        selectedOption={countryFilter}
                                        onSelect={setCountryFilter}
                                        title="Filter by Destination"
                                    />
                                    
                                    <CustomDropdown
                                        options={consignment}
                                        selectedOption={consignmentFilter}
                                        onSelect={setConsignmentFilter}
                                        title="Filter by Consignee/Consignor"
                                    />
                                </div>
                            </div>
                            <div className='flex gap-2 sticky bottom-0 bg-white py-4'>
                                <button
                                    type='submit'
                                    className='w-full text-white text-sm rounded-md px-12 py-[14px] transition-all duration-500 bg-[var(--primary-color)] font-semibold'
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type='button'
                                    onClick={onReset}
                                    className='w-full text-[#979797] text-sm rounded-md px-12 py-[14px] border border-[#979797] transition-all duration-500 font-semibold'
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