# Treasure Fortune - Muslim Cooperative Dashboard

A modern, responsive dashboard for a Muslim cooperative web application built with HTML, CSS, and JavaScript.

## 🌟 Features

### 1. **Top Navbar**
- App logo and branding
- User profile with avatar and dropdown menu
- Notifications icon with badge counter
- Dark mode toggle

### 2. **Collapsible Sidebar**
- Dashboard (home)
- My Loans
- Savings
- Payments
- Transactions History
- Profile Settings
- Logout

### 3. **Dashboard Content**

#### Welcome Section
- Islamic greeting: "As-salamu alaykum"
- Personalized user name
- Motivational message

#### Summary Cards
- **Total Savings Balance** - Shows current savings with trend indicator
- **Active Loan Amount** - Displays active loan with tenure info
- **Remaining Loan Balance** - Shows remaining balance with payment progress
- **Next Payment Due Date** - Displays upcoming payment with countdown

#### Loan Section
- Active loan details (amount, remaining balance, monthly payment)
- Visual progress bar for repayment tracking
- "Make Repayment" action button
- Empty state when no active loan exists

#### Savings Section
- Current savings balance display
- Monthly contribution stats
- Total contributions counter
- "Add Savings" action button

#### Recent Transactions
- Last 5 transactions displayed
- Transaction type indicators (Savings/Loan/Payment)
- Amount with positive/negative styling
- Status badges (Completed/Pending)
- "View All" link for full history

#### Meeting Info Card
- Next cooperative meeting details
- Date, time, and location
- Visual date badge
- "Add to Calendar" button
- Reminder notification badge

## 🎨 Design Features

### Color Theme
- **Primary Color**: Emerald Green (#10b981) - Islamic-friendly aesthetic
- **Accent Colors**: Success, Warning, Danger, Info variants
- **Dark Mode**: Full dark theme support with localStorage persistence

### UI/UX Elements
- Clean fintech-inspired design
- Soft shadows and rounded cards
- Smooth transitions and animations
- Loading skeleton screens
- Empty state illustrations
- Notification toast system
- Responsive hover effects

## 📱 Responsive Design

### Mobile-First Approach
- **Desktop (>992px)**: Full sidebar, expanded layout
- **Tablet (768px-992px)**: Collapsible sidebar, optimized grid
- **Mobile (<768px)**: Hamburger menu, stacked layout, touch-optimized

### Breakpoints
- 1200px: Adjusts dashboard grid
- 992px: Switches to single column layout
- 768px: Mobile sidebar overlay
- 480px: Compact mobile view

## 🚀 Getting Started

### Installation
1. Clone or download the project
2. Open `dashboard.html` in a modern web browser
3. No build process or dependencies required!

### File Structure
```
treasure-fortune/
├── dashboard.html          # Main dashboard page
├── css/
│   └── styles.css         # All styling and responsive design
├── js/
│   └── app.js            # JavaScript functionality and mock data
└── README.md             # Project documentation
```

## 💡 Features Implementation

### Dark Mode
- Toggle button in navbar
- Persists preference in localStorage
- Smooth theme transitions
- Optimized color contrast

### Mock Data
The dashboard uses mock/dummy data for demonstration:
- User profile information
- Financial summary (savings, loans, payments)
- Transaction history
- Meeting schedules

### Interactive Elements
- Collapsible sidebar (desktop) / Overlay sidebar (mobile)
- Profile dropdown menu
- Active navigation highlighting
- Button click handlers
- Notification system
- Smooth scrolling

### Loading States
- Skeleton loaders for summary cards
- Delayed data loading simulation
- Progressive content rendering

## 🎯 Technical Highlights

### Clean Code Structure
- Semantic HTML5 markup
- CSS custom properties (variables)
- Modular JavaScript functions
- Component-based design approach

### Performance
- Minimal external dependencies (Font Awesome CDN only)
- Optimized CSS animations
- Efficient DOM manipulation
- LocalStorage for theme persistence

### Accessibility
- Semantic HTML elements
- ARIA-friendly structure
- Keyboard navigation support
- High contrast ratios

## 🔧 Customization

### Changing Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #10b981;
    --primary-dark: #059669;
    /* ... other colors */
}
```

### Updating Mock Data
Edit the `mockData` object in `js/app.js`:
```javascript
const mockData = {
    user: { /* user data */ },
    summary: { /* financial summary */ },
    transactions: [ /* transaction list */ ]
};
```

### Adding New Features
1. Add HTML structure in `dashboard.html`
2. Style with CSS in `css/styles.css`
3. Add functionality in `js/app.js`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Future Enhancements

- Backend API integration
- Real-time data updates
- Advanced filtering and search
- Export transactions to PDF/Excel
- Multi-language support (Arabic)
- Push notifications
- Biometric authentication
- Payment gateway integration

## 🤝 Islamic Finance Principles

This dashboard is designed with Islamic finance principles in mind:
- No interest-based transactions (Riba-free)
- Cooperative/mutual assistance model (Ta'awun)
- Transparent financial tracking
- Community-focused features

## 📄 License

This project is open source and available for educational and commercial use.

## 👨‍💻 Developer Notes

Built with vanilla JavaScript - no frameworks required. The code is well-commented and structured for easy understanding and modification.

---

**As-salamu alaykum!** May your wealth grow with blessings. 🌟
