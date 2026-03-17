import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Stickers from './pages/Stickers';
import Labels from './pages/Labels';
import Magnets from './pages/Magnets';
import Buttons from './pages/Buttons';
import Packaging from './pages/Packaging';
import Apparel from './pages/Apparel';
import Acrylics from './pages/Acrylics';
import MoreProducts from './pages/MoreProducts';
import Deals from './pages/Deals';
import AllReviews from './pages/AllReviews';
import Marketplace from './pages/Marketplace';
import MarketplaceProductDetail from './pages/MarketplaceProductDetail';
import Legal from './pages/Legal';
import LegalDocument from './pages/LegalDocument';
import About from './pages/About';
import Returns from './pages/Returns';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Wishlist from './pages/Wishlist';
import ProductDetail from './pages/ProductDetail';
import UploadArtwork from './pages/UploadArtwork';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Cart from './pages/Cart';
import AllOrders from './pages/AllOrders';
import OrderDetails from './pages/OrderDetails';
import CreateStore from './pages/CreateStore';
import StoreDashboard from './pages/StoreDashboard';
import StoreUpload from './pages/StoreUpload';
import StoreSettings from './pages/StoreSettings';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminArtworks from './pages/admin/Artworks';
import AdminCoupons from './pages/admin/Coupons';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import AdminMarketplace from './pages/admin/Marketplace';
import AdminReturns from './pages/admin/Returns';
import AdminBlogs from './pages/admin/Blogs';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ProgressBar from './components/ProgressBar';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ProgressBar />
          <Routes>
            {/* Public Routes with MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/stickers" element={<Stickers />} />
              <Route path="/labels" element={<Labels />} />
              <Route path="/magnets" element={<Magnets />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/packaging" element={<Packaging />} />
              <Route path="/apparel" element={<Apparel />} />
              <Route path="/acrylics" element={<Acrylics />} />
              <Route path="/more-products" element={<MoreProducts />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/all-reviews" element={<AllReviews />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/legal/:docId" element={<LegalDocument />} />
              <Route path="/about" element={<About />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<MarketplaceProductDetail />} />
              <Route path="/product/:name" element={<ProductDetail />} />
              <Route path="/upload-artwork" element={<UploadArtwork />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Private Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/all-orders" element={<AllOrders />} />
                <Route path="/order-details/:orderId" element={<OrderDetails />} />
                <Route path="/create-store" element={<CreateStore />} />
                <Route path="/store-dashboard" element={<StoreDashboard />} />
                <Route path="/store-upload" element={<StoreUpload />} />
                <Route path="/store-settings" element={<StoreSettings />} />
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
                <Route path="/admin/marketplace" element={<AdminMarketplace />} />
                <Route path="/admin/returns" element={<AdminReturns />} />
                <Route path="/admin/blogs" element={<AdminBlogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
