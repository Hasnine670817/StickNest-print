import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Samples from './pages/Samples';
import Stickers from './pages/Stickers';
import Labels from './pages/Labels';
import Magnets from './pages/Magnets';
import Buttons from './pages/Buttons';
import Packaging from './pages/Packaging';
import Apparel from './pages/Apparel';
import Acrylics from './pages/Acrylics';
import MoreProducts from './pages/MoreProducts';
import Deals from './pages/Deals';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import UploadArtwork from './pages/UploadArtwork';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Cart from './pages/Cart';
import AllOrders from './pages/AllOrders';
import OrderDetails from './pages/OrderDetails';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminArtworks from './pages/admin/Artworks';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/samples" element={<Samples />} />
              <Route path="/stickers" element={<Stickers />} />
              <Route path="/labels" element={<Labels />} />
              <Route path="/magnets" element={<Magnets />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/packaging" element={<Packaging />} />
              <Route path="/apparel" element={<Apparel />} />
              <Route path="/acrylics" element={<Acrylics />} />
              <Route path="/more-products" element={<MoreProducts />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:name" element={<ProductDetail />} />
              <Route path="/upload-artwork" element={<UploadArtwork />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/all-orders" element={<AllOrders />} />
                <Route path="/order-details/:orderId" element={<OrderDetails />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/artworks" element={<AdminArtworks />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
