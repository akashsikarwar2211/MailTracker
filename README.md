# 📧 Email Analysis System

A full-stack email analysis system that receives emails via IMAP, parses headers to extract receiving chains and ESP types, and provides a responsive dashboard for analysis.

## 🏗️ Architecture Overview

```
InspMail/
├── frontend/          # Next.js frontend with TailwindCSS
├── backend/           # NestJS backend with MongoDB
├── shared/            # Shared types and utilities
└── docs/              # Documentation and deployment guides
```

## 🚀 Features

- **IMAP Email Reception**: Connect to IMAP servers and monitor incoming emails
- **Header Analysis**: Extract and parse email headers for receiving chain and ESP detection
- **Real-time Processing**: Process emails as they arrive
- **Responsive Dashboard**: Modern, mobile-friendly UI built with Next.js and TailwindCSS
- **RESTful API**: Clean NestJS backend with proper error handling
- **MongoDB Storage**: Persistent storage of email data and analysis results

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Node.js, NestJS, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Email Processing**: IMAP4, email-header-parser
- **Deployment**: Vercel (Frontend), Render/Heroku (Backend), MongoDB Atlas

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB instance (local or Atlas)
- IMAP server credentials
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd InspMail
npm run install:all
```

### 2. Environment Configuration

```bash
# Automatically create environment files
npm run setup:env

# Or manually copy example files
npm run setup:backend
npm run setup:frontend
```

### 3. Configure Environment Variables

Edit the created environment files with your actual configuration:

- **Backend**: `backend/.env` - Add your IMAP and MongoDB credentials
- **Frontend**: `frontend/.env.local` - Configure API URL if needed

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

### 5. Database Setup

- Create MongoDB database (local or Atlas)
- Update `MONGODB_URI` in `backend/.env`

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. Use the setup script to create the necessary files:

```bash
npm run setup:env
```

### Backend Environment Variables (`backend/.env`)

```env
# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/inspmail

# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# Optional: Advanced Configuration
# IMAP_FOLDER=INBOX
# IMAP_CHECK_INTERVAL=30000
# MAX_RECONNECT_ATTEMPTS=5
```

### Frontend Environment Variables (`frontend/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Additional Configuration
# NEXT_PUBLIC_APP_NAME=InspMail
# NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Environment File Setup

The project includes example environment files and a setup script:

- `backend/env.example` - Backend environment template
- `frontend/env.example` - Frontend environment template
- `setup-env.js` - Automated setup script

**Important**: Never commit `.env` files to version control. They are already included in `.gitignore`.

## 📡 API Endpoints

### Email Management

- `POST /emails/receive` - Process new incoming email
- `GET /emails/latest` - Get most recent processed email
- `GET /emails/history` - Get email processing history

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "email_id",
    "rawHeaders": "Received: from...",
    "receivingChain": ["server1.com", "server2.com"],
    "espType": "Gmail",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🏃‍♂️ Running the System

### Development Mode

```bash
# Backend
cd backend && npm run start:dev

# Frontend  
cd frontend && npm run dev
```

### Production Mode

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && npm start
```

## 📱 Frontend Features

- **Dashboard**: Real-time email analysis display
- **Receiving Chain**: Visual timeline of email routing
- **ESP Detection**: Clear identification of email service providers
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Real-time Updates**: Live data fetching and updates

## 🔒 Security Features

- Environment variable protection
- No IMAP credentials in frontend
- Input validation and sanitization
- Error handling without information leakage

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Backend (Render/Heroku)

1. Connect repository to deployment platform
2. Set environment variables
3. Configure build commands
4. Deploy

### Database (MongoDB Atlas)

1. Create cluster
2. Set up database user
3. Configure network access
4. Update connection string

## 🧪 Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests  
cd frontend && npm run test
```

## 📊 Monitoring

- Email processing logs
- API response times
- Error tracking
- Database performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review error logs

## 📈 Roadmap

- [ ] DKIM/SPF validation
- [ ] Email content analysis
- [ ] Advanced ESP detection
- [ ] Email threading
- [ ] Analytics dashboard
- [ ] Webhook notifications
