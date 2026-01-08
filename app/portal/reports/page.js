'use client'
import { useContext } from 'react';
import ReportNav from './ReportNav';



const Page = () => {
  return (
    <main className="w-full px-9 flex flex-col gap-6">
      <h1 className='font-bold text-2xl text-[#18181B]'>Reports</h1>
      <ReportNav />
    </main>
  )
}

export default Page
