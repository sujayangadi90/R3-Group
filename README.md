# R3 Group | Ultra-Luxury Real Estate Advisory Platform

A dynamic, full-stack, mobile-responsive web platform with an administrative control desk engineered for **R3 Group**.

Built strictly following the **R3 Group Real Estate Architecture Design System** (`DESIGN.md`):
- **Aesthetic**: Warm Modern Corporate Minimalism, architectural precision, Plus Jakarta Sans & Inter typography.
- **Palette**: Deep Charcoal Black (`#1F1F1F`), Refined Warm Gold (`#B58A3A`), Cream Alabaster (`#FDF9F5`), and Pure White (`#FFFFFF`).

---

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Vite, React Router 6
- **Backend**: Node.js (ES Modules), Express.js, JWT Authentication
- **Database**: MongoDB (Mongoose ODM)
- **Responsive**: 100% mobile, tablet, and desktop adaptive layout

---

## 🔑 Admin Panel Credentials

The platform includes a dedicated administrative terminal:
- **URL**: `/admin/login` (or click the user icon in the top header)
- **Username**: `admin`
- **Password**: `ramesh`

### Admin Capabilities:
1. **Enquiries Management Desk**:
   - Collects, filters, and monitors incoming client requests:
     - **Private Site Visits** (with preferred dates, timeslots, and client notes)
     - **Sell Property Submissions** (with target price, carpet area, configuration, and owner contact details)
     - **General Advisory Inquiries**
   - Live status workflow tracking: `New`, `Contacted`, `In Discussion`, `Closed`
   - Internal advisory notes per client lead
   - Export leads to CSV for family office reporting
2. **Properties Management Desk**:
   - Full CRUD: Add, Edit, Delete luxury property listings
   - Manage price (numeric & display formatting in Indian ₹ Cr / ₹ Lakhs), location, BHK, carpet area, status
   - One-click toggle for **Exclusive Featured** listings
   - Multi-photo gallery URLs management
   - Amenities and RERA certificate tracking

---

## 🌐 Public Website Sections

1. **Home (`/`)**:
   - Hero banner ("Find a Property That Feels Like Home")
   - Multi-criteria real-time search bar (Location, Category, BHK)
   - Institutional track record bar (₹ 2,400+ Cr transacted, 450+ families, 18+ years)
   - Curated Featured Properties showcase
   - Asset specialization categories (Penthouses, Luxury Apartments, Coastal Villas, Commercial Floorplates, Freehold Plots)
   - The Three Pillars of R3 Advisory (Absolute Discretion, Architectural Reverence, Institutional Rigor)
   - Discreet divestment consultation banner
2. **Buy Property / Portfolio (`/properties`)**:
   - Search by keyword, filter by Property Type, Location, Configuration (3/4/5+ BHK), and Status
   - Sort by Newest, Price (Low to High / High to Low), or Area
   - Instant "Schedule Site Visit" modal
3. **Property Details (`/properties/:id`)**:
   - High-definition architectural photo gallery with thumbnail switcher
   - Specifications strip (BHK, carpet area, floor elevation, possession date)
   - Architectural Overview & Technical Specifications
   - Full residence amenities with iconography
   - Strategic locality & commute landmarks
   - Sticky VIP site inspection booking card
4. **Sell Property (`/sell`)**:
   - Dedicated divestment desk for high-net-worth property owners
   - Asset submission form with instant database collection
5. **About Us (`/about`)**:
   - Heritage, philosophy, executive emblem, and operational track record
6. **Contact Us (`/contact`)**:
   - Registered Mumbai office (Maker Chambers VI, Nariman Point)
   - Direct phone concierge (+91 022 4900 8800) and email (`concierge@r3group.in`)
   - Interactive FAQs accordion and direct advisory dispatch form

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on default port `27017` (e.g. `mongodb://127.0.0.1:27017/r3_group_real_estate`)

### 2. Seed Database
To populate the database with luxury listings and sample enquiries:
```bash
npm run seed
```

### 3. Start Development Servers
To run both backend API (port `5001`) and frontend (port `3000`) simultaneously:
```bash
# Terminal 1 - Backend Server:
npm run dev:server

# Terminal 2 - Frontend Client:
npm run dev:client
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Mode
```bash
npm run build
npm start
```
The Express server will serve both the REST API and the compiled React frontend at [http://localhost:5001](http://localhost:5001).
