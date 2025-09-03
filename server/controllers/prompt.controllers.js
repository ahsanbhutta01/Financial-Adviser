import Prompt from "../models/prompt.model.js"
import User from "../models/user.model.js"
import axios from "axios"
import slugify from "@sindresorhus/slugify"
import { validateAndTransformResponse } from "../utils/validateAndTransformResponse.js"
import dotenv from 'dotenv'
dotenv.config()

function cleanTitle(rawTitle) {
  const cleanedTitle = slugify(rawTitle, {
    remove: /[^\w\s]/g,
    lower: false,
    strict: true,
  }).replace(/-/g, " ")

  // Capitalize the first letter of each word
  return cleanedTitle
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

async function giveAdvice(req, res) {
  try {
    const { investment, risk, tradeType } = req.body

    const uID = req.userId
    const getUser = await User.findById(uID)
    if (!getUser) {
      res.json({ success: false, msg: "Please authenticate yourself!" })
      return;
    }

    // 1. Fetch top 25 crypto markets from CoinGecko
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: "1h,24h,7d",
      },
    })
    const coinGeckoData = response.data // raw market data

    // 2. Enhanced market analysis prompt
    const summaryResp = await axios.post(
      //deepseek/deepseek-chat-v3-0324:free
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [
          {
            role: "system",
            content: `You are a professional cryptocurrency market analyst with expertise in technical analysis, fundamental analysis, and market sentiment. 
            Your analysis is data-driven, balanced, and considers multiple factors including price action, volume, market trends, and on-chain metrics.`,
          },
          {
            role: "user",
            content: `
            Analyze the following cryptocurrency market data and provide a comprehensive market assessment: ${JSON.stringify(coinGeckoData)}

            Please include:

            1. **Market Overview**: Analyze the overall cryptocurrency market direction, key support/resistance levels, and general sentiment.
            
            2. **Top Performers Analysis**: Identify cryptocurrencies showing strong momentum and analyze the reasons behind their performance.
            
            3. **Underperformers Analysis**: Identify cryptocurrencies that are underperforming and analyze potential reasons.
            
            4. **Volume Analysis**: Analyze trading volumes and what they indicate about market interest and potential price movements.
            
            5. **Market Sentiment**: Determine if the overall market sentiment is bullish, bearish, or neutral with clear reasoning.
            
            6. **Key Levels to Watch**: Identify important price levels for major cryptocurrencies that could act as support or resistance.
            
            7. **Risk Assessment**: Evaluate the current market risk level (low, medium, high) with justification.

            Format your response in clear sections with concise, actionable insights suitable for both new and experienced cryptocurrency investors.
            `,
          },
        ],
        max_tokens: 1500,
        temperature:0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API}`,
          "Content-Type": "application/json",
        },
      },
    )
    const marketSummary = summaryResp.data.choices[0].message.content

    // 3. Create trade-type specific instructions
    let tradeSpecificInstructions = ""
    let responseFormat = ""

    if (tradeType.toLowerCase() === "future") {
      tradeSpecificInstructions = `
### Futures Trading Parameters
- Investment amount: $${investment}
- Risk tolerance: ${risk}% per trade (maximum acceptable loss per position)
- Trading type: Futures trading with leverage
- Time horizon: Short to medium-term positions based on market volatility and momentum

### Requirements
Based on the current market conditions and the investor profile, create a comprehensive futures trading strategy that:

1. Allocates the $${investment} investment across 3-5 cryptocurrencies with specific USD amounts and percentages
2. For each recommended cryptocurrency:
   - Recommend appropriate leverage (1x-20x) based on volatility and risk profile
   - Provide a specific entry price range based on technical analysis
   - Set target take-profit levels (multiple targets recommended)
   - Set a stop-loss level that aligns with the ${risk}% risk tolerance
   - Calculate and display the liquidation price based on the leverage
   - Specify the recommended position duration (hours, days, weeks)
   - Explain the rationale using technical indicators, momentum, and market structure
   - Include funding rate considerations for perpetual futures
   - Provide a practical example of the trade with P&L calculations at different scenarios

3. Include a comprehensive risk management strategy specific to futures trading:
   - Position sizing with leverage considerations
   - Partial profit-taking strategy
   - Stop loss adjustment techniques
   - Hedging strategies if applicable
   - Guidance on managing liquidation risk
      `

      responseFormat = `
### Response Format
Respond ONLY with a valid JSON object in the following format with no markdown formatting or additional text:

{
  "market_explanation": "A concise, insightful summary of the current market situation highlighting key opportunities and risks",
  "allocations": [
    {
      "asset": "Cryptocurrency name and ticker",
      "amount_usd": Exact USD amount to invest,
      "percentage": "Percentage of total portfolio",
      "recommended_leverage": "Specific leverage recommendation (e.g., 5x)",
      "entry_range": "Specific price range for entry",
      "take_profit_levels": ["Level 1 price", "Level 2 price", "Level 3 price"],
      "stop_loss": "Specific stop loss price",
      "liquidation_price": "Calculated liquidation price based on leverage",
      "position_duration": "Specific timeframe (hours, days, weeks)",
      "funding_rate_strategy": "How to manage funding rates for this position",
      "rationale": "Detailed explanation of why this cryptocurrency is recommended for futures trading",
      "example": "Practical example of the trade with P&L calculations"
    }
  ],
  "risk_management": "Comprehensive risk management strategy specific to futures trading"
}
      `
    } else {
      // Spot trading
      tradeSpecificInstructions = `
