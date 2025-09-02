# Prmtr Evaluation Agent

A sophisticated AI-powered evaluation system that combines Planner & Execution agents to assess business intelligence queries using Prmtr AI and Meama products context.

## 🏗️ Architecture

The system consists of two main agents:

- **Planner Agent**: Breaks down evaluation tasks into structured steps
- **Execution Agent**: Executes the plan by calling Prmtr API and evaluating responses

## 🚀 Features

- **REST API**: Express.js + TypeScript API with comprehensive endpoints
- **Agent System**: LangChain-powered planner and execution agents
- **Database Storage**: PostgreSQL with Prisma ORM for result persistence
- **Validation**: Zod-based request validation
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Helmet, CORS, and rate limiting
- **TypeScript**: Full TypeScript support with strict typing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prmtr-eval-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/prmtr_eval_db"
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Prmtr API Configuration
   PRMTR_API_URL="https://api.prmtr.ai"
   PRMTR_API_KEY="your_prmtr_api_key_here"
   
   # LangChain Configuration
   OPENAI_API_KEY="your_openai_api_key_here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Prmtr Evaluation Agent is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

#### 2. Evaluate Query
```http
POST /api/evaluation
```

**Request Body:**
```json
{
  "prompt": "What was average order value in online store for past 3 months?",
  "context": "Optional additional context"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "prompt": "What was average order value in online store for past 3 months?",
    "result": "Based on the analysis of your e-commerce data...",
    "assessment": "Quality Score: 8/10\nStrengths: Comprehensive analysis...",
    "metadata": {
      "planSteps": 3,
      "executionTimestamp": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. Get Evaluation History
```http
GET /api/evaluation/history?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "prompt": "What was average order value...",
      "result": "Based on the analysis...",
      "assessment": "Quality Score: 8/10...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 4. Get Evaluation by ID
```http
GET /api/evaluation/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "prompt": "What was average order value...",
    "result": "Based on the analysis...",
    "assessment": "Quality Score: 8/10...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Build
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
```

### Project Structure

```
src/
 ├── agents/
 │   ├── plannerAgent.ts      # LangChain planner agent
 │   └── executionAgent.ts    # LangChain execution agent
 ├── controllers/
 │   └── evaluationController.ts  # HTTP request handlers
 ├── middleware/
 │   ├── errorHandler.ts      # Error handling middleware
 │   └── validation.ts        # Request validation
 ├── routes/
 │   └── evaluation.ts        # API routes
 ├── services/
 │   └── evaluationService.ts # Business logic
 ├── types/
 │   └── evaluation.ts        # TypeScript interfaces
 └── index.ts                 # Application entry point

prisma/
 └── schema.prisma            # Database schema
```

## 🤖 Agent System

### Planner Agent
- Analyzes user queries and creates step-by-step evaluation plans
- Considers Meama and Prmtr context for relevant analysis
- Generates structured execution steps

### Execution Agent
- Calls Prmtr API with optimized queries
- Evaluates AI responses for quality and relevance
- Provides comprehensive assessments

## 🗄️ Database Schema

```sql
CREATE TABLE evaluation_results (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  result TEXT NOT NULL,
  assessment TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request rate limiting (100 requests per 15 minutes)
- **Input Validation**: Zod-based request validation
- **Error Handling**: Comprehensive error handling without exposing internals

## 🧪 Testing

### Example Usage

```bash
# Health check
curl http://localhost:3000/api/health

# Evaluate a query
curl -X POST http://localhost:3000/api/evaluation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What was average order value in online store for past 3 months?"
  }'

# Get evaluation history
curl http://localhost:3000/api/evaluation/history?limit=5
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL="postgresql://user:pass@host:5432/db"
   PRMTR_API_KEY="your_production_key"
   OPENAI_API_KEY="your_production_key"
   ```

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Database Migration**
   ```bash
   npm run db:push
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Express.js, TypeScript, LangChain, and Prisma**
