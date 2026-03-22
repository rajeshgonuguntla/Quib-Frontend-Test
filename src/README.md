# Quib - YouTube to Verified Credentials

A complete, production-ready ed-tech web application for turning YouTube videos into verified credentials with AI-generated quizzes and professional certificates.

## 🌟 Overview

**Quib** allows learners to:
- Paste any YouTube video or playlist URL
- Generate AI-powered quizzes from video transcripts
- Take interactive assessments with multiple question types
- Earn verified certificates with unique IDs
- Share credentials on LinkedIn

## ✨ Features

### Core Functionality
- 🎥 **YouTube Integration** - Generate quizzes from any video or playlist
- 🤖 **AI-Powered Quizzes** - Custom questions based on video transcripts
- ⚙️ **Customizable Settings** - Difficulty levels, question types, time limits
- 📊 **Detailed Results** - Score breakdowns with topic analysis
- 🎓 **Professional Certificates** - Verified credentials with QR codes
- 🔗 **LinkedIn Integration** - Share achievements instantly
- ✅ **Public Verification** - Anyone can verify certificate authenticity

### Authentication
- Email/password authentication
- Google OAuth sign-in
- Clean, modern sign-in experience

### User Experience
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, minimal design with Quib Red (#E10600) branding
- ♿ **Accessible** - WCAG-compliant design
- ⚡ **Fast & Smooth** - Optimized performance with smooth transitions

## 🏗️ Project Structure

```
/
├── components/
│   ├── LandingPage.tsx               # Marketing homepage
│   ├── SignIn.tsx                    # Authentication
│   ├── Dashboard.tsx                 # Main user dashboard
│   ├── QuizSetup.tsx                 # Quiz generation flow
│   ├── QuizTaking.tsx                # Interactive quiz interface
│   ├── Results.tsx                   # Score results and review
│   ├── Certificate.tsx               # Certificate preview and download
│   ├── Verification.tsx              # Public certificate verification
│   ├── Pricing.tsx                   # Pricing page
│   ├── Settings.tsx                  # User settings
│   ├── Button.tsx                    # Reusable button component
│   ├── Input.tsx                     # Reusable input component
│   ├── Card.tsx                      # Reusable card component
│   ├── StatusPill.tsx                # Status indicator component
│   ├── ProgressBar.tsx               # Progress indicator
│   └── ui/                           # shadcn/ui components
└── styles/
    └── globals.css                   # Global styles and design tokens
```

## 🎨 Design System

### Brand Colors
- **Primary Red**: `#E10600` - Used for CTAs and brand emphasis
- **Hover**: `#C00500`
- **Active**: `#A00400`
- **Neutrals**: Gray scale from `#FAFAFA` to `#1F1F1F`

### Typography
- Modern sans-serif font stack (Inter-like)
- Strong hierarchy with 8pt spacing system
- Responsive font sizing

### Components
- **Button**: 4 variants (primary, secondary, ghost, destructive), 3 sizes
- **Input**: With icons, labels, error states, and focus indicators
- **Card**: 3 variants (standard, outlined, elevated) with hover effects
- **StatusPill**: 5 color variants for different statuses
- **ProgressBar**: With optional labels

## 📱 Pages

1. **Landing Page** (`/`)
   - Hero section with YouTube URL input
   - How it works (3 steps)
   - Features grid
   - Pricing preview
   - Testimonials
   - Footer

2. **Sign In** (`/signin`)
   - Split-screen design
   - Google OAuth
   - Email/password
   - Sign up flow

3. **Dashboard** (`/dashboard`)
   - Stats cards (quizzes, score, certificates, streak)
   - Quiz generation form
   - Recent quizzes list
   - Sidebar navigation

4. **Quiz Setup** (`/quiz-setup/:id`)
   - Video preview
   - Quiz details
   - Generation progress animation
   - Start quiz button

5. **Quiz Taking** (`/quiz/:id`)
   - Timer (optional)
   - Progress bar
   - Multiple choice questions
   - True/False questions
   - Question navigator
   - Flag questions
   - Submit confirmation

6. **Results** (`/results/:id`)
   - Score hero with circular progress
   - Pass/fail indicator
   - Topic breakdown with smiley faces
   - Question review with explanations
   - Certificate generation CTA

7. **Certificate** (`/certificate/:id`)
   - Professional certificate design
   - Download PDF option
   - Share to LinkedIn
   - Verification QR code
   - Certificate details

8. **Verification** (`/verify/:certId`)
   - Public certificate search
   - Verification status
   - Certificate details display

9. **Pricing** (`/pricing`)
   - Free and Pro plans
   - Feature comparison
   - FAQ section

10. **Settings** (`/settings`)
    - Profile management
    - Billing information
    - Notifications
    - Connected accounts
    - Privacy & security

## 🚀 Getting Started

The application is ready to use with mock data. All pages and flows are fully functional for demonstration purposes.

### User Flow

1. **Land on homepage** → Enter YouTube URL
2. **Sign in** → Choose authentication method
3. **Configure quiz** → Set difficulty, question count, types
4. **Take quiz** → Answer questions with timer (optional)
5. **View results** → See score breakdown and review answers
6. **Get certificate** → Download and share verified credential

## 🎯 Tech Stack

- **React** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4.0** for styling
- **Lucide React** for icons
- **shadcn/ui** component library

## 📦 Key Dependencies

- `react-router-dom` - Client-side routing
- `lucide-react` - Icon library
- `motion/react` - Smooth animations
- `sonner` - Toast notifications
- shadcn/ui components

## 💡 Key Features

### Quiz Generation
- Paste any YouTube video or playlist URL
- AI analyzes transcript to generate relevant questions
- Customize difficulty: Easy, Medium, Hard
- Choose question count: 5-25 questions
- Select question types: MCQ, True/False, Short Answer
- Optional time limits for exam-like conditions

### Quiz Taking Experience
- Clean, distraction-free interface
- Progress tracking
- Question navigation panel
- Flag questions for review
- Auto-save progress
- Time warnings

### Results & Analytics
- Detailed score breakdown by topic
- Question-by-question review
- AI-generated explanations
- Performance metrics
- Visual feedback with progress indicators

### Certificates
- Professional A4-sized design
- Unique verification ID
- QR code for instant verification
- Downloadable as PDF
- Shareable on LinkedIn
- Public verification page

## 🎓 Pricing Plans

### Free Plan
- Take unlimited quizzes
- View scores
- Basic analytics

### Pro Plan ($9/month)
- Everything in Free
- Downloadable certificates
- LinkedIn badge sharing
- Certificate verification
- Priority support

## 🎨 Design Philosophy

- **Clean & Minimal** - White backgrounds, generous whitespace
- **Professional** - Like Coursera, Udemy, Google certificates
- **Consistent** - Design system with reusable components
- **Accessible** - WCAG-compliant contrast and keyboard navigation
- **Modern** - Soft shadows, 16px+ border radius, smooth transitions

## 📄 Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design system documentation

## 🔒 Privacy & Security

- User data handled securely
- Certificate verification without exposing personal data
- Unique verification IDs for each certificate
- Public verification system

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

All rights reserved.