### Spot Trading Parameters
- Investment amount: $${investment}
- Risk tolerance: ${risk}% per trade (maximum acceptable loss per position)
- Trading type: Spot trading (direct ownership)
- Time horizon: Mix of short-term and medium-term positions based on market conditions

### Requirements
Based on the current market conditions and the investor profile, create a comprehensive spot trading strategy that:

1. Allocates the $${investment} investment across 3-5 cryptocurrencies with specific USD amounts and percentages
2. Balances the portfolio between established cryptocurrencies (lower risk) and promising altcoins (higher potential)
3. For each recommended cryptocurrency:
   - Provide a specific entry price range based on technical analysis
   - Set a target exit price with clear reasoning
   - Set a stop-loss level that aligns with the ${risk}% risk tolerance
   - Specify the recommended time horizon (short/medium/long term)
   - Explain the rationale using fundamental and technical factors
   - Include a practical example of how the trade would work
   - Suggest DCA (Dollar Cost Averaging) strategy if applicable

4. Include a comprehensive risk management strategy that:
   - Addresses position sizing
   - Recommends when to take partial profits
   - Explains how to adjust stop losses as positions move in favor
   - Provides guidance on portfolio rebalancing
   - Addresses market volatility considerations
      `

      responseFormat = `
### Response Format
Respond ONLY with a valid JSON object in the following format with no markdown formatting or additional text:

{
  "market_explanation": "A concise, insightful summary of the current market situation highlighting key opportunities and risks",
  "allocations": [
    {
      "asset": "Cryptocurrency name and ticker",
      "amount_usd": Exact USD amount to invest,
      "percentage": "Percentage of total portfolio",
      "entry_range": "Specific price range for entry",
      "target_exit": "Specific target price for taking profits",
      "stop_loss": "Specific stop loss price",
      "time_horizon": "Short-term, medium-term, or long-term",
      "dca_strategy": "Dollar Cost Averaging strategy if applicable",
      "rationale": "Detailed explanation of why this cryptocurrency is recommended",
      "example": "Practical example of how the trade would work with actual numbers"
    }
  ],
  "risk_management": "Comprehensive risk management strategy specific to spot trading"
}
      `
    }

    // 4. Generate the investment advice with trade-type specific instructions
    const instruction = [
      {
        role: "system",
        content: `You are an elite cryptocurrency investment advisor with extensive experience in portfolio management, risk assessment, and market analysis.

Your advice is:
- Data-driven and based on thorough market analysis
- Tailored to the user's specific investment parameters
- Balanced between potential returns and risk management
- Specific and actionable with clear entry/exit strategies
- Educational, explaining the rationale behind each recommendation

CRITICAL INSTRUCTION: You MUST respond ONLY with a valid JSON object. Do NOT include any markdown formatting, headers, explanations, or code blocks. Your entire response must be a single, valid, parseable JSON object.`,
      },
      {
        role: "user",
        content: `
          ### Market Context
          ${marketSummary}
          ${tradeSpecificInstructions}
          ${responseFormat}
        `,
      },
    ]

    // Generate the investment advice
    const promptResp = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: instruction,
        max_tokens: 2000, // Increased token limit for more comprehensive advice
        temperature: 0.5, // Slightly increased creativity while maintaining accuracy
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API}`,
          "Content-Type": "application/json",
        },
      },
    )
    const bestPrompt = promptResp.data.choices[0].message.content

    // Try to parse the response as JSON
    let parsedPrompt
    try {
      // First, try to parse the entire response as JSON
      parsedPrompt = JSON.parse(bestPrompt)
      console.log("Successfully parsed JSON directly")
    } catch (e) {
      console.error("Failed to parse direct JSON:", e)

      try {
        // If that fails, try to extract JSON from markdown code block
        const jsonMatch = bestPrompt.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch && jsonMatch[1]) {
          parsedPrompt = JSON.parse(jsonMatch[1])
          // console.log("Successfully parsed JSON from code block")
        } else {
          // If no code block, try to find anything that looks like a JSON object
          const possibleJson = bestPrompt.match(/\{[\s\S]*\}/)
          if (possibleJson) {
            parsedPrompt = JSON.parse(possibleJson[0])
            // console.log("Successfully parsed JSON from object pattern")
          } else {
            // If all parsing fails, create a clean object with the data we have
            parsedPrompt = {
              market_explanation: "Pleas try again.",
              allocations: [],
              risk_management: "Try again.",
            }
          }
        }
      } catch (e2) {
        // console.error("All JSON parsing attempts failed:", e2)
        // Create a clean object with the data we have
        parsedPrompt = {
          market_explanation: "Please try again",
          allocations: [],
          risk_management: "Unable to get risk management. Please try again",
        }
      }
    }

    // 5. Generate a catchy title for the investment advice
    const titleResp = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "You are a creative financial copywriter who creates engaging, professional investment strategy titles.",
          },
          {
            role: "user",
            content: `Create a short, catchy title (5-10 words) for this cryptocurrency ${tradeType.toLowerCase()} trading strategy. The title should be professional yet engaging, and capture the essence of the strategy.
            
Strategy details:
${JSON.stringify(parsedPrompt)}

Respond with ONLY the title, no additional text or explanations.`,
          },
        ],
        max_tokens: 20,
        temperature: 0.8, // More creativity for the title
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API}`,
          "Content-Type": "application/json",
        },
      },
    )
    const rawTitle = titleResp.data.choices[0].message.content
    const promptTitle = cleanTitle(rawTitle)

    // Validate the prompt only once
    const validatedPrompt = validateAndTransformResponse(parsedPrompt, tradeType)

    // Store the validated prompt in the database
    const newPrompt = await Prompt.create({
      investment,
      risk,
      tradeType,
      title: promptTitle,
      content: validatedPrompt, // Store the validated JSON as a string
    })
    await getUser.promptId.push(newPrompt._id)
    await getUser.save()
    await newPrompt.save()

    // Send the already validated object
    res.status(200).json({
      investment,
      risk,
      tradeType,
      title: promptTitle,
      prompt: validatedPrompt,
    })
    return
  } catch (error) {
    console.error(error.response?.data || error.message)
    res.status(500).json({ error: "Failed to generate advice" })
  }
}


// Helper function to analyze market data and create context
function analyzeMarketData(coinGeckoData) {
  const topGainers = coinGeckoData
    .filter((coin) => coin.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5)

  const topLosers = coinGeckoData
    .filter((coin) => coin.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5)

  const highVolumeCoins = coinGeckoData.sort((a, b) => b.total_volume - a.total_volume).slice(0, 10)

  const marketCap = coinGeckoData.reduce((sum, coin) => sum + coin.market_cap, 0)
  const avgChange24h =
    coinGeckoData.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / coinGeckoData.length

  return {
    topGainers,
    topLosers,
    highVolumeCoins,
    totalMarketCap: marketCap,
    averageChange24h: avgChange24h,
    marketSentiment: avgChange24h > 2 ? "Bullish" : avgChange24h < -2 ? "Bearish" : "Neutral",
  }
}

// Helper function to generate futures-specific prompt section
function generateFuturesPromptSection(investment, risk) {
  return `
## 🎯 FUTURES TRADING SPECIFIC REQUIREMENTS

### 📊 Trading Parameters & Constraints
- **Available Capital**: $${investment} USD (allocated for futures positions)
- **Maximum Risk Per Trade**: ${risk}% (strict loss limit per individual position)
- **Leverage Range**: 1x to 20x (recommend based on volatility analysis and risk profile)
- **Position Types**: Both LONG and SHORT positions acceptable
- **Time Horizon**: Short to Medium-term (1 day - 4 weeks maximum)
- **Margin Type**: Isolated margin preferred for risk management
- **Portfolio Heat**: Maximum 3-5 simultaneous positions

### ⚡ Advanced Futures Trading Analysis Framework

#### 1. 🔬 LEVERAGE OPTIMIZATION MATRIX
**For each recommended cryptocurrency, provide:**
- **Optimal Leverage**: Specific leverage recommendation (e.g., "5x leverage")
- **Volatility-Adjusted Sizing**: Position size based on historical volatility
- **Risk-Parity Allocation**: Equal risk contribution across positions
- **Correlation Considerations**: Avoid over-leveraging correlated assets
- **Margin Buffer**: Minimum 30% margin buffer above liquidation price

#### 2. 🎯 PRECISION ENTRY & EXIT STRATEGY
**Multi-layer approach for each position:**
- **Entry Zone Analysis**: Primary entry range with 3-5 specific price levels
- **Scale-in Strategy**: How to build positions (25%, 50%, 75%, 100%)
- **Multiple Take-Profit Levels**: 
  - TP1 (25% position): Conservative target for quick profits
  - TP2 (50% position): Technical target based on key resistance
  - TP3 (25% position): Extended target for trend continuation
- **Dynamic Stop-Loss**: Technical stops that adjust with price movement
- **Liquidation Calculations**: Exact liquidation prices for each leverage level

#### 3. 💰 FUNDING RATE STRATEGY & COST ANALYSIS
**Comprehensive funding cost management:**
- **Current Funding Rates**: Real-time rates for recommended contracts
- **Funding Rate Trends**: 7-day and 30-day average funding rates
- **Optimal Holding Duration**: Cost-benefit analysis for position duration
- **Funding Arbitrage Opportunities**: Spot-futures basis trading opportunities
- **Roll Strategy**: When to close and re-enter positions to minimize funding costs

#### 4. 🛡️ ADVANCED RISK MANAGEMENT FOR LEVERAGED POSITIONS
**Multi-layered risk protection:**
- **Position Sizing Formula**: 
  - Risk Amount = Account Size × ${risk}%
  - Position Size = Risk Amount ÷ (Entry Price - Stop Loss) × Leverage
- **Margin Management**: 
  - Initial margin requirements
  - Maintenance margin buffers
  - Margin call prevention strategies
- **Portfolio Risk Metrics**:
  - Maximum portfolio leverage exposure
  - Correlation-adjusted risk
  - Value-at-Risk (VaR) calculations at 95% confidence level
- **Liquidation Risk Management**:
  - Minimum distance from liquidation price (recommended 40%+)
  - Partial position closure triggers
  - Emergency exit procedures

#### 5. 📈 MARKET STRUCTURE ANALYSIS FOR FUTURES
**Deep market intelligence:**
- **Open Interest Analysis**: Trend and implications for each contract
- **Long/Short Ratio**: Market positioning insights where available
- **Basis Analysis**: Spot vs futures price differences and convergence
- **Volume Profile**: Intraday volume patterns and optimal execution times
- **Futures Curve Analysis**: Contango/backwardation implications
- **Cross-Exchange Arbitrage**: Price differences across major exchanges

### 🎯 FUTURES-SPECIFIC DELIVERABLES REQUIRED

**For each recommended futures position, provide:**

1. **Contract Specification**:
   - Exact contract name and symbol
   - Recommended exchange (Binance, Bybit, OKX, etc.)
   - Contract size and tick size

2. **Position Details**:
   - Exact USD allocation
   - Recommended leverage with justification
   - Position size in base currency
   - Margin requirement calculation

3. **Technical Setup**:
   - Entry price range (specific levels)
   - Stop-loss price (technical and % based)
   - Take-profit levels (TP1, TP2, TP3 with specific prices)
   - Liquidation price calculation
   - Risk-reward ratio for each scenario

4. **Timing Strategy**:
   - Optimal entry timeframe (specific hours/days)
   - Expected position duration
   - Funding rate schedule considerations
   - Market session preferences (Asian/European/US)

5. **Scenario Analysis**:
   - **Bull Case**: Expected returns and exit strategy
   - **Base Case**: Most likely outcome and management
   - **Bear Case**: Loss limitation and exit triggers
   - **Black Swan**: Emergency liquidation procedures

6. **Performance Tracking**:
   - Daily P&L monitoring thresholds
   - Position adjustment triggers
   - Partial profit-taking schedule
   - Roll-over decision criteria

### ⚠️ CRITICAL FUTURES TRADING WARNINGS
- Account for 0.02-0.04% trading fees on each side
- Monitor funding rates every 8 hours
- Never risk more than ${risk}% on any single trade
- Maintain minimum 30% margin buffer above liquidation
- Set alerts for 50% of stop-loss level
- Plan for gap risk and weekend volatility
- Consider regional regulatory restrictions
`
}

// Helper function to generate spot-specific prompt section
function generateSpotPromptSection(investment, risk) {
  return `
## 💎 SPOT TRADING SPECIFIC REQUIREMENTS

### 📊 Investment Parameters & Framework
- **Available Capital**: $${investment} USD (for direct cryptocurrency ownership)
- **Maximum Risk Per Position**: ${risk}% (maximum acceptable loss per individual holding)
- **Investment Approach**: Direct ownership with strategic allocation
- **Time Horizon**: Flexible (1 week to 6+ months based on opportunity)
- **Rebalancing Frequency**: Monthly or trigger-based (±15% allocation drift)
- **Tax Efficiency**: Consider FIFO/LIFO implications and tax-loss harvesting

### 🏗️ ADVANCED SPOT PORTFOLIO CONSTRUCTION

#### 1. 📈 STRATEGIC ALLOCATION FRAMEWORK
**Multi-tier portfolio structure:**
- **Core Holdings (50-65%)**: Large-cap, established cryptocurrencies
  - Bitcoin (BTC): Store of value and portfolio anchor
  - Ethereum (ETH): Smart contract platform leader
- **Growth Positions (25-35%)**: Mid-cap with strong fundamentals
  - Layer 1 platforms, DeFi protocols, infrastructure projects
- **Speculative Positions (5-15%)**: High-risk/high-reward opportunities
  - Small-cap gems, new protocols, emerging narratives
- **Sector Diversification**: Balance across DeFi, Layer 1/2, Web3, Gaming, AI, etc.

#### 2. 🎯 SOPHISTICATED ENTRY STRATEGIES
**Multi-method approach for each allocation:**
- **Lump Sum vs. DCA Analysis**: Optimal entry method based on technical setup
- **Dollar-Cost Averaging (DCA) Schedules**:
  - Weekly DCA for core holdings (4-8 week schedules)
  - Bi-weekly DCA for growth positions (6-12 week schedules)
  - Event-driven purchases for speculative positions
- **Technical Entry Zones**:
  - Primary accumulation zones (strongest support levels)
  - Secondary entry points (on pullbacks to moving averages)
  - Value opportunity thresholds (oversold conditions)

#### 3. 🔍 FUNDAMENTAL ANALYSIS DEEP DIVE
**Comprehensive project evaluation for each recommendation:**
- **Technology Assessment**:
  - Innovation and competitive advantages
  - Development activity and GitHub commits
  - Technical roadmap and milestone achievements
- **Tokenomics Analysis**:
  - Total supply and inflation schedule
  - Token utility and value accrual mechanisms
  - Staking rewards and lock-up periods
- **Ecosystem Health**:
  - Total Value Locked (TVL) trends
  - Active addresses and transaction volumes
  - Developer ecosystem and partnerships
- **Competitive Positioning**:
  - Market share analysis
  - Moat strength and defensibility
  - Adoption metrics and user growth

#### 4. 📊 TECHNICAL ANALYSIS FOR SPOT ACCUMULATION
**Long-term technical framework:**
- **Multi-Timeframe Analysis**: Weekly, daily, and 4-hour chart confluence
- **Accumulation Zone Identification**:
  - Volume-weighted average price (VWAP) levels
  - Fibonacci retracement zones (38.2%, 50%, 61.8%)
  - Historical support levels and previous consolidation ranges
- **Trend Analysis**:
  - Primary trend identification using 200-day moving average
  - Intermediate trend using 50-day moving average
  - Short-term momentum using 20-day moving average
- **Momentum Indicators**:
  - RSI for oversold/overbought conditions
  - MACD for trend confirmation
  - On-balance volume for accumulation/distribution patterns

#### 5. 💰 PROFIT-TAKING & PORTFOLIO MANAGEMENT STRATEGY
**Systematic approach to profit realization:**
- **Partial Profit-Taking Levels**:
  - First tier (25%): Conservative target at key resistance
  - Second tier (50%): Technical target based on measured moves
  - Third tier (25%): Extended target for long-term holds
- **Rebalancing Methodology**:
  - Quarterly strategic rebalancing
  - Tactical rebalancing on ±15% allocation drift
  - Momentum-based adjustments during strong trends
- **Tax-Optimized Strategies**:
  - Long-term capital gains holding (1+ year)
  - Tax-loss harvesting opportunities
  - Specific lot identification for sales

### 🎯 SPOT TRADING SPECIFIC DELIVERABLES REQUIRED

**For each recommended spot position, provide:**

1. **Asset Fundamentals**:
   - Project overview and value proposition
   - Market cap category and growth potential
   - Key partnerships and ecosystem developments
   - Competitive advantages and moat analysis

2. **Allocation Strategy**:
   - Exact USD allocation and percentage of portfolio
   - Rationale for position sizing
   - Market cap category classification
   - Sector allocation contribution

3. **Entry Strategy**:
   - Optimal entry price range (specific levels)
   - DCA schedule recommendation (if applicable)
   - Technical entry triggers and conditions
   - Minimum and maximum position sizing

4. **Technical Analysis**:
   - Current technical setup and trend direction
   - Key support and resistance levels
   - Moving average analysis and signals
   - Volume profile and accumulation zones

5. **Exit Strategy**:
   - Profit-taking levels (specific prices and percentages)
   - Stop-loss methodology (technical vs. percentage)
   - Long-term holding vs. trading approach
   - Rebalancing triggers and thresholds

6. **Risk Assessment**:
   - Project-specific risks and mitigation strategies
   - Regulatory risks and geographic considerations
   - Technology risks and competitive threats
   - Liquidity risks and market depth analysis

7. **Performance Monitoring**:
   - Key performance indicators (KPIs) to track
   - Fundamental milestone monitoring
   - Technical level monitoring
   - Rebalancing triggers and procedures

### 💡 ADVANCED SPOT STRATEGIES

#### 🔄 YIELD OPTIMIZATION
**Maximize returns on holdings:**
- **Staking Opportunities**: APY analysis and lock-up considerations
- **Liquidity Mining**: Risk-adjusted yield farming strategies
- **Lending Protocols**: Secure lending for additional yield
- **Governance Participation**: Voting rewards and protocol benefits

#### 🛡️ RISK MITIGATION TECHNIQUES
**Comprehensive protection strategies:**
- **Correlation Analysis**: Avoid over-concentration in correlated assets
- **Geographic Diversification**: Regulatory risk spreading
- **Exchange Risk Management**: Multi-exchange custody strategies
- **Insurance Coverage**: Available protection options

#### 📈 PERFORMANCE OPTIMIZATION
**Continuous improvement framework:**
- **Monthly Performance Review**: Attribution analysis and lessons learned
- **Quarterly Strategy Assessment**: Market condition adjustments
- **Annual Tax Planning**: Optimize for tax efficiency
- **Market Cycle Adaptation**: Bull/bear market strategy adjustments

### ⚠️ CRITICAL SPOT TRADING CONSIDERATIONS
- Account for 0.1-0.25% trading fees on purchases
- Consider withdrawal fees for moving to cold storage
- Plan for potential exchange downtime or access issues
- Maintain detailed records for tax reporting
- Consider dollar-cost averaging to reduce timing risk
- Plan for long-term custody and security solutions
- Monitor regulatory developments in your jurisdiction
`
}

// NEW FUNCTION: Generate cryptocurrency analysis prompt for external AI tools
async function generateCryptoPrompt(req, res) {
  try {
    const { investment, risk, tradeType } = req.body
    const uID = req.userId

    // Validate user authentication
    const getUser = await User.findById(uID)
    if (!getUser) {
      return res.json({ success: false, msg: "Please authenticate yourself!" })
    }

    // Validate input parameters
    if (!investment || !risk || !tradeType) {
      return res.status(400).json({
        success: false,
        msg: "Missing required parameters: investment, risk, or tradeType",
      })
    }

    // Fetch current market data from CoinGecko
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: "1h,24h,7d,30d",
      },
    })

    const coinGeckoData = response.data
    const marketAnalysis = analyzeMarketData(coinGeckoData)

    // Get current timestamp for market context
    const currentDate = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString()

    // Generate trade-specific prompt sections
    const tradeSpecificSection =
      tradeType.toLowerCase() === "future"
        ? generateFuturesPromptSection(investment, risk)
        : generateSpotPromptSection(investment, risk)

    // Create the enhanced comprehensive prompt
    const comprehensivePrompt = `
