import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

function AddressPicker({ type, onClose, Addresses, selectedAdd }) {
    const [bgPos, setBgPos] = useState(false); // bgPos false = Consignor, true = Consignee
    const modalRef = useRef(null);

    // Close modal on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, onClose]);

    // Filter addresses based on address type (Consignor/Consignee)
    const filteredAddresses = Addresses.filter(address => 
        bgPos ? address.addressType === 'Consignee' : address.addressType === 'Consignor'
    );

    // Prevent background scrolling when wallet is open
  useEffect(() => {
    if (modalRef) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable scrolling
    }

    // Cleanup function to reset the overflow when the component unmounts or when walletOpen changes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalRef]);

    return (
        <div ref={modalRef} className="flex flex-col gap-9 bg-white rounded-[20px] w-[830px] h-[570px] px-6 py-9">
            <div className='flex flex-col gap-4'>
                <div className='flex justify-between items-start'>
                    <h2 className="text-xl font-bold mb-4">My Address Book</h2>
                    <button onClick={onClose} className="">
                        <Image src={'/close-button.svg'} alt='close btn' width={24} height={24} />
                    </button>
                </div>
                <div className='flex justify-between w-full items-center'>
                    <div className='   flex border border-[#979797] rounded-full p-0.5 relative overflow-hidden items-center'>
                        <div className={`transition-transform ${bgPos ? 'translate-x-[6.25rem]' : ""} bg-[var(--primary-color)] w-[100px]  h-[90%] absolute rounded-full -z-0`}></div>
                        <div onClick={() => setBgPos(false)} className={`flex items-center justify-center  w-[100px] py-2 text-center   rounded-full  ${bgPos ? 'text-[#979797]' : "text-white font-bold "}   text-xs z-0 transition-colors`}>Consignor</div>
                        <div onClick={() => setBgPos(true)} className={`flex items-center justify-center  w-[100px] py-2 text-center rounded-full ${bgPos ? 'text-white font-bold ' : "text-[#979797] "}  text-xs z-0 transition-colors`}>Consignee</div>
                    </div>
                    <div className='rounded-md flex items-center gap-2 px-[11px] py-[6px] w-[190px] h-9 border border-[#979797]'>
                        <Image className='text-[#2D3748]' width={20} height={20} src='/search.svg' alt='Search' />
                        <input className='bg-transparent text-[#71717A] outline-none text-xs' type="text" placeholder='Search Address Book' />
                    </div>
                </div>
            </div>

            <div className='flex flex-wrap gap-3 overflow-y-auto scrollbar-hide'>
                {filteredAddresses.map((address) => (
                    <AddressCard key={address._id} address={address} selectedAdd={() => selectedAdd(address)} />
                ))}
            </div>
        </div>
    );
}

function AddressCard({ address, selectedAdd }) {
    return (
        <div className='w-[250px] flex flex-col border border-[#e2e8f0] rounded-md overflow-hidden'>
            <div className='h-2 bg-[var(--primary-color)]'></div>
            <div className='text-xs px-5 pb-4 pt-2 flex flex-col justify-between h-full gap-3'>
                <div className='flex flex-col gap-3'>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-1.5'>
                            <div className='mt-1'>
                                <Image src={'/address-card-name.svg'} alt='' width={17} height={17} />
                            </div>
                            <span className='font-bold text-[#18181b]'>{address.fullName}</span>
                        </div>
                        <div className='uppercase text-[8px] bg-[#e2e8f0] px-2 py-0.5 rounded-sm text-[#718096]'>{address.kycType}</div>
                    </div>
                    <div className='text-[#979797] flex flex-col gap-2'>
                        <span className='text-ellipsis-2-lines'>{address.addressLine1} {address.addressLine2}, {address.city}, {address.state}, {address.pincode}, {address.country}</span>
                        <div className='flex flex-col gap-1'>
                            <div className='flex gap-2 items-center'>
                                <Image src={"/address-card-phone.svg"} alt='' width={17} height={17} />
                                <span>{address.phoneNumber}</span>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <Image src={"/address-card-email.svg"} alt='' width={17} height={17} />
                                <span>{address.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button type='button' onClick={selectedAdd} className='bg-[var(--primary-color)] text-white font-bold text-[11px] p-1 rounded'>Select Address</button>
            </div>
        </div>
    );
}

export default AddressPicker;
