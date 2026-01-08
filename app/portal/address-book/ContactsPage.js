import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import "./styles.css";
import Image from 'next/image';
import { GlobalContext } from '../GlobalContext.js';
import { useSession } from 'next-auth/react';

const ContactsPage = () => {
  const { data: session } = useSession();
  const [contactsData, setContactsData] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const { adding, setAdding, server } = useContext(GlobalContext);

  const handleNew = () => {
    setAdding(!adding);
  };

  const [selectedLi, setSelectedLi] = useState(0); // 0 = All, 1 = Consignor, 2 = Consignee
  const [lineLeft, setLineLeft] = useState(0);
  const [lineWidth, setLineWidth] = useState(0);
  const lineRef = useRef(null);

  useEffect(() => {
    if (lineRef.current) {
      const selectedElement = document.querySelector(`.list-none > li:nth-child(${selectedLi + 1})`);
      if (selectedElement) {
        const ulElement = selectedElement.parentElement;
        setLineWidth(selectedElement.offsetWidth);
        setLineLeft(selectedElement.offsetLeft - ulElement.offsetLeft);
      }
    }
  }, [selectedLi]);

  const handleLiClick = (index) => {
    setSelectedLi(index);
  };

  // Fetch contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${server}/portal/address-book/getAddress?accountCode=${session?.user?.accountCode}`
        );
        setContactsData(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    if (session?.user?.accountCode) {
      fetchData();
    }
  }, [session?.user?.accountCode, server]);

  const totalContacts = () => filteredContacts().length;

  // Filter contacts based on tab selection
  const filteredContacts = () => {
    if (selectedLi === 1) {
      return contactsData.filter((c) => c.addressType?.toLowerCase() === "consignor");
    }
    if (selectedLi === 2) {
      return contactsData.filter((c) => c.addressType?.toLowerCase() === "consignee");
    }
    return contactsData; // all
  };

  const handleCheckboxChange = (id) => {
    setSelectedContacts((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((contactId) => contactId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleEdit = async (index) => {
    console.log('edit contact:', index);
  };

  const handleDelete = async (index) => {
    try {
      let idsToDelete = [];

      if (selectedContacts.length > 0) {
        // ✅ delete all selected
        idsToDelete = [...selectedContacts];
      } else {
        // ✅ delete only the clicked one
        const contactToDelete = filteredContacts()[index];
        idsToDelete = [contactToDelete._id];
      }

      await axios.delete(`${server}/portal/address-book`, { data: { ids: idsToDelete } });

      // ✅ Update state
      setContactsData((prevContacts) =>
        prevContacts.filter((contact) => !idsToDelete.includes(contact._id))
      );

      setSelectedContacts((prevSelected) =>
        prevSelected.filter((id) => !idsToDelete.includes(id))
      );
    } catch (error) {
      console.error('Error deleting contact(s):', error);
    }
  };


  return (
    <div>
      <div className='flex items-baseline justify-between '>
        <div className=' w-full '>
          <div className='flex justify-between items-end'>
            <ul className='list-none flex gap-6'>
              <li
                style={{ cursor: 'pointer', fontSize: '14px' }}
                className={selectedLi === 0 ? 'text-[var(--primary-color)] ' : 'text-[#A0AEC0]'}
                onClick={() => handleLiClick(0)}
              >
                All
              </li>
              <li
                style={{ cursor: 'pointer', fontSize: '14px' }}
                className={selectedLi === 1 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'}
                onClick={() => handleLiClick(1)}
              >
                Consignor
              </li>
              <li
                style={{ cursor: 'pointer', fontSize: '14px' }}
                className={selectedLi === 2 ? 'text-[var(--primary-color)]' : 'text-[#A0AEC0]'}
                onClick={() => handleLiClick(2)}
              >
                Consignee
              </li>
            </ul>
            <div className='flex gap-3'>
              <button
                onClick={handleNew}
                type='button'
                className='flex  gap-[10px] items-center border border-[#979797] py-[6px] px-[11px] rounded-md bg-white '
              >
                <Image width={15} height={15} src='/addNew.svg' alt='Add Address' />
                <span className='text-[#71717A] text-sm'>Add Address</span>
              </button>
            </div>
          </div>
          <div className="relative mt-1 ">
            <Image layout='responsive' width={1000} height={24} src={'/line-address.svg'} alt='Line' />
            <div
              ref={lineRef}
              className="transition-all duration-400 rounded-t-lg absolute bottom-[1px] bg-[var(--primary-color)]"
              style={{ width: lineWidth, height: '3px', left: lineLeft }}
            ></div>
          </div>
        </div>
      </div>

      <div className='mt-6 flex flex-col gap-9'>
        <div className='flex justify-between items-end text-[#A0AEC0]'>
          <div>
            <p className='text-xs '>{totalContacts()} contact(s) in total</p>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <div>
            <ul className='flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] drop-shadow-sm contact-detail-ul p-4 text-[#A0AEC0] text-sm font-semibold items-center'>
              <li className='action-buttons-li-checkbox' style={{ width: '42px' }}>
                <input
                  type="checkbox"
                  name="select-all"
                  id="select-all"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedContacts(filteredContacts().map((contact) => contact._id));
                    } else {
                      setSelectedContacts([]);
                    }
                  }}
                />
              </li>
              <li>Contact Name</li>
              <li>Address Line</li>
              <li>Pin Code</li>
              <li>City-State-Country</li>
              <li>KYC</li>
              <li>Email ID</li>
              <li>Phone Number</li>
              <li className="action-buttons-li"></li>
            </ul>
          </div>

          <div className='flex flex-col gap-2 text-xs text-[#71717A]'>
            {filteredContacts().map((contact, index) => (
              <ContactCard
                key={contact._id}
                contactData={contact}
                selected={selectedContacts.includes(contact._id)}
                onCheckboxChange={handleCheckboxChange}
                handleDelete={() => handleDelete(index)}
                handleEdit={() => handleEdit(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactCard = ({ contactData, selected, onCheckboxChange, handleDelete, handleEdit }) => {
  const { _id, fullName, addressLine1, pincode, city, state, country, kycNumber, kycType, email, phoneNumber } = contactData;

  return (
    <div className={`bg-white ${selected ? 'bg-gray-200' : ''} text-[#71717A]`}>
      <ul className='flex justify-between bg-white border border-[#E2E8F0] rounded-[4px] contact-detail-ul p-4  text-xs '>
        <li className='action-buttons-li-checkbox flex items-center justify-center' style={{ width: '42px' }}>
          <input
            type="checkbox"
            name="contact-detail"
            id={_id}
            checked={selected}
            onChange={() => onCheckboxChange(_id)}
          />
        </li>
        <li className='flex items-center justify-center'>{fullName}</li>
        <li className='flex items-center justify-center'>{addressLine1}</li>
        <li className='flex items-center justify-center'>{pincode}</li>
        <li className='flex items-center justify-center'>{city}, {state} {country}</li>
        <li className='flex flex-col gap-2 items-center'>
          {kycNumber}
          <div className='px-[2px] h-5 w-24 rounded text-xs bg-[#E2E9F0] text-[#718096]'>
            {kycType}
          </div>
        </li>
        <li className='flex items-center justify-center'>{email}</li>
        <li className='flex items-center justify-center'>{phoneNumber}</li>
        <li className='action-buttons-li flex items-center justify-center'>
          <div className=' flex gap-[10px]'>
            <button onClick={handleEdit}>
              <Image className='w-fit p-[10px]' width={20} height={20} src='/addEdit.svg' alt='edit button' />
            </button>
            <button onClick={handleDelete}>
              <Image className='w-fit p-[10px]' width={20} height={20} src='/addDelete.svg' alt='delete button' />
            </button>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ContactsPage;
