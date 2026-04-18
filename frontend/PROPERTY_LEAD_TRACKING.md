# Property Lead Tracking - Usage Guide

## 🎯 Overview

The property lead tracking system has been successfully implemented with the following components:

### 📁 Files Created/Updated:

1. **`usePropertyLeadTracker.js`** - Custom hook for lead tracking logic
2. **`PropertyCard.jsx`** - Updated with lead tracking integration  
3. **`PropertyCardDemo.jsx`** - Demo component showing usage

## 🚀 How to Use

### Basic Usage:

```jsx
import PropertyCard from './components/PropertyCard';

function PropertyList() {
  const handlePropertyClick = (data) => {
    console.log('Property clicked:', data);
    // data.leadGenerated - boolean indicating if lead was generated
    // data.isViewed - boolean indicating if property was already viewed
    // data.property - full property object
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          {...property}
          onPropertyClick={handlePropertyClick}
          showViewedBadge={true}
        />
      ))}
    </div>
  );
}
```

### PropertyCard Props:

```jsx
<PropertyCard
  // Existing props (unchanged)
  id="prop-1"
  title="Luxury Apartment"
  price={45000000}
  location="Bangalore"
  // ... other existing props
  
  // New props for lead tracking
  onPropertyClick={handlePropertyClick}     // Callback for click events
  showViewedBadge={true}             // Show "Viewed" badge for clicked properties
/>
```

## 🔄 Lead Tracking Flow:

1. **First Click**: 
   - ✅ Generates lead (logs to console)
   - ✅ Marks property as "viewed" 
   - ✅ Shows "Viewed" badge on subsequent renders
   - ✅ Navigates to property details

2. **Subsequent Clicks**:
   - ⚠️ No lead generation
   - ✅ Direct navigation to property details
   - ✅ "Viewed" badge remains visible

3. **Console Output**:
   ```
   propertyId: prop-1, userId: user-123
   Lead generated for propertyId: prop-1, userId: user-123
   ```

## 🎨 Features Implemented:

### ✅ Core Requirements:
- ✅ Capture `propertyId` and `userId` on click
- ✅ First-click-only tracking per property per user
- ✅ Console logging of `propertyId` and `userId`
- ✅ Frontend-only lead generation (no API calls)
- ✅ Modular, clean React code
- ✅ Separation of concerns (UI, logic, storage)
- ✅ Edge case handling (missing userId, undefined propertyId)
- ✅ Performance optimized (prevents rapid clicks)

### 🎁 Bonus Features:
- ✅ Visual "Viewed" badge after first click
- ✅ Debounced rapid click prevention
- ✅ localStorage persistence
- ✅ Comprehensive error handling

## 🔧 Integration Points:

### For Backend Integration:
Replace the console log in `usePropertyLeadTracker.js` line 45:

```javascript
// Current (frontend only):
console.log(`Lead generated for propertyId: ${propertyId}, userId: ${userId}`);

// Future (backend integration):
await api.post('/leads', { propertyId, userId });
```

### For Analytics:
Add analytics tracking in the `handlePropertyClick` callback:

```javascript
const handlePropertyClick = (data) => {
  // Analytics tracking
  analytics.track('property_lead_generated', {
    propertyId: data.property.id,
    propertyType: data.property.propertyType,
    location: data.property.location,
    timestamp: new Date().toISOString()
  });
};
```

## 🧪 Testing:

1. Open `PropertyCardDemo.jsx` in your browser
2. Open browser console
3. Click on different property cards
4. Observe console output and badge behavior
5. Refresh page to test localStorage persistence

## 📱 Mobile Responsive:

The implementation is fully responsive and works across all device sizes with proper touch event handling.
