# Bottle Shop

This project is a simple e-commerce website for Assignment 2.

It is based on the original Bottle Shop project and was extended into a more complete single page application using React, Express and MySQL.

## Basic Functions

- User register and login
- Password hashing with bcrypt
- JWT authentication
- Product browsing
- Live search and filter
- Add to cart
- Update cart quantity
- Remove items from cart
- Checkout and create order
- View my orders
- Admin manage products
- Admin manage orders
- Admin view users and activity

## Main Feature Points

### Customer Side

- Register a new account
- Login and logout
- Browse all products
- Search products by keyword
- Filter products by category
- View product details
- Add products to cart
- Change quantity in cart
- Clear cart
- Checkout
- View order history
- Edit profile name

### Admin Side

- Login as admin
- Add new products
- Edit products
- Delete products
- View all orders
- Update order status
- View all users
- View user activity

## Technology Used

- React
- React Router
- Bootstrap
- React Toastify
- Node.js
- Express
- MySQL
- bcryptjs
- jsonwebtoken

## How to Install

### 1. Clone or download the project

Put the project folder on your computer.

### 2. Install root dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
```

## Database Setup

1. Open MySQL
2. Create or import the database by running the `schema.sql` file in the root folder
3. The database name is `bottle_shop`

You can also use `server/schema.sql`.

## How to Run

Go back to the project root folder and run:

```bash
npm start
```

This will start:

- backend server on port `5001`
- frontend React app on port `3000`

## Admin Account

Default admin account:

- Email: `admin@bottleshop.com`
- Password: `admin123`

## Folder Structure

- `client/` - React frontend
- `server/` - Express backend
- `schema.sql` - database file
- `server/images/` - product images

