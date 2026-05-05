# 🏠 Revo-Home - Complete User Manual

**Version**: 2.0  
**Last Updated**: May 2026  
**Platform**: Modern Real Estate Portal  
**Tech Stack**: React 19 + Vite + Tailwind CSS 4

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [User Roles & Access Control](#3-user-roles--access-control)
4. [Authentication System](#4-authentication-system)
5. [Public Portal Features](#5-public-portal-features)
6. [User Dashboard](#6-user-dashboard)
7. [Property Management](#7-property-management)
8. [Lead Generation System](#8-lead-generation-system)
9. [Financial Tools & Calculators](#9-financial-tools--calculators)
10. [Payment & Subscription System](#10-payment--subscription-system)
11. [Admin Panel](#11-admin-panel)
12. [Support Services](#12-support-services)
13. [API Reference](#13-api-reference)
14. [Technical Specifications](#14-technical-specifications)
15. [Troubleshooting](#15-troubleshooting)
16. [Support & Contact](#16-support--contact)

---

## 1. System Overview

### What is Revo-Home?

Revo-Home is a **comprehensive real estate platform** designed for buying, selling, and renting properties. It connects property seekers with owners, agents, and developers through a modern, feature-rich web application.

### Key Features

| Feature | Description |
|---------|-------------|
| **Property Search** | Advanced search with filters, maps, and sorting |
| **Lead Generation** | Automatic lead capture when users interact with properties |
| **Financial Tools** | EMI calculator, loan assistance, rental yield analysis |
| **User Dashboard** | Complete property management for owners and agents |
| **Admin Panel** | Platform management with analytics and approvals |
| **Payment Integration** | PayU gateway with multiple payment options |
| **Geolocation** | Location-based search and nearby properties |
| **Responsive Design** | Mobile-first approach with touch optimization |

---

## 2. Architecture & Tech Stack

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Revo-Home Frontend                     │
├─────────────────────────────────────────────────────────┤
│  React 19 + Vite  │  React Router v6  │  Tailwind CSS 4  │
├────────────────────┼───────────────────┼─────────────────┤
│  Context API       │  Custom Hooks     │  Service Layer  │
│  - AuthContext     │  - useProperty    │  - API Client   │
│  - PropertyContext │  - useLocation    │  - Billing API  │
│  - LocationContext │  - useDashboard   │  - Lead Service │
└─────────────────────────────────────────────────────────┘
```

### Brand Identity

| Element | Value | Usage |
|---------|-------|-------|
| **Primary Color** | `#B91C1C` (Contrast Red) | Headers, buttons, CTAs |
| **CTA Color** | `#FF6B35` (Orange) | Call-to-action buttons |
| **Accent Color** | `#F3F4F6` (Light Gray) | Backgrounds, cards |
| **Font Family** | System fonts + Tailwind defaults | All text |

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx     # Navigation with auth state
│   ├── Footer.jsx     # Site footer with links
│   ├── SearchBar.jsx  # Property search input
│   ├── PropertyCard.jsx    # Property display card
│   ├── FilterSidebar.jsx   # Search filters panel
│   ├── ImageGallery.jsx    # Property image viewer
│   ├── LoginModal.jsx      # Auth modal
│   ├── SignupModal.jsx     # Registration modal
│   ├── CookieConsent.jsx   # GDPR compliance
│   └── ...
├── pages/              # Route-level components
│   ├── Home.jsx        # Landing page
│   ├── Properties.jsx  # Property listing page
│   ├── PropertyDetails.jsx # Single property view
│   ├── SellProperty.jsx    # Property posting form
│   ├── Dashboard.jsx       # User dashboard
│   ├── Login.jsx           # Login page
│   ├── Signup.jsx          # Registration page
│   └── ...
├── contexts/           # State management
│   ├── AuthContext.jsx     # Authentication state
│   ├── PropertyContext.jsx # Property data state
│   ├── LocationContext.jsx # Geolocation state
│   └── DashboardContext.jsx# Dashboard state
├── services/           # API services
│   ├── api.js          # Main API client
│   ├── billingApi.js   # Payment services
│   ├── locationService.js# Geolocation services
│   ├── propertyClickService.js # Lead tracking
│   └── ...
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── routes/             # Route configuration
└── assets/             # Static resources
```

---

## 3. User Roles & Access Control

### Role Hierarchy

| Role | Description | Access Level |
|------|-------------|--------------|
| **Public Visitor** | Unauthenticated user | Browse properties, use calculators, view content |
| **Authenticated User** | Logged-in user | Dashboard, saved properties, enquiries, post property |
| **Property Owner** | User with listings | Manage own properties, view analytics |
| **Agent** | Verified agent | Manage multiple properties, view leads |
| **Admin** | Platform administrator | User management, property approval, system analytics |

### Access Matrix

| Feature | Public | User | Owner | Agent | Admin |
|---------|--------|------|-------|-------|-------|
| View Properties | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search & Filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save Properties | ❌ | ✅ | ✅ | ✅ | ✅ |
| Post Property | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Properties | ❌ | Own | Own | Multiple | All |
| View Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |
| Approve Listings | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Analytics | ❌ | Basic | Detailed | Detailed | Full |
| Manage Subscriptions | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Authentication System

### 4.1 Login Methods

#### Method 1: Email + Password Login (`/login`)

**Steps:**
1. Navigate to `/login`
2. Enter registered email address
3. Enter password
4. Click "Sign In"
5. System validates credentials via `/api/v1/auth/login`
6. JWT token stored in localStorage (`authToken`)
7. Redirected to dashboard or intended destination

**Features:**
- "Remember Me" option for persistent login
- Password visibility toggle
- Forgot password link
- Form validation with error messages

#### Method 2: Phone OTP Login (`/otp-verify`)

**Steps:**
1. Click "Login with Phone" on login page
2. Enter 10-digit mobile number
3. Click "Send OTP"
4. System sends OTP via SMS through `/api/v1/auth/otp/request`
5. Enter 6-digit OTP received
6. Click "Verify & Login"
7. System validates via `/api/v1/auth/otp/verify`
8. Auto-login on successful verification

**Security:**
- OTP expires after 10 minutes
- 3 attempts allowed before requiring new OTP
- Rate limiting: 1 OTP per 60 seconds

#### Method 3: Social Login (OAuth)

**Supported Providers:**
- Google OAuth
- Facebook Login

**Flow:**
1. Click social login button
2. Redirect to provider auth page
3. Grant permissions
4. Callback to `/api/v1/auth/oauth/callback`
5. Account created/linked automatically
6. Login completed

### 4.2 Registration (`/signup`)

**Registration Process:**

1. **Basic Information:**
   - Full Name (required)
   - Email Address (required, unique)
   - Phone Number (required, unique)
   - Password (min 8 chars, uppercase, number, special char)
   - Confirm Password

2. **Validation:**
   - Email format validation
   - Phone number format (India: +91)
   - Password strength checker
   - Terms & Conditions acceptance

3. **Account Creation:**
   - POST to `/api/v1/auth/register`
   - Verification email sent
   - Phone verification via OTP

4. **Profile Completion:**
   - Upload profile photo
   - Add location preferences
   - Set notification preferences

### 4.3 Session Management

| Aspect | Configuration |
|--------|---------------|
| Token Storage | localStorage (`authToken`) |
| Token Type | JWT (JSON Web Token) |
| Token Expiry | 24 hours |
| Auto-logout | On token expiry or 24h inactivity |
| Concurrent Sessions | Supported (multiple devices) |
| Secure Cookies | Enabled for cross-origin |

### 4.4 Password Recovery

1. Click "Forgot Password" on login page
2. Enter registered email
3. System sends reset link to `/api/v1/auth/forgot-password`
4. Click link in email (valid for 1 hour)
5. Enter new password
6. Confirm password change
7. Redirect to login with success message

---

## 5. Public Portal Features

### 5.1 Landing Page (`/home`)

**Hero Section:**
- Headline: "Find Your Perfect Space"
- Subheadline: "Buy, Sell, Rent Properties with Ease"
- Smart Search Bar: Location, Property Type, Budget
- Primary CTA: "Search Properties"
- Secondary CTA: "Post Your Property"

**Featured Properties Section:**
- Displays 6-8 curated properties
- Carousel/grid layout
- Property cards with:
  - Primary image
  - Property name
  - Price
  - Location
  - BHK info
  - Area
  - "View Details" button

**Popular Cities:**
- Quick links to top cities
- Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune
- Property count per city

**Our Services:**
- Buy Property
- Rent Property
- Sell Property
- Home Loans
- Property Valuation
- Legal Assistance

**Why Choose Us:**
- Verified Listings
- Trusted Agents
- Easy Process
- 24/7 Support
- Best Deals

**Testimonials:**
- Customer reviews carousel
- Ratings and feedback
- Property success stories

### 5.2 Property Search (`/properties`)

#### Search Interface

**Smart Search Bar:**
- Location input with autocomplete
- Property type dropdown
- Budget range selector
- Search button

**Filter Sidebar:**

| Filter Category | Options |
|-----------------|---------|
| **Property Type** | Apartment, Villa, Plot, Commercial, Office, Shop |
| **Transaction Type** | Buy, Rent, Lease |
| **Budget Range** | ₹10L - ₹10Cr+ slider |
| **Bedrooms** | 1, 2, 3, 4, 5+ BHK |
| **Bathrooms** | 1, 2, 3, 4+ |
| **Area (sqft)** | 500 - 10,000+ slider |
| **Property Status** | Ready to Move, Under Construction, New Launch |
| **Furnishing** | Furnished, Semi-Furnished, Unfurnished |
| **Parking** | 1, 2, 3+ Spaces |
| **Amenities** | Pool, Gym, Security, Power Backup, etc. |
| **Facing** | North, South, East, West, etc. |
| **Floor** | Ground, 1-5, 6-10, 10+ |
| **Age of Property** | 0-1, 1-5, 5-10, 10+ years |

**View Options:**
- Grid View (3 columns)
- List View (detailed rows)
- Map View (properties on map)

**Sorting Options:**
- Relevance (default)
- Price: Low to High
- Price: High to Low
- Date: Newest First
- Area: Small to Large
- Popularity

#### Property Cards

**Card Elements:**
- Primary image with badge overlay
- Property title
- Location with map icon
- Price (formatted with currency)
- BHK + Area info
- Key amenities icons
- Posted date
- "View Details" button
- "Save" heart icon (for logged-in users)
- "Viewed" badge (if previously clicked)

**Card Actions:**
- Click card → Navigate to property details
- Click image → Open gallery
- Click save → Add to favorites
- Hover → Show quick actions

### 5.3 Property Details (`/properties/:slug`)

#### Header Section

- Property title with verification badge
- Location with full address
- Price (formatted)
- Price per sqft
- Action buttons:
  - Contact Agent
  - Schedule Visit
  - Save Property
  - Share

#### Image Gallery

- Main image (large)
- Thumbnail strip (4-5 images)
- Click to open lightbox
- Zoom functionality
- Full-screen mode
- Video tour (if available)

#### Property Overview

```
┌─────────────────────────────────────────────────────┐
│ Property Type: Apartment      Transaction: Buy     │
│ Bedrooms: 3 BHK               Bathrooms: 3           │
│ Carpet Area: 1,200 sqft      Built-up: 1,500 sqft   │
│ Furnishing: Semi-furnished  Parking: 2 Cars        │
│ Floor: 5th of 20            Facing: East           │
│ Age: 2 Years                Status: Ready to Move  │
└─────────────────────────────────────────────────────┘
```

#### Description Section

- Full property description
- Property highlights
- About the locality
- Nearby landmarks

#### Amenities Section

**Categorized Display:**

| Category | Amenities |
|----------|-----------|
| **Safety** | 24/7 Security, CCTV, Fire Safety, Intercom |
| **Convenience** | Power Backup, Lift, Gas Pipeline, Water Supply |
| **Leisure** | Swimming Pool, Gym, Clubhouse, Garden |
| **Environment** | Rainwater Harvesting, Waste Management, Solar Power |
| **Parking** | Covered Parking, Visitor Parking, EV Charging |
| **Sports** | Tennis Court, Basketball, Jogging Track |
| **Kids** | Play Area, Day Care, Kids Pool |

#### Location Section

- Interactive map with property marker
- Street view option
- Nearby places:
  - Schools
  - Hospitals
  - Markets
  - Transport
  - Restaurants
- Distance to key locations

#### Builder/Agent Information

- Builder/Agent name
- Verification badge
- Experience
- Contact number (masked)
- Response time
- Other properties by same

#### Similar Properties

- 4-6 related properties
- Same location/budget range
- Horizontal scroll carousel

#### Contact Form

**Fields:**
- Name (pre-filled if logged in)
- Email (pre-filled if logged in)
- Phone (pre-filled if logged in)
- Message (optional)
- Preferred contact time

**Actions:**
- Send Enquiry
- Schedule Site Visit
- Get Callback

#### Lead Generation

**Automatic Lead Capture:**
- First click on property → Creates lead
- Captures: propertyId, userId, timestamp
- Checks for duplicates
- Assigns to property agent

**Viewed Badge:**
- Shows on properties already clicked
- Persistent across sessions (localStorage)

---

## 6. User Dashboard

### 6.1 Main Dashboard (`/dashboard`)

#### Profile Overview Widget

```
┌─────────────────────────────────────────┐
│ 👤 [Avatar] John Doe                   │
│ 📧 john.doe@example.com                │
│ 📱 +91 98765 43210                     │
│ ⭐ Premium Member                      │
│ [Edit Profile]                         │
└─────────────────────────────────────────┘
```

#### Statistics Cards

| Stat | Value | Action |
|------|-------|--------|
| **My Properties** | 5 Posted | [View All] |
| **Saved Properties** | 12 | [View All] |
| **Enquiries Sent** | 8 | [View All] |
| **Site Visits** | 3 Scheduled | [View All] |

#### Quick Actions

- Post New Property
- Search Properties
- View Saved
- Check Enquiries

#### Recent Activity Feed

```
[Today 10:30 AM] You saved "Luxury Apartment in Bandra"
[Yesterday 4:15 PM] Enquiry sent for "3BHK in Andheri"
[2 days ago] Property "Villa in Juhu" posted successfully
```

#### Recommended Properties

- Based on saved/search history
- AI-powered recommendations
- Carousel display

### 6.2 My Properties (`/dashboard/properties`)

#### Property List Table

| Column | Description |
|--------|-------------|
| **Property** | Image + Name + Location |
| **Price** | Listed price |
| **Status** | Draft / Pending / Live / Rejected |
| **Views** | Total view count |
| **Enquiries** | Number of enquiries |
| **Posted** | Date posted |
| **Actions** | Edit / Boost / Delete |

#### Status Indicators

| Status | Badge | Description |
|--------|-------|-------------|
| **Draft** | 🟡 Yellow | Saved but not submitted |
| **Pending** | 🟠 Orange | Submitted, awaiting approval |
| **Live** | 🟢 Green | Approved and published |
| **Rejected** | 🔴 Red | Not approved (see reason) |
| **Expired** | ⚫ Gray | Listing period ended |

#### Property Actions

**For Each Property:**
- **Edit**: Modify property details
- **Boost**: Upgrade to premium listing
- **Renew**: Extend listing duration
- **Analytics**: View detailed stats
- **Delete**: Remove property (confirmation required)

#### Property Analytics

**Metrics Displayed:**
- Total Views (with graph)
- Unique Visitors
- Enquiries Generated
- Phone Clicks
- Email Clicks
- Saves Count
- Peak View Times
- Traffic Sources

### 6.3 Saved Properties (`/dashboard/saved`)

#### Saved List

- Grid view of saved properties
- Sort by: Date Saved, Price, Area
- Filter by: Property Type, Location

#### Compare Feature

**Select 2-4 properties to compare:**

| Feature | Property 1 | Property 2 | Property 3 |
|---------|------------|------------|------------|
| Price | ₹1.5 Cr | ₹1.2 Cr | ₹1.8 Cr |
| Area | 1200 sqft | 1100 sqft | 1500 sqft |
| BHK | 3 | 2 | 3 |
| Location | Bandra | Andheri | Juhu |
| Amenities | Pool, Gym | Gym | Pool, Gym, Club |

**Comparison Highlights:**
- Best value (price per sqft)
- Largest area
- Most amenities
- Best location score

#### Actions

- Remove from saved (individual or bulk)
- Contact owner/agent
- Schedule visit
- Share property

### 6.4 My Enquiries (`/dashboard/enquiries`)

#### Enquiries List

| Column | Description |
|--------|-------------|
| **Property** | Name + Image |
| **Agent** | Contact person |
| **Status** | Pending / Responded / Closed |
| **Date** | Enquiry sent date |
| **Actions** | View / Follow up |

#### Enquiry Details

- Property information
- Message sent
- Agent response (if any)
- Contact details shared
- Follow-up button

#### Status Meanings

| Status | Description |
|--------|-------------|
| **Pending** | Awaiting agent response |
| **Responded** | Agent has replied |
| **Contacted** | Direct contact established |
| **Closed** | Enquiry completed or expired |

### 6.5 Site Visits (`/dashboard/visits`)

#### Visits Calendar

- Monthly calendar view
- Scheduled visits marked
- Color-coded by status

#### Upcoming Visits

| Property | Date | Time | Status | Actions |
|----------|------|------|--------|---------|
| Marina Apartment | May 10 | 11:00 AM | Confirmed | Reschedule/Cancel |
| Skyline Villa | May 12 | 3:00 PM | Pending | Cancel |

#### Visit Status

| Status | Meaning |
|--------|---------|
| **Confirmed** | Agent has accepted |
| **Pending** | Awaiting confirmation |
| **Rescheduled** | New time proposed |
| **Completed** | Visit done |
| **Cancelled** | Visit cancelled |

#### Schedule New Visit

1. Select property
2. Choose date (calendar picker)
3. Choose time slot
4. Add notes/preferences
5. Submit request
6. Agent receives notification

### 6.6 Settings (`/dashboard/settings`)

#### Profile Settings

**Personal Information:**
- Full Name (editable)
- Email (verification required to change)
- Phone Number (verification required)
- Date of Birth
- Gender
- Profile Photo (upload/remove)

**Address:**
- Current Address
- City
- State
- PIN Code

#### Account Settings

**Security:**
- Change Password (current + new + confirm)
- Two-Factor Authentication toggle
- Login History
- Active Sessions (logout from all devices)

**Notifications:**
| Type | Email | SMS | In-App |
|------|-------|-----|--------|
| Property Updates | ✅/❌ | ✅/❌ | ✅/❌ |
| New Enquiries | ✅/❌ | ✅/❌ | ✅/❌ |
| Site Visit Reminders | ✅/❌ | ✅/❌ | ✅/❌ |
| Marketing Offers | ✅/❌ | ✅/❌ | ✅/❌ |
| Newsletter | ✅/❌ | - | - |

**Privacy:**
- Profile visibility (Public/Private)
- Contact information sharing
- Activity tracking consent

#### Preferences

**Property Preferences:**
- Preferred locations
- Budget range
- Property types
- BHK preference
- Purpose (Investment/Self-use)

**Search Defaults:**
- Default sort order
- Default view (Grid/List/Map)
- Currency display
- Area unit (sqft/sqm)

---

## 7. Property Management

### 7.1 Post Property (`/sell`)

#### 5-Step Listing Wizard

**Step 1: Basic Information**

| Field | Options |
|-------|---------|
| **Property For** | Sell / Rent / Lease |
| **Property Type** | Residential / Commercial / Plot |
| **Sub Type** | Apartment / Villa / Independent House / Shop / Office |
| **Location** | City, Locality (with autocomplete) |
| **Project/Building Name** | Text input |

**Step 2: Property Details**

| Field | Input Type |
|-------|------------|
| **Bedrooms** | 1-5+ dropdown |
| **Bathrooms** | 1-5+ dropdown |
| **Balconies** | 0-5 dropdown |
| **Carpet Area** | Number (sqft) |
| **Built-up Area** | Number (sqft) |
| **Super Built-up** | Number (sqft) |
| **Floor Number** | Dropdown (Ground, 1-50) |
| **Total Floors** | Dropdown (1-100) |
| **Facing** | North, South, East, West, etc. |
| **Age of Property** | 0-1, 1-5, 5-10, 10+ years |
| **Furnishing** | Fully, Semi, Unfurnished |
| **Parking** | Covered, Open, None |
| **Parking Spaces** | 0-5 |

**Step 3: Pricing & Photos**

| Field | Description |
|-------|-------------|
| **Expected Price** | Number input (₹) |
| **Price per sqft** | Auto-calculated |
| **Maintenance** | Monthly charges |
| **Negotiable** | Yes/No toggle |
| **Available From** | Date picker |
| **Photos** | Multiple file upload (max 10) |
| **Video Tour** | YouTube link |

**Photo Upload Features:**
- Drag & drop support
- Preview before upload
- Reorder images
- Set primary image
- Delete individual images
- Progress indicator

**Step 4: Amenities**

**Safety:**
- [ ] 24/7 Security
- [ ] CCTV Surveillance
- [ ] Fire Safety Equipment
- [ ] Intercom Facility
- [ ] Security Guards

**Convenience:**
- [ ] Power Backup
- [ ] Lift/Elevator
- [ ] Gas Pipeline
- [ ] 24/7 Water Supply
- [ ] Maintenance Staff

**Leisure:**
- [ ] Swimming Pool
- [ ] Gym/Fitness Center
- [ ] Clubhouse
- [ ] Garden/Park
- [ ] Children's Play Area
- [ ] Indoor Games

**Sports:**
- [ ] Tennis Court
- [ ] Basketball Court
- [ ] Jogging Track
- [ ] Yoga/Meditation Area

**Environment:**
- [ ] Rainwater Harvesting
- [ ] Solar Power
- [ ] Waste Management
- [ ] Sewage Treatment

**Step 5: Description & Contact**

| Field | Description |
|-------|-------------|
| **Property Description** | Rich text editor (500 chars min) |
| **Highlights** | Bullet points for key features |
| **Preferred Contact Time** | Morning/Afternoon/Evening/Anytime |
| **Terms Acceptance** | Required checkbox |

**Form Validation:**
- Required field checks
- Format validation (email, phone)
- Image count (min 3 recommended)
- Price reasonableness check
- Duplicate detection

**Submission:**
- Save as Draft (continue later)
- Submit for Review
- Preview before submit

### 7.2 Subscription Plans

#### Plan Comparison

| Feature | Free | Premium | Elite |
|---------|------|---------|-------|
| **Price** | ₹0 | ₹999/mo | ₹2,999/mo |
| **Listings** | 1 active | 10 active | Unlimited |
| **Featured** | ❌ | ✅ (3) | ✅ (10) |
| **Verified Badge** | ❌ | ✅ | ✅ |
| **Analytics** | Basic | Detailed | Advanced |
| **Priority Support** | ❌ | Email | Phone + Email |
| **Property Photos** | 5 | 15 | 30 |
| **Video Tours** | ❌ | ✅ | ✅ |
| **Lead Notifications** | ❌ | ✅ | ✅ |
| **Social Sharing** | Basic | Enhanced | Premium |

#### Plan Features Explained

**Free Plan:**
- Basic listing on platform
- Standard search ranking
- Limited analytics
- Community support

**Premium Plan:**
- Featured placement in search
- Verified badge for trust
- Priority customer support
- Detailed analytics dashboard

**Elite Plan:**
- Homepage showcase placement
- Dedicated account manager
- Advanced market insights
- Custom branding options

### 7.3 Property Subscription (`/property-subscription`)

#### Individual Property Boosting

**Boost Options:**

| Boost Type | Duration | Price | Benefits |
|------------|----------|-------|----------|
| **Highlight** | 7 days | ₹499 | Colored background in search |
| **Top Placement** | 7 days | ₹999 | First 3 in search results |
| **Homepage Feature** | 7 days | ₹1,999 | Featured on homepage |
| **Premium Listing** | 30 days | ₹2,999 | All premium benefits |

**Checkout Process:**
1. Select property to boost
2. Choose boost type
3. Review order summary
4. Proceed to payment
5. PayU payment gateway
6. Activation confirmation
7. Property boosted immediately

---

## 8. Lead Generation System

### 8.1 Property Click Lead Tracking

#### How It Works

**Flow:**
```
User Clicks Property Card
    ↓
Check Authentication
    ↓
If Authenticated → Check for Existing Lead
    ↓
If New Lead → Capture Data
    ↓
Create Lead Record
    ↓
Navigate to Property Details
```

**Captured Data:**
```javascript
{
  property_id: "prop_123",
  user_id: "user_456",
  property_data: {
    name: "Luxury Apartment",
    property_type: "apartment",
    city: "Mumbai",
    price_min: 15000000,
    bedrooms: 3,
    bathrooms: 3,
    total_area: 1500,
    is_featured: true
  },
  timestamp: "2026-05-05T09:44:19.000Z",
  source: "property_click"
}
```

**Duplicate Prevention:**
- Checks for existing lead (user + property combination)
- Prevents multiple leads for same property
- Updates existing lead with new activity (future)

### 8.2 Viewed Badge System

**Implementation:**
- Tracks viewed properties in localStorage
- Shows "Viewed" badge on property cards
- Persists across browser sessions
- Clears on logout (optional)

**Badge Display:**
```
┌─────────────────────┐
│  [Image]            │
│  [VIEWED]           │
│  Property Name       │
│  Location            │
└─────────────────────┘
```

### 8.3 Enquiry Lead Capture

**Enquiry Form Data:**
- User details (name, email, phone)
- Property interested in
- Message/query
- Preferred contact time
- Source tracking

**Lead Assignment:**
- Auto-assigned to property owner/agent
- Notification sent (email + SMS)
- Lead appears in CRM dashboard
- Follow-up reminders generated

---

## 9. Financial Tools & Calculators

### 9.1 EMI Calculator (`/tools/emi-calculator`)

#### Input Parameters

| Field | Default | Range |
|-------|---------|-------|
| **Loan Amount** | ₹50,00,000 | ₹1L - ₹10Cr |
| **Interest Rate** | 8.5% | 5% - 20% |
| **Loan Tenure** | 20 years | 1 - 30 years |

#### Output Display

```
┌─────────────────────────────────────────┐
│  Monthly EMI: ₹43,391                  │
│  Total Interest: ₹54,13,840             │
│  Total Payment: ₹1,04,13,840            │
└─────────────────────────────────────────┘
```

#### Amortization Schedule

- Year-wise breakdown
- Principal vs Interest split
- Outstanding balance
- Download as Excel

#### Interactive Features

- Sliders for quick adjustment
- Pie chart (principal vs interest)
- Compare multiple scenarios
- Share results

### 9.2 Home Loan Assistance (`/tools/home-loan`)

#### Bank Comparison

| Bank | Interest Rate | Processing Fee | Max Tenure | Features |
|------|--------------|----------------|------------|----------|
| SBI | 8.40% | 0.35% | 30 years | Government bank |
| HDFC | 8.50% | 0.50% | 30 years | Quick approval |
| ICICI | 8.55% | 0.50% | 30 years | Online process |
| Axis | 8.60% | 1% | 30 years | Doorstep service |
| PNB | 8.45% | 0.35% | 30 years | Low fees |

#### Eligibility Calculator

**Input:**
- Monthly income
- Existing EMIs
- Age
- Employment type

**Output:**
- Max eligible loan amount
- Recommended EMI
- Suggested tenure

#### Document Checklist

**Salaried:**
- ID Proof
- Address Proof
- Last 3 months salary slips
- Last 6 months bank statements
- Form 16 / ITR

**Self-Employed:**
- ID Proof
- Address Proof
- Last 2 years ITR
- Business proof
- Bank statements (1 year)

### 9.3 Home Loan Eligibility (`/tools/home-loan-eligibility`)

#### Multi-Bank Check

- Input income details once
- Check eligibility across banks
- Compare offers side-by-side
- Apply to preferred bank

#### Calculation Factors

| Factor | Weight | Impact |
|--------|--------|--------|
| Income | High | Higher income = Higher eligibility |
| Age | Medium | Younger = Longer tenure possible |
| Credit Score | High | 750+ = Better rates |
| Existing Loans | High | Reduces eligibility |
| Employment Type | Low | Salaried preferred |

### 9.4 Buying vs Renting Calculator (`/tools/buying-vs-renting`)

#### Input Parameters

**Buy Scenario:**
- Property price
- Down payment
- Loan interest rate
- Maintenance cost
- Appreciation rate

**Rent Scenario:**
- Monthly rent
- Rent increase rate
- Investment opportunity (if not buying)

#### Analysis Output

```
┌─────────────────────────────────────────┐
│  Breakeven Point: 8 years              │
│  10-Year Comparison:                     │
│    - Buying Cost: ₹1.2 Cr              │
│    - Renting Cost: ₹95 Lakhs           │
│  Recommendation: BUY (after 8 years)   │
└─────────────────────────────────────────┘
```

#### Visualizations

- Cost comparison graph
- Breakeven point marker
- Long-term projection (10, 20, 30 years)

### 9.5 Rental Yield Calculator (`/tools/rental-yield`)

#### Input

- Property price
- Monthly rent
- Annual maintenance
- Vacancy period estimate

#### Output

```
┌─────────────────────────────────────────┐
│  Gross Rental Yield: 4.5%               │
│  Net Rental Yield: 3.8%               │
│  Investment Grade: B+ (Good)           │
│  Area Average: 4.2%                    │
└─────────────────────────────────────────┘
```

#### Investment Grade Scale

| Grade | Yield Range | Rating |
|-------|-------------|--------|
| A+ | 6%+ | Excellent |
| A | 5-6% | Very Good |
| B+ | 4-5% | Good |
| B | 3-4% | Average |
| C | <3% | Below Average |

#### Area Comparison

- Compare yields across localities
- Identify best investment areas
- Trend analysis

### 9.6 Property Valuation (`/tools/property-valuation`)

#### Valuation Method

**Factors Considered:**
- Location (city, locality)
- Property type
- Area (sqft)
- Age of property
- Amenities
- Market trends

**Output:**
- Estimated market value
- Price per sqft comparison
- Similar properties sold
- Value appreciation prediction

---

## 10. Payment & Subscription System

### 10.1 Payment Gateway (PayU)

#### Supported Payment Methods

| Method | Availability |
|--------|--------------|
| **UPI** | ✅ Google Pay, PhonePe, Paytm |
| **Credit/Debit Cards** | ✅ Visa, MasterCard, RuPay |
| **Net Banking** | ✅ 50+ banks |
| **Wallets** | ✅ Paytm, Mobikwik, Freecharge |
| **EMI** | ✅ 3-24 months |
| **BNPL** | ✅ LazyPay, Simpl |

#### Payment Flow

1. **Initiate Payment:**
   - User selects plan/boost
   - System creates order via `/api/v1/payments/payu/order`
   - Returns transaction ID and hash

2. **Redirect to PayU:**
   - User redirected to PayU checkout
   - Selects payment method
   - Completes payment

3. **Callback Handling:**
   - Success: `/payment/success`
   - Failure: `/payment/failure`
   - Verification via `/api/v1/payments/payu/verify`

4. **Activation:**
   - Payment verified
   - Subscription/boost activated
   - Confirmation email sent

#### Security Features

- PCI DSS compliant
- 3D Secure authentication
- Fraud detection
- Transaction encryption
- No card data stored locally

### 10.2 Billing API Services

#### Subscription Management

```javascript
// Get available plans
billingApi.getPlans()

// Get current subscription
billingApi.getActiveSubscription()

// Create new subscription
billingApi.createSubscription({
  planId: 'premium',
  duration: 'monthly'
})

// Change plan
billingApi.changePlan(subscriptionId, {
  newPlanId: 'elite'
})

// Cancel subscription
billingApi.cancelSubscription(subscriptionId)

// Renew subscription
billingApi.renewSubscription(subscriptionId)
```

#### Invoice Management

```javascript
// Get all invoices
billingApi.getInvoices()

// Download invoice PDF
billingApi.downloadInvoicePdf(invoiceId)

// Pay advance
billingApi.payAdvance(invoiceId, { amount: 1000 })

// Pay remaining
billingApi.payRemaining(invoiceId, { amount: 2000 })
```

#### Coupon & Discounts

```javascript
// Validate coupon
billingApi.validateCoupon('SAVE20', {
  planId: 'premium',
  amount: 999
})
```

### 10.3 Checkout Process

#### Checkout Page (`/checkout`)

**Order Summary:**
```
┌─────────────────────────────────────────┐
│  Order Summary                          │
│  ─────────────────────────────────────  │
│  Premium Plan (Monthly)    ₹999         │
│  Discount (SAVE20)       -₹200        │
│  GST (18%)               +₹144        │
│  ─────────────────────────────────────  │
│  Total                   ₹943         │
└─────────────────────────────────────────┘
```

**Payment Steps:**
1. Review order
2. Apply coupon (optional)
3. Select payment method
4. Complete payment
5. Success/failure redirect
6. Invoice generation

### 10.4 Payment Status Pages

#### Success Page (`/payment/success`)

- Confirmation message
- Transaction ID
- Amount paid
- Next steps
- Download invoice button

#### Failure Page (`/payment/failure`)

- Failure reason
- Retry payment button
- Alternative payment methods
- Contact support link

---

## 11. Admin Panel

### 11.1 Admin Dashboard (`/admin`)

#### Overview Metrics

```
┌─────────────────────────────────────────────────────────┐
│  Platform Overview                                      │
│  ─────────────────────────────────────────────────────  │
│  Total Users: 1,245    Total Properties: 3,567       │
│  Pending Approvals: 23  Revenue (MTD): ₹2.4L            │
│  Active Listings: 2,890  Conversion Rate: 12%          │
└─────────────────────────────────────────────────────────┘
```

#### Charts & Graphs

- User registration trend (daily/weekly/monthly)
- Property listing growth
- Revenue analytics
- Lead conversion funnel
- Top performing locations

#### Quick Actions

- View pending approvals
- Manage flagged content
- System announcements
- Export reports

### 11.2 Property Management

#### Pending Approvals

| Property | Owner | Submitted | Status | Actions |
|----------|-------|-----------|--------|---------|
| Marina Heights | John Doe | 2 hours ago | Pending Review | Approve/Reject |
| Skyline Villa | Jane Smith | 1 day ago | Flagged | Review |

**Approval Workflow:**
1. View property details
2. Verify documents
3. Check for duplicates
4. Approve or Reject (with reason)
5. Owner notified

#### Flagged Content

**Reasons for Flagging:**
- Inappropriate content
- Fake listing
- Wrong pricing
- Duplicate property
- Spam

**Actions:**
- Remove listing
- Request changes
- Suspend user
- Blacklist user

### 11.3 User Management

#### User List

| User | Email | Role | Status | Properties | Actions |
|------|-------|------|--------|------------|---------|
| John Doe | john@example.com | Owner | Active | 5 | Edit/Ban |
| Agent X | agent@example.com | Agent | Active | 12 | Edit/Ban |
| Spammer | spam@example.com | User | Suspended | 0 | Unban |

**Actions:**
- Edit user details
- Change role
- Suspend/unsuspend
- Reset password
- View activity log
- Delete account

### 11.4 Analytics & Reports

#### Available Reports

1. **User Analytics:**
   - Registration trends
   - Active users
   - User retention
   - Geographic distribution

2. **Property Analytics:**
   - Listings by category
   - Popular locations
   - Price trends
   - Approval rates

3. **Financial Reports:**
   - Revenue by plan
   - Payment failures
   - Refund requests
   - Subscription churn

4. **Lead Analytics:**
   - Lead sources
   - Conversion rates
   - Response times
   - Top agents

#### Export Options

- PDF report
- Excel/CSV data
- JSON (API format)
- Scheduled email reports

---

## 12. Support Services

### 12.1 Legal Assistance (`/tools/property-agreement`)

#### Services Offered

| Service | Description |
|---------|-------------|
| **Sale Deed Drafting** | Legal documentation for property sale |
| **Agreement Review** | Expert review of property agreements |
| **Document Verification** | Title deed, encumbrance certificate |
| **RERA Compliance** | Regulatory compliance check |
| **Legal Consultation** | Property lawyer consultation |

#### Process

1. Select service type
2. Fill requirement form
3. Upload documents (if any)
4. Make payment
5. Expert assigned
6. Service delivery
7. Download documents

### 12.2 Rent Agreement (`/rent-agreement`)

#### Online Rent Agreement Creation

**Steps:**
1. Enter landlord details
2. Enter tenant details
3. Property details
4. Rent terms (amount, deposit, duration)
5. Special clauses (optional)
6. Generate agreement
7. E-stamp integration
8. Digital signatures
9. Registration assistance

#### Features

- Legally valid templates
- E-stamp paper integration
- Digital signature support
- Registration tracking
- Renewal reminders

### 12.3 Property Agreement (`/property-agreement`)

#### Agreement Types

| Type | Purpose |
|------|---------|
| **Sale Deed** | Property sale transfer |
| **Gift Deed** | Property gifting |
| **Power of Attorney** | Legal representation |
| **Will** | Property inheritance |
| **Lease Deed** | Long-term lease |
| **Leave & License** | Short-term rental |

### 12.4 Vastu Consultancy (`/vastu-consultancy`)

#### Vastu Score Calculator

**Parameters:**
- Direction (North, East, etc.)
- Room placements
- Entrance position
- Kitchen location
- Bedroom directions

**Output:**
- Vastu score (0-100)
- Compliance level
- Remedial suggestions
- Expert consultation booking

### 12.5 Interior Design (`/interior-design`)

#### Services

- 3D visualization
- Cost estimation
- Material selection
- Vendor directory
- Project management

### 12.6 Home Construction (`/home-construction`)

#### Construction Cost Calculator

**Input:**
- Plot area
- Construction area
- Quality (Basic/Medium/Premium)
- Number of floors
- Location

**Output:**
- Estimated cost
- Material breakdown
- Labor cost
- Timeline estimate
- Contractor directory

---

## 13. API Reference

### 13.1 Authentication Endpoints

```
POST /api/v1/auth/login              - Email/password login
POST /api/v1/auth/otp/request        - Request OTP
POST /api/v1/auth/otp/verify         - Verify OTP
POST /api/v1/auth/register           - User registration
GET  /api/v1/auth/me                 - Get current user
POST /api/v1/auth/logout             - Logout user
POST /api/v1/auth/forgot-password    - Password reset request
POST /api/v1/auth/reset-password     - Reset password
```

### 13.2 Property Endpoints

```
GET    /api/v1/properties                    - List properties
POST   /api/v1/properties                    - Create property
GET    /api/v1/properties/:id                - Get property details
PUT    /api/v1/properties/:id                - Update property
DELETE /api/v1/properties/:id                - Delete property
GET    /api/v1/properties/featured           - Featured properties
GET    /api/v1/properties/nearby             - Nearby properties
GET    /api/v1/properties/by-city            - Properties by city
POST   /api/v1/properties/:id/images         - Upload images
GET    /api/v1/properties/:id/media          - Get property media
```

### 13.3 Listing Endpoints

```
GET    /api/v1/listings                      - Search listings
POST   /api/v1/listings                      - Create listing
GET    /api/v1/listings/:id                  - Get listing
GET    /api/v1/listings/slug/:slug           - Get by slug
PATCH  /api/v1/listings/:id                  - Update listing
DELETE /api/v1/listings/:id                  - Delete listing
POST   /api/v1/listings/:id/publish          - Publish listing
POST   /api/v1/listings/:id/unpublish        - Unpublish listing
POST   /api/v1/listings/:id/feature          - Toggle featured
POST   /api/v1/listings/:id/inquiry          - Send enquiry
POST   /api/v1/listings/:id/favorite         - Add to favorites
```

### 13.4 Lead Endpoints

```
POST /api/v1/leads/property-click            - Create property click lead
GET  /api/v1/leads/property-click/check/:id  - Check lead exists
GET  /api/v1/leads                           - Get user leads
POST /api/v1/leads/public/listing-visit/:id - Public visit lead
POST /api/v1/leads/public/listing-inquiry/:id - Public enquiry lead
```

### 13.5 User Endpoints

```
GET    /api/v1/users/me                      - Get current user
PATCH  /api/v1/users/:id                     - Update user
GET    /api/v1/users/me/favorites            - Get favorites
POST   /api/v1/users/me/favorites            - Add favorite
DELETE /api/v1/users/me/favorites/:id        - Remove favorite
GET    /api/v1/users/me/inquiries            - Get enquiries
POST   /api/v1/users/me/avatar               - Upload avatar
GET    /api/v1/users/me/preferences          - Get preferences
PATCH  /api/v1/users/me/preferences          - Update preferences
```

### 13.6 Billing Endpoints

```
GET    /api/v1/subscriptions/plans           - Get plans
GET    /api/v1/subscriptions/active          - Active subscription
POST   /api/v1/subscriptions                 - Create subscription
POST   /api/v1/payments/payu/order           - Create PayU order
POST   /api/v1/payments/payu/verify          - Verify PayU payment
GET    /api/v1/billing/portal/invoices       - Get invoices
GET    /api/v1/billing/portal/usage          - Usage stats
POST   /api/v1/billing/refunds               - Request refund
```

### 13.7 Admin Endpoints

```
GET    /api/v1/admin/properties/pending      - Pending approvals
PATCH  /api/v1/admin/properties/:id/approve  - Approve property
GET    /api/v1/admin/analytics                - Platform analytics
GET    /api/v1/admin/enquiries                - All enquiries
```

---

## 14. Technical Specifications

### 14.1 System Limits

| Resource | Limit |
|----------|-------|
| Properties per user (Free) | 1 active |
| Properties per user (Premium) | 10 active |
| Properties per user (Elite) | Unlimited |
| Images per property | 10 (Free), 15 (Premium), 30 (Elite) |
| File upload size | 25 MB per file |
| Saved properties | 500 per user |
| Enquiries per day | 50 per user |
| API rate limit | 1,000 requests per minute |
| Session duration | 24 hours |

### 14.2 Browser Compatibility

| Browser | Minimum Version | Status |
|---------|---------------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Opera | 76+ | ✅ Full support |
| IE 11 | - | ❌ Not supported |

### 14.3 Mobile Responsiveness

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Touch Optimizations:**
- Minimum touch target: 44x44px
- Swipe gestures for gallery
- Bottom navigation on mobile
- Collapsible filters

### 14.4 Performance Metrics

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |

### 14.5 Security Features

- HTTPS only
- JWT token authentication
- XSS protection
- CSRF tokens
- Rate limiting
- Input sanitization
- File upload validation
- SQL injection prevention

---

## 15. Troubleshooting

### 15.1 Common Issues

#### Login Issues

| Problem | Solution |
|---------|----------|
| "Invalid credentials" | Check email/password for typos |
| "Account not verified" | Check email for verification link |
| "Account suspended" | Contact support |
| OTP not received | Check spam folder, wait 60 seconds |
| "Token expired" | Login again |

#### Property Posting Issues

| Problem | Solution |
|---------|----------|
| "Failed to save" | Check required fields |
| Images not uploading | Verify file size (< 25MB) and format |
| "Duplicate property" | Check if already listed |
| "Invalid location" | Select from autocomplete |

#### Payment Issues

| Problem | Solution |
|---------|----------|
| Payment failed | Try alternative method |
| Transaction not reflecting | Wait 5 minutes, refresh |
| Double charged | Contact support with transaction ID |
| Refund pending | Allow 5-7 business days |

#### General Issues

| Problem | Solution |
|---------|----------|
| Page not loading | Clear browser cache |
| Slow performance | Check internet connection |
| Images not showing | Disable ad blocker |
| Search not working | Check filters applied |

### 15.2 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check input data |
| 401 | Unauthorized | Login again |
| 403 | Forbidden | Contact admin for access |
| 404 | Not Found | Verify URL |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Check form fields |
| 429 | Too Many Requests | Wait and retry |
| 500 | Server Error | Try again later |
| 503 | Service Unavailable | System maintenance |

### 15.3 Debug Mode

Enable debug mode by adding `?debug=true` to URL:
- Shows API request/response logs
- Displays component render times
- Shows state changes

---

## 16. Support & Contact

### 16.1 Support Channels

| Channel | Availability | Response Time |
|---------|--------------|---------------|
| **In-app Chat** | 24/7 | Instant - 5 min |
| **Email** | 24/7 | 4-24 hours |
| **Phone** | 9 AM - 9 PM IST | Immediate |
| **WhatsApp** | 24/7 | 30 min - 2 hours |

### 16.2 Contact Details

**Technical Support:**
- Email: support@revo-home.com
- Phone: +91-XXXX-XXXXXX
- WhatsApp: +91-XXXX-XXXXXX

**Sales Inquiries:**
- Email: sales@revo-home.com
- Phone: +91-XXXX-XXXXXX

**Address:**
```
Revo-Homes Technologies Pvt. Ltd.
[Office Address]
[City, State, PIN]
India
```

### 16.3 Information to Provide

When contacting support, include:
- Registered email/phone
- Property ID (if applicable)
- Transaction ID (if payment issue)
- Screenshot (if UI issue)
- Browser and OS version
- Time when issue occurred

---

## 📱 Additional Features

### Cookie Consent
- GDPR-compliant cookie banner
- Preference management
- Analytics opt-in/opt-out
- Third-party cookie control

### Social Sharing
- Share properties on:
  - WhatsApp
  - Facebook
  - Twitter
  - LinkedIn
  - Email

### Notifications
- Browser push notifications
- Email alerts
- SMS notifications
- In-app notifications

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### PWA Features
- Add to home screen
- Offline support (partial)
- Push notifications
- Background sync

---

*End of Revo-Home Complete User Manual*

**Document Version**: 2.0  
**Last Updated**: May 2026  
**For Support**: support@revo-home.com

---
