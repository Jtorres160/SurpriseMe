# SurpriseMe - Content Monetization Platform

A modern web application where creators can upload images and videos, and users can pay to unlock exclusive content. Built with Node.js, Express, MongoDB, React, and Stripe for secure payments.

## Features

### For Creators
- **Easy Content Upload**: Drag & drop interface for images and videos
- **Flexible Pricing**: Set your own prices from $0.01 to $1000
- **Content Management**: Edit, delete, and organize your content
- **Earnings Tracking**: Monitor your sales and earnings
- **Secure Payments**: Stripe integration for safe transactions
- **Analytics**: View content performance and audience insights

### For Buyers
- **Content Discovery**: Browse and search through available content
- **Secure Purchases**: Safe payment processing with Stripe
- **Instant Access**: Get immediate access after payment
- **Purchase History**: Track all your purchases
- **Content Categories**: Filter by art, photography, music, videos, and more

### Platform Features
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live content and payment status
- **Search & Filter**: Find content by title, description, tags, or category
- **User Profiles**: Customizable creator profiles
- **Rating System**: Content quality indicators

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Cloudinary** - File storage and CDN
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Dropzone** - File upload interface
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Stripe Elements** - Payment forms

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Stripe Account** (for payments)
- **Cloudinary Account** (for file storage)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd surprise-me
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/surprise-me
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Set up frontend environment variables**
   
   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```
   The React app will run on `http://localhost:3000`

### Production Mode

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Content
- `GET /api/content` - Get all content with pagination and filters
- `GET /api/content/:id` - Get specific content by ID
- `POST /api/content/upload` - Upload new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `GET /api/content/creator/:userId` - Get content by creator
- `GET /api/content/trending` - Get trending content

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-purchase` - Confirm purchase
- `GET /api/payments/purchases` - Get user's purchase history
- `GET /api/payments/sales` - Get creator's sales history
- `GET /api/payments/earnings` - Get creator's earnings
- `POST /api/payments/withdraw` - Withdraw earnings

## Database Schema

### User Model
- Username, email, password
- Profile picture, bio
- Balance, total earnings, total spent
- Stripe account and customer IDs

### Content Model
- Creator reference
- Title, description, type (image/video)
- File URL, thumbnail URL
- Price, category, tags
- Views, purchases, revenue
- File metadata (size, duration, dimensions)

### Purchase Model
- Buyer, content, and creator references
- Amount, platform fee, creator earnings
- Stripe payment intent ID
- Status and timestamps

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Input Validation** - Server-side validation for all inputs
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Cross-origin resource sharing configuration
- **Helmet.js** - Security headers
- **Stripe Security** - PCI-compliant payment processing

## File Upload

The application supports:
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV, WMV
- **Max Size**: 100MB per file
- **Storage**: Cloudinary CDN for fast delivery

## Payment Processing

- **Stripe Integration** - Secure payment processing
- **Platform Fee**: 10% of each transaction
- **Creator Earnings**: 90% of transaction amount
- **Instant Payouts** - Automatic balance updates
- **Webhook Support** - Real-time payment status updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@surpriseme.com or create an issue in the repository.

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Subscription-based content
- [ ] Content bundling
- [ ] Creator verification system
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Social media integration
- [ ] Content watermarking
- [ ] Bulk upload functionality

## Acknowledgments

- [Stripe](https://stripe.com/) for payment processing
- [Cloudinary](https://cloudinary.com/) for file storage
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the frontend framework
- [Express](https://expressjs.com/) for the backend framework 