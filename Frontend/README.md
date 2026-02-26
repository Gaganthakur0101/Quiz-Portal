# QuizPlatform - Interactive Learning Management System

A modern, responsive quiz platform built with React that provides an engaging learning experience with real-time progress tracking, achievements, and comprehensive analytics.

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Real-time statistics and progress tracking
- Interactive charts for performance visualization
- Achievement system with unlockable badges
- Learning streak tracking
- Personalized recommendations

### 📝 **Quiz Management**
- Multi-section quiz navigation
- Real-time answer tracking
- Question bookmarking and review system
- Timer functionality with auto-submit
- Multiple question types support

### 🎯 **Gamification**
- Achievement badges and progress tracking
- Points system and leaderboards
- Learning streaks and milestones
- Progress visualization

### 👤 **User Experience**
- Responsive design for all devices
- Dark/Light theme support
- Advanced search functionality
- Real-time notifications
- Accessibility-first design

### 🔐 **Security & Performance**
- JWT-based authentication
- Input validation and sanitization
- Error boundaries and graceful fallbacks
- Optimized bundle size and lazy loading
- Progressive Web App (PWA) support

## 🛠️ Technologies Used

### **Frontend**
- **React 18** - Component-based UI library
- **React Hooks** - Modern state management
- **Axios** - HTTP client for API calls
- **React Icons** - Comprehensive icon library
- **Tailwind CSS** - Utility-first CSS framework
- **PropTypes** - Runtime type checking

### **Backend Integration**
- RESTful API architecture
- MongoDB for data persistence
- JWT authentication
- Real-time notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── StatsCard.jsx         # Statistics display cards
│   │   └── AchievementGrid.jsx   # Achievement system UI
│   ├── Navigation/
│   │   └── Navbar.jsx            # Main navigation component
│   ├── Quiz/
│   │   └── QuizPage.jsx          # Quiz taking interface
│   └── UI/
│       ├── Button.jsx            # Reusable button component
│       ├── Card.jsx              # Container component
│       ├── ErrorBoundary.jsx     # Error handling
│       └── LoadingSkeleton.jsx   # Loading states
├── hooks/
│   └── useDashboardData.jsx      # Custom data fetching hooks
├── utils/
│   ├── api.js                    # API configuration
│   └── constants.js              # App constants
└── styles/
    └── globals.css               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **MongoDB** (for backend)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/quiz-platform.git
cd quiz-platform
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_APP_NAME=QuizPlatform
REACT_APP_VERSION=1.0.0
```

4. **Start the development server**
```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

## 📊 Database Schema

### **Collections Overview**

| Collection | Purpose | Documents |
|------------|---------|-----------|
| `users` | User accounts and profiles | User authentication, preferences |
| `quizzes` | Quiz definitions | Quiz metadata, settings |
| `questions` | Individual questions | Question content, options |
| `quiz_attempts` | User quiz sessions | Answers, scores, progress |
| `user_stats` | Performance analytics | Statistics, achievements |
| `achievements` | Achievement definitions | Badge types, requirements |
| `notifications` | User notifications | Messages, alerts |

### **Key Relationships**
- Users → Quiz Attempts (One to Many)
- Quizzes → Questions (One to Many)
- Users → Achievements (Many to Many)
- Users → Notifications (One to Many)

## 🔌 API Endpoints

### **Authentication**
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
GET  /api/auth/profile        # Get user profile
```

### **Quizzes**
```
GET    /api/quizzes           # List all quizzes
GET    /api/quizzes/:id       # Get specific quiz
POST   /api/quizzes           # Create new quiz
PUT    /api/quizzes/:id       # Update quiz
DELETE /api/quizzes/:id       # Delete quiz
```

### **Quiz Attempts**
```
POST /api/quiz-attempts       # Start new attempt
PUT  /api/quiz-attempts/:id   # Update attempt
GET  /api/quiz-attempts/:id   # Get attempt details
POST /api/quiz-attempts/:id/submit # Submit quiz
```

### **User Data**
```
GET /api/users/stats          # User statistics
GET /api/users/achievements   # User achievements
GET /api/users/notifications  # User notifications
```

## 🎨 Component Usage

### **Basic Quiz Implementation**
```jsx
import QuizPage from './components/Quiz/QuizPage';

function App() {
  const user = { user_Id: "123", name: "John Doe" };
  const quiz = { Id: "quiz_1", title: "React Basics" };

  return (
    <QuizPage 
      user={user} 
      quiz={quiz} 
    />
  );
}
```

### **Dashboard Integration**
```jsx
import Dashboard from './components/Dashboard/Dashboard';

function DashboardPage() {
  return <Dashboard />;
}
```

### **Custom UI Components**
```jsx
import { Button, Card, StatsCard } from './components/UI';

function MyComponent() {
  return (
    <Card>
      <StatsCard 
        title="Total Score" 
        value="1,250" 
        icon={<TrophyIcon />}
      />
      <Button 
        variant="primary" 
        onClick={handleClick}
      >
        Start Quiz
      </Button>
    </Card>
  );
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Build & Deployment

### **Production Build**
```bash
npm run build
```

### **Docker Deployment**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables**
```env
# Production Environment
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

## 🔧 Configuration

### **Tailwind CSS Setup**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    }
  },
  plugins: []
}
```

### **API Configuration**
```javascript
// src/utils/api.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

## 📱 Features in Detail

### **Quiz Taking Experience**
- **Section Navigation**: Organize questions by topics
- **Progress Tracking**: Real-time completion indicators
- **Review System**: Mark questions for later review
- **Auto-save**: Automatic answer persistence
- **Time Management**: Per-question and overall timers

### **Dashboard Analytics**
- **Performance Metrics**: Score trends and averages
- **Learning Insights**: Strengths and improvement areas
- **Goal Tracking**: Set and monitor learning objectives
- **Social Features**: Compare with peers (optional)

### **Achievement System**
- **Badge Categories**: Completion, performance, streak-based
- **Progress Visualization**: Clear progress indicators
- **Unlock Conditions**: Transparent requirements
- **Sharing Features**: Social media integration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Code Standards**
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 🐛 Known Issues & Roadmap

### **Current Limitations**
- [ ] Offline mode support
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Mobile app versions

### **Upcoming Features**
- [ ] Video question support
- [ ] Advanced quiz builder
- [ ] Bulk import/export
- [ ] White-label solutions
- [ ] Advanced reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **React Icons** - For comprehensive icon library
- **MongoDB Team** - For the flexible database solution

## 📞 Support

- **Documentation**: [docs.yourapp.com](https://docs.yourapp.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/quiz-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/quiz-platform/discussions)
- **Email**: support@yourapp.com

***

**Made with ❤️ by Vector**

*Happy Learning! 🎓*
