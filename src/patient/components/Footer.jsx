import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-5 mt-5">
      <div className="container">
        <div className="row mb-5">
          {/* Company Info */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Aayush Healthcare</h5>
            <p className="text-light">Your trusted partner for healthcare services and medical consultations.</p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/" className="text-white text-decoration-none">Home</a></li>
              <li className="mb-2"><a href="/about" className="text-white text-decoration-none">About</a></li>
              <li className="mb-2"><a href="/contact" className="text-white text-decoration-none">Contact Us</a></li>
              <li className="mb-2"><a href="/doctors" className="text-white text-decoration-none">Find Doctors</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-4 mb-4">
            <h5 className="fw-bold mb-3">Contact Us</h5>
            <ul className="list-unstyled text-light">
              <li className="mb-2"><i className="bi bi-envelope"></i> info@aayush.com</li>
              <li className="mb-2"><i className="bi bi-telephone"></i> +1 (555) 123-4567</li>
              <li className="mb-2"><i className="bi bi-geo-alt"></i> 123 Healthcare St, Medical City</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-top border-light pt-4 text-center text-light">
          <p>&copy; 2026 Aayush Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
