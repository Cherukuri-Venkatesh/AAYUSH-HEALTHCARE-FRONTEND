import React from 'react';

const Contact = () => {
  return (
    <div className="py-4">
      <div className="text-center mb-4">
        <h1 className="h3 fw-bold mb-2">Contact Us</h1>
        <p className="text-secondary mb-0">Reach out for support, partnerships, or healthcare assistance.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Contact Information</h2>
              <p className="mb-2"><strong>Email:</strong> support@aayushhealthcare.com</p>
              <p className="mb-2"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="mb-0"><strong>Address:</strong> Vijayawada, Andhra Pradesh, India</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Send Feedback</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Name</label>
                  <input className="form-control" type="text" placeholder="Your Name" />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input className="form-control" type="email" placeholder="Your Email" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Message</label>
                  <textarea className="form-control" rows="4" placeholder="Write your message"></textarea>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" style={{ background: '#5F6FFF', borderColor: '#5F6FFF' }}>
                    Send Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
