import React, { useContext, useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GlobalContext } from '../portal/GlobalContext';
import axios from 'axios';

export default function CompanyProfileModal({ onComplete }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1 - Registered Address
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        city: '',
        state: '',
        country: '',
        // Step 2 - Business Address
        sameAsRegistered: false,
        businessAddressLine1: '',
        businessAddressLine2: '',
        businessPincode: '',
        businessCity: '',
        businessState: '',
        businessCountry: '',
        useForPickup: false,
        // Step 3 - Contact Details
        companyPersonName: '',
        email: '',
        mobileNumber: '',
        cinNumber: '',
        panNumber: '',
        serviceTaxNumber: '',
        tanNumber: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { data: session } = useSession();
    const { server } = useContext(GlobalContext);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isStep1Valid = formData.addressLine1 && formData.pincode && formData.city && formData.state && formData.country;
    const isStep2Valid = formData.sameAsRegistered || (formData.businessAddressLine1 && formData.businessPincode && formData.businessCity && formData.businessState && formData.businessCountry);
    const isStep3Valid = formData.companyPersonName && formData.email && formData.mobileNumber;


    const handleNext = () => {
        if (step === 1 && isStep1Valid) setStep(2);
        else if (step === 2 && isStep2Valid) setStep(3);
    };

    const handleSubmit = async () => {
        if (!isStep3Valid) return;

        try {
            const res = await axios.post(`${server}/portal/companyprofile`, {
                userId: session?.user?.id,
                accountCode: session?.user?.accountCode,
                ...formData,
            });

            if (res.data.success) {
                console.log("Company profile saved successfully:", res.data.companyProfile);
                setIsSubmitted(true);
                onComplete();
            }
        } catch (err) {
            console.error("Failed to save company profile:", err.response?.data || err.message);
        }
    };

    // Auto fetch city/state/country from pincode
    useEffect(() => {
        const fetchAddress = async () => {
            if (formData.pincode.length === 6) {
                try {
                    const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await res.json();

                    if (data[0].Status === "Success") {
                        const post = data[0].PostOffice[0];

                        setFormData(prev => ({
                            ...prev,
                            city: post.District,
                            state: post.State,
                            country: post.Country
                        }));
                    }
                } catch (error) {
                    console.log("Failed to fetch address:", error);
                }
            }
        };

        fetchAddress();
    }, [formData.pincode]);


    const renderProgressBar = () => {
        return (
            <div className="mb-6">
                <div className="text-sm text-[#333333] mb-3">Step {step}/3</div>
                <div className="flex gap-2">
                    <div className={`flex-1 h-1.5 rounded-full ${step > 1 ? 'bg-[#FB3851]' : 'bg-gray-200'}`} />
                    <div className={`flex-1 h-1.5 rounded-full ${step > 2 ? 'bg-[#FB3851]' : 'bg-gray-200'}`} />
                    <div className={`flex-1 h-1.5 rounded-full ${step >= 3 ? 'bg-[#FB3851]' : 'bg-gray-200'}`} />
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="space-y-5">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-[#FB3851]" />
                    <h4 className="text-base font-semibold text-[#333333]">Add your Registered Address</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">This is the registered address of your Company/Business</p>
            </div>

            <input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                placeholder="Enter Address Line 1"
            />

            <input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                placeholder="Enter Address Line 2"
            />

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="Pincode"
                />
                <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="City"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="State"
                />
                <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="Country"
                />
            </div>

            <div className="bg-[#FBF3E0] border border-[#F9F06D] rounded-md p-3">
                <p className="text-sm font-medium text-[#C3B600] mb-1">Why we need this?</p>
                <p className="text-xs text-[#C3B600]">This address will be used as your official company address on billing address, shipping labels, freights invoices, etc.</p>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <h4 className="text-base font-semibold text-gray-900">Add your Business Address</h4>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.sameAsRegistered}
                            onChange={(e) => {
                                const checked = e.target.checked;

                                setFormData(prev => ({
                                    ...prev,
                                    sameAsRegistered: checked,
                                    businessAddressLine1: checked ? prev.addressLine1 : "",
                                    businessAddressLine2: checked ? prev.addressLine2 : "",
                                    businessPincode: checked ? prev.pincode : "",
                                    businessCity: checked ? prev.city : "",
                                    businessState: checked ? prev.state : "",
                                    businessCountry: checked ? prev.country : ""
                                }));
                            }}

                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        Same as Registered Address
                    </label>
                </div>
                <p className="text-sm text-gray-500 mb-4">This is the registered address of your Company/Business</p>
            </div>

            <input
                type="text"
                value={formData.businessAddressLine1}
                onChange={(e) => handleChange('businessAddressLine1', e.target.value)}
                disabled={formData.sameAsRegistered}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter Address Line 1"
            />

            <input
                type="text"
                value={formData.businessAddressLine2}
                onChange={(e) => handleChange('businessAddressLine2', e.target.value)}
                disabled={formData.sameAsRegistered}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter Address Line 2 (optional)"
            />

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    value={formData.businessPincode}
                    onChange={(e) => handleChange('businessPincode', e.target.value)}
                    disabled={formData.sameAsRegistered}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter Pincode"
                />
                <input
                    type="text"
                    value={formData.businessCity}
                    onChange={(e) => handleChange('businessCity', e.target.value)}
                    disabled={formData.sameAsRegistered}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="City"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    value={formData.businessState}
                    onChange={(e) => handleChange('businessState', e.target.value)}
                    disabled={formData.sameAsRegistered}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="State"
                />
                <input
                    type="text"
                    value={formData.businessCountry}
                    onChange={(e) => handleChange('businessCountry', e.target.value)}
                    disabled={formData.sameAsRegistered}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Country"
                />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.useForPickup}
                    onChange={(e) => handleChange('useForPickup', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                Use this for Pickup Address
            </label>

            <div className="bg-[#FBF3E0] border border-[#F9F06D] rounded-md p-3">
                <p className="text-sm font-medium text-[#C3B600] mb-1">Why we need this?</p>
                <p className="text-xs text-[#C3B600]">This address will be used as your official company address on billing address, shipping labels, freights invoices, etc.</p>
            </div>
        </div>
    );

    const renderStep3 = () => {
        if (isSubmitted) {
            return (
                <div className="py-12 text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">You&apos;re Almost Done!</h3>
                    <p className="text-sm text-gray-600 mb-8">
                        Activate your account for shipping by completing the KYC verification step<br />
                        with your Aadhaar, PAN or GSTIN
                    </p>

                    <div className="flex gap-3 max-w-md mx-auto mb-6">
                        <button
                            onClick={() => {
                                setTimeout(() => onComplete(), 500);
                            }}
                            className="flex-1 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
                        >
                            Proceed to verify KYC
                        </button>
                        <button
                            onClick={() => {
                                setTimeout(() => onComplete(), 500);
                            }}
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>

                    <div className="bg-[#FBF3E0] border border-[#F9F06D] rounded-md py-4 mt-[50px]">
                        <p className="text-xs text-[#C3B600]">
                            Note: KYC is mandatory for Identification proof to use for SME rates update.
                        </p>
                    </div>
                    <div className="mt-[150px]">
                        <p className="text-xs text-[#979797]">
                            For any assistance
                        </p>
                        <p className="text-xs text-[#979797]">
                            Write to us at
                            <span className='px-1 text-[#333333]'>
                                support@m5clogs.com
                            </span>
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <h4 className="text-base font-semibold text-gray-900">Add your Contact Details</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">This is the registered address of your Company/Business</p>
                </div>

                <input
                    type="text"
                    value={formData.companyPersonName}
                    onChange={(e) => handleChange('companyPersonName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="Company Person Name"
                />

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Email"
                    />
                    <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => handleChange('mobileNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Whatsapp/Mobile Number"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={formData.cinNumber}
                        onChange={(e) => handleChange('cinNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="CIN Number"
                    />
                    <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => handleChange('panNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="PAN Number"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={formData.serviceTaxNumber}
                        onChange={(e) => handleChange('serviceTaxNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="Service Tax/ GST Number"
                    />
                    <input
                        type="text"
                        value={formData.tanNumber}
                        onChange={(e) => handleChange('tanNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                        placeholder="TAN Number"
                    />
                </div>

                <div className="bg-[#FBF3E0] border border-[#F9F06D] rounded-md p-3">
                    <p className="text-sm font-medium text-[#C3B600] mb-1">Why we need this?</p>
                    <p className="text-xs text-[#C3B600]">These details will be used in order to contact your business and for CSV shipment setting</p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
            <div className="bg-white rounded-lg w-[750px] shadow-2xl h-[650px]">
                <div className="p-8">
                    {/* Progress Bar */}
                    {renderProgressBar()}

                    {/* Form Steps */}
                    <div className="mb-8">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </div>

                    {/* Action Buttons */}
                    {!isSubmitted && (
                        <div className="flex justify-center">
                            <button
                                onClick={step < 3 ? handleNext : handleSubmit}
                                disabled={
                                    (step === 1 && !isStep1Valid) ||
                                    (step === 2 && !isStep2Valid) ||
                                    (step === 3 && !isStep3Valid)
                                }
                                className={`px-16 py-3 rounded-md font-medium transition-colors ${((step === 1 && isStep1Valid) ||
                                    (step === 2 && isStep2Valid) ||
                                    (step === 3 && isStep3Valid))
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {step < 3 ? 'Next' : 'Done'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}