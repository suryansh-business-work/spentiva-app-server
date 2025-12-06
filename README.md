# Spentiva - Expense Tracker Backend Server

> A powerful AI-powered expense tracking backend built with Node.js, Express, TypeScript, and MongoDB

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Installation](#-installation)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)

## 🚀 Overview

Spentiva is a modern expense tracking server that leverages OpenAI's GPT models to intelligently parse natural language expense entries. The backend provides a comprehensive API for managing expenses, user authentication, analytics, and real-time usage tracking.

## ✨ Features

- **🤖 AI-Powered Expense Parsing** - Natural language processing using OpenAI GPT-4
- **🔐 Authentication System** - Phone-based OTP authentication with JWT tokens
- **📊 Advanced Analytics** - Comprehensive expense analysis by category, month, and date ranges
- **👤 User Management** - Profile management with email verification and photo uploads
- **📈 Usage Tracking** - Token-based usage monitoring for AI interactions
- **📄 Report Generation** - Detailed expense reports with filtering capabilities
- **🎯 Tracker System** - Organize expenses with multiple trackers
- **💬 AI Chat Assistant** - Interactive chat for expense-related queries

## 🛠️ Tech Stack

- **Runtime**: Node.js 20 | **Framework**: Express.js | **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM) | **AI**: OpenAI GPT-4
- **Authentication**: JWT + OTP | **File Uploads**: Multer
- **Email**: Nodemailer + MJML | **Testing**: Mocha, Chai, Supertest
- **DevOps**: Docker, GitHub Actions

## 🔧 Installation

### Prerequisites

- Node.js 20.x or higher
- MongoDB 8.x or higher
- OpenAI API Key
- npm or yarn

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd spentiva-app-server

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=8002
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/expenses?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
EOF

# 4. Run development server
npm run dev
```

Server starts at `http://localhost:8002`

## 🐳 Docker Deployment

### Local Build & Run

```bash
# Build image
docker build -t spentiva-app-server .

# Run container
docker run -d \
  --name spentiva-app-server \
  -p 8002:8002 \
  -e PORT=8002 \
  -e OPENAI_API_KEY=your_key \
  -e MONGODB_URL=your_mongodb_url \
  -e JWT_SECRET=your_secret \
  --restart=always \
  spentiva-app-server:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  spentiva-backend:
    build: .
    ports:
      - '8002:8002'
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

### Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint                 | Description                 | Auth |
| ------ | ------------------------ | --------------------------- | ---- |
| POST   | `/auth/send-otp`         | Send OTP to phone number    | ❌   |
| POST   | `/auth/verify-otp`       | Verify OTP and login/signup | ❌   |
| GET    | `/auth/me`               | Get current user profile    | ✅   |
| PUT    | `/auth/profile`          | Update user profile         | ✅   |
| POST   | `/auth/profile-photo`    | Upload profile photo        | ✅   |
| POST   | `/auth/send-email-otp`   | Send email verification OTP | ✅   |
| POST   | `/auth/verify-email-otp` | Verify email OTP            | ✅   |

</details>

<details>
<summary><b>💰 Expenses</b></summary>

| Method | Endpoint         | Description                    | Auth     |
| ------ | ---------------- | ------------------------------ | -------- |
| POST   | `/expenses`      | Create new expense             | Optional |
| GET    | `/expenses`      | Get all expenses               | ❌       |
| PUT    | `/expenses/:id`  | Update expense                 | ❌       |
| DELETE | `/expenses/:id`  | Delete expense                 | ❌       |
| POST   | `/parse-expense` | Parse natural language expense | ✅       |

</details>

<details>
<summary><b>📊 Analytics</b></summary>

| Method | Endpoint                 | Description                | Auth |
| ------ | ------------------------ | -------------------------- | ---- |
| GET    | `/analytics/summary`     | Get summary statistics     | ❌   |
| GET    | `/analytics/by-category` | Get expenses by category   | ❌   |
| GET    | `/analytics/by-month`    | Get monthly expense trends | ❌   |
| GET    | `/analytics/total`       | Get total expenses         | ❌   |

</details>

<details>
<summary><b>📈 Trackers & 💬 Chat</b></summary>

**Trackers**

| Method | Endpoint        | Description           | Auth |
| ------ | --------------- | --------------------- | ---- |
| POST   | `/trackers`     | Create new tracker    | ✅   |
| GET    | `/trackers`     | Get all user trackers | ✅   |
| PUT    | `/trackers/:id` | Update tracker        | ✅   |
| DELETE | `/trackers/:id` | Delete tracker        | ✅   |

**Chat & AI**

| Method | Endpoint            | Description            | Auth |
| ------ | ------------------- | ---------------------- | ---- |
| POST   | `/chat`             | Chat with AI assistant | ✅   |
| GET    | `/reports/email`    | Generate email report  | ✅   |
| GET    | `/usage/statistics` | Get usage statistics   | ✅   |
| GET    | `/health`           | Server health status   | ❌   |

</details>

### Example Requests

```bash
# Send OTP
curl -X POST http://localhost:8002/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# Parse Expense (AI)
curl -X POST http://localhost:8002/api/parse-expense \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message": "Spent 500 rupees on groceries via UPI", "trackerId": "tracker_id"}'

