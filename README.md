# अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट (ABSSD) Website

A professional, modern website for Akhil Bhartiya Swachta Sewa Dal Trust, built with React, Node.js, Express, and MongoDB.

## Project Structure

```
NGO/
├── Frontend/          # React + Vite + Tailwind CSS v4
└── Backend/           # Node.js + Express + MongoDB
```

## Features

- 🎨 Modern, responsive design with Tailwind CSS v4
- 🌐 Bilingual support (Hindi/English)
- 📱 Fully responsive for all devices
- 🖼️ Gallery with image modal
- 📧 Contact form with backend integration
- 📰 News/Events section
- ⚡ Fast performance with React Query
- 🎯 SEO optimized

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **React Query** - Data fetching and caching
- **Heroicons** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Quick Start (Recommended)

Use the provided bash scripts to start/stop both servers:

```bash
# Start both Frontend and Backend
./start.sh

# Stop both servers
./stop.sh
```

The scripts will:
- Check and install dependencies if needed
- Start both servers in the background
- Save process IDs for easy stopping
- Display server URLs and logs location

**Note**: Make sure MongoDB is running before starting the backend.

### Manual Setup

#### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abssd
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:5000`

## API Endpoints

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)
- `GET /api/contact/:id` - Get single contact

### Gallery
- `GET /api/gallery` - Get all gallery items
- `POST /api/gallery` - Create gallery item (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Health Check
- `GET /api/health` - Server health check

## Development

### Using Scripts (Recommended)
- `./start.sh` - Start both Frontend and Backend servers
- `./stop.sh` - Stop both servers

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Logs
When using `./start.sh`, logs are saved to:
- `backend.log` - Backend server logs
- `frontend.log` - Frontend server logs

## Project Information

### Organization Details
- **Name**: अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट (Akhil Bhartiya Swachta Sewa Dal Trust)
- **Founded**: 2017
- **Founder & National President**: श्री जीतू माली (Shri Jeetu Mali)
- **Contact**: +91 8860442044

### Services
- स्वच्छता अभियान (Cleanliness Campaigns)
- जलसेवा (Water Service)
- शोचालय प्रबंधन (Toilet Management)
- मेले सेवा (Fair Service)
- एकादशी सेवा (Ekadashi Service)
- पर्यावरण जागरूकता (Environmental Awareness)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For support, contact:
- Phone: +91 8860442044
- Email: info@abssd.org

