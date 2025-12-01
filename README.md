
- **🤖 AI-Powered Expense Parsing**: Natural language processing for expense entries using OpenAI
- **🔐 Authentication System**: Phone-based OTP authentication with JWT tokens
- **📊 Advanced Analytics**: Comprehensive expense analysis by category, month, and custom date ranges
- **👤 User Management**: Profile management with email verification and photo uploads
- **📈 Usage Tracking**: Token-based usage monitoring for AI interactions
- **📄 Report Generation**: Detailed expense reports with filtering capabilities
- **🎯 Tracker System**: Organize expenses with multiple trackers
- **💬 AI Chat Assistant**: Interactive chat for expense-related queries
- **🔄 RESTful API**: Well-structured API endpoints with proper authentication

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + OTP
- **AI Integration**: OpenAI GPT-4
- **File Uploads**: Multer
- **Email**: Nodemailer + MJML templates
- **Testing**: Mocha, Chai, Supertest
- **DevOps**: Docker, GitHub Actions

## 📋 Prerequisites

- Node.js 20.x or higher
- MongoDB 8.x or higher
- OpenAI API Key
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd spentiva-app-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

Create a `.env` file in the root directory:

```env
PORT=8002
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/expenses?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

### 4. Run the development server

```bash
npm run dev
```

The server will start on `http://localhost:8002`

## 🐳 Docker Deployment

### Build Docker image

```bash
docker build -t spentiva-app-server .
```

### Run Docker container

```bash
docker run -d \
  --name spentiva-app-server \
  -p 8002:8002 \
  --restart=always \
  spentiva-app-server:latest
```

### Docker Compose (Optional)

```yaml
version: '3.8'
services:
  spentiva-backend:
    build: .
    ports:
      - "8002:8002"
    environment:
      - PORT=8002
      - MONGODB_URL=${MONGODB_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    restart: always
```

## 📚 API Documentation

### Base URL
```
http://localhost:8002/api
```

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/send-otp` | Send OTP to phone number | ❌ |
| POST | `/auth/verify-otp` | Verify OTP and login/signup | ❌ |
| GET | `/auth/me` | Get current user profile | ✅ |
| PUT | `/auth/profile` | Update user profile | ✅ |
| POST | `/auth/profile-photo` | Upload profile photo | ✅ |
| POST | `/auth/send-email-otp` | Send email verification OTP | ✅ |
| POST | `/auth/verify-email-otp` | Verify email OTP | ✅ |

#### 💰 Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/expenses` | Create new expense | Optional |
| GET | `/expenses` | Get all expenses | ❌ |
| PUT | `/expenses/:id` | Update expense | ❌ |
| DELETE | `/expenses/:id` | Delete expense | ❌ |
| POST | `/parse-expense` | Parse natural language expense | ✅ |

#### 📊 Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/summary` | Get summary statistics | ❌ |
| GET | `/analytics/by-category` | Get expenses by category | ❌ |
| GET | `/analytics/by-month` | Get monthly expense trends | ❌ |
| GET | `/analytics/total` | Get total expenses | ❌ |

#### 📈 Trackers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/trackers` | Create new tracker | ✅ |
| GET | `/trackers` | Get all user trackers | ✅ |
| PUT | `/trackers/:id` | Update tracker | ✅ |
| DELETE | `/trackers/:id` | Delete tracker | ✅ |

#### 💬 Chat & AI

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat` | Chat with AI assistant | ✅ |
| POST | `/parse-expense` | Parse expense with AI | ✅ |

#### 📄 Reports & Usage

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reports/email` | Generate email report | ✅ |
| GET | `/usage/statistics` | Get usage statistics | ✅ |

#### 🏥 Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health status | ❌ |

### Example Requests

#### Send OTP
```bash
curl -X POST http://localhost:8002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

#### Verify OTP & Login
```bash
curl -X POST http://localhost:8002/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "otp": "123456",
    "name": "John Doe"
  }'
```

#### Parse Expense (AI)
```bash
curl -X POST http://localhost:8002/api/parse-expense \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "message": "Spent 500 rupees on groceries via UPI",
    "trackerId": "tracker_id_here"
  }'
```

#### Create Expense
```bash
curl -X POST http://localhost:8002/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "amount": 500,
    "category": "Food & Dining",
    "subcategory": "Groceries",
    "categoryId": "food",
    "paymentMethod": "UPI",
    "description": "Monthly groceries",
    "trackerId": "tracker_id_here"
  }'
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## 📁 Project Structure

