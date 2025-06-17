# Real-Time Stock Data Integration

## Overview

StockVision Pro features a comprehensive real-time stock data integration system that provides live market data through multiple APIs, WebSocket connections, and intelligent fallback mechanisms.

## Architecture

### Data Sources

1. **Alpha Vantage (Primary)**
   - Real-time quotes and historical data
   - Company fundamentals
   - News sentiment analysis
   - Rate limit: 5 calls/minute (free tier)

2. **Yahoo Finance (Fallback)**
   - Real-time quotes and charts
   - Batch quote requests
   - Higher rate limits
   - No API key required

3. **Finnhub (WebSocket)**
   - Real-time streaming data
   - WebSocket connections for live updates
   - Professional-grade data feeds

### Core Features

- **Real-time price updates every 5 seconds during market hours**
- **WebSocket connections for live data streaming**
- **Intelligent caching to reduce API calls**
- **Robust error handling and rate limit management**
- **Market hours detection and after-hours trading display**
- **Multiple exchange support (NYSE, NASDAQ, international)**
- **Currency conversion for international stocks**
- **Batch API calls for multiple stocks**
- **Data validation and sanitization**
- **Automatic fallback between data sources**

## API Functions

### Core Data Functions

```typescript
// Get current stock price
const price = await realTimeDataService.getCurrentPrice('AAPL')

// Get historical data
const historical = await realTimeDataService.getHistoricalData('AAPL', '1y', '1d')

// Get company information
const companyInfo = await realTimeDataService.getCompanyInfo('AAPL')

// Batch quotes for multiple symbols
const quotes = await realTimeDataService.getBatchQuotes(['AAPL', 'GOOGL', 'MSFT'])

// Search for stocks
const searchResults = await realTimeDataService.searchStocks('Apple')

// Get news
const news = await realTimeDataService.getNews('AAPL')
```

### Real-Time Subscriptions

```typescript
// Subscribe to real-time updates
const unsubscribe = realTimeDataService.subscribeToRealTimeUpdates(
  ['AAPL', 'GOOGL'], 
  (quote) => {
    console.log('Real-time update:', quote)
  }
)

// Unsubscribe when done
unsubscribe()
```

### Market Hours Detection

```typescript
// Get market hours for an exchange
const marketHours = realTimeDataService.getMarketHours('NASDAQ')
console.log('Market is open:', marketHours.isOpen)
console.log('Current session:', marketHours.session) // 'regular', 'pre-market', 'after-hours', 'closed'
```

### Currency Conversion

```typescript
// Convert currency
const convertedAmount = await realTimeDataService.convertCurrency(100, 'USD', 'EUR')
```

## React Hooks

### useRealTimeData Hook

```typescript
import { useRealTimeData } from '@/hooks/useRealTimeData'

function StockComponent() {
  const {
    data,
    quote,
    historicalData,
    marketHours,
    loading,
    error,
    lastUpdated,
    refresh
  } = useRealTimeData({
    symbol: 'AAPL',
    enableRealTime: true,
    updateInterval: 5000,
    autoRefresh: true
  })

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Price: ${quote?.price}</p>
      <p>Change: {quote?.changePercent}%</p>
      <p>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
    </div>
  )
}
```

### useMultipleStocks Hook

```typescript
import { useMultipleStocks } from '@/hooks/useRealTimeData'

function WatchlistComponent() {
  const {
    quotes,
    loading,
    error,
    refresh
  } = useMultipleStocks({
    symbols: ['AAPL', 'GOOGL', 'MSFT'],
    enableRealTime: true
  })

  return (
    <div>
      {Array.from(quotes.entries()).map(([symbol, quote]) => (
        <div key={symbol}>
          <span>{symbol}: ${quote.price}</span>
        </div>
      ))}
    </div>
  )
}
```

## Configuration

### Environment Variables

```bash
# Alpha Vantage API Key
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_api_key_here

# Finnhub API Key
NEXT_PUBLIC_FINNHUB_API_KEY=your_api_key_here

# WebSocket URL
NEXT_PUBLIC_WEBSOCKET_URL=wss://ws.finnhub.io
```

### Data Source Priority

1. **Alpha Vantage** (Priority 1) - Primary data source
2. **Yahoo Finance** (Priority 2) - Fallback for quotes and historical data
3. **Finnhub** (Priority 3) - WebSocket streaming and additional data

## Caching Strategy

### Cache Configuration

- **Default TTL**: 5 seconds for real-time data
- **Historical Data**: 5 minutes
- **Company Info**: 1 hour
- **Search Results**: 5 minutes
- **Currency Rates**: 1 hour

### Cache Management

```typescript
// Manual cache control
realTimeDataService.setCache('key', data, 30000) // 30 seconds TTL
const cached = realTimeDataService.getCache('key')
```

## Error Handling

### Retry Logic

- **Exponential backoff** for failed requests
- **Rate limit detection** and automatic retry
- **Circuit breaker** pattern for failing APIs
- **Graceful degradation** to fallback sources

### Error Types

```typescript
interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: number
  source: string
  rateLimit?: {
    remaining: number
    reset: number
  }
}
```

## WebSocket Integration

### Connection Management

- **Automatic reconnection** with exponential backoff
- **Heartbeat mechanism** to maintain connections
- **Subscription management** for multiple symbols
- **Graceful fallback** to polling when WebSocket fails

### Message Handling

```typescript
// WebSocket message format
interface WebSocketMessage {
  type: 'trade' | 'quote' | 'ping' | 'pong'
  symbol?: string
  price?: number
  volume?: number
  timestamp?: number
}
```

## Market Hours Support

### Supported Exchanges

- **NASDAQ** (US) - 9:30 AM - 4:00 PM ET
- **NYSE** (US) - 9:30 AM - 4:00 PM ET
- **LSE** (UK) - 8:00 AM - 4:30 PM GMT
- **TSE** (Japan) - 9:00 AM - 3:00 PM JST

### Trading Sessions

- **Pre-market**: 4:00 AM - 9:30 AM ET
- **Regular**: 9:30 AM - 4:00 PM ET
- **After-hours**: 4:00 PM - 8:00 PM ET
- **Closed**: Outside trading hours

## Performance Optimization

### Batch Operations

```typescript
// Efficient batch processing
const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
const quotes = await realTimeDataService.getBatchQuotes(symbols)
```

### Connection Pooling

- **WebSocket connection reuse** for multiple subscriptions
- **HTTP connection pooling** for API requests
- **Request deduplication** for identical calls

### Memory Management

- **Automatic cache cleanup** for expired entries
- **Subscription cleanup** on component unmount
- **Memory leak prevention** with proper event listeners

## Testing

### Mock Data

The service includes comprehensive mock data for development and testing:

```typescript
// Enable/disable real-time service
const stockApi = new StockApiService()
stockApi.useRealTimeService = false // Use mock data
```

### Integration Testing

```typescript
// Test real-time updates
const testSubscription = realTimeDataService.subscribeToRealTimeUpdates(
  ['AAPL'],
  (quote) => {
    expect(quote.symbol).toBe('AAPL')
    expect(quote.price).toBeGreaterThan(0)
  }
)
```

## Monitoring and Analytics

### Performance Metrics

- **API response times**
- **Cache hit rates**
- **WebSocket connection stability**
- **Error rates by data source**

### Rate Limit Monitoring

```typescript
// Monitor rate limits
const response = await realTimeDataService.makeApiCall(url, source)
console.log('Rate limit remaining:', response.rateLimit?.remaining)
```

## Best Practices

1. **Always handle errors gracefully**
2. **Use caching to minimize API calls**
3. **Implement proper cleanup for subscriptions**
4. **Monitor rate limits and implement backoff**
5. **Use batch operations when possible**
6. **Implement circuit breakers for failing services**
7. **Cache currency conversion rates**
8. **Validate and sanitize all incoming data**

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**
   - Solution: Implement exponential backoff
   - Check cache configuration
   - Use batch operations

2. **WebSocket Connection Failed**
   - Solution: Automatic fallback to polling
   - Check network connectivity
   - Verify API keys

3. **Stale Data**
   - Solution: Adjust cache TTL
   - Force refresh when needed
   - Monitor last update timestamps

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('debug', 'stockvision:*')
```
