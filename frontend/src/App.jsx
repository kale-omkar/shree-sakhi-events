import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventsPage from './pages/EventsPage';
import UpcomingEventsPage from './pages/UpcomingEventsPage';
import PastEventsPage from './pages/PastEventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import ContactPage from './pages/ContactPage';
import EnquiryPage from './pages/EnquiryPage';
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
        <Route path="/contact"          element={<ContactPage />} />
        <Route path="/enquiry"          element={<EnquiryPage />} />
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

function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__name">Shree Sakhi Events</span>
          <span className="site-footer__tagline">Celebrating Women Through Culture, Creativity & Community</span>
        </div>
        <div className="site-footer__links">
          <a href="/events"          className="site-footer__link">All Events</a>
          <a href="/upcoming-events" className="site-footer__link">Upcoming</a>
          <a href="/past-events"     className="site-footer__link">Past & Portfolio</a>
          <a href="/about"           className="site-footer__link">About Us</a>
          <a href="/contact"         className="site-footer__link">Contact</a>
          <a href="/enquiry"         className="site-footer__link">Enquiry</a>
          <a href="/register"        className="site-footer__link">Register</a>
          <a href="/admin"           className="site-footer__link" style={{ opacity: 0.7 }}>Admin Portal</a>
        </div>
        <div className="site-footer__copy">
          © {new Date().getFullYear()} Shree Sakhi Events, Nashik. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default App;
