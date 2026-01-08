import React from 'react'
import Image from 'next/image'

const AddBtn = (props) => {
    return (

        <button onClick={props.onclick} type='button' className='flex  gap-[10px] items-center border border-[#979797] py-[6px] px-[11px] rounded-md bg-white '>
            <Image className='w-fit' width={15} height={15} src={props.logo} alt={props.label} />
            <span className='text-[#71717A] text-sm'>{props.label}</span>
        </button>

    )
}

export default AddBtn