```
spentiva-app-server/
├── src/
│   ├── config/           # Configuration files (DB, environment, categories)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Expense.ts
│   │   ├── Tracker.ts
│   │   ├── OTP.ts
│   │   ├── Category.ts
│   │   ├── Usage.ts
│   │   ├── UsageLog.ts
│   │   └── Message.ts
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic services
│   │   ├── expenseParser.ts    # AI expense parsing
│   │   └── analyticsService.ts # Analytics calculations
│   ├── templates/        # Email templates (MJML)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.ts          # Application entry point
├── test/                 # Test files
├── uploads/              # User uploaded files
├── dist/                 # Compiled JavaScript
├── .github/
│   └── workflows/
│       └── deploy.yaml   # CI/CD pipeline
├── Dockerfile            # Docker configuration
├── tsconfig.json         # TypeScript configuration
├── .mocharc.json         # Mocha test configuration
└── package.json          # Project dependencies
```

## 🔄 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run migrate:usage` | Run usage data migration script |

## 🚀 CI/CD Pipeline

The project uses GitHub Actions for automated deployment on every push to the `main` branch.

### Deployment Workflow

1. **Build**: Creates Docker image with multi-stage build
2. **Test**: Verifies Node.js and npm versions in the image
3. **Push**: Uploads image to Docker Hub
4. **Deploy**: SSH deployment to production server with environment variables

### 🔐 GitHub Secrets Setup

#### Where to Add Secrets

**Use Repository Secrets** (NOT Environment secrets)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Under **Repository secrets** tab, click **New repository secret**

> 💡 **Why Repository Secrets?** Your workflow doesn't define specific environments, so it uses repository-level secrets accessible to all workflows.

#### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `OPENAI_API_KEY` | OpenAI API key for AI expense parsing | Get from [OpenAI Platform](https://platform.openai.com/api-keys) |
| `MONGODB_URL` | MongoDB connection string | Copy from MongoDB Atlas or your `.env` file |
| `JWT_SECRET` | Secret key for JWT token signing | Generate using command below ⬇️ |
| `DOCKERHUB_USERNAME` | Docker Hub username | Your Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub access token | Generate from [Docker Hub Settings](https://hub.docker.com/settings/security) |
| `SSH_HOST` | Production server IP/domain | Your server's IP address or domain |
| `SSH_USER` | SSH username | Usually `root` or `ubuntu` |
| `SSH_KEY` | SSH private key | Your server's private SSH key (entire content) |
| `SSH_PORT` | SSH port | Usually `22` |

#### Generate JWT Secret

Run this command in your terminal to generate a secure random JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it to GitHub as `JWT_SECRET`.

#### How Secrets Are Used

The deployment workflow passes these secrets as environment variables to your Docker container:

```yaml
docker run -d --name spentiva-app-server \
  -p 8002:8002 \
  -e PORT=8002 \
  -e OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }} \
  -e MONGODB_URL=${{ secrets.MONGODB_URL }} \
  -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
  --restart=always \
  username/spentiva-app-server:latest
```

#### Quick Setup Checklist

- [ ] Add `OPENAI_API_KEY` to GitHub Repository Secrets
- [ ] Add `MONGODB_URL` to GitHub Repository Secrets
- [ ] Generate and add `JWT_SECRET` to GitHub Repository Secrets
- [ ] Add `DOCKERHUB_USERNAME` to GitHub Repository Secrets
- [ ] Add `DOCKERHUB_TOKEN` to GitHub Repository Secrets
- [ ] Add `SSH_HOST` to GitHub Repository Secrets
- [ ] Add `SSH_USER` to GitHub Repository Secrets
- [ ] Add `SSH_KEY` to GitHub Repository Secrets
- [ ] Add `SSH_PORT` to GitHub Repository Secrets
- [ ] Push to `main` branch to trigger deployment

## 🔒 Security Features

- JWT-based authentication with 30-day expiration
- OTP verification for phone and email
- File upload validation and size limits (5MB)
- CORS enabled for cross-origin requests
- Environment variable protection
- Password hashing with bcrypt
- Request authentication middleware

## 📊 Database Models

### User
- Phone number (unique)
- Name
- Email (optional, with verification)
- Profile photo
- Account type (personal/business)

### Expense
- Amount
- Category & Subcategory
- Payment method
- Description
- Timestamp
- Tracker reference
- User reference

### Tracker
- Name
- Icon
- Color
- Budget
- User reference

### OTP
- Identifier (phone/email)
- OTP code
- Type (phone/email)
- Expiration
- Verification status

### Usage & UsageLog
- Token tracking for AI usage
- Message history
- Tracker snapshots

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 8002 |
| `MONGODB_URL` | MongoDB connection string | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB connection string format
# Ensure IP whitelist includes your server IP
# Verify MongoDB Atlas cluster is running
```

### OpenAI API Errors
```bash
# Verify API key is valid
# Check rate limits and quotas
# Ensure sufficient credits
```

### Docker Issues
```bash
# Check if port 8002 is available
docker ps | grep 8002

# View container logs
docker logs spentiva-app-server

# Restart container
docker restart spentiva-app-server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software developed by Exyconn.

## 👥 Team

Developed by **Exyconn** - Building the future of expense tracking

## 📞 Support

For support and queries, please contact the development team.

---

**Made with ❤️ by Exyconn**
