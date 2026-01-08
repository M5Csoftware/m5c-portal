import React from 'react'
import Image from 'next/image'

const NavBtn = (props) => {
    return (

        <button onClick={props.onclick} type='button' className='flex  gap-2 items-center border border-[#2d3748] px-2 py-1 rounded-lg bg-white '>
            <span>{props.label}</span>
        </button>

    )
}

export default NavBtn
