-- Seed data for local development
INSERT INTO public.menu_items (name, description, price, category, image_url, is_active) VALUES
  ('Espresso', 'Rich and bold single shot', 3.50, 'coffee', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop', true),
  ('Americano', 'Espresso with hot water', 4.00, 'coffee', 'https://images.unsplash.com/photo-1571470555434-cdb0a1b9c4bc?w=400&h=400&fit=crop', true),
  ('Latte', 'Espresso with steamed milk and foam', 5.50, 'coffee', 'https://images.unsplash.com/photo-1571181751264-23fa8cfc36ce?w=400&h=400&fit=crop', true),
  ('Cappuccino', 'Equal parts espresso, steamed milk, and foam', 5.00, 'coffee', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop', true),
  ('Macchiato', 'Espresso "marked" with foamed milk', 4.75, 'coffee', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop', true),
  ('Mocha', 'Espresso with chocolate and steamed milk', 6.00, 'coffee', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&h=400&fit=crop', true),
  ('Cold Brew', 'Smooth and less acidic cold coffee', 4.50, 'coffee', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop', true),
  ('Iced Latte', 'Chilled espresso with cold milk', 5.75, 'coffee', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop', true),
  ('Butter Croissant', 'Flaky, buttery pastry', 3.25, 'pastry', 'https://images.unsplash.com/photo-1549318721-1f258d4414d5?w=400&h=400&fit=crop', true),
  ('Blueberry Muffin', 'Fresh blueberries in tender muffin', 4.00, 'pastry', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop', true),
  ('Everything Bagel', 'Toasted with cream cheese', 3.75, 'pastry', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', true),
  ('BLT Sandwich', 'Bacon, lettuce, tomato on sourdough', 8.50, 'food', 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop', true);

-- Add RLS policy for menu_items (public read)
DROP POLICY IF EXISTS "menu public read" ON public.menu_items;
CREATE POLICY "menu public read" ON public.menu_items FOR SELECT USING (true);