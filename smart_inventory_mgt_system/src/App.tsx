import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import AIInsights from './pages/AIInsights';
import Forecasts from './pages/Forecasts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchase-orders" element={<PurchaseOrders />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/forecasts" element={<Forecasts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
