import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { GlobalContext } from "../GlobalContext";
import NotificationFlag from "../component/NotificationFlag";

const ProfilePage = () => {
  const { server } = useContext(GlobalContext);
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    accountCode: session?.user?.accountCode || "",
    telNo: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    contactPerson: "",
    panNo: "",
    gstNo: "",
    kycNo: "",
    branch: "",
    companyName: "",
    salesPersonName: "",
  });
  const [editField, setEditField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    subMessage: "",
  });

  // Get initials from company name
  const getInitials = (name) => {
    if (!name) return "CN";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accountCode = session?.user?.accountCode;

        if (!accountCode) {
          console.error("Account code not found in session");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${server}/portal/customer-details-profile?accountCode=${accountCode}`
        );

        if (response.data.success) {
          // Merge session data with fetched data
          setProfile({
            ...response.data.data,
            name: response.data.data.name,
            email: response.data.data.email,
            accountCode: session.user.accountCode,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If fetch fails, still set name, email and accountCode from session
        if (session?.user) {
          setProfile((prev) => ({
            ...prev,
            accountCode: session.user.accountCode || "",
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accountCode) {
      fetchProfile();
    }
  }, [session, server]);

  const profileCards = [
    {
      title: "Branch Details",
      editable: false,
      rows: [
        {
          title: "Account Code",
          field: "accountCode",
          content: profile.accountCode,
        },
        { title: "Branch", field: "branch", content: profile.branch },
        {
          title: "Company",
          field: "companyName",
          content: profile.companyName,
        },
        {
          title: "Sales Executive",
          field: "salesPersonName",
          content: profile.salesPersonName,
        },
      ],
    },
    {
      title: "Registered Address Details",
      editable: true,
      rows: [
        {
          title: "Address Line 1",
          field: "addressLine1",
          content: profile.addressLine1,
        },
        {
          title: "Address Line 2",
          field: "addressLine2",
          content: profile.addressLine2,
        },
        { title: "City", field: "city", content: profile.city },
        { title: "State", field: "state", content: profile.state },
        { title: "Zip Code", field: "pinCode", content: profile.pinCode },
        { title: "Country", field: "country", content: profile.country },
      ],
    },
    {
      title: "Contact Details",
      editable: true,
      rows: [
        {
          title: "Contact Person",
          field: "contactPerson",
          content: profile.contactPerson,
        },
        { title: "Email", field: "email", content: profile.email },
        { title: "Telephone", field: "telNo", content: profile.telNo },
        { title: "Pan No.", field: "panNo", content: profile.panNo },
        { title: "Service Tax (GST)", field: "gstNo", content: profile.gstNo },
        { title: "KYC No.", field: "kycNo", content: profile.kycNo },
      ],
    },
  ];

  const handleEdit = (field) => {
    setEditField(field);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = async (field) => {
    setEditField(null);

    // Don't save name, email and accountCode changes (they come from session)
    if (field === "name" || field === "email" || field === "accountCode") {
      return;
    }

    // Save to database
    try {
      setSaving(true);
      const accountCode = session?.user?.accountCode;

      if (!accountCode) {
        console.error("Account code not found in session");
        alert("Session expired. Please login again.");
        return;
      }

      await axios.put(`${server}/portal/customer-details-profile`, {
        accountCode,
        [field]: profile[field],
      });

      // Show success notification
      setNotification({
        visible: true,
        message: "Profile Updated",
        subMessage: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = async (e, field) => {
    if (e.key === "Enter") {
      await handleBlur(field);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  if (!session?.user?.accountCode) {
    return (
      <div className="text-center py-10">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 text-xs text-[#71717A] mt-9">
      <div className="flex flex-col bg-white gap-8 rounded-md border border-[#E2E8F0] py-14 px-9 relative">
        <div className="w-[90px] h-[90px] rounded-full bg-[#E2E8F0] absolute left-9 -top-11 overflow-clip border border-[#E2E8F0] flex items-center justify-center">
          <span className="text-3xl font-bold text-[#71717A]">
            {getInitials(profile.name)}
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          <ProfileSettingRow
            title="Account Code"
            field="accountCode"
            value={profile.accountCode}
            editField={editField}
            onEdit={handleEdit}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            disabled={true}
          />
          <ProfileSettingRow
            title="Name"
            field="name"
            value={profile.name}
            editField={editField}
            onEdit={handleEdit}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
          />
          <ProfileSettingRow
            title="Email"
            field="email"
            value={profile.email}
            editField={editField}
            onEdit={handleEdit}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            disabled={true}
          />
          <ProfileSettingRow
            title="Phone No."
            field="telNo"
            value={profile.telNo}
            editField={editField}
            onEdit={handleEdit}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
          />
        </ul>
      </div>

      {/* Profile Cards */}
      {profileCards.map((card, index) => (
        <ProfileCard
          key={index}
          title={card.title}
          rows={card.rows}
          editable={card.editable}
          session={session}
          server={server}
          onUpdate={async (field, value) => {
            setProfile((prev) => ({ ...prev, [field]: value }));
            try {
              const accountCode = session?.user?.accountCode;

              if (!accountCode) {
                console.error("Account code not found in session");
                alert("Session expired. Please login again.");
                return;
              }

              await axios.put(`${server}/portal/customer-details-profile`, {
                accountCode,
                [field]: value,
              });

              // Show success notification
              setNotification({
                visible: true,
                message: "Profile Updated",
                subMessage: "Your changes have been saved successfully.",
              });
            } catch (error) {
              console.error("Error updating profile:", error);
              alert("Failed to update profile. Please try again.");
            }
          }}
        />
      ))}

      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Saving...
        </div>
      )}

      <NotificationFlag
        message={notification.message}
        subMessage={notification.subMessage}
        visible={notification.visible}
        setVisible={(visible) =>
          setNotification((prev) => ({ ...prev, visible }))
        }
      />
    </div>
  );
};

export default ProfilePage;

function ProfileSettingRow({
  title,
  field,
  value,
  editField,
  onEdit,
  onChange,
  onBlur,
  onKeyPress,
  disabled = false,
  tooltip = null,
}) {
  return (
    <li className="text-[#71717A] flex gap-4 items-center">
      <div className="w-44 font-bold">{title}</div>
      <div className="flex w-full justify-between">
        {editField === field && !disabled ? (
          <input
            className="border border-gray-300 rounded px-2 py-1 text-black w-full"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            onBlur={() => onBlur(field)}
            onKeyPress={(e) => onKeyPress(e, field)}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2">
            {value || <span className="text-gray-400">Click edit to add</span>}
            {tooltip && disabled && (
              <span className="text-gray-400 text-[10px]">({tooltip})</span>
            )}
          </div>
        )}
        {editField !== field && !disabled && (
          <div className="cursor-pointer ml-2" onClick={() => onEdit(field)}>
            <Image src="/profile/edit.svg" height={14} width={14} alt="Edit" />
          </div>
        )}
      </div>
    </li>
  );
}

function ProfileCard({ title, rows, editable, onUpdate, session, server }) {
  const [editField, setEditField] = useState(null);
  const [data, setData] = useState(rows);

  useEffect(() => {
    setData(rows);
  }, [rows]);

  const handleEdit = (field) => {
    if (editable) {
      setEditField(field);
    }
  };

  const handleChange = (field, value) => {
    setData((prev) =>
      prev.map((item) =>
        item.field === field ? { ...item, content: value } : item
      )
    );
  };

  const handleBlur = async (field, value) => {
    setEditField(null);
    if (editable) {
      await onUpdate(field, value);
    }
  };

  const handleKeyPress = async (e, field, value) => {
    if (e.key === "Enter") {
      await handleBlur(field, value);
    }
  };

  return (
    <div className="flex flex-col bg-white gap-5 rounded-md border border-[#E2E8F0] py-6 px-9">
      <div className="font-bold text-[#2D3748] text-sm">{title}</div>
      <div className="flex flex-col gap-3">
        {data.map((item, index) => (
          <div key={index} className="text-[#71717A] flex gap-4">
            <div className="w-44 font-bold">{item.title}</div>
            <div className="flex w-full justify-between">
              {editField === item.field ? (
                <input
                  className="border border-gray-300 rounded px-2 py-1 text-black w-full"
                  value={item.content}
                  onChange={(e) => handleChange(item.field, e.target.value)}
                  onBlur={() => handleBlur(item.field, item.content)}
                  onKeyPress={(e) => handleKeyPress(e, item.field, item.content)}
                  autoFocus
                />
              ) : (
                <div className="flex gap-2 justify-between items-center w-full">
                  <span>{item.content || "N/A"}</span>
                  {editable && (
                    <div
                      className="cursor-pointer"
                      onClick={() => handleEdit(item.field)}
                    >
                      <Image
                        src="/profile/edit.svg"
                        height={14}
                        width={14}
                        alt="Edit"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}