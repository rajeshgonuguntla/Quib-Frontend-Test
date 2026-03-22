# Quib Design System

A complete, production-ready ed-tech web application for turning YouTube videos into verified credentials.

## 🎨 Design System

### Brand Colors
- **Primary Red**: `#E10600` - Used for CTAs, primary actions, and brand emphasis
- **Red Variants**: `#C00500` (hover), `#A00400` (active)
- **Neutrals**: Gray scale from `#FAFAFA` to `#1F1F1F`

### Typography
- **Font Family**: System sans-serif (Inter-like)
- **Scale**: 
  - H1: 3.75rem (60px)
  - H2: 2.25rem (36px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)

### Spacing System
8pt grid system used throughout:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius
- Cards: 24px (`rounded-3xl`)
- Buttons: 16px (`rounded-2xl`)
- Small elements: 12px (`rounded-xl`)

## 📦 Core Components

### Button
```tsx
<Button variant="primary|secondary|ghost|destructive" size="sm|md|lg">
  Click Me
</Button>
```

### Input
```tsx
<Input 
  label="Email"
  placeholder="you@example.com"
  icon={<Mail />}
  error="Error message"
/>
```

### Card
```tsx
<Card variant="standard|outlined|elevated" hover>
  Content
</Card>
```

### StatusPill
```tsx
<StatusPill variant="success|warning|error|info|neutral">
  Status
</StatusPill>
```

### ProgressBar
```tsx
<ProgressBar progress={75} showLabel />
```

## 🏗️ Application Structure

### Pages
1. **LandingPage** (`/`) - Marketing homepage with hero, features, pricing
2. **SignIn** (`/signin`) - Authentication with Google OAuth
3. **Dashboard** (`/dashboard`) - Main user interface with quiz generation
4. **QuizSetup** (`/quiz-setup/:id`) - Quiz generation progress
5. **QuizTaking** (`/quiz/:id`) - Interactive quiz interface
6. **Results** (`/results/:id`) - Score breakdown with review
7. **Certificate** (`/certificate/:id`) - Certificate preview and download
8. **Verification** (`/verify/:certId`) - Public certificate verification
9. **Pricing** (`/pricing`) - Detailed pricing page
10. **Settings** (`/settings`) - User settings and preferences

## 🎯 Key Features

### Quiz Generation
- Paste YouTube video/playlist URL
- AI analyzes transcript and generates questions
- Customizable difficulty, question count, types
- Optional timed exams

### Quiz Taking
- Multiple choice, True/False, Short answer
- Progress tracking
- Question flagging
- Navigation panel
- Timer with warnings

### Results & Certificates
- Detailed score breakdown
- Topic-wise performance
- Answer review with explanations
- Professional certificates with verification IDs
- QR codes for verification
- LinkedIn sharing

## 🔐 Authentication
- Email/Password
- Google OAuth

## 📱 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Optimized for desktop, tablet, and mobile

## 🎨 UI Patterns

### Consistent Visual Language
- Elevated cards with subtle shadows
- Generous whitespace
- Clear visual hierarchy
- Accessible color contrast (WCAG compliant)

### Interactive States
- Hover effects with smooth transitions
- Active/pressed states
- Focus indicators for keyboard navigation
- Loading states with skeletons

### Icons
Uses lucide-react for consistent iconography

## 🚀 Getting Started

All pages are fully functional with mock data. The application is ready for:
- Backend integration
- Real API connections
- User authentication
- Database persistence

## 📄 Certificate Design
Professional certificates include:
- Recipient name
- Course title
- Score and date
- Unique certificate ID
- Verification URL and QR code
- Quib branding seal
- Premium border design

## 🎓 User Flows

### Learner Flow
1. Land on homepage
2. Sign in/Sign up
3. Generate quiz from YouTube URL
4. Configure quiz settings
5. Take quiz
6. View results
7. Download certificate
8. Share on LinkedIn