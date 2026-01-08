import React from 'react';
import Image from 'next/image';

function FAQSection({ heading, logoSrc, faqs, expandedIdx, toggleExpand }) {
    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-3'>
                <span>
                    <Image src={logoSrc} alt={`${heading} logo`} width={24} height={24} />
                </span>
                <span className='font-bold text-[var(--primary-color)] text-lg'>
                    {heading}
                </span>
            </div>
            <div className='flex flex-col gap-3'>
                {faqs.map((faq, index) => (
                    <div onClick={() => toggleExpand(`${heading}-${index}`)} key={index} className='cursor-pointer bg-white p-4 rounded-md text-sm font-medium flex flex-col'>
                        <div className='flex items-center justify-between'>
                            <div className='text-[#18181B]'>{faq.question}</div>
                            <button onClick={() => toggleExpand(`${heading}-${index}`)}>
                                <Image
                                    className={`${expandedIdx === `${heading}-${index}` ? 'rotate-180' : ''} transition-all duration-300`}
                                    src="/customer-support/FAQs/arrow.svg"
                                    alt="toggle"
                                    width={26}
                                    height={26}
                                />
                            </button>
                        </div>
                        <div
                            className={`text-[#A0AEC0] pr-80 overflow-hidden transition-all duration-300 ${expandedIdx === `${heading}-${index}` ? 'max-h-36 mt-4' : 'max-h-0 mt-0'}`}
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQSection;
