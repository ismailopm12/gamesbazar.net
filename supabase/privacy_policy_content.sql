-- Insert default privacy policy content with proper HTML formatting
INSERT INTO public.page_contents (page_slug, title, content) 
VALUES (
  'privacy',
  'Privacy Policy',
  '<h2>1. Information Collection</h2>
<p>We collect your email, phone number, and payment information which are necessary for providing our services.</p>

<h2>2. Information Usage</h2>
<p>Your information is used solely for order processing and customer support. We never sell your personal information to third parties.</p>

<h2>3. Information Security</h2>
<p>We make every effort to ensure the security of your information. Our systems are encrypted and secure.</p>

<h2>4. Cookies</h2>
<p>We use cookies to enhance your browsing experience. You may disable cookies if you prefer.</p>

<h2>5. Information Access</h2>
<p>You can view and modify your stored information at any time through your profile settings.</p>

<h2>6. Policy Changes</h2>
<p>We may update this policy from time to time. We will notify you of significant changes.</p>

<h2>7. Contact</h2>
<p>If you have any questions about this policy, please contact us.</p>'
)
ON CONFLICT (page_slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content;