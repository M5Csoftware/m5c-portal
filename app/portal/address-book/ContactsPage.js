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
  const [editingContactId, setEditingContactId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const handleEdit = (contact) => {
    setEditingContactId(contact._id);
    setEditFormData({ ...contact });
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    try {
      // Send the entire object including _id to the PUT endpoint
      await axios.put(`${server}/portal/address-book`, editFormData);
      
      // Update state
      setContactsData((prevContacts) =>
        prevContacts.map((contact) =>
          contact._id === editingContactId ? { ...contact, ...editFormData } : contact
        )
      );
      
      setEditingContactId(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please try again.');
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteClick = (index) => {
    setDeleteTarget(index);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      let idsToDelete = [];

      if (selectedContacts.length > 0) {
        // ✅ delete all selected
        idsToDelete = [...selectedContacts];
      } else if (deleteTarget !== null) {
        // ✅ delete only the clicked one
        const contactToDelete = filteredContacts()[deleteTarget];
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

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting contact(s):', error);
      alert('Failed to delete contact(s). Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
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
                handleDelete={() => handleDeleteClick(index)}
                handleEdit={() => handleEdit(contact)}
                isEditing={editingContactId === contact._id}
                editFormData={editFormData}
                handleEditFormChange={handleEditFormChange}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedContacts.length > 0 ? `${selectedContacts.length} contact(s)` : 'this contact'}?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContactCard = ({ 
  contactData, 
  selected, 
  onCheckboxChange, 
  handleDelete, 
  handleEdit,
  isEditing,
  editFormData,
  handleEditFormChange,
  handleSaveEdit,
  handleCancelEdit
}) => {
  const { _id, fullName, addressLine1, pincode, city, state, country, kycNumber, kycType, email, phoneNumber } = contactData;

  if (isEditing) {
    return (
      <div className={`bg-white ${selected ? 'bg-gray-200' : ''} text-[#71717A]`}>
        <ul className='flex justify-between bg-white border-2 border-blue-400 rounded-[4px] contact-detail-ul p-4 text-xs'>
          <li className='action-buttons-li-checkbox flex items-center justify-center' style={{ width: '42px' }}>
            <input
              type="checkbox"
              name="contact-detail"
              id={_id}
              checked={selected}
              onChange={() => onCheckboxChange(_id)}
              disabled
            />
          </li>
          <li className='flex items-center justify-center'>
            <input
              type="text"
              value={editFormData.fullName || ''}
              onChange={(e) => handleEditFormChange('fullName', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='flex items-center justify-center'>
            <input
              type="text"
              value={editFormData.addressLine1 || ''}
              onChange={(e) => handleEditFormChange('addressLine1', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='flex items-center justify-center'>
            <input
              type="text"
              value={editFormData.pincode || ''}
              onChange={(e) => handleEditFormChange('pincode', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='flex items-center justify-center gap-1'>
            <input
              type="text"
              value={editFormData.city || ''}
              onChange={(e) => handleEditFormChange('city', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-16"
              placeholder="City"
            />
            <input
              type="text"
              value={editFormData.state || ''}
              onChange={(e) => handleEditFormChange('state', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-16"
              placeholder="State"
            />
            <input
              type="text"
              value={editFormData.country || ''}
              onChange={(e) => handleEditFormChange('country', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-16"
              placeholder="Country"
            />
          </li>
          <li className='flex flex-col gap-2 items-center'>
            <input
              type="text"
              value={editFormData.kycNumber || ''}
              onChange={(e) => handleEditFormChange('kycNumber', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
            <input
              type="text"
              value={editFormData.kycType || ''}
              onChange={(e) => handleEditFormChange('kycType', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='flex items-center justify-center'>
            <input
              type="email"
              value={editFormData.email || ''}
              onChange={(e) => handleEditFormChange('email', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='flex items-center justify-center'>
            <input
              type="text"
              value={editFormData.phoneNumber || ''}
              onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </li>
          <li className='action-buttons-li flex items-center justify-center'>
            <div className='flex gap-[10px]'>
              <button 
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </li>
        </ul>
      </div>
    );
  }

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