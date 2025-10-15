import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { VendorProvider } from "./context/VendorContext";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";

import HomeLanding from "./components/Homepage/HomeLanding";
import AllProducts from "./components/products/AllProducts";
import Categories from "./components/products/Categories";
import CategoryProducts from "./components/products/CategoryProducts";
import Checkout from "./components/checkout/Checkout";

import ExploreVendors from "./components/Vendor/ExploreVendors";
import PopularProducts from "./components/products/PopularProducts";
import NewArrivals from "./components/products/NewArrivals";

// ✅ Use the existing location of the file
import ProductDetail from "./components/products/ProductDetail";

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
import ChatWindow from "./components/Customer/ChatWindow";
// 🔻 Removed old wallet components (CustomerWallet, PaymentMethods) imports
import CustomerCoupons from "./components/Customer/CustomerCoupons";
import CustomerReviews from "./components/Customer/CustomerReviews";
import CustomerNotifications from "./components/Customer/CustomerNotifications";
import CustomerSupport from "./components/Customer/CustomerSupport";
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
import VendorEditProfile from "./components/Vendor/VendorEditProfile";
import VendorPublicProfile from "./components/Vendor/VendorPublicProfile";
// 🔻 Removed VendorWallet import (unified wallet now)
import PayoutsHistory from "./components/Vendor/PayoutsHistory";
import VendorInbox from "./components/Vendor/VendorInbox";
import VendorReviews from "./components/Vendor/VendorReviews";
import VendorDiscounts from "./components/Vendor/VendorDiscounts";
import CreateDiscount from "./components/Vendor/CreateDiscount";
import VendorHelp from "./components/Vendor/VendorHelp";
import VendorChangePassword from "./components/Vendor/VendorChangePassword";
import VendorStore from "./components/Vendor/VendorStore";

// ⭐ NEW
import CreateShop from "./components/Vendor/CreateShop";

// ⭐ NEW — unified wallet module
import WalletLayout from "./components/wallet/WalletLayout";
import WalletOverview from "./components/wallet/WalletOverview";
import DepositOzow from "./components/wallet/DepositOzow";
import Withdraw from "./components/wallet/Withdraw";
import Transactions from "./components/wallet/Transactions";

// Small inline helpers for Ozow return/cancel pages
function DepositSuccess() {
  return (
    <div className="text-center py-4">
      <h5 className="text-success mb-2">Deposit success</h5>
      <p className="text-muted">If your balance hasn’t updated yet, it will after the webhook finalizes.</p>
      <Link className="btn btn-dark" to="/wallet">Back to Wallet</Link>
    </div>
  );
}
function DepositCancel() {
  return (
    <div className="text-center py-4">
      <h5 className="text-danger mb-2">Deposit cancelled</h5>
      <p className="text-muted">No funds were taken. You can try again anytime.</p>
      <Link className="btn btn-outline-dark" to="/wallet/deposit">Try Again</Link>
    </div>
  );
}

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

            {/* 👇 Single chat route handles:
                /customer/inbox?vendor=ID&product=ID  OR  /customer/inbox?conversation=ID */}
            <Route path="/customer/inbox" element={<ChatWindow />} />
            {/* keep :id alias if you still link to it elsewhere */}
            <Route path="/customer/inbox/:id" element={<ChatWindow />} />

            {/* 🔻 Removed legacy wallet routes
                <Route path="/customer/wallet" element={<CustomerWallet />} />
                <Route path="/customer/payment-methods" element={<PaymentMethods />} />
            */}
            <Route path="/customer/coupons" element={<CustomerCoupons />} />
            <Route path="/customer/reviews" element={<CustomerReviews />} />
            <Route path="/customer/notifications" element={<CustomerNotifications />} />
            <Route path="/customer/support" element={<CustomerSupport />} />
            <Route path="/customer/resolution-center" element={<ResolutionCenter />} />

            {/* Vendor */}
            <Route path="/vendor/create" element={<CreateShop />} />
            <Route path="/vendor/register" element={<VendorRegister />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/add-product" element={<AddProduct />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
            <Route path="/vendor/customers" element={<VendorCustomers />} />
            <Route path="/vendor/reports" element={<VendorReports />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/edit-profile" element={<VendorEditProfile />} />
            <Route path="/vendor/public-profile/:vendor_id" element={<VendorPublicProfile />} />
            {/* 🔻 Removed legacy vendor wallet route
                <Route path="/vendor/wallet" element={<VendorWallet />} />
            */}
            <Route path="/vendor/payouts" element={<PayoutsHistory />} />
            <Route path="/vendor/inbox" element={<VendorInbox />} />
            <Route path="/vendor/reviews" element={<VendorReviews />} />
            <Route path="/vendor/discounts" element={<VendorDiscounts />} />
            <Route path="/vendor/discounts/create" element={<CreateDiscount />} />
            <Route path="/vendor/help" element={<VendorHelp />} />
            <Route path="/vendor/change-password" element={<VendorChangePassword />} />
            <Route path="/vendor/store/:vendor_slug/:vendor_id" element={<VendorStore />} />

            {/* slug-only public route — must be last in /vendor/* */}
            <Route path="/vendor/:vendor_slug" element={<VendorPublicProfile />} />

            {/* ⭐ NEW unified Wallet routes */}
            <Route path="/wallet" element={<WalletLayout />}>
              <Route index element={<WalletOverview />} />
              <Route path="deposit" element={<DepositOzow />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="transactions" element={<Transactions />} />
              {/* Ozow return pages from settings */}
              <Route path="deposit/success" element={<DepositSuccess />} />
              <Route path="deposit/cancel" element={<DepositCancel />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </VendorProvider>
    </AuthProvider>
  );
}

export default App;