# PROFESSIONAL CRYPTOCURRENCY INVESTMENT ANALYSIS & STRATEGY

## 🎯 MISSION STATEMENT
You are a seasoned cryptocurrency portfolio manager with 10+ years of experience in digital assets, technical analysis, and risk management. Provide a detailed, actionable investment strategy based on real-time market data and sophisticated analysis techniques.

## 📊 MARKET CONTEXT & TIMESTAMP
- **Analysis Date**: ${currentDate}
- **Analysis Time**: ${currentTime} (Local Time)
- **Data Source**: CoinGecko API (Real-time Market Data)
- **Market Session**: ${new Date().getUTCHours() >= 13 && new Date().getUTCHours() <= 21 ? 'US Trading Hours' : 'Asian/European Trading Hours'}

## 👤 INVESTOR PROFILE & CONSTRAINTS
- **Available Capital**: $${investment} USD
- **Risk Tolerance**: Maximum ${risk}% loss per individual position
- **Trading Style**: ${tradeType.charAt(0).toUpperCase() + tradeType.slice(1).toLowerCase()} Trading
- **Experience Level**: Intermediate (understands basic concepts, needs advanced guidance)
- **Investment Horizon**: ${tradeType.toLowerCase() === 'future' ? 'Short to Medium-term (1 day - 4 weeks)' : 'Medium to Long-term (1 week - 6 months)'}
- **Portfolio Approach**: Diversified allocation across market cap categories

## 📈 REAL-TIME MARKET INTELLIGENCE

### Global Market Overview
- **Total Cryptocurrency Market Cap**: $${(marketAnalysis.totalMarketCap / 1e12).toFixed(2)} Trillion
- **Market Sentiment Index**: ${marketAnalysis.marketSentiment} (${marketAnalysis.averageChange24h > 5 ? 'Extremely Bullish' : marketAnalysis.averageChange24h > 2 ? 'Bullish' : marketAnalysis.averageChange24h > -2 ? 'Neutral' : marketAnalysis.averageChange24h > -5 ? 'Bearish' : 'Extremely Bearish'})
- **24h Average Price Change**: ${marketAnalysis.averageChange24h.toFixed(2)}%
- **Market Volatility Level**: ${Math.abs(marketAnalysis.averageChange24h) > 5 ? 'High' : Math.abs(marketAnalysis.averageChange24h) > 2 ? 'Medium' : 'Low'}

### 🚀 TOP MOMENTUM GAINERS (24h Performance)
${marketAnalysis.topGainers
  .map(
    (coin, index) =>
      `${index + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})
   📈 +${coin.price_change_percentage_24h.toFixed(2)}% | 💰 $${coin.current_price.toLocaleString()} | 📊 Volume: $${(coin.total_volume / 1e6).toFixed(1)}M
   🏆 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B | 🔄 Market Cap Rank: #${coin.market_cap_rank}`,
  )
  .join("\n\n")}

### 📉 SIGNIFICANT DECLINERS (24h Performance)
${marketAnalysis.topLosers
  .map(
    (coin, index) =>
      `${index + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})
   📉 ${coin.price_change_percentage_24h.toFixed(2)}% | 💰 $${coin.current_price.toLocaleString()} | 📊 Volume: $${(coin.total_volume / 1e6).toFixed(1)}M
   🏆 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B | 🔄 Market Cap Rank: #${coin.market_cap_rank}`,
  )
  .join("\n\n")}

### 🌊 LIQUIDITY LEADERS (High Volume Assets)
${marketAnalysis.highVolumeCoins
  .map(
    (coin, index) =>
      `${index + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})
   💧 24h Volume: $${(coin.total_volume / 1e9).toFixed(2)}B | 💰 Price: $${coin.current_price.toLocaleString()} 
   📊 24h Change: ${coin.price_change_percentage_24h.toFixed(2)}% | 🏆 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B`,
  )
  .join("\n\n")}

