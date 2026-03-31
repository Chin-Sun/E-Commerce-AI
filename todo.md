# Hardware E-Commerce Platform TODO

## Database & Schema

- [x] Products table with name, description, price, category, specs, stock, images
- [x] Categories table (metal hardware, bearings, electromechanical, screws)
- [x] Cart items table linked to users
- [x] Orders table with status tracking
- [x] Order items table linked to orders and products
- [x] Seed initial product data across all categories

## Backend API (tRPC)

- [x] Product listing with pagination, search, and filtering
- [x] Single product detail endpoint
- [x] Cart CRUD operations (add, remove, update quantity, get cart)
- [x] Order creation from cart
- [x] Order history for authenticated users
- [x] Admin: product CRUD (create, read, update, delete)
- [x] Admin: order management and status updates
- [x] Admin: inventory tracking

## Multi-Language (i18n)

- [x] i18n system with language context and hook
- [x] English translations
- [x] Simplified Chinese translations
- [x] Traditional Chinese translations
- [x] Malay translations
- [x] Language switcher in navigation

## Frontend Pages

- [x] Global layout with header, footer, navigation
- [x] Home/landing page with hero and featured products
- [x] Product catalog page with grid layout
- [x] Product detail page with specs and add-to-cart
- [x] Shopping cart page with quantity controls
- [x] Checkout flow with shipping form and order summary
- [x] Order confirmation page
- [x] Order history page for authenticated users
- [x] User account page

## Admin Dashboard

- [x] Admin layout with sidebar navigation
- [x] Product management page (CRUD)
- [x] Order management page with status updates
- [x] Inventory tracking dashboard

## Security & Payment

- [x] Secure authentication with login/logout
- [x] Protected routes for user and admin pages
- [x] Stripe checkout integration
- [x] Multiple currency support

## Design & Polish

- [x] International Typographic Style theme (white bg, red accents, black type)
- [x] Responsive design across breakpoints
- [x] Search and filter UI for products
- [x] Loading states and error handling

## Testing

- [x] Vitest: auth logout test
- [x] Vitest: category list test
- [x] Vitest: product list and filter tests
- [x] Vitest: cart authentication test
- [x] Vitest: order authentication test
- [x] Vitest: admin role guard test

## Gap Fixes

- [x] User account page with profile info and quick links
- [x] Order detail page enhanced as confirmation page with payment status banners
- [x] Multi-currency support passed through to Stripe checkout
- [x] Frontend route guards: admin pages check role, user pages redirect to login
- [x] Account link added to user dropdown in header
