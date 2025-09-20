// App.js
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { VendorProvider } from "./context/VendorContext"; // ✅ Vendor context

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

// Shared
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";

// Website
import HomeLanding from "./components/Homepage/HomeLanding";
import AllProducts from "./components/products/AllProducts";
import Categories from "./components/products/Categories";
import CategoryProducts from "./components/products/CategoryProducts";
import ProductDetail from "./components/products/ProductDetail";
import Checkout from "./components/checkout/Checkout";

// Explore & Collections
import ExploreVendors from "./components/Vendor/ExploreVendors";
import PopularProducts from "./components/products/PopularProducts";
import NewArrivals from "./components/products/NewArrivals";

// Customer
import Register from "./components/Customer/Register";
import Login from "./components/Customer/Login";
import Dashboard from "./components/Customer/Dashboard";
import Orders from "./components/Customer/Orders";
import OrderDetail from "./components/Customer/OrderDetail";
import Cart from "./components/Customer/Cart";
import Wishlist from "./components/Customer/Wishlist";
import Profile from "./components/Customer/Profile";
import ChangePassword from "./components/Customer/ChangePassword";
import AddressList from "./components/Customer/AddressList";
import AddAddress from "./components/Customer/AddAddress";
import CustomerInbox from "./components/Customer/CustomerInbox";
import ChatWindow from "./components/Customer/ChatWindow";   // ✅ chat window
import CustomerWallet from "./components/Customer/CustomerWallet";
import CustomerCoupons from "./components/Customer/CustomerCoupons";
import CustomerReviews from "./components/Customer/CustomerReviews";
import CustomerNotifications from "./components/Customer/CustomerNotifications";
import CustomerSupport from "./components/Customer/CustomerSupport";
import PaymentMethods from "./components/Customer/PaymentMethods";
import ResolutionCenter from "./components/Customer/ResolutionCenter";

// Vendor
import VendorRegister from "./components/Vendor/VendorRegister";
import VendorLogin from "./components/Vendor/VendorLogin";
import VendorDashboard from "./components/Vendor/VendorDashboard";
import VendorProducts from "./components/Vendor/VendorProducts";
import AddProduct from "./components/Vendor/AddProduct";
import VendorOrders from "./components/Vendor/VendorOrders";
import VendorCustomers from "./components/Vendor/VendorCustomers";
import VendorReports from "./components/Vendor/VendorReports";
import VendorProfile from "./components/Vendor/VendorProfile";
import VendorEditProfile from "./components/Vendor/VendorEditProfile"; // ✅ new
import VendorPublicProfile from "./components/Vendor/VendorPublicProfile";
import VendorWallet from "./components/Vendor/VendorWallet";
import PayoutsHistory from "./components/Vendor/PayoutsHistory";
import VendorInbox from "./components/Vendor/VendorInbox";
import VendorReviews from "./components/Vendor/VendorReviews";
import VendorDiscounts from "./components/Vendor/VendorDiscounts";
import CreateDiscount from "./components/Vendor/CreateDiscount";
import VendorHelp from "./components/Vendor/VendorHelp";
import VendorChangePassword from "./components/Vendor/VendorChangePassword";
import VendorStore from "./components/Vendor/VendorStore";

function App() {
  return (
    <AuthProvider>
      <VendorProvider>
        <Header />
        <main>
          <Routes>
            {/* Website */}
            <Route path="/" element={<HomeLanding />} />
            <Route path="/products" element={<AllProducts />} />
            <Route path="/products/popular" element={<PopularProducts />} />
            <Route path="/products/new" element={<NewArrivals />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:category_slug/:category_id" element={<CategoryProducts />} />
            <Route path="/product/:product_slug/:product_id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/explore-vendors" element={<ExploreVendors />} />

            {/* Customer */}
            <Route path="/customer/register" element={<Register />} />
            <Route path="/customer/login" element={<Login />} />
            <Route path="/customer/dashboard" element={<Dashboard />} />
            <Route path="/customer/orders" element={<Orders />} />
            <Route path="/customer/orders/:id" element={<OrderDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/customer/wishlist" element={<Wishlist />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/change-password" element={<ChangePassword />} />
            <Route path="/customer/addresses" element={<AddressList />} />
            <Route path="/customer/add-address" element={<AddAddress />} />
            <Route path="/customer/inbox" element={<CustomerInbox />} />
            <Route path="/customer/inbox/:id" element={<ChatWindow />} /> {/* ✅ chat route */}
            <Route path="/customer/wallet" element={<CustomerWallet />} />
            <Route path="/customer/coupons" element={<CustomerCoupons />} />
            <Route path="/customer/reviews" element={<CustomerReviews />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/support" element={<CustomerSupport />} />
            <Route path="/customer/payment-methods" element={<PaymentMethods />} />
            <Route path="/customer/resolution-center" element={<ResolutionCenter />} />

            {/* Vendor */}
            <Route path="/vendor/register" element={<VendorRegister />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/add-product" element={<AddProduct />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
            <Route path="/vendor/customers" element={<VendorCustomers />} />
            <Route path="/vendor/reports" element={<VendorReports />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/edit-profile" element={<VendorEditProfile />} /> {/* ✅ edit profile */}
            <Route path="/vendor/public-profile/:vendor_id" element={<VendorPublicProfile />} />
            <Route path="/vendor/wallet" element={<VendorWallet />} />
            <Route path="/vendor/payouts" element={<PayoutsHistory />} />
            <Route path="/vendor/inbox" element={<VendorInbox />} />
            <Route path="/vendor/reviews" element={<VendorReviews />} />
            <Route path="/vendor/discounts" element={<VendorDiscounts />} />
            <Route path="/vendor/discounts/create" element={<CreateDiscount />} />
            <Route path="/vendor/help" element={<VendorHelp />} />
            <Route path="/vendor/change-password" element={<VendorChangePassword />} />
            <Route path="/vendor/store/:vendor_slug/:vendor_id" element={<VendorStore />} />
          </Routes>
        </main>
        <Footer />
      </VendorProvider>
    </AuthProvider>
  );
}

export default App;
