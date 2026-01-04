# ABSSD Website Project - Complete Documentation

## Project Overview

This is a professional, modern website for **अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट (Akhil Bhartiya Swachta Sewa Dal Trust)** - an NGO dedicated to cleanliness and social service since 2017.

**Status**: ✅ Complete and Ready for Development

## Goals

1. Create a professional, beautiful website matching or exceeding the quality of reference sites
2. Support bilingual content (Hindi/English)
3. Implement responsive design for all devices
4. Integrate backend API for dynamic content management
5. Provide contact form functionality
6. Display gallery and news/events dynamically

## Scope

### Frontend Features
- ✅ Hero section with call-to-action
- ✅ About Us section with organization details
- ✅ Services showcase
- ✅ Gallery with image modal
- ✅ News/Events section
- ✅ Contact form with backend integration
- ✅ Join Us section
- ✅ Responsive navigation header
- ✅ Footer with links and contact info

### Backend Features
- ✅ RESTful API with Express
- ✅ MongoDB database integration
- ✅ Contact form submission endpoint
- ✅ Gallery management endpoints
- ✅ Events/News management endpoints
- ✅ CORS configuration
- ✅ Error handling

## Technology Stack

### Frontend
- **React 19** - Latest React version
- **Vite 7** - Fast build tool
- **Tailwind CSS v4** - Latest Tailwind with new features
- **React Query** - Data fetching and caching
- **Modern ES6+** - Latest JavaScript features

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Project Structure

```
NGO/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── News.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Join.jsx
│   │   │   └── Footer.jsx
│   │   ├── api/
│   │   │   ├── config.js
│   │   │   └── client.js
│   │   ├── hooks/
│   │   │   ├── useGallery.js
│   │   │   └── useEvents.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── Backend/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── contactController.js
    │   ├── galleryController.js
    │   └── eventController.js
    ├── models/
    │   ├── Contact.js
    │   ├── Gallery.js
    │   └── Event.js
    ├── routes/
    │   ├── contactRoutes.js
    │   ├── galleryRoutes.js
    │   └── eventRoutes.js
    ├── server.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud)
- npm or yarn

### Frontend Setup
```bash
cd Frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

## API Endpoints

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)
- `GET /api/contact/:id` - Get single contact

### Gallery
- `GET /api/gallery` - Get all active gallery items
- `POST /api/gallery` - Create gallery item (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)

### Events
- `GET /api/events` - Get all active events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Health
- `GET /api/health` - Server health check

## Organization Information

### Basic Details
- **Name (Hindi)**: अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट
- **Name (English)**: Akhil Bhartiya Swachta Sewa Dal Trust
- **Abbreviation**: ABSSD
- **Founded**: 2017
- **Tagline**: सेवा, समर्पण और स्वच्छता का संकल्प

### Founder & Leadership
- **Founder & National President**: श्री जीतू माली (Shri Jeetu Mali)
- **Contact**: +91 8860442044

### Services Provided
1. **स्वच्छता अभियान** (Cleanliness Campaigns)
   - Regular cleanliness drives in Khatu Dham
   - Monthly Ekadashi service
   - 10-day special cleanliness drive during Falgun Fair

2. **जलसेवा** (Water Service)
   - Water coolers installed at key locations
   - Drinking water facilities for pilgrims

3. **शोचालय प्रबंधन** (Toilet Management)
   - Toilet cleaning and maintenance
   - Public facility management

4. **मेले सेवा** (Fair Service)
   - Special service during Falgun Fair

5. **एकादशी सेवा** (Ekadashi Service)
   - Monthly Ekadashi service programs

6. **पर्यावरण जागरूकता** (Environmental Awareness)
   - Environmental awareness programs

### Achievements
- **10+ Years** of service
- **500+ Volunteers** actively involved
- **1000+ Cleanliness Drives** conducted
- **24/7 Service** commitment

### Mission
"स्वच्छ भारत, सुंदर भारत, और संस्कारवान भारत"
(Clean India, Beautiful India, and Cultured India)

## Design Features

### Color Scheme
- **Primary**: Orange (#F97316) - Represents energy and service
- **Secondary**: White/Gray - Clean and professional
- **Accents**: Green (for environmental themes)

### Typography
- Hindi and English support
- Modern, readable fonts
- Proper font sizing for accessibility

### UI/UX Features
- Smooth scrolling navigation
- Hover effects and transitions
- Image modals for gallery
- Responsive mobile menu
- Loading states
- Error handling
- Form validation

## Next Steps / Future Enhancements

1. **Admin Panel**
   - Dashboard for managing content
   - Image upload functionality
   - User authentication

2. **Additional Features**
   - Volunteer registration form
   - Donation integration
   - Newsletter subscription
   - Social media integration
   - Blog section

3. **Performance**
   - Image optimization
   - Lazy loading
   - CDN integration
   - Caching strategies

4. **SEO**
   - Meta tags optimization
   - Sitemap generation
   - Schema markup
   - Open Graph tags

5. **Analytics**
   - Google Analytics integration
   - User behavior tracking
   - Form submission tracking

## Development Notes

### Frontend
- Uses React Query for efficient data fetching
- Fallback to placeholder data if API fails
- Fully responsive with Tailwind CSS
- Modern component architecture
- Clean, maintainable code structure

### Backend
- RESTful API design
- MongoDB for flexible data storage
- Error handling middleware
- CORS configured for frontend
- Environment-based configuration

### Database Models
- **Contact**: Stores contact form submissions
- **Gallery**: Stores gallery images and metadata
- **Event**: Stores news/events information

## Testing

### Manual Testing Checklist
- [ ] Frontend loads correctly
- [ ] Navigation works on all devices
- [ ] Contact form submits successfully
- [ ] Gallery displays images
- [ ] News section shows events
- [ ] Responsive design on mobile/tablet/desktop
- [ ] API endpoints respond correctly
- [ ] Database connections work

## Deployment Considerations

### Frontend
- Build command: `npm run build`
- Output directory: `dist/`
- Can be deployed to Vercel, Netlify, or any static hosting

### Backend
- Requires Node.js environment
- MongoDB connection (local or cloud like MongoDB Atlas)
- Environment variables must be set
- Can be deployed to Heroku, Railway, or any Node.js hosting

## Support & Contact

For technical support or questions:
- Check README.md for detailed setup instructions
- Review API documentation in this file
- Check component files for implementation details

---

**Last Updated**: 2024
**Project Status**: ✅ Complete - Ready for Development/Deployment

