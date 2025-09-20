// context/VendorContext.js
import React, { createContext, useContext, useState } from "react";
import logo from "../logo.png";
import banner from "../logo.png";

const VendorContext = createContext();

export function VendorProvider({ children }) {
  const [vendor, setVendor] = useState({
    storeName: "TechWorld",
    ownerName: "John Doe",
    email: "john@techworld.com",
    phone: "+27 65 123 4567",
    address: "123 Market Street, Cape Town",
    category: "Electronics",
    description: "Affordable electronics and accessories for everyone.",
    logo: logo,
    banner: banner,
    status: "Active",
    joinDate: "2024-07-01",
    totalProducts: 12,
    completedOrders: 58,
    rating: 4.5,
  });

  return (
    <VendorContext.Provider value={{ vendor, setVendor }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  return useContext(VendorContext);
}
