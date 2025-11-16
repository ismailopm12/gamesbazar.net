-- Add default SEO settings for key pages
INSERT INTO public.seo_settings (page_path, title, description, keywords, og_type, twitter_card, robots)
VALUES 
  ('/', 'BD Games Bazar - Digital Game Top-ups', 'Buy digital game top-ups instantly. We offer the best prices and fastest delivery for popular games.', 'game top-up, digital games, instant delivery, gaming', 'website', 'summary_large_image', 'index, follow'),
  ('/auth', 'Login - BD Games Bazar', 'Login to your BD Games Bazar account to manage your orders and profile.', 'login, account, gaming', 'website', 'summary_large_image', 'noindex, nofollow'),
  ('/profile', 'My Profile - BD Games Bazar', 'Manage your BD Games Bazar profile, orders, and account settings.', 'profile, account, orders, gaming', 'website', 'summary_large_image', 'noindex, nofollow'),
  ('/add-money', 'Add Money - BD Games Bazar', 'Add money to your BD Games Bazar wallet to purchase game top-ups.', 'add money, wallet, payment, gaming', 'website', 'summary_large_image', 'noindex, nofollow'),
  ('/my-orders', 'My Orders - BD Games Bazar', 'View your order history and track the status of your game top-ups.', 'orders, history, gaming', 'website', 'summary_large_image', 'noindex, nofollow'),
  ('/help', 'Help Center - BD Games Bazar', 'Find answers to frequently asked questions about BD Games Bazar services.', 'help, faq, support, gaming', 'website', 'summary_large_image', 'index, follow'),
  ('/contact', 'Contact Us - BD Games Bazar', 'Get in touch with BD Games Bazar customer support.', 'contact, support, gaming', 'website', 'summary_large_image', 'index, follow'),
  ('/terms', 'Terms & Conditions - BD Games Bazar', 'Read the terms and conditions of using BD Games Bazar services.', 'terms, conditions, legal, gaming', 'website', 'summary_large_image', 'index, follow'),
  ('/privacy', 'Privacy Policy - BD Games Bazar', 'Learn how BD Games Bazar protects your privacy and personal information.', 'privacy, policy, legal, gaming', 'website', 'summary_large_image', 'index, follow')
ON CONFLICT (page_path) DO NOTHING;