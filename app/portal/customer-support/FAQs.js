import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import FAQSection from './FAQSection';

function FAQs() {
    const searchParams = useSearchParams();
    const [expandedIdx, setExpandedIdx] = useState(null);
    const sectionRefs = useRef({});

    const toggleExpand = (id) => {
        setExpandedIdx(expandedIdx === id ? null : id);
    };

    // Handle section scrolling from query parameters
    useEffect(() => {
        const section = searchParams.get('section');
        if (section && sectionRefs.current[section]) {
            setTimeout(() => {
                sectionRefs.current[section].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 300);
        }
    }, [searchParams]);

    const generalFAQs = [
        {
            question: "What is M5C Logistics?",
            answer: "M5C Logistics is a leading logistics solutions provider specializing in courier and cargo exports to five major global sectors:<br/>Australia, Europe, the UK, the USA, and Canada. We offer comprehensive services tailored to meet the needs of businesses and individuals, ensuring safe and timely delivery of goods."
        },
        {
            question: "Which regions do you serve?",
            answer: "We operate in five key sectors: Australia, Europe, the UK, the USA, and Canada. Our hubs are strategically located in major Indian cities like Delhi, Mumbai, Ahmedabad, Hyderabad, Chennai, and Kolkata to ensure efficient service."
        }
    ];

    const serviceFAQs = [
        {
            question: "What services does M5C Logistics offer?",
            answer: "We provide a wide range of services, including:<br/><br/>International courier services<br/>Cargo export solutions<br/>Customs clearance and documentation support<br/>Freight forwarding by air and sea<br/>Door-to-door delivery"
        },
        {
            question: "Can M5C Logistics handle large shipments or bulk cargo?",
            answer: "Yes, we specialize in handling both small packages and bulk cargo. Our solutions are scalable to accommodate various shipment sizes, from single parcels to full container loads."
        },
        {
            question: "Do you offer insurance for shipments?",
            answer: "Yes, we offer comprehensive insurance options to protect your shipments against potential risks during transit. Please inquire with our customer service team for more details."
        },
    ];

    const bookingFAQs = [
        {
            question: "How can I book a shipment with M5C Logistics?",
            answer: "You can book a shipment by contacting our customer service team via phone or email, or by using our online booking portal on our website. Our team will guide you through the process and provide a tailored solution for your needs."
        },
        {
            question: "What documentation is required for international shipments?",
            answer: "The required documentation varies depending on the destination and type of goods. Typically, you'll need a commercial invoice, packing list, and any relevant permits or certificates. Our team will assist you in preparing all necessary documents."
        },
        {
            question: "How do I track my shipment?",
            answer: "You can track your shipment in real-time using our online tracking tool. Simply enter your tracking number on our website, and you'll receive the latest updates on your shipment's status."
        },
    ];

    const paymentsFAQs = [
        {
            question: "How are shipping costs calculated?",
            answer: "Shipping costs are calculated based on factors such as the weight, dimensions, destination, and type of service chosen. For an accurate quote, please contact our customer service team or use the cost calculator on our website."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept various payment methods, including bank transfers, credit/debit cards, and online payment gateways. Specific payment options may vary depending on your location and service type."
        },
        {
            question: "Are there any additional fees I should be aware of?",
            answer: "Additional fees may apply for services such as customs clearance, insurance, and special handling requirements. Our team will provide a detailed breakdown of all charges before you confirm your booking."
        },
    ];

    const deliveryFAQs = [
        {
            question: "What is the estimated delivery time for international shipments?",
            answer: "Delivery times vary depending on the destination and service selected. Generally, express services range from 3 to 7 business days, while standard services may take 7 to 14 business days."
        },
        {
            question: "What should I do if my shipment is delayed or lost?",
            answer: "If your shipment is delayed or lost, please contact our customer service team immediately. We will investigate the issue and keep you informed throughout the resolution process. If applicable, insurance claims will be processed as per the policy terms."
        },
        {
            question: "Do you offer expedited shipping services?",
            answer: "Yes, we offer expedited shipping options for urgent deliveries. Please specify your needs when booking, and our team will recommend the best service to meet your deadlines."
        },
    ];

    const customsFAQs = [
        {
            question: "How does M5C Logistics handle customs clearance?",
            answer: "We handle customs clearance for your shipments, ensuring all necessary documentation is in order and that your goods comply with the destination country's regulations. Our experienced team will assist you with any specific requirements."
        },
        {
            question: "Are there any restricted items that cannot be shipped internationally?",
            answer: "Yes, certain items are restricted or prohibited from being shipped internationally, depending on the destination country's regulations. Common restricted items include hazardous materials, perishables, and contraband. Our team will provide guidance on specific restrictions for your shipment."
        },
    ];

    const custSupportFAQs = [
        {
            question: "How can I contact M5C Logistics for support?",
            answer: "You can contact our customer support team via phone, email, or through the contact form on our website. We are available to assist you with any inquiries, booking needs, or issues related to your shipments."
        },
        {
            question: "Can I change or cancel my booking?",
            answer: "Yes, you can change or cancel your booking, but certain conditions may apply. Please contact our customer service team as soon as possible to make any changes or cancellations."
        },
        {
            question: "How does M5C Logistics ensure the safety of my shipment?",
            answer: "We follow stringent safety protocols and use high-quality packaging materials to protect your shipment. Additionally, our team monitors every stage of the shipping process to minimize risks."
        },
        {
            question: "How do I become an agent for M5C Logistics?",
            answer: "If you are interested in becoming an agent for M5C Logistics, please reach out to our business development team via the contact information on our website. We look forward to discussing partnership opportunities."
        },
    ];

    return (
        <div className='flex flex-col gap-10 h-[600px] overflow-x-auto scrollbar-hide'>
            <div ref={el => sectionRefs.current['general'] = el}>
                <FAQSection
                    heading="General Information"
                    logoSrc="/customer-support/FAQs/general-info.svg"
                    faqs={generalFAQs}
                    expandedIdx={expandedIdx}
                    toggleExpand={toggleExpand}
                />
            </div>
            <FAQSection
                heading="Services"
                logoSrc="/customer-support/FAQs/services.svg"
                faqs={serviceFAQs}
                expandedIdx={expandedIdx}
                toggleExpand={toggleExpand}
            />
            <div ref={el => sectionRefs.current['shipping'] = el}>
                <FAQSection
                    heading="Booking and Shipping"
                    logoSrc="/customer-support/FAQs/booking.svg"
                    faqs={bookingFAQs}
                    expandedIdx={expandedIdx}
                    toggleExpand={toggleExpand}
                />
            </div>
            <FAQSection
                heading="Pricing and Payments"
                logoSrc="/customer-support/FAQs/pricing.svg"
                faqs={paymentsFAQs}
                expandedIdx={expandedIdx}
                toggleExpand={toggleExpand}
            />
            <FAQSection
                heading="Delivery and Transit"
                logoSrc="/customer-support/FAQs/pricing.svg"
                faqs={deliveryFAQs}
                expandedIdx={expandedIdx}
                toggleExpand={toggleExpand}
            />
            <FAQSection
                heading="Customs and Regulations"
                logoSrc="/customer-support/FAQs/pricing.svg"
                faqs={customsFAQs}
                expandedIdx={expandedIdx}
                toggleExpand={toggleExpand}
            />
            <div ref={el => sectionRefs.current['account'] = el}>
                <FAQSection
                    heading="Customer Support"
                    logoSrc="/customer-support/FAQs/pricing.svg"
                    faqs={custSupportFAQs}
                    expandedIdx={expandedIdx}
                    toggleExpand={toggleExpand}
                />
            </div>
        </div>
    );
}

export default FAQs;