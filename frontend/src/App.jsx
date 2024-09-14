import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Dashboard from './dashboard/Dashboard'; // Placeholder for the dashboard
import Login from './auth/login'; // Placeholder for login page
import Signup from './auth/signup'; // Placeholder for signup page
import { ThemeProvider } from './ColorTheme';
import './App.css';
import FishStoryGenerator from './FishStoryGenerator';

const AppContent = () => {
  const location = useLocation();
  const showNavbar = !['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirect root to dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
        <FishStoryGenerator />
      </ThemeProvider>
    </Router>
  );
};

export default App;
