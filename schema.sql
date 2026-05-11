CREATE DATABASE IF NOT EXISTS bottle_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bottle_shop;

DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role, status) VALUES
  ('Admin User', 'admin@bottleshop.com', '$2b$10$MJwupPBSOU9cXpnFCptJfesywTpJB/k9ZjLNnmWskApg9yO2czveW', 'admin', 'active');

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  stock INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, price, description, image_url, stock, is_active) VALUES
  ('Pepperjack Shiraz', 'Wine', 24.99, 'Rich and full-bodied Australian Shiraz.', '/images/pepperjack.avif', 24, 1),
  ('Metala Cabernet Shiraz', 'Wine', 21.99, 'Classic Cabernet Shiraz blend with dark fruit flavours.', '/images/metala.avif', 18, 1),
  ('19 Crimes Red Blend', 'Wine', 18.99, 'Popular bold red blend with a smooth finish.', '/images/19Crims.avif', 32, 1),
  ('South Island Sauvignon Blanc', 'Wine', 16.99, 'Crisp and refreshing New Zealand Sauvignon Blanc.', '/images/SouthIsland.webp', 30, 1),
  ('Pinot Grigio', 'Wine', 17.99, 'Light and fresh Pinot Grigio, easy to drink.', '/images/PinotGrigio.webp', 16, 1),
  ('Sauvignon Blanc', 'Wine', 15.99, 'Fruity white wine with citrus notes.', '/images/SauvignonBlanc.webp', 22, 1),
  ('VB Lager', 'Beer', 5.50, 'Classic Australian lager beer.', '/images/VB.avif', 60, 1),
  ('Coopers Pale Ale', 'Beer', 6.00, 'Famous Australian pale ale with a malty flavour.', '/images/Coopers.avif', 44, 1),
  ('John Boston Pale Ale', 'Beer', 5.99, 'Easy-drinking pale ale, perfect for summer.', '/images/JohnBoston.webp', 28, 1),
  ('South Coast Pale Ale', 'Beer', 6.49, 'Craft pale ale from the South Coast region.', '/images/SouthCoastPaleAle.webp', 25, 1),
  ('BentSpoke IPA', 'Beer', 7.50, 'Hoppy IPA with strong bitterness and aroma.', '/images/BentspokeIPA.webp', 20, 1),
  ('Brut Sparkling Wine', 'Sparkling', 22.99, 'Dry sparkling wine for celebrations.', '/images/Brut.webp', 15, 1),
  ('Zoncello Limoncello Spritz', 'Ready To Drink', 9.99, 'Refreshing limoncello spritz ready-to-drink.', '/images/ZoncelloLimoncelloSpritz.webp', 18, 1),
  ('Chocolate Brownie Whiskey', 'Spirits', 49.99, 'Flavoured whiskey with chocolate brownie notes.', '/images/ChocolateBrownieWhiskey.webp', 12, 1),
  ('Capi Mixer', 'Mixer', 3.99, 'Premium mixer, great with spirits.', '/images/Capi.avif', 40, 1),
  ('Fever-Tree Mixer', 'Mixer', 4.49, 'High quality tonic and mixers for your cocktails.', '/images/FeverTree.avif', 50, 1),
  ('Just Be Non-Alcoholic', 'Non-Alcoholic', 12.99, 'Non-alcoholic option for mindful drinking.', '/images/JustBe.avif', 26, 1);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name_snapshot VARCHAR(255) NOT NULL,
  price_snapshot DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
