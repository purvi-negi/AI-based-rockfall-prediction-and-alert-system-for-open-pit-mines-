# 🪨 ROCKFALL AI — Rockfall Prediction & Monitoring System
## Production-Grade React.js Frontend Application

An intelligent, geotechnical safety and slope failure early-warning system frontend built with **React 19**, **Vite**, **React Router v7**, **Recharts**, and **Lucide React**.

---

## 🎨 Design System: Rust Orange & White Theme
The UI follows a consistent, minimal, high-contrast geotechnical design system:

| Token Name | Hex Code | Visual Application |
| :--- | :--- | :--- |
| `--primary` | `#B84A1B` | Rust Orange — Primary brand, buttons, active nav, key metrics |
| `--primary-hover` | `#963B15` | Darker Rust Orange — Button hover states |
| `--primary-light` | `#FCE9DF` | Soft Orange — Selected badges, highlight cards |
| `--secondary` | `#E8A27E` | Warm Terracotta — Secondary chart fills and borders |
| `--background` | `#FFFFFF` | Pure White — Primary screen background |
| `--surface` | `#F5F3F0` | Warm Grey — Dashboard cards, table headers, stat tiles |
| `--sidebar` | `#292929` | Deep Charcoal — Fixed desktop sidebar & mobile drawer |
| `--text-primary` | `#252525` | Dark Charcoal — Headings, titles, high-readability text |
| `--text-secondary` | `#777777` | Neutral Grey — Subtitles, labels, timestamps |
| `--border` | `#E8E3DF` | Sandstone Grey — Clean borders, table dividers |
| `--success` | `#27865B` | Forest Green — SAFE classifications, active sensors, resolved alerts |
| `--warning` | `#E39A28` | Amber Orange — Medium risk, vibration warnings, acknowledged alerts |
| `--danger` | `#D83B3B` | Crimson Red — HAZARD alerts, critical slope displacement |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Lint Verification
```bash
npm run lint    # Zero errors, clean code
npm run build   # Production bundle with vendor & chart chunking
```

---

## 🔑 Demo Presentation Credentials

For viva and project demonstration, 1-click quick-fill buttons are provided on the login page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Lead Engineer / Admin** | `admin@rockfall.ai` | `rockfall2026` | Full CRUD for Mines & Sensors, Acknowledge & Resolve Alerts, Run Predictions, Audit History |
| **Field Operator (User)** | `operator@rockfall.ai` | `rockfall2026` | View-only Mines & Sensors, Run Predictions, View Telemetry & Alerts, Audit History |

> 💡 **Role Switcher Pill:** Click the role pill (`Role: ADMIN` / `Role: USER`) directly in the top navigation bar or user profile to demonstrate role-based permissions in real-time.

---

## 📁 Project Architecture

```
Frontend/
├── .env                     # Centralized API configuration
├── .env.example             # Example configuration template
├── package.json             # Dependencies (React 19, Recharts, Lucide, Axios, Router)
├── vite.config.js           # Vite configuration with chunk optimization
├── eslint.config.js         # ESLint configuration
├── src/
│   ├── assets/              # Static branding and assets
│   ├── components/
│   │   ├── Sidebar.jsx      # Fixed, collapsible, responsive charcoal sidebar
│   │   ├── Navbar.jsx       # Top navigation, search, notifications, role pill, profile
│   │   ├── StatCard.jsx     # Reusable warm grey KPI metric cards
│   │   ├── DataTable.jsx    # Responsive data table with pagination & custom renderers
│   │   ├── Loading.jsx      # Rust Orange animated loading indicators
│   │   └── ProtectedRoute.jsx # Route auth guard & permission checks
│   ├── pages/
│   │   ├── Login.jsx        # Login page with password toggle & demo quick-fill
│   │   ├── Register.jsx     # Operator registration form with validation
│   │   ├── Dashboard.jsx    # 8 KPI cards, hero prediction, risk pie chart, fleet status
│   │   ├── MineManagement.jsx   # Mine list, add/edit/delete modals, view details
│   │   ├── SensorManagement.jsx # IoT sensor list, type & mine filters, add/edit/delete
│   │   ├── LiveMonitoring.jsx   # 6 live metric tiles, 4 Recharts graphs, snapshot log
│   │   ├── RockfallPrediction.jsx # ML inference runner, probability gauge, factors
│   │   ├── AlertManagement.jsx  # Alert overview, acknowledge & resolve workflow
│   │   ├── PredictionHistory.jsx # Searchable & paginated historical prediction audits
│   │   └── UserProfile.jsx  # Operator credentials, access tier, demo role switcher
│   ├── services/
│   │   ├── api.js           # Centralized Axios client & mock data engine
│   │   └── authService.js   # Authentication & session token management
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentication state & session provider
│   │   └── useAuth.js       # Custom auth hook
│   ├── styles/
│   │   ├── global.css       # Root design tokens, typography, buttons, modals, badges
│   │   ├── dashboard.css    # Sidebar, topbar, grid systems, telemetry cards
│   │   └── auth.css         # Authentication card styling & demo account boxes
│   ├── App.jsx              # Router configuration & dashboard shell layout
│   └── main.jsx             # React 19 root bootstrap
```

---

## 🔗 Backend API Integration

The application is structured to connect seamlessly to your teammate's backend:

1. Configure your teammate's backend URL in `Frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_ENABLE_MOCK=false
   ```
2. When `VITE_ENABLE_MOCK=false`, `src/services/api.js` delegates all calls directly through Axios with JWT bearer tokens.
3. When `VITE_ENABLE_MOCK=true` (default), the built-in prototype engine automatically provides rich geotechnical data with realistic asynchronous delays and local storage persistence.
