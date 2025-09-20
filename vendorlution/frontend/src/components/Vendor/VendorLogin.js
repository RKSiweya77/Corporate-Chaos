// components/Vendor/VendorLogin.js
import { Navigate, useLocation } from "react-router-dom";

function VendorLogin() {
  const location = useLocation();
  // Redirect vendors to the unified login but pass along a state flag
  return (
    <Navigate
      to="/customer/login"
      replace
      state={{ from: "vendor", ...location.state }}
    />
  );
}

export default VendorLogin;
