'use client'
import { GlobalContext } from '../GlobalContext.js';
import AddAddress from './AddAddress';
import { useContext } from 'react';
import ContactsPage from './ContactsPage';



const Page = () => {
  const { adding, setAdding } = useContext(GlobalContext);

  return (
    <main className='w-full px-9 flex flex-col gap-6'>
      <h1 className='font-bold text-2xl text-[#18181B]'>Address Book</h1>
      {adding ?<AddAddress /> : <ContactsPage />
      }

    </main>
  )
}

export default Page
