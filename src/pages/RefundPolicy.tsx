import React from 'react';

const RefundPolicy: React.FC = () => (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h1>Refund Policy</h1>
        <p>
            At Adaptius, we strive to ensure customer satisfaction with our products and services. If you are not satisfied with your purchase, please review our refund policy below:
        </p>
        <h2>Eligibility for Refunds</h2>
        <ul>
            <li>Refund requests must be made within 14 days of purchase.</li>
            <li>Only purchases made directly through our website are eligible for refunds.</li>
            <li>Refunds are not available for services that have already been delivered or completed.</li>
        </ul>
        <h2>How to Request a Refund</h2>
        <ol>
            <li>Contact our support team at <a href="mailto:aakash@adaptius.in">shalini@adaptius.in</a> with your order details.</li>
            <li>Provide a brief explanation for your refund request.</li>
            <li>Our team will review your request and respond within 3 business days.</li>
        </ol>
        <h2>Exceptions</h2>
        <ul>
            <li>Refunds are not available for promotional or discounted items unless otherwise stated.</li>
            <li>Partial refunds may be considered in special circumstances at our discretion.</li>
        </ul>
        <h2>Contact Us</h2>
        <p>
            If you have any questions about our refund policy, please contact us at <a href="mailto:aakash@adaptius.in">shalini@adaptius.in</a>.
        </p>
    </div>
);

export default RefundPolicy;