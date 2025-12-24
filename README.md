# Sales Forecasting Dashboard

An interactive dashboard for sales prediction using time series analysis and machine learning algorithms. Provides actionable insights for business planning with the ability to import custom datasets.

## Features

- **Dataset Import**: Upload CSV files with your sales data via Firebase integration
- **Interactive Forecasting**: Multiple forecasting methods (Linear Regression, Exponential Smoothing, Moving Average)
- **Real-time Analytics**: Dynamic KPIs, growth metrics, and performance indicators
- **Visual Analytics**: Interactive charts with confidence intervals and trend analysis
- **Business Insights**: AI-generated recommendations and actionable insights
- **Configurable Parameters**: Adjust forecast periods, seasonality, and trend strength
- **Data Export**: Export forecasts and reports for business planning

## Dataset Format

Upload CSV files with the following required columns:

```csv
date,revenue,units
2023-01-01,45000,562
2023-02-01,48000,600
2023-03-01,52000,650
```

### Column Requirements:
- `date`: Date in YYYY-MM-DD format
- `revenue`: Sales revenue (numeric, positive)
- `units`: Units sold (numeric, positive)

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Storage
3. Copy your Firebase configuration
4. Create a `.env` file based on `.env.example`
5. Add your Firebase credentials to the `.env` file

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Firebase configuration in `.env`

3. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Charts**: Custom SVG-based interactive charts
- **Backend**: Firebase (Firestore + Storage)
- **Data Processing**: Papa Parse for CSV handling
- **Forecasting**: Custom JavaScript algorithms

## Forecasting Methods

1. **Linear Regression**: Trend-based forecasting with seasonal adjustments
2. **Exponential Smoothing**: Weighted historical data with trend projection
3. **Moving Average**: Simple average-based prediction with trend analysis

## Business Intelligence Features

- Revenue growth analysis
- Seasonal pattern detection
- Forecast accuracy metrics
- Growth trend indicators
- Actionable business recommendations
- Risk assessment and opportunity identification

## Data Security

- All data is stored securely in Firebase
- Client-side data validation
- Encrypted data transmission
- User data isolation and privacy protection
- 

# plz try avoiding entering file other than .csc or .xlsv(converted to csv) as the app may not be able to give results for such case.
- do not exploit app the copyright  is for fair use only
