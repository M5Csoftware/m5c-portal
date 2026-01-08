"use client";
import { useContext, useEffect } from "react";
import { useFormData } from "./FormDataContext";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import MultiStepForm from "./MultiStepForm";
import { GlobalContext } from "../GlobalContext";

export default function CreateShipmentPage() {
  const { setFormData } = useFormData();
  const searchParams = useSearchParams();
  const editAwb = searchParams.get("editAwb");
  const { server } = useContext(GlobalContext);

  useEffect(() => {
    if (editAwb) {
      loadShipment(editAwb);
    }
  }, [editAwb]);

  const loadShipment = async (awb) => {
    try {
      const res = await axios.get(`${server}/portal/create-shipment?awbNo=${awb}`);
      setFormData(res.data);
      console.log(res.data);
    } catch (e) {
      console.error("Error loading shipment:", e);
    }
  };

  return <MultiStepForm />;
}
