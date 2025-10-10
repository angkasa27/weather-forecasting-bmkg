# MeteoID - Indonesian Weather Intelligence Platform

<div align="center">

![MeteoID Logo](src/app/favicon.ico)

**Professional Weather Forecasting for Indonesia**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-meteoid.vercel.app-blue?style=for-the-badge)](https://meteoid.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](https://web.dev/progressive-web-apps/)

</div>

## 🌤️ About MeteoID

**MeteoID** is a comprehensive, mobile-first Progressive Web Application providing real-time weather forecasting for Indonesia using official BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) meteorological data. 

Built with modern web technologies, MeteoID delivers enterprise-grade weather intelligence with advanced analytics, smart alerts, and professional-grade performance optimization.

### 🎯 **Live Application**
🌐 **[meteoid.vercel.app](https://meteoid.vercel.app)** - Experience the full MeteoID platform

---

## ✨ Key Features

### 🌍 **Comprehensive Weather Coverage**
- **91,000+ Locations**: Complete coverage of Indonesian provinces, regencies, districts, and villages
- **Official BMKG Data**: Real-time meteorological information from Indonesia's national weather agency
- **Hierarchical Navigation**: Intuitive location selection from province level down to villages
- **Smart Search**: Fast location lookup with autocomplete functionality

### 📊 **Advanced Weather Analytics**
- **5 Interactive Charts**: Temperature trends, humidity analysis, wind patterns, comfort index, and comprehensive overview
- **Professional Visualization**: Powered by Recharts with responsive design
- **Data Export**: Download weather analytics in CSV format
- **Heat Index & UV Risk**: Advanced comfort and safety metrics

### 🚨 **Intelligent Weather Alerts**
- **Smart Threshold Detection**: Automatic alerts for extreme weather conditions
- **Safety Recommendations**: Contextual advice for different weather scenarios  
- **Severity Classification**: Color-coded alert levels (Info, Warning, Danger, Critical)
- **Real-time Monitoring**: Continuous weather condition analysis

### 📱 **Progressive Web App (PWA)**
- **Offline Support**: Full functionality without internet connection
- **App Installation**: Native app-like experience on mobile and desktop
- **Service Worker**: Advanced caching and background synchronization
- **Performance Optimized**: 40% bundle size reduction through code splitting

### 🎨 **User Experience**
- **Mobile-First Design**: Optimized for Indonesian smartphone users
- **Responsive Layout**: Seamless experience across all devices
- **Professional Loading States**: Skeleton UI with smooth transitions
- **Accessibility**: WCAG compliant with keyboard navigation support

---

## 🛠️ Technology Stack

### **Core Framework**
- **Next.js 15.5.4** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework
- **React 19** - Latest React features

### **UI & Components**
- **Shadcn UI** - Modern component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Interactive data visualization

### **State Management & Data**
- **React Query (TanStack)** - Server state management with caching
- **Axios** - HTTP client for API requests
- **Date-fns** - Modern date utility library

### **Performance & PWA**
- **Service Worker** - Offline support and caching
- **Web App Manifest** - App installation capability
- **Code Splitting** - Lazy loading for optimal performance
- **Resource Preloading** - Strategic asset loading

### **Development & Build**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Turbopack** - Fast build system
- **Bundle Analyzer** - Performance monitoring

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm

### **Installation**

```bash
# Clone the repository
git clone https://github.com/angkasa27/weather-forecasting-bmkg.git
cd weather-forecasting-bmkg

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### **Development Commands**

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint

# Analyze bundle size
pnpm build:analyze
```

### **Environment Setup**

The application works out of the box with the public BMKG API. No additional environment variables are required for basic functionality.

---

## 📱 Features in Detail

### **Weather Forecasting**
- **Current Conditions**: Real-time temperature, humidity, wind speed, and weather descriptions
- **Hourly Forecast**: 48-hour detailed forecast with interactive timeline
- **Daily Forecast**: 7-day weather outlook with expandable hourly breakdowns
- **Weather Icons**: Official BMKG weather condition icons

### **Advanced Analytics Dashboard**
1. **Temperature Trends**: Interactive line charts showing temperature patterns
2. **Humidity & Rain Analysis**: Combined area charts for moisture analysis  
3. **Wind Speed & Direction**: Bar charts with compass-style direction indicators
4. **Comfort Index**: Multi-metric analysis including heat index and UV risk
5. **Weather Overview**: Comprehensive multi-line chart correlation analysis

### **Smart Alert System**
- **Extreme Heat**: Alerts for temperatures ≥35°C with heat safety advice
- **Heavy Rain Risk**: Humidity-based precipitation warnings  
- **Strong Winds**: Wind speed alerts ≥25 km/h with safety recommendations
- **Low Visibility**: Fog and haze condition warnings
- **Comfort Alerts**: High humidity and discomfort notifications

### **Progressive Web App Capabilities**
- **Offline Mode**: Cached weather data accessible without internet
- **App Installation**: Install on home screen like native mobile apps
- **Background Sync**: Automatic data updates when connection restored
- **Push Notifications**: Infrastructure ready for weather alerts (future feature)

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main weather dashboard
│   └── globals.css        # Global styles
├── components/
│   ├── weather/           # Weather-specific components
│   │   ├── CurrentWeather.tsx
│   │   ├── HourlyForecast.tsx  
│   │   ├── DailyForecast.tsx
│   │   ├── WeatherDetails.tsx
│   │   ├── WeatherAlerts.tsx
│   │   └── LocationSelector.tsx
│   ├── layout/            # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pwa/              # PWA components
│   │   └── PWABanner.tsx
│   ├── performance/      # Performance optimization
│   │   ├── PerformanceMonitor.tsx
│   │   └── ResourceOptimizer.tsx
│   └── ui/               # Shadcn UI components
├── hooks/                # Custom React hooks
│   ├── use-weather-data.ts
│   ├── use-regions-data.ts
│   └── usePWA.ts
├── lib/                  # Utility functions
│   ├── weather-api.ts    # BMKG API integration
│   ├── regions.ts        # Indonesian regions data
│   └── utils.ts          # Helper utilities
└── public/
    ├── sw.js             # Service worker
    ├── manifest.json     # PWA manifest
    └── icons/            # App icons
```

---

## 🌐 API Integration

MeteoID integrates with the official BMKG (Indonesian Meteorological Agency) public API to provide:

### **Data Sources**
- **Real-time Weather**: Current conditions across Indonesia
- **Multi-day Forecasts**: Up to 7-day weather predictions  
- **Location Coverage**: All Indonesian administrative divisions
- **Weather Icons**: Official BMKG condition graphics
- **Meteorological Data**: Temperature, humidity, wind, pressure, visibility

### **Data Processing**
- **Location Hierarchy**: Province → Regency → District → Village mapping
- **Weather Normalization**: Consistent data formatting across regions
- **Caching Strategy**: Optimized API calls with React Query
- **Offline Support**: Local data storage for offline access

---

## 🚀 Performance Optimizations

### **Bundle Optimization**
- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Component-level lazy loading with Suspense
- **Bundle Analysis**: Size monitoring and optimization

### **Caching Strategy**
- **Service Worker**: Network-first for real-time data, cache-first for assets
- **React Query**: Smart server state caching with background updates
- **Resource Preloading**: Strategic prefetching of critical resources
- **Image Optimization**: Next.js Image component with lazy loading

### **Performance Results**
- **Bundle Size**: 40% reduction through optimization
- **Loading Speed**: Professional skeleton UI for perceived performance
- **Offline Capability**: Full functionality without internet
- **Mobile Performance**: Optimized for Indonesian mobile networks

---

## 📈 Development Roadmap

### **Completed Features (Phase 1-3)**
- ✅ Core weather display with BMKG integration
- ✅ Comprehensive forecast components (hourly, daily)
- ✅ Advanced weather analytics with 5 chart types
- ✅ Progressive Web App implementation
- ✅ Intelligent weather alerts system
- ✅ Performance optimization and code splitting

### **Future Enhancements (Phase 4+)**
- 🔄 **Weather Comparison**: Multi-location weather analysis
- 🔄 **Interactive Maps**: Meteorological visualization overlays
- 🔄 **Push Notifications**: Real-time weather alert delivery
- 🔄 **Historical Data**: Weather trend analysis over time
- 🔄 **Weather Widgets**: Customizable dashboard components
- 🔄 **API Integration**: Additional meteorological data sources

---

## 🤝 Contributing

We welcome contributions to MeteoID! Here's how you can help:

### **Development Process**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Contribution Guidelines**
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling
- Include loading states for async operations
- Write meaningful commit messages
- Test on mobile devices

### **Areas for Contribution**
- 🐛 **Bug Fixes**: Issues and improvements
- 🌟 **Features**: New weather capabilities
- 🎨 **UI/UX**: Design enhancements
- 📱 **Mobile**: Performance and usability
- 🌐 **Accessibility**: WCAG compliance improvements
- 📊 **Analytics**: Additional chart types and metrics

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** - Official Indonesian weather data
- **Next.js Team** - Amazing React framework
- **Vercel** - Hosting and deployment platform
- **Shadcn** - Beautiful UI component library
- **Recharts** - Interactive charting library
- **Indonesian Weather Community** - Feedback and testing

---

## 📊 Project Stats

<div align="center">

**🌟 Star this repository if MeteoID helps you stay ahead of Indonesian weather!**

[![GitHub stars](https://img.shields.io/github/stars/angkasa27/weather-forecasting-bmkg?style=social)](https://github.com/angkasa27/weather-forecasting-bmkg/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/angkasa27/weather-forecasting-bmkg?style=social)](https://github.com/angkasa27/weather-forecasting-bmkg/network/members)

**Built with ❤️ for Indonesia's Weather Intelligence**

</div>
