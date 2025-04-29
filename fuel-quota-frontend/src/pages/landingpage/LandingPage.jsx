import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGasPump, 
  faQrcode, 
  faCar, 
  faUserPlus, 
  faSignInAlt,
  faChartLine,
  faQuestionCircle,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="header">
        <div className="logo">
          <FontAwesomeIcon icon={faGasPump} className="logo-icon" />
          <h1>FuelQuota</h1>
        </div>
        <nav className="navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="auth-buttons">
          <button 
            className="login-button"
            onClick={handleLoginClick}
          >
            <FontAwesomeIcon icon={faSignInAlt} /> Login
          </button>
          <button 
            className="register-button"
            onClick={handleRegisterClick}
          >
            <FontAwesomeIcon icon={faUserPlus} /> Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Manage Your Vehicle's Fuel Quota</h1>
          <p>
            Register your vehicle, receive your personalized QR code, and access fuel efficiently 
            during the country's fuel crisis. Monitor your consumption and get notifications
            when fuel is dispensed.
          </p>
          <div className="hero-cta">
            <button 
              className="cta-button"
              onClick={handleRegisterClick}
            >
              Register Your Vehicle
            </button>
            <button className="secondary-button" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/fuel-quota.svg" alt="Fuel Quota System Illustration" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <h2>Key Features</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faCar} />
            </div>
            <h3>Vehicle Registration</h3>
            <p>Register your vehicles online with a verification process through the Department of Motor Traffic.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faQrcode} />
            </div>
            <h3>Personalized QR Code</h3>
            <p>Receive a unique QR code for your vehicle to use at registered fuel stations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <h3>Quota Tracking</h3>
            <p>Track your fuel consumption and available quota in real-time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <h3>Secure System</h3>
            <p>Your vehicle information and quota details are securely stored and managed.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register Your Vehicle</h3>
            <p>Create an account and register your vehicle with valid documentation</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Verification Process</h3>
            <p>Your details are verified with the Department of Motor Traffic database</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Your QR Code</h3>
            <p>A unique QR code is generated for your vehicle</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Fill Fuel at Stations</h3>
            <p>Visit any registered fuel station and present your QR code to receive fuel</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <h3>Receive Notifications</h3>
            <p>Get SMS notifications each time fuel is dispensed to your vehicle</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3><FontAwesomeIcon icon={faQuestionCircle} /> How much quota will I receive?</h3>
            <p>Quota allocation is based on your vehicle type and usage category. Standard passenger vehicles receive a weekly quota determined by government regulations.</p>
          </div>
          <div className="faq-item">
            <h3><FontAwesomeIcon icon={faQuestionCircle} /> What happens if I lose my QR code?</h3>
            <p>You can log in to your account and download or display your QR code again. Your QR code is tied to your account for security.</p>
          </div>
          <div className="faq-item">
            <h3><FontAwesomeIcon icon={faQuestionCircle} /> Can I transfer my quota to another vehicle?</h3>
            <p>No, fuel quotas are non-transferable between vehicles as they are tied to specific registration details.</p>
          </div>
          <div className="faq-item">
            <h3><FontAwesomeIcon icon={faQuestionCircle} /> How do I know my remaining quota?</h3>
            <p>You can check your remaining quota by logging into your account on this portal. You'll also receive SMS notifications after each fuel purchase.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to Register Your Vehicle?</h2>
        <p>Join thousands of vehicle owners who are managing their fuel needs efficiently</p>
        <button 
          className="cta-button"
          onClick={handleRegisterClick}
        >
          Register Now
        </button>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FontAwesomeIcon icon={faGasPump} className="logo-icon" />
            <h2>FuelQuota</h2>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Quick Links</h3>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#faq">FAQ</a>
              <a href="/contact">Contact Us</a>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <a href="/help">Help Center</a>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
            </div>
            <div className="footer-column">
              <h3>Contact</h3>
              <p>Email: support@fuelquota.gov.lk</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Hours: 8am - 5pm, Mon-Fri</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Fuel Quota Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;