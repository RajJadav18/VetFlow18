import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout       from './components/Layout';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Animals      from './pages/Animals';
import Triage       from './pages/Triage';
import Ambulance    from './pages/Ambulance';
import Wildlife     from './pages/Wildlife';
import Inventory    from './pages/Inventory';
import Schedule     from './pages/Schedule';
import Staff        from './pages/Staff';
import Adoption     from './pages/Adoption';
import Analytics    from './pages/Analytics';
import NotFound     from './pages/NotFound';

const Protected = ({ children }) => {
  const token = useAuthStore(s => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index              element={<Dashboard />} />
        <Route path="animals"     element={<Animals />} />
        <Route path="triage"      element={<Triage />} />
        <Route path="ambulance"   element={<Ambulance />} />
        <Route path="wildlife"    element={<Wildlife />} />
        <Route path="inventory"   element={<Inventory />} />
        <Route path="schedule"    element={<Schedule />} />
        <Route path="staff"       element={<Staff />} />
        <Route path="adoption"    element={<Adoption />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="*"           element={<NotFound />} />
      </Route>
    </Routes>
  );
}
