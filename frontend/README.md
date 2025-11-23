# Frontend - Inventory Stock Management System

## Overview

React 19.2.0 frontend application built with Vite for the Inventory Stock Management System. Provides a modern, responsive interface for inventory operations, analytics, and AI-powered insights.

## Tech Stack

- **React** 19.2.0 - Modern UI framework
- **Vite** 7.2.5 (rolldown) - Ultra-fast build tool
- **React Router DOM** 7.9.6 - Client-side routing
- **CSS Modules** - Scoped component styling
- **ESLint** - Code quality and linting

## Features

### Core Pages
- **Landing Page** - Welcome and navigation
- **Login/Signup** - User authentication
- **Dashboard** - Real-time inventory KPIs and analytics
- **Stock Management** - Inventory operations and stock tracking
- **Product Management** - Product catalog and categories
- **Warehouse Management** - Multi-location inventory
- **Reports** - Analytics and movement history

### Components
- **Chatbot** - AI-powered inventory queries
- **KanbanView** - Visual inventory organization
- **StockEditModal** - Inline stock level editing
- **ContactDetail** - Contact management
- **Footer** - Application footer

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Auto-fix lint issues
npm run lint -- --fix
```

## Environment Configuration

The frontend connects to:
- **Backend API**: http://localhost:5001
- **AI Service**: http://localhost:8000

Update API endpoints in source files if backend services run on different ports.

## File Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Chatbot.jsx     # AI chat interface
│   ├── KanbanView.jsx  # Kanban-style layouts  
│   └── StockEditModal.jsx # Stock editing modal
├── pages/              # Main application pages
│   ├── Dashboard.jsx   # Main dashboard
│   ├── Stock.jsx       # Inventory management
│   ├── Landing.jsx     # Landing page
│   ├── DeliveryList.jsx # Delivery management
│   ├── ReceiptList.jsx # Receipt management
│   └── MoveHistory.jsx # Movement history
├── styles/             # Component-specific CSS
│   ├── Dashboard.css   # Dashboard styling
│   ├── Stock.css       # Inventory styling
│   ├── Chatbot.css     # Chat interface styling
│   └── [component].css # Individual component styles
├── App.jsx             # Main application component
├── App.css             # Global application styles
├── main.jsx           # React entry point
└── index.css          # Global base styles
```

## Development

### Hot Module Replacement (HMR)

Vite provides instant HMR during development. Changes to React components are reflected immediately without losing state.

### Code Quality

- **ESLint Configuration**: Extends recommended React rules
- **React Hooks**: Proper hooks usage enforced
- **React Refresh**: Fast refresh enabled for development

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all files
- `npm run lint -- --fix` - Auto-fix linting issues

## Deployment

### Production Build

```bash
npm run build
```

Optimized files will be generated in the `dist/` directory.

### Deployment Options

- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop `dist/` folder or connect repo
- **Static Hosting**: Serve `dist/` directory with any web server
- **Reverse Proxy**: Use nginx/Apache to serve alongside backend

### Environment Variables

For production deployments, configure:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_AI_SERVICE_URL=https://ai.yourdomain.com
```

## Integration

### Backend API

The frontend communicates with the Node.js/Express backend API for:
- User authentication (JWT tokens)
- CRUD operations on inventory data
- Real-time inventory updates
- Analytics and reporting data

### AI Service

Integrated chatbot component connects to the FastAPI AI service for:
- Natural language inventory queries
- Intelligent product search
- Automated insights and recommendations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern ES6+ features are used, requiring recent browser versions.

## Contributing

1. Follow the ESLint configuration for code style
2. Use functional components with hooks
3. Implement responsive design principles
4. Test across different screen sizes
5. Ensure accessibility standards (ARIA labels, keyboard navigation)

## Troubleshooting

### Common Issues

**Dev server won't start**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend connection issues**
- Verify backend is running on port 5001
- Check CORS configuration allows localhost:5173
- Ensure API endpoints are correct

**Build failures**
```bash
# Check for TypeScript/JavaScript errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

For additional help, refer to the main project README or create an issue on GitHub.
