import React from "react"
import './App.css';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from './styles/admintheme';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Home from './pages/Home';
import Comate from './pages/Comate';
import Cart from './pages/Cart';
import Login from './pages/Login';
import SignupTerms from './pages/SignupTerms';
import SignupInfo from './pages/SignupInfo';
import FindAccount from './pages/FindAccount';
import KakaoAdditionalInfo from './pages/KakaoAdditionalInfo';
import NaverLoginCallback from './pages/NaverLoginCallback';
import MyPage from './pages/MyPage';
import ProfileEdit from "./pages/ProfileEdit";
import OrderHistory from "./pages/OrderHistory";
import MyActivity from './pages/MyActivity';
import AccountSettings from "./pages/AccountSettings";
import MyCoMate from './pages/MyCoMate';
import OrderDetail from "./pages/OrderDetail";
import Review from './pages/Review.js';
import UpdateReview from './pages/UpdateReview.js';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminProductList from './pages/admin/AdminProductList';
import AdminProductNew from './pages/admin/AdminProductNew';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import AdminMemberList from './pages/admin/AdminMemberList';
import OrderPage from './pages/Orderpage/OrderPage';
import PaymentPage from './pages/PaymentPage/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import OrderFailPage from './pages/OrderFailPage/OrderFailPage';
import { OrderProvider } from './pages/OrderContext';
import CreateReviewwPage from "./features/CreateReviewPage.js";
import CreateUpdatePage from "./features/CreateUpdatePage.js";

function App() {
  const location = useLocation();
  const hideHeaderFooter = ['/login', '/login/naver/callback', '/signup/terms', '/signup/info', '/find-account', '/kakao/additional-info'].includes(location.pathname) 
    || location.pathname.startsWith('/admin');


  return (
    <ThemeProvider theme={theme}>
    <OrderProvider>
      <div className="App">
        {!hideHeaderFooter && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 로그인 관련 */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/naver/callback" element={<NaverLoginCallback />} />
          <Route path="/signup/terms" element={<SignupTerms />} />
          <Route path="/signup/info" element={<SignupInfo />} />
          <Route path="/find-account" element={<FindAccount />} />
          <Route path="/kakao/additional-info" element={<KakaoAdditionalInfo />} />

          <Route element={<ProtectedRoute />}> {/* 로그인이 필요한 페이지는 ProtectedRoute로 감싸서 접근 제어 */}
            {/* 마이페이지 관련 */}
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/profile-edit" element={<ProfileEdit />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/my-activity" element={<MyActivity />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/my-comate" element={<MyCoMate />} />
            <Route path="/order-detail/:id" element={<OrderDetail />} />
            <Route path="/update-reviews/:reviewNo" element={<UpdateReview />} />
            {/* 장바구니 관련 */}
            <Route path="/cart" element={<Cart />} />
            {/* 주문 관련 */}
            <Route path="/order" element={<OrderPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order-fail" element={<OrderFailPage />} />
            {/* COMATE 관련 -  내 계정 */}
            <Route path="/comate/me/:tab?" element={<Comate userType="me" />} />
          </Route>
          
          {/* 관리자 페이지 - 관리자 권한 필요 */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="products" replace />} />
              <Route path="products" element={<AdminProductList />} />
              <Route path="product/new" element={<AdminProductNew />} />
              <Route path="product/edit/:productId" element={<AdminProductEdit />} />
              <Route path="categories" element={<AdminCategoryList />} />
              <Route path="members" element={<AdminMemberList />} />
            </Route>
          </Route>
          {/* COMATE 관련 - 다른 사용자 계정 */}
          <Route path="/comate/user/:memNo/:tab?" element={<Comate userType="user" />} />
          {/* 리뷰 관련 */}
          <Route path="/reviews/:orderItemNo" element={<CreateReviewwPage/>} />
          <Route path="/update-reviews/:reviewNo" element={<CreateUpdatePage/>} />
          {/* 상품 관련 */}
          <Route path="/product" element={<ProductListPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Routes>
        {!hideHeaderFooter && <Footer />}
      </div>
    </OrderProvider>
    </ThemeProvider>
  ); 
}   


export default App;