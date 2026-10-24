import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import UpcomingEventsPage from './pages/UpcomingEventsPage';
import PastEventsPage from './pages/PastEventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                 element={<HomePage />} />
        <Route path="/about"            element={<AboutPage />} />
        <Route path="/events"           element={<EventsPage />} />
        <Route path="/upcoming-events"  element={<UpcomingEventsPage />} />
        <Route path="/past-events"      element={<PastEventsPage />} />
        <Route path="/events/:id"       element={<EventDetailPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/admin"            element={<AdminPanel />} />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <main style={{ minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <p style={{ fontSize:'6rem', marginBottom:'1rem' }}>404</p>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', marginBottom:'1rem', background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
        Page Not Found
      </h1>
      <p style={{ color:'var(--color-text-muted)', marginBottom:'2rem' }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">Go Home</a>
    </main>
  );
}

export default App;
