// utils/filterShipments.js
export const filterShipments = (shipments, filters) => {
  if (!shipments || !Array.isArray(shipments)) return [];

  return shipments.filter((shipment) => {
    // Filter by type (All, Invoiced, New)
    if (filters.filterType !== "All") {
      if (filters.filterType === "Invoiced" && !shipment.invoiced) return false;
      if (filters.filterType === "New" && !shipment.isNew) return false;
    }

    // Filter by M5 Coin Discount
    if (filters.m5Coin && !shipment.m5CoinDiscount) return false;

    // Filter by RTO
    if (filters.rto && !shipment.appliedForRTO) return false;

    // Filter by status
    if (filters.inTransit && shipment.status !== "in-transit") return false;
    if (filters.delivered && shipment.status !== "delivered") return false;

    // Filter by price range
    if (shipment.price) {
      const price = parseFloat(shipment.price);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
    }

    // Filter by weight range
    if (shipment.weight) {
      const weight = parseFloat(shipment.weight);
      if (weight < filters.weightRange[0] || weight > filters.weightRange[1]) {
        return false;
      }
    }

    // Filter by payment method
    if (
      filters.paymentMethod &&
      shipment.paymentMethod !== filters.paymentMethod.value
    ) {
      return false;
    }

    // Filter by service
    if (filters.service && shipment.service !== filters.service.value) {
      return false;
    }

    // Filter by country
    if (filters.country && shipment.country !== filters.country.value) {
      return false;
    }

    // Filter by consignment type
    if (filters.consignmentType) {
      if (
        filters.consignmentType.value === "consignee" &&
        !shipment.isConsignee
      )
        return false;
      if (
        filters.consignmentType.value === "consigner" &&
        !shipment.isConsigner
      )
        return false;
    }

    return true;
  });
};
