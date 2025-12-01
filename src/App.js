import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Orders from './pages/Orders';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Suppliers from './pages/Suppliers';
import Transactions from './pages/Transactions';
import Pharmacies from './pages/Pharmacies';
import PharmacyDetail from './pages/PharmacyDetail';
// Import other pages as you create them
// import PatientsCare from './pages/PatientsCare';
// import DDIIntegrators from './pages/DDIIntegrators';
// import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/products/add" element={<Layout><AddProduct /></Layout>} />
        <Route path="/products/edit/:id" element={<Layout><EditProduct /></Layout>} />
        <Route path="/suppliers" element={<Layout><Suppliers /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/pharmacies" element={<Layout><Pharmacies /></Layout>} />
        <Route path="/pharmacies/:id" element={<Layout><PharmacyDetail /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        
        {/* Uncomment and add routes as you create the pages */}
        {/* <Route path="/patients-care" element={<Layout><PatientsCare /></Layout>} /> */}
        {/* <Route path="/ddi-integrators" element={<Layout><DDIIntegrators /></Layout>} /> */}
        {/* <Route path="/analytics" element={<Layout><Analytics /></Layout>} /> */}
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
