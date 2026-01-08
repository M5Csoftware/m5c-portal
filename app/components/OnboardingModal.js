'use client'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import PasswordSetupModal from '@/app/components/PasswordSetupModal'
import CompanyProfileModal from './CompanyProfileModal'
import ClientImportModal from './ClientImportModal'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { GlobalContext } from '../portal/GlobalContext'

const stepsList = [
    { id: 1, title: "Set a password", buttonText: "Set", type: "modal", action: "password", key: "passwordSet" },
    { id: 2, title: "Build Your Company Profile", buttonText: "Build", type: "modal", action: "companyProfile", key: "companyProfileCompleted" },
    { id: 3, title: "Complete Your KYC", buttonText: "Upload", type: "route", action: "/portal/profile", key: "kycCompleted" },
    { id: 4, title: "Import Your Client Directory", buttonText: "Browse", type: "modal", action: "clientsImported", key: "clientsImported" },
    { id: 5, title: "Create Your First Shipment", buttonText: "Create", type: "route", action: "/portal/createshipment", key: "shipmentCreated" },
];

const OnboardingModal = () => {
    const [steps, setSteps] = useState(stepsList);
    const [activeModal, setActiveModal] = useState(null);
    const router = useRouter();
    const { data: session } = useSession();
    const { server } = useContext(GlobalContext);

    // ✅ Fetch user's onboarding progress on mount / refresh
    useEffect(() => {
        const fetchProgress = async () => {
            if (!session?.user?.id) return;

            try {
                const res = await axios.get(`${server}/portal/auth/register?id=${session.user.id}`);
                const user = res.data;
                const progress = user?.onboardingProgress || {};

                // Update steps with backend completion data
                const updatedSteps = stepsList.map(step => ({
                    ...step,
                    completed: !!progress[step.key],
                }));

                setSteps(updatedSteps);
            } catch (error) {
                console.error("Failed to fetch onboarding progress:", error.response?.data?.error || error.message);
            }
        };

        fetchProgress();
    }, [session, server]);

    // ✅ Handle button click actions
    const handleAction = (step) => {
        if (step.type === 'modal') {
            setActiveModal(step.action);
        } else if (step.type === 'route') {
            router.push(step.action);
        }
    };

    // ✅ Handle marking step as complete + update backend
    const handleComplete = async (id) => {
        const updatedSteps = steps.map((step) =>
            step.id === id ? { ...step, completed: true } : step
        );
        setSteps(updatedSteps);
        setActiveModal(null);

        try {
            const progressMap = {
                1: { passwordSet: true },
                2: { companyProfileCompleted: true },
                3: { kycCompleted: true },
                4: { clientsImported: true },
                5: { shipmentCreated: true },
            };

            const field = progressMap[id];
            const userId = session?.user?.id;

            if (!userId) {
                console.error("User ID missing from session");
                return;
            }

            await axios.put(`${server}/portal/auth/register/updated-onboarding?id=${userId}`, {
                onboardingProgress: field,
            });

            // ✅ Re-fetch latest progress after update
            const res = await axios.get(`${server}/portal/auth/register?id=${userId}`);
            const user = res.data;
            const progress = user?.onboardingProgress || {};

            const refreshedSteps = stepsList.map(step => ({
                ...step,
                completed: !!progress[step.key],
            }));
            setSteps(refreshedSteps);

            console.log("Onboarding progress synced:", progress);
        } catch (error) {
            console.error("Failed to update onboarding:", error.response?.data?.error || error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex z-50">
            <div className="bg-gradient-to-b from-[#FFD6D9] via-[#FFE8E9] to-[#E8EEF5] rounded-xl w-[350px] p-6 shadow-2xl flex flex-col gap-6 h-[630px] absolute right-5 top-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#0E0F0F]">Welcome User</h2>
                    <p className="text-sm text-[#0E0F0F] mt-1">Get Started in 5 steps</p>
                </div>

                <div className="flex flex-col gap-3">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg px-3 py-3 shadow-sm gap-2">
                            <div className="flex items-center">
                                {step.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-[#188C43] flex items-center justify-center flex-shrink-0 mr-2 my-2">
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    </div>
                                ) : (
                                    <span className="text-[#0E0F0F] font-semibold text-sm pr-1 flex-shrink-0">{index + 1}.</span>
                                )}
                                <span className="text-xs font-medium text-[#0E0F0F]">{step.title}</span>
                            </div>

                            {!step.completed && (
                                <button
                                    onClick={() => handleAction(step)}
                                    className="bg-[#EA1B40] hover:bg-[#c91530] text-white text-sm py-2 w-[80px] rounded-md font-semibold transition-colors"
                                >
                                    {step.buttonText}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-modals */}
            {activeModal === 'password' && PasswordSetupModal && (
                <PasswordSetupModal onComplete={() => handleComplete(1)} />
            )}
            {activeModal === 'companyProfile' && CompanyProfileModal && (
                <CompanyProfileModal onComplete={() => handleComplete(2)} />
            )}
            {activeModal === 'clientsImported' && ClientImportModal && (
                <ClientImportModal onComplete={() => handleComplete(4)} />
            )}
        </div>
    );
};

export default OnboardingModal;
