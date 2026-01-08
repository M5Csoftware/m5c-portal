'use client';
import React, { useState, useRef, useEffect, useContext } from 'react';
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { GlobalContext } from '../../GlobalContext';

function ChatBot() {
    const { server } = useContext(GlobalContext);
    const { data: session } = useSession();
    const [isOpened, setIsOpened] = useState(false);
    const [messages, setMessages] = useState([
        { text: '👋 Hi there! How can I help you today?', from: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [awbInput, setAwbInput] = useState('');
    const [showAwbInput, setShowAwbInput] = useState(false);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(null);

    // Enhanced rate calculator state
    const [rateCalcStep, setRateCalcStep] = useState(0);
    const [rateCalcData, setRateCalcData] = useState({
        sector: '',
        destinationCountry: '',
        destinationZipcode: '',
        actualWeight: '',
        length: '',
        width: '',
        height: '',
        shipmentPurpose: 'Commercial'
    });
    const [showRateCalcForm, setShowRateCalcForm] = useState(false);

    const router = useRouter();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleChatBot = () => {
        setIsOpened(!isOpened);
    };

    const handleSend = () => {
        if (input.trim()) {
            const userMessage = input.trim();
            const newMessages = [...messages, { text: userMessage, from: 'user' }];

            const lowerInput = userMessage.toLowerCase();

            // Check for confirmation responses
            if (waitingForConfirmation) {
                if (lowerInput === 'yes' || lowerInput === 'y' || lowerInput === 'sure' || lowerInput === 'ok' || lowerInput === 'okay') {
                    handleOptionClick(waitingForConfirmation);
                    setWaitingForConfirmation(null);
                    setMessages(newMessages);
                    setInput('');
                    return;
                } else if (lowerInput === 'no' || lowerInput === 'n' || lowerInput === 'nope') {
                    newMessages.push({
                        text: "No problem! Is there anything else I can help you with?",
                        from: 'bot',
                        type: 'main_menu'
                    });
                    setWaitingForConfirmation(null);
                    setMessages(newMessages);
                    setInput('');
                    return;
                }
            }

            if (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput === 'menu') {
                newMessages.push({
                    text: "I can assist with a variety of logistics tasks:",
                    from: 'bot',
                    type: 'main_menu'
                });
            } else if (lowerInput.includes('track')) {
                newMessages.push({
                    text: "I can help you track your shipment! Please enter your AWB number:",
                    from: 'bot',
                    type: 'awb_input'
                });
                setShowAwbInput(true);
            } else if (lowerInput.includes('rate') || lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('calculate') || lowerInput.includes('shipping')) {
                newMessages.push({
                    text: "I can help calculate shipping costs! Would you like to:",
                    from: 'bot',
                    type: 'rate_options'
                });
            } else if (lowerInput.includes('book')) {
                newMessages.push({
                    text: "Let me redirect you to the shipment booking page! 🚀",
                    from: 'bot'
                });
                setTimeout(() => {
                    router.push('/portal/createshipment');
                }, 1000);
            } else if (lowerInput.includes('ticket')) {
                newMessages.push({
                    text: "I'll help you raise a ticket. Redirecting you now... 🎫",
                    from: 'bot'
                });
                setTimeout(() => {
                    router.push('/portal/customer-support');
                }, 1000);
            } else {
                newMessages.push({
                    text: "I'm here to help! Here's what I can do for you:",
                    from: 'bot',
                    type: 'main_menu'
                });
            }

            setMessages(newMessages);
            setInput('');
        }
    };

    const handleOptionClick = (option) => {
        const newMessages = [...messages, { text: option, from: 'user' }];

        if (option === "📦 Track Shipment") {
            newMessages.push({
                text: "Great! Please enter your AWB (Airwaybill) number to track your shipment:",
                from: 'bot',
                type: 'awb_input'
            });
            setShowAwbInput(true);
        }
        else if (option === "💰 Calculate Shipping Cost") {
            newMessages.push({
                text: "Perfect! I can help you calculate shipping costs. Choose your preferred method:",
                from: 'bot',
                type: 'rate_options'
            });
        }
        else if (option === "🚚 Book Shipment") {
            newMessages.push({
                text: "Redirecting you to the shipment booking page... 🚀",
                from: 'bot'
            });
            setTimeout(() => {
                router.push('/portal/createshipment');
            }, 1000);
        }
        else if (option === "🎫 Raise a Ticket") {
            newMessages.push({
                text: "Taking you to the ticket submission page... 🎫",
                from: 'bot'
            });
            setTimeout(() => {
                router.push('/portal/customer-support');
            }, 1000);
        }
        else if (option === "📊 Step-by-Step Calculator") {
            setRateCalcStep(1);
            newMessages.push({
                text: "Perfect! Let's calculate your shipping cost step by step.\n\n📍 Step 1 of 6: Where are you shipping FROM?\n\nPlease enter the sector code (e.g., US, UK, IN):",
                from: 'bot',
                type: 'rate_calc_step_1'
            });
            setShowRateCalcForm(true);
        }
        else if (option === "🖥️ Full Calculator Page") {
            newMessages.push({
                text: "Redirecting to the full rate calculator page... 💰",
                from: 'bot'
            });
            setTimeout(() => {
                router.push('/portal/tools/rate-calculator');
            }, 1500);
        }

        setMessages(newMessages);
    };

    const handleAwbTrack = () => {
        if (awbInput.trim()) {
            const newMessages = [...messages,
            { text: awbInput, from: 'user' },
            { text: `✅ Tracking shipment ${awbInput}... Please wait! 📦`, from: 'bot' }
            ];
            setMessages(newMessages);

            setTimeout(() => {
                router.push(`/portal/tracking?awb=${encodeURIComponent(awbInput.trim())}`);
            }, 1000);

            setAwbInput('');
            setShowAwbInput(false);
        }
    };

    const handleRateCalcNext = async (value) => {
        const newMessages = [...messages];
        let updatedData = { ...rateCalcData };

        switch (rateCalcStep) {
            case 1:
                updatedData.sector = value;
                newMessages.push({ text: value, from: 'user' });
                newMessages.push({
                    text: `✅ Great! Sector: ${value}\n\n📍 Step 2 of 6: Where are you shipping TO?\n\nEnter destination country (e.g., Canada, Australia):`,
                    from: 'bot',
                    type: 'rate_calc_step_2'
                });
                setRateCalcStep(2);
                break;

            case 2:
                updatedData.destinationCountry = value;
                newMessages.push({ text: value, from: 'user' });
                newMessages.push({
                    text: `✅ Destination: ${value}\n\n📮 Step 3 of 6: What's the destination zipcode?\n\nEnter zipcode (e.g., V5K0A5):`,
                    from: 'bot',
                    type: 'rate_calc_step_3'
                });
                setRateCalcStep(3);
                break;

            case 3:
                updatedData.destinationZipcode = value;
                newMessages.push({ text: value, from: 'user' });
                newMessages.push({
                    text: `✅ Zipcode: ${value}\n\n⚖️ Step 4 of 6: What's the actual weight of your shipment?\n\nEnter weight in kg (e.g., 2.5):`,
                    from: 'bot',
                    type: 'rate_calc_step_4'
                });
                setRateCalcStep(4);
                break;

            case 4:
                updatedData.actualWeight = value;
                newMessages.push({ text: `${value} kg`, from: 'user' });
                newMessages.push({
                    text: `✅ Weight: ${value} kg\n\n📏 Step 5 of 6: What are the package dimensions?\n\nEnter in format: Length x Width x Height (in cm)\nExample: 30 x 20 x 15`,
                    from: 'bot',
                    type: 'rate_calc_step_5'
                });
                setRateCalcStep(5);
                break;

            case 5:
                const dims = value
                    .toLowerCase()
                    .split(/x|\*|×|\s+/) // split by x, *, ×, or spaces
                    .map(d => d.trim())
                    .filter(Boolean);

                if (dims.length === 3 && dims.every(d => !isNaN(d))) {
                    updatedData.length = dims[0];
                    updatedData.width = dims[1];
                    updatedData.height = dims[2];
                    newMessages.push({ text: value, from: 'user' });
                    newMessages.push({
                        text: `✅ Dimensions: ${value} cm\n\n📦 Step 6 of 6: What's the shipment purpose?`,
                        from: 'bot',
                        type: 'rate_calc_step_6'
                    });
                    setRateCalcStep(6);
                } else {
                    newMessages.push({
                        text: "⚠️ Please enter dimensions in the correct format:\nLength x Width x Height (e.g., 30 x 20 x 15)",
                        from: 'bot',
                        type: 'rate_calc_step_5'
                    });
                }
                break;

            case 6:
                updatedData.shipmentPurpose = value;
                newMessages.push({ text: value, from: 'user' });

                // Calculate volumetric & chargeable weight
                const volWeight = (updatedData.length * updatedData.width * updatedData.height) / 5000;
                const chargeableWeight = Math.max(volWeight, parseFloat(updatedData.actualWeight), 0.5);

                // Show summary first
                newMessages.push({
                    text: `✅ Perfect! All information collected!\n\n📊 **Calculation Summary:**\n━━━━━━━━━━━━━━━━\n📍 From: ${updatedData.sector}\n📍 To: ${updatedData.destinationCountry} (${updatedData.destinationZipcode})\n⚖️ Weight: ${updatedData.actualWeight} kg\n📦 Dimensions: ${updatedData.length}×${updatedData.width}×${updatedData.height} cm\n📊 Volumetric Weight: ${volWeight.toFixed(2)} kg\n✅ Chargeable Weight: ${chargeableWeight.toFixed(2)} kg\n🎯 Purpose: ${updatedData.shipmentPurpose}\n━━━━━━━━━━━━━━━━\n\n⏳ Calculating rates...`,
                    from: 'bot'
                });

                // 🔥 Call your server APIs directly (same logic as Page.js)
                try {
                    const zoneRes = await axios.get(
                        `${server}/zones?sector=${updatedData.sector}&destination=${updatedData.destinationCountry}`
                    );
                    const zoneData = zoneRes.data || [];
                    const zoneServices = zoneData.map((z) => z.service);

                    const tariffRes = await axios.get(
                        `${server}/shipper-tariff?accountCode=${session?.user?.accountCode}`
                    );
                    const tariffServices = tariffRes.data?.ratesApplicable || [];

                    const common = tariffServices.filter((t) =>
                        zoneServices.includes(t.service)
                    );

                    const finalRates = [];
                    for (let srv of common) {
                        const zoneInfo = zoneData.find((z) => z.service === srv.service);
                        if (!zoneInfo) continue;

                        const rateRes = await axios.get(
                            `${server}/rate-sheet?service=${srv.service}`
                        );
                        const rates = rateRes.data;

                        const matchedRow = rates.find(
                            (row) =>
                                chargeableWeight >= row.minWeight &&
                                chargeableWeight <= row.maxWeight
                        );

                        if (matchedRow) {
                            const zoneRate = matchedRow[zoneInfo.zone];
                            if (zoneRate) {
                                let price = 0;
                                if (matchedRow.type === "B") {
                                    price = zoneRate * chargeableWeight;
                                } else if (matchedRow.type === "S") {
                                    price = zoneRate;
                                }

                                finalRates.push({
                                    service: matchedRow.service,
                                    network: srv.network,
                                    type: matchedRow.type,
                                    grandTotal: price.toFixed(2),
                                    from: srv.from,
                                    to: srv.to
                                });

                                console.log("suraj", finalRates);
                            }
                        }
                    }

                    if (finalRates.length > 0) {
                        finalRates.forEach(rate => {
                            newMessages.push({
                                text: `🚀 **${rate.service} (${rate.network})**\n💰 ₹${rate.grandTotal} (Incl. GST)\n📦 Chargeable Weight: ${chargeableWeight.toFixed(2)} kg\n⏱️ Duration: ${calculateDuration(rate.from, rate.to)}`,
                                from: 'bot'
                            });
                        });
                    } else {
                        newMessages.push({
                            text: "⚠️ No rates found for the given details.",
                            from: 'bot'
                        });
                    }
                } catch (err) {
                    newMessages.push({
                        text: "❌ Error calculating rates. Please try again later.",
                        from: 'bot'
                    });
                    console.error(err);
                }

                setShowRateCalcForm(false);
                setRateCalcStep(0);
                updatedData = {
                    sector: '',
                    destinationCountry: '',
                    destinationZipcode: '',
                    actualWeight: '',
                    length: '',
                    width: '',
                    height: '',
                    shipmentPurpose: 'Commercial'
                };
                break;

        }

        setRateCalcData(updatedData);
        setMessages(newMessages);
    };

    const handleHelpClick = () => {
        const newMessages = [
            ...messages,
            { text: "How can you help me?", from: 'user' },
            {
                text: "I can assist with a variety of logistics tasks:",
                from: 'bot',
                type: 'main_menu'
            }
        ];
        setMessages(newMessages);
    };

    const renderMainMenu = () => (
        <div className="mt-3 grid grid-cols-2 gap-2">
            <button
                onClick={() => handleOptionClick("📦 Track Shipment")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg p-3 text-center transition-all hover:shadow-md group"
            >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📦</span>
                <span className="text-xs font-semibold text-blue-900">Track Shipment</span>
            </button>

            <button
                onClick={() => handleOptionClick("💰 Calculate Shipping Cost")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-lg p-3 text-center transition-all hover:shadow-md group"
            >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💰</span>
                <span className="text-xs font-semibold text-green-900">Calculate Cost</span>
            </button>

            <button
                onClick={() => handleOptionClick("🚚 Book Shipment")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-lg p-3 text-center transition-all hover:shadow-md group"
            >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🚚</span>
                <span className="text-xs font-semibold text-purple-900">Book Shipment</span>
            </button>

            <button
                onClick={() => handleOptionClick("🎫 Raise a Ticket")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-lg p-3 text-center transition-all hover:shadow-md group"
            >
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎫</span>
                <span className="text-xs font-semibold text-orange-900">Raise Ticket</span>
            </button>
        </div>
    );

    const renderRateOptions = () => (
        <div className="mt-3 flex flex-col gap-2">
            <button
                onClick={() => handleOptionClick("📊 Step-by-Step Calculator")}
                className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 rounded-lg p-3 transition-all hover:shadow-md group"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-indigo-900">Step-by-Step Calculator</div>
                        <div className="text-xs text-indigo-600">Guided process (Recommended)</div>
                    </div>
                </div>
                <span className="text-indigo-400 group-hover:text-indigo-600">→</span>
            </button>

            <button
                onClick={() => handleOptionClick("🖥️ Full Calculator Page")}
                className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-lg p-3 transition-all hover:shadow-md group"
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🖥️</span>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Full Calculator Page</div>
                        <div className="text-xs text-gray-600">Complete form view</div>
                    </div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
            </button>
        </div>
    );

    const renderPurposeOptions = () => (
        <div className="mt-3 flex flex-col gap-2">
            {["Gift", "Commercial", "Sample"].map((purpose) => (
                <button
                    key={purpose}
                    onClick={() => handleRateCalcNext(purpose)}
                    className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-[var(--primary-color)] rounded-lg px-4 py-3 text-sm font-medium text-gray-800 transition-all text-left hover:shadow-md"
                >
                    {purpose}
                </button>
            ))}
        </div>
    );

    // Helper function for displaying duration nicely
    const calculateDuration = (from, to) => {
        if (!from || !to) return "N/A";

        const fromDate = new Date(from).toLocaleDateString();
        const toDate = new Date(to).toLocaleDateString();

        return `${fromDate} – ${toDate}`;
    };



    return (
        <div>
            <div className={`fixed bottom-20 z-50 right-8 w-[355PX] rounded-lg shadow-2xl flex flex-col transition-all duration-500 ease-in-out overflow-hidden bg-white ${isOpened ? 'max-h-[492px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--primary-color)] to-[#d01a3a] text-white p-2 flex items-center rounded-t-lg">
                    <Image
                        src="/chatbot.svg"
                        alt="Chatbot Icon"
                        width={25}
                        height={25}
                        className="mr-3"
                    />
                    <div className="flex-1">
                        <h3 className="text-white text-lg font-semibold">Customer Support</h3>
                        <p className="text-xs text-white/90">Online • Ready to help!</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[82%] ${msg.from === 'user' ? 'bg-[var(--primary-color)] text-white' : 'bg-white text-gray-800 shadow-sm'} p-2 rounded-lg`}>
                                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>

                                {msg.type === 'main_menu' && renderMainMenu()}
                                {msg.type === 'rate_options' && renderRateOptions()}
                                {msg.type === 'rate_calc_step_6' && renderPurposeOptions()}

                                {msg.type === 'awb_input' && showAwbInput && index === messages.length - 1 && (
                                    <div className="mt-3 flex gap-2">
                                        <input
                                            type="text"
                                            value={awbInput}
                                            onChange={(e) => setAwbInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAwbTrack()}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-800 focus:border-[var(--primary-color)]"
                                            placeholder="Enter AWB Number"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleAwbTrack}
                                            className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d01a3a] transition-all"
                                        >
                                            Track
                                        </button>
                                    </div>
                                )}

                                {msg.type?.startsWith('rate_calc_step_') && msg.type !== 'rate_calc_step_6' && showRateCalcForm && index === messages.length - 1 && (
                                    <RateCalcInputComponent
                                        step={rateCalcStep}
                                        onNext={handleRateCalcNext}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-2">
                    <button
                        onClick={handleHelpClick}
                        className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 p-2.5 rounded-lg text-sm font-medium cursor-pointer text-center transition-all flex items-center justify-center gap-2"
                    >
                        <span>💡</span>
                        <span>Show Main Menu</span>
                    </button>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--primary-color)] transition-all"
                            placeholder="Type your message..."
                        />
                        <button
                            onClick={handleSend}
                            className="bg-[var(--primary-color)] hover:bg-[#d01a3a] text-white px-5 py-2.5 rounded-lg font-medium transition-all"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <div className="fixed bottom-5 right-5 z-50">
                <Tooltip title={!isOpened ? "How can we assist you today?" : ""} arrow placement="left">
                    <div onClick={toggleChatBot} className="bg-gradient-to-br from-[var(--primary-color)] to-[#d01a3a] hover:shadow-2xl w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:scale-110">
                        <Image
                            className={`transform transition-transform duration-300 ${isOpened ? 'rotate-180' : ''}`}
                            width={25}
                            height={25}
                            src={isOpened ? '/up_arrow_white.svg' : '/chatbot.svg'}
                            alt={isOpened ? 'Close chat' : 'Open chat'}
                        />
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}

// Separate component for rate calc input
function RateCalcInputComponent({ step, onNext }) {
    const [value, setValue] = useState('');

    return (
        <div className="mt-3 flex gap-1">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && value.trim()) {
                        onNext(value.trim());
                        setValue('');
                    }
                }}
                className="flex px-1 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-800 focus:border-[var(--primary-color)]"
                placeholder={
                    step === 1 ? "e.g., US" :
                        step === 2 ? "e.g., Canada" :
                            step === 3 ? "e.g., V5K0A5" :
                                step === 4 ? "e.g., 2.5" :
                                    step === 5 ? "e.g., 30 x 20 x 15" : ""
                }
                autoFocus
            />
            <button
                onClick={() => {
                    if (value.trim()) {
                        onNext(value.trim());
                        setValue('');
                    }
                }}
                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d01a3a] transition-all"
            >
                Next
            </button>
        </div>
    );
}

export default ChatBot;