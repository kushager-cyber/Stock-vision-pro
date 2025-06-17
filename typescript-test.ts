// TypeScript test to verify the fixes work
type AnalystRating = 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

// Test the exact code that was failing
const analystRating: AnalystRating = (['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'] as const)[Math.floor(Math.random() * 5)]
const riskLevel: RiskLevel = (['Low', 'Medium', 'High', 'Very High'] as const)[Math.floor(Math.random() * 4)]

console.log('TypeScript test passed!', { analystRating, riskLevel })

export { analystRating, riskLevel }
