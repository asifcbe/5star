import React from 'react';

const PrivacyPolicy = () => (
  <div>
    <div className="page-header">
      <div className="container"><h1>Privacy Policy</h1><p>How we handle your data</p></div>
    </div>
    <div className="policy-content">
      <p>At 5Star, we respect your privacy and are committed to protecting the personal information you share with us while shopping for bags, jerkins and trolleys.</p>

      <h2>Information We Collect</h2>
      <p>We collect information you provide directly, such as your name, email, phone number, and delivery address. We also collect order history and payment status (payment details themselves are processed securely by Razorpay and are never stored on our servers).</p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process and deliver your orders</li>
        <li>To communicate order updates, tracking information, and support responses</li>
        <li>To improve our product range and recommend relevant products</li>
        <li>To send promotional offers, only if you have opted in</li>
      </ul>

      <h2>Data Security</h2>
      <p>We use industry-standard measures to protect your data, including encrypted connections and secure authentication. Access to customer data is restricted to authorized personnel only.</p>

      <h2>Third-Party Sharing</h2>
      <p>We do not sell your personal information. We share data only with service providers necessary to fulfil your order, such as payment gateways and courier partners.</p>

      <h2>Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>

      <h2>Contact Us</h2>
      <p>For privacy-related questions, email us at <a href="mailto:support@fivestar.example.com">support@fivestar.example.com</a>.</p>
    </div>
  </div>
);

export default PrivacyPolicy;
