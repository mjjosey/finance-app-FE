import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Items from './pages/Items/Items';
import Customers from './pages/customers/Customers';
import Suppliers from './pages/suppliers/Suppliers';
import Sales from './pages/sales/Sales';
import Purchases from './pages/purchases/Purchases';
import Payments from './pages/payments/Payments';
import Receipts from './pages/receipts/Receipts';
import { navItems as baseNavItems } from './constants';

export const navItems = [
  { ...baseNavItems[0], component: Items },
  { ...baseNavItems[1], component: Customers },
  { ...baseNavItems[2], component: Suppliers },
  { ...baseNavItems[3], component: Sales },
  { ...baseNavItems[4], component: Purchases },
  { ...baseNavItems[5], component: Payments },
  { ...baseNavItems[6], component: Receipts },
];

export default function AppRouter() {
  return (
    <Routes>
      <Route
        index
        element={<Typography>Welcome to the dashboard</Typography>}
      />
      {navItems.map((item) => {
        const Page = item.component;
        return (
          <Route
            key={item.link}
            path={item.link.slice(1)}
            element={<Page />}
          />
        );
      })}
    </Routes>
  );
}
