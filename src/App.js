import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="pharmacies/:id" element={<PharmacyDetail />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Uncomment and add routes as you create the pages */}
          {/* <Route path="patients-care" element={<PatientsCare />} /> */}
          {/* <Route path="ddi-integrators" element={<DDIIntegrators />} /> */}
          {/* <Route path="analytics" element={<Analytics />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