## 📋 COMPLETE MARKET DATA SNAPSHOT
\`\`\`json
${JSON.stringify(coinGeckoData.slice(0, 30), null, 2)}
\`\`\`

${tradeSpecificSection}

## 🎯 COMPREHENSIVE ANALYSIS FRAMEWORK

### 1. 🔍 MULTI-DIMENSIONAL MARKET ANALYSIS
**Required Deep Dive Analysis:**
- **Macro Trend Analysis**: Identify primary, secondary, and tertiary trends across different timeframes
- **Market Structure Analysis**: Support/resistance levels, trend lines, and chart patterns
- **Volume Profile Assessment**: Volume at price levels, buying/selling pressure zones
- **Momentum Indicators**: RSI, MACD, Stochastic, Williams %R analysis
- **Market Sentiment Indicators**: Fear & Greed Index implications, social sentiment
- **Liquidity Analysis**: Bid-ask spreads, order book depth, slippage considerations
- **Correlation Analysis**: Inter-asset correlations and portfolio diversification benefits
- **News & Fundamental Catalyst Assessment**: Recent developments affecting price action

### 2. 💼 STRATEGIC PORTFOLIO CONSTRUCTION
**Create a sophisticated allocation strategy that includes:**
- **Core Holdings (60-70%)**: Established, high market cap cryptocurrencies (BTC, ETH)
- **Growth Positions (20-30%)**: Mid-cap assets with strong fundamentals and growth potential
- **Speculative Positions (5-15%)**: Small-cap, high-risk/high-reward opportunities
- **Sector Diversification**: DeFi, Layer 1, Layer 2, Web3, Gaming, AI, etc.
- **Geographic Considerations**: Regulatory environments and regional adoption
- **Specific USD Allocation**: Exact dollar amounts for each recommended position
- **Rebalancing Triggers**: When and how to adjust allocations

### 3. 📊 ADVANCED TECHNICAL ANALYSIS FRAMEWORK
**For each recommended cryptocurrency, provide:**
- **Multi-Timeframe Analysis**: 1H, 4H, 1D, 1W chart analysis
- **Key Technical Levels**: 
  - Primary Support/Resistance zones
  - Fibonacci retracement levels
  - Moving average clusters (20, 50, 100, 200 MA)
  - Volume-weighted average price (VWAP)
- **Chart Pattern Recognition**: Triangles, flags, head & shoulders, double tops/bottoms
- **Momentum Oscillators**: RSI divergences, MACD crossovers, stochastic conditions
- **Volume Analysis**: On-balance volume, accumulation/distribution patterns
- **Volatility Indicators**: Bollinger Bands, Average True Range analysis

### 4. ⚠️ SOPHISTICATED RISK MANAGEMENT PROTOCOL
**Comprehensive risk framework including:**
- **Position Sizing Mathematics**: Kelly Criterion or fixed fractional method
- **Stop-Loss Strategy**: 
  - Technical stop-losses (below key support levels)
  - Percentage-based stops (aligned with ${risk}% risk tolerance)
  - Trailing stop methodology
- **Take-Profit Strategy**: 
  - Multiple profit-taking levels (25%, 50%, 75% position reduction)
  - Risk-reward ratios for each trade (minimum 1:2 ratio)
- **Portfolio Heat Management**: Maximum exposure limits per sector/market cap
- **Correlation Risk Management**: Avoiding over-concentration in correlated assets
- **Black Swan Protection**: Hedging strategies and position sizing for tail risk events
- **Drawdown Management**: Maximum portfolio drawdown limits and recovery strategies

### 5. ⚡ PRECISION EXECUTION STRATEGY
**Step-by-step implementation plan:**
- **Market Timing Analysis**: Optimal entry windows based on market microstructure
- **Order Management**: 
  - Limit orders vs. market orders strategy
  - Dollar-cost averaging schedules
  - Scale-in and scale-out techniques
- **Exchange Selection**: Liquidity, fees, and security considerations
- **Tax Optimization**: FIFO/LIFO strategies and tax-loss harvesting opportunities
- **Monitoring Framework**: 
  - Daily, weekly, and monthly review schedules
  - Key performance indicators (KPIs) tracking
  - Portfolio rebalancing triggers

## 📋 ENHANCED OUTPUT FORMAT REQUIREMENTS

**Structure your comprehensive response as follows:**

### 1. 🎯 EXECUTIVE SUMMARY (3-4 sentences)
- Market outlook and key opportunities
- Primary investment thesis
- Expected risk-adjusted returns

### 2. 🌍 MARKET OUTLOOK & MACRO ANALYSIS
- Current market cycle phase
- Key technical and fundamental drivers
- Short-term (1-4 weeks) and medium-term (1-3 months) forecasts
- Potential market catalysts and risk events

### 3. 💎 RECOMMENDED PORTFOLIO ALLOCATIONS
**For each recommended asset, provide:**
- Asset name and ticker symbol
- Allocation percentage and exact USD amount
- Market cap category (Large/Mid/Small cap)
- Investment thesis and fundamental rationale
- Technical entry strategy and price levels
- Expected time horizon for the position

### 4. 📊 DETAILED TECHNICAL ANALYSIS
**For each recommendation:**
- Current technical setup and trend direction
- Key support and resistance levels with specific prices
- Technical indicators analysis (RSI, MACD, etc.)
- Chart pattern identification
- Volume profile assessment
- Risk-reward ratio calculation

### 5. 🛡️ COMPREHENSIVE RISK MANAGEMENT
- Position sizing methodology with calculations
- Stop-loss placement strategy with specific prices
- Take-profit levels and partial exit strategy
- Portfolio correlation analysis
- Maximum drawdown projections
- Contingency plans for different market scenarios

### 6. ⏰ IMPLEMENTATION TIMELINE
- **Week 1**: Initial positions and entry strategy
- **Week 2-4**: Monitoring and potential adjustments
- **Monthly**: Portfolio rebalancing schedule
- **Quarterly**: Strategic review and allocation updates

### 7. 📈 PERFORMANCE MONITORING CHECKLIST
- Daily monitoring metrics
- Weekly portfolio review items
- Monthly performance evaluation criteria
- Warning signals and exit triggers
- Rebalancing thresholds and procedures

## 🎓 ENHANCED GUIDANCE NOTES

**CRITICAL SUCCESS FACTORS:**
- ✅ Base ALL recommendations on the provided real-time market data
- ✅ Provide specific, quantifiable advice with exact prices and percentages
- ✅ Include realistic profit targets with probability assessments
- ✅ Account for transaction costs, slippage, and tax implications
- ✅ Consider market volatility and provide contingency scenarios
- ✅ Ensure all recommendations align precisely with the ${risk}% risk tolerance
- ✅ Include psychological aspects of trading and behavioral finance considerations
- ✅ Provide educational context for all technical terms and strategies

**DELIVERABLE QUALITY STANDARDS:**
- Professional-grade analysis suitable for institutional investors
- Actionable insights with clear implementation steps
- Risk-adjusted return expectations with scenario analysis
- Comprehensive coverage of all major risk factors
- Clear reasoning and methodology behind every recommendation

This analysis should serve as a complete investment blueprint that could be implemented by a professional trader or sophisticated retail investor, providing both strategic direction and tactical execution guidance based on current market conditions.
`

    // Generate a simple title without AI
    const promptTitle = `${marketAnalysis.marketSentiment} ${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} Strategy - $${investment}`
    const cleanedTitle = cleanTitle(promptTitle)

    // Return the comprehensive prompt (no database operations)
    res.status(200).json({
      success: true,
      title: cleanedTitle,
      prompt: comprehensivePrompt,
      marketSummary: {
        sentiment: marketAnalysis.marketSentiment,
        totalMarketCap: `$${(marketAnalysis.totalMarketCap / 1e12).toFixed(2)}T`,
        averageChange: `${marketAnalysis.averageChange24h.toFixed(2)}%`,
        topGainer: marketAnalysis.topGainers[0]?.name || "N/A",
        topLoser: marketAnalysis.topLosers[0]?.name || "N/A",
      },
      instructions: {
        howToUse:
          "Copy the generated prompt and paste it into any AI tool (ChatGPT, Claude, Gemini, etc.) for comprehensive cryptocurrency investment advice.",
        recommendedAI: ["ChatGPT-4", "Claude-3", "Gemini Pro", "Perplexity AI"],
        tips: [
          "Use the prompt as-is for best results",
          "The prompt includes real-time market data",
          "Follow up with specific questions about individual cryptocurrencies",
          "Ask for clarification on any technical terms",
        ],
      },
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generating crypto prompt:", error.response?.data || error.message)
    res.status(500).json({
      success: false,
      error: "Failed to generate cryptocurrency analysis prompt",
      details: error.message,
    })
  }
}



