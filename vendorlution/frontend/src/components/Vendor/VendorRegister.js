// components/Vendor/VendorRegister.js
import { Navigate } from "react-router-dom";

function VendorRegister() {
  // Redirect vendors to the unified register
  return <Navigate to="/customer/register" replace />;
}

export default VendorRegister;