# Create Expense
curl -X POST http://localhost:8002/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "category": "Food & Dining",
    "subcategory": "Groceries",
    "categoryId": "food",
    "paymentMethod": "UPI",
    "trackerId": "tracker_id"
  }'
```

## 🧪 Testing

```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
```

## 📁 Project Structure

```
spentiva-app-server/
├── src/
│   ├── config/           # DB, environment, categories config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models (User, Expense, Tracker, OTP, etc.)
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic (AI parsing, analytics)
│   ├── templates/        # Email templates (MJML)
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions
│   └── index.ts          # Entry point
├── test/                 # Test suite
├── .github/workflows/    # CI/CD pipeline
├── Dockerfile            # Docker config
└── package.json          # Dependencies
```

## 🔄 Available Scripts

### Enhanced Scripts (Recommended)

These scripts provide beautiful, colorful console output with progress indicators, timing information, and proper error handling:

| Script           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | 🚀 Start development server with enhanced console output |
| `npm run build`  | 🔨 Build project with step-by-step progress and timing   |
| `npm start`      | ▶️ Start production server with build verification       |
| `npm run lint`   | 🔍 Check code for linting errors                         |
| `npm run format` | ✨ Format code using Prettier                            |

### Simple Scripts (Legacy)

These scripts run without the enhanced console output:

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev:simple`   | Development server (basic nodemon)  |
| `npm run build:simple` | Build TypeScript (basic output)     |
| `npm run start:simple` | Start production server (no checks) |

### Build Process Details

The **`npm run build`** script performs the following steps:

1. **🧹 Clean** - Removes old `dist/` folder
2. **🔨 Compile** - Compiles TypeScript using `tsc`
3. **📋 Copy** - Copies email templates to `dist/templates/`

Each step shows:

- ✓ Success/✗ Failure indicators
- ⏱️ Execution time
- 📊 Overall build summary

**Example Output:**

```
════════════════════════════════════════════════════════════
  🚀 Building Expense Tracker Server 🚀
════════════════════════════════════════════════════════════

Build started at: 4:44:15 pm

[1/3] 🧹 Cleaning output directory...
✓ Removed old dist folder

[2/3] 🔨 Compiling TypeScript...
[TypeScript Compilation] Starting...
✓ TypeScript Compilation completed (5.23s)

[3/3] 📋 Copying template files...
[Template Copy] Starting...
✓ Template Copy completed (0.45s)

════════════════════════════════════════════════════════════
  ✓ Build Completed Successfully! ✓
════════════════════════════════════════════════════════════

  All steps completed successfully!

  Total build time: 6.82s
  Output directory: ./dist
  Completed at: 4:44:22 pm

  🚀 Ready to start the server with: npm start
```

## 🚀 CI/CD Pipeline

The project uses **GitHub Actions** for automated deployment on every push to the `main` branch.

### Deployment Workflow

