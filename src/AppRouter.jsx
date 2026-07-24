import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Items from './pages/Items/Items';
import Customers from './pages/customers/Customers';
import Suppliers from './pages/suppliers/Suppliers';
import Sales from './pages/sales/Sales';
import Purchases from './pages/purchases/Purchases';
import Payments from './pages/payments/Payments';
import Receipts from './pages/receipts/Receipts';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { navItems as baseNavItems } from './constants';
import { TOKEN_STORAGE_KEY } from './api/axios';

export const navItems = [
  { ...baseNavItems[0], component: Items },
  { ...baseNavItems[1], component: Customers },
  { ...baseNavItems[2], component: Suppliers },
  { ...baseNavItems[3], component: Sales },
  { ...baseNavItems[4], component: Purchases },
  { ...baseNavItems[5], component: Payments },
  { ...baseNavItems[6], component: Receipts },
];

function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default function AppRouter() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  return (
    <Routes>
      <Route index element={<Navigate to={token ? '/items' : '/login'} replace />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      {navItems.map((item) => {
        const Page = item.component;
        return (
          <Route
            key={item.link}
            path={item.link.slice(1)}
            element={
              <ProtectedRoute>
                <Page />
              </ProtectedRoute>
            }
          />
        );
      })}
      <Route path="*" element={<Navigate to={token ? '/items' : '/login'} replace />} />
    </Routes>
  );
}
