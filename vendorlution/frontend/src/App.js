import { useState } from "react";
import {Routes,Route} from 'react-router-dom';

//Assets
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

//Website
import Header from './components/Header';
import Home from './components/Home';
import Categories from './components/Categories';
import AllProducts from './components/AllProducts';
import ProductDetail from './components/ProductDetail';
import Footer from './components/Footer'; 
import CategoryProducts from './components/CategoryProducts';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import OrderFailure from './components/OrderFailure';

//Customer Panel
import Register from './components/Customer/Register';
import Login from './components/Customer/Login';
import Dashboard from './components/Customer/Dashboard';
import Orders from './components/Customer/Orders';
import Wishlist from './components/Customer/Wishlist';
import Profile from './components/Customer/Profile';
import ChangePassword from './components/Customer/ChangePassword';
import AddressList from './components/Customer/AddressList';
import AddAddress from './components/Customer/AddAddress';

//Vendor Panel
import VendorRegister from './components/Vendor/VendorRegister';
import VendorLogin  from './components/Vendor/VendorLogin';
import VendorDashboard  from './components/Vendor/VendorDashboard';
import VendorProducts from './components/Vendor/VendorProducts';
import AddProduct from "./components/Vendor/AddProduct";



function App() {
  return (
    <>
    <Header />
     <Routes>
      <Route path='/' element={<Home />}/>
       <Route path='/products' element={<AllProducts />}/>
      <Route path='/categories' element={<Categories />}/>
      <Route path='/category/:category_slug/:category_id' element={<CategoryProducts />}/>
      <Route path='/product/:product_slug/:product_id' element={<ProductDetail />}/>
      <Route path='/checkout' element={<Checkout />}/> 
       <Route path='/order/success' element={<OrderSuccess />}/> 
       <Route path='/order/failure' element={<OrderFailure />}/> 

      {/*Customer Routes*/}
      <Route path='/customer/register' element={<Register />}/> 
      <Route path='/customer/login' element={<Login />}/> 
      <Route path='/customer/dashboard' element={<Dashboard />}/> 
      <Route path='/customer/orders' element={<Orders />}/> 
      <Route path='/customer/wishlist' element={<Wishlist />}/>
      <Route path='/customer/profile' element={<Profile />}/> 
      <Route path='/customer/change-password' element={<ChangePassword />}/>
      <Route path='/customer/addresses' element={<AddressList />}/>
      <Route path='/customer/add-address' element={<AddAddress />}/>
      

      {/*Vendor Routes*/}
      <Route path='/vendor/register' element={<VendorRegister />}/> 
      <Route path='/vendor/login' element={<VendorLogin />}/> 
      <Route path='/vendor/dashboard' element={<VendorDashboard />}/> 
      <Route path='/vendor/products' element={<VendorProducts />}/> 
      <Route path='/vendor/add-product' element={<AddProduct />}/> 

      

    </Routes>
    <Footer />
    </>
  );
}

export default App;