1. **Build** - Creates Docker image with multi-stage build
2. **Test** - Verifies Node.js and npm versions in the image
3. **Push** - Uploads image to Docker Hub
4. **Deploy** - SSH deployment to production server with environment variables

### 🔐 GitHub Secrets Setup

#### Where to Add Secrets

**Use Repository Secrets** (NOT Environment secrets)

```
GitHub Repository → Settings → Secrets and variables → Actions → Repository secrets
```

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Under **Repository secrets** tab, click **New repository secret**

> 💡 **Why Repository Secrets?** Your workflow doesn't define specific environments, so it uses repository-level secrets accessible to all workflows.

#### Required Secrets

| Secret Name          | Description                           | How to Get                                                      |
| -------------------- | ------------------------------------- | --------------------------------------------------------------- |
| `OPENAI_API_KEY`     | OpenAI API key for AI expense parsing | [OpenAI Platform](https://platform.openai.com/api-keys)         |
| `MONGODB_URL`        | MongoDB connection string             | Copy from MongoDB Atlas or `.env` file                          |
| `JWT_SECRET`         | Secret key for JWT token signing      | Generate using command below ⬇️                                 |
| `DOCKERHUB_USERNAME` | Docker Hub username                   | Your Docker Hub account                                         |
| `DOCKERHUB_TOKEN`    | Docker Hub access token               | [Docker Hub Settings](https://hub.docker.com/settings/security) |
| `SSH_HOST`           | Production server IP/domain           | Your server's IP address                                        |
| `SSH_USER`           | SSH username                          | Usually `root` or `ubuntu`                                      |
| `SSH_KEY`            | SSH private key                       | Entire private key content                                      |
| `SSH_PORT`           | SSH port                              | Usually `22`                                                    |

#### Generate JWT Secret

Run this command to generate a secure random JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and add it to GitHub as `JWT_SECRET`.

#### How Secrets Are Used

The deployment workflow passes secrets as environment variables to your Docker container:

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

## 🌍 Environment Variables

| Variable         | Description               | Required | Default |
| ---------------- | ------------------------- | -------- | ------- |
| `PORT`           | Server port               | No       | 8002    |
| `MONGODB_URL`    | MongoDB connection string | Yes      | -       |
| `OPENAI_API_KEY` | OpenAI API key            | Yes      | -       |
| `JWT_SECRET`     | JWT signing secret        | Yes      | -       |

## 🔒 Security Features

- ✅ JWT-based authentication with 30-day expiration
- ✅ OTP verification for phone and email
- ✅ File upload validation and size limits (5MB)
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variable protection
- ✅ Password hashing with bcrypt
- ✅ Request authentication middleware

## 📊 Database Models

**User** - Phone, Name, Email, Profile Photo, Account Type  
**Expense** - Amount, Category, Payment Method, Description, Timestamp  
**Tracker** - Name, Icon, Color, Budget  
**OTP** - Identifier, Code, Type, Expiration  
**Usage & UsageLog** - Token tracking, Message history

## 🐛 Troubleshooting

<details>
<summary><b>MongoDB Connection Issues</b></summary>

- Check MongoDB connection string format
- Ensure IP whitelist includes your server IP or `0.0.0.0/0`
- Verify MongoDB Atlas cluster is running
- Test connection: `mongosh <your_connection_string>`

</details>

<details>
<summary><b>OpenAI API Errors</b></summary>

- Verify API key is valid and starts with `sk-`
- Check rate limits and quotas in OpenAI dashboard
- Ensure sufficient credits in your account
- Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer <key>"`

</details>

<details>
<summary><b>Docker Issues</b></summary>

```bash
# Check if port 8002 is available
docker ps | grep 8002

# View container logs
docker logs spentiva-app-server

# Restart container
docker restart spentiva-app-server

# Check running containers
docker ps -a
```

</details>

<details>
<summary><b>GitHub Actions Deployment Fails</b></summary>

- Verify all 9 secrets are added to Repository Secrets
- Check secret names match exactly (case-sensitive)
- View workflow logs in Actions tab
- Test SSH connection manually: `ssh -i key user@host -p port`

</details>

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