async function getChatLabels(req, res) {
  try {
    const { userEmail } = req.params;
    if (!userEmail) {
      res.json({ msg: "Authenticate youself" })
      return;
    }
    const userChatLables = await User.findOne({ email: userEmail })
      .select('promptId -_id')
      .populate({
        path: "promptId",
        select: "_id title",
        options: { sort: { _id: -1 } }
      })
    if (!userChatLables) {
      res.status(404).json({ success: false, msg: "User data not found" })
      return;
    }

    res.json({ chatLabels: userChatLables.promptId })
    return;

  } catch (error) {
    console.log("Error in getting chatlabels", error.message)
  }
}

async function getChatById(req, res) {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      res.status(404).json({ success: false, msg: "Chat data not found!" });
      return;
    }
    const chatDataById = await Prompt.findById(chatId)
    if (!chatDataById) {
      res.status(404).json({ success: false, msg: "Data not found" })
      return;
    }
    return res.status(200).json({ success: true, chatDataById })
  } catch (error) {
    console.log("Error in getChatById", error.message)
    return res.status(500).json({ msg: "Server error" })

  }
}

async function deleteChat(req, res) {
  try {
    const { chatId } = req.params

    if (!chatId) {
      return res.status(400).json({
        success: false,
        msg: "Chat ID is required",
      })
    }

    // Check if chat exists before deleting
    const existingChat = await Prompt.findById(chatId)
    if (!existingChat) {
      return res.status(404).json({
        success: false,
        msg: "Chat not found",
      })
    }

    // Delete the chat
    const deletedChat = await Prompt.findByIdAndDelete(chatId)

    if (!deletedChat) {
      return res.status(500).json({
        success: false,
        msg: "Failed to delete chat",
      })
    }

    return res.status(200).json({
      success: true,
      msg: "Chat deleted successfully",
      deletedChatId: chatId,
    })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    })
  }
}


export { giveAdvice, getChatLabels, getChatById, deleteChat, generateCryptoPrompt }
