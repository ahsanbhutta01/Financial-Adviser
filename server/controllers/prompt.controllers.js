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
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat:free",
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
        model: "deepseek/deepseek-chat:free",
        messages: instruction,
        max_tokens: 2000, // Increased token limit for more comprehensive advice
        temperature: 0.7, // Slightly increased creativity while maintaining accuracy
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
        model: "deepseek/deepseek-chat:free",
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
## FUTURES TRADING SPECIFIC REQUIREMENTS

### Trading Parameters
- **Capital**: $${investment} USD available for futures positions
- **Maximum Risk**: ${risk}% per trade (maximum acceptable loss per position)
- **Leverage Range**: 1x to 20x (recommend based on volatility and risk profile)
- **Position Types**: Both long and short positions acceptable
- **Time Horizon**: Short to medium-term (hours to weeks)

### Futures-Specific Analysis Needed
1. **Leverage Recommendations**
   - Optimal leverage for each recommended cryptocurrency
   - Justification based on volatility and market conditions
   - Risk-adjusted position sizing with leverage

2. **Entry and Exit Strategy**
   - Specific entry price ranges with technical justification
   - Multiple take-profit levels (TP1, TP2, TP3)
   - Stop-loss placement to limit risk to ${risk}%
   - Liquidation price calculations for each position

3. **Funding Rate Analysis**
   - Current funding rates for recommended perpetual futures
   - Funding rate trends and impact on position holding costs
   - Optimal position duration considering funding costs

4. **Risk Management for Leveraged Positions**
   - Position sizing formulas with leverage considerations
   - Margin requirements and buffer calculations
   - Liquidation risk management strategies
   - Partial profit-taking and stop-loss adjustment techniques

5. **Market Structure Analysis**
   - Open interest analysis for recommended futures contracts
   - Long/short ratio insights where available
   - Basis analysis (spot vs futures price differences)
   - Volatility assessment for leverage selection

### Expected Deliverables for Futures Trading
- Specific leverage recommendations (e.g., "5x leverage on BTC")
- Calculated liquidation prices for each position
- Funding rate impact analysis
- Risk-reward ratios for each recommended trade
- Position management timeline and milestones
`
}

// Helper function to generate spot-specific prompt section
function generateSpotPromptSection(investment, risk) {
  return `
## SPOT TRADING SPECIFIC REQUIREMENTS

### Trading Parameters
- **Capital**: $${investment} USD available for spot purchases
- **Maximum Risk**: ${risk}% per trade (maximum acceptable loss per position)
- **Position Types**: Long-only positions (direct ownership)
- **Time Horizon**: Mix of short, medium, and long-term positions
- **Rebalancing**: Consider periodic portfolio rebalancing

### Spot-Specific Analysis Needed
1. **Portfolio Diversification**
   - Balance between large-cap, mid-cap, and small-cap cryptocurrencies
   - Sector diversification (DeFi, Layer 1, Layer 2, Gaming, etc.)
   - Risk distribution across different market cap categories

2. **Dollar-Cost Averaging (DCA) Strategy**
   - Recommended DCA schedules for each allocation
   - Entry point optimization for lump-sum vs. DCA approach
   - Market timing considerations for initial purchases

3. **Fundamental Analysis**
   - Project fundamentals and long-term viability
   - Tokenomics analysis (supply, inflation, utility)
   - Development activity and ecosystem growth
   - Competitive positioning and market share

4. **Technical Analysis for Spot Entry**
   - Optimal entry zones based on support levels
   - Accumulation zones and value opportunities
   - Trend analysis for medium to long-term holds
   - Volume profile analysis for entry timing

5. **Hold vs. Trade Strategy**
   - Recommendations for long-term holds vs. active trading
   - Profit-taking strategies for different time horizons
   - Rebalancing triggers and portfolio maintenance
   - Tax considerations for spot trading

### Expected Deliverables for Spot Trading
- Specific allocation percentages with USD amounts
- DCA schedules and entry strategies
- Long-term price targets and holding periods
- Fundamental analysis summary for each recommendation
- Portfolio rebalancing guidelines and triggers
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

    // Create the comprehensive prompt
    const comprehensivePrompt = `
# CRYPTOCURRENCY INVESTMENT ANALYSIS REQUEST

## ANALYSIS DATE & TIME
- Date: ${currentDate}
- Time: ${currentTime}
- Market Data Source: CoinGecko API (Live Data)

## INVESTOR PROFILE
- **Investment Amount**: $${investment} USD
- **Risk Tolerance**: ${risk}% maximum loss per trade
- **Trading Type**: ${tradeType.charAt(0).toUpperCase() + tradeType.slice(1).toLowerCase()} Trading
- **Experience Level**: Assume intermediate knowledge

## CURRENT MARKET SNAPSHOT
### Market Overview
- **Total Market Cap**: $${(marketAnalysis.totalMarketCap / 1e12).toFixed(2)}T
- **Market Sentiment**: ${marketAnalysis.marketSentiment}
- **Average 24h Change**: ${marketAnalysis.averageChange24h.toFixed(2)}%

### Top Performers (24h)
${marketAnalysis.topGainers
  .map(
    (coin, index) =>
      `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): +${coin.price_change_percentage_24h.toFixed(2)}% | Price: $${coin.current_price} | Volume: $${(coin.total_volume / 1e6).toFixed(1)}M`,
  )
  .join("\n")}

### Top Decliners (24h)
${marketAnalysis.topLosers
  .map(
    (coin, index) =>
      `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): ${coin.price_change_percentage_24h.toFixed(2)}% | Price: $${coin.current_price} | Volume: $${(coin.total_volume / 1e6).toFixed(1)}M`,
  )
  .join("\n")}

### High Volume Assets (Liquidity Leaders)
${marketAnalysis.highVolumeCoins
  .map(
    (coin, index) =>
      `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): Volume: $${(coin.total_volume / 1e9).toFixed(2)}B | Price: $${coin.current_price} | 24h: ${coin.price_change_percentage_24h.toFixed(2)}%`,
  )
  .join("\n")}

## DETAILED MARKET DATA
${JSON.stringify(coinGeckoData.slice(0, 25), null, 2)}

${tradeSpecificSection}

## ANALYSIS REQUIREMENTS

### 1. MARKET ANALYSIS
Provide a comprehensive analysis of:
- Current market trends and momentum
- Key support and resistance levels for major cryptocurrencies
- Volume analysis and liquidity assessment
- Market sentiment indicators
- Potential market catalysts or risks

### 2. PORTFOLIO ALLOCATION
Create a detailed investment strategy that:
- Allocates the $${investment} across 3-5 cryptocurrencies
- Provides specific USD amounts and percentages for each allocation
- Balances risk vs. reward based on ${risk}% risk tolerance
- Considers current market conditions and technical indicators

### 3. TECHNICAL ANALYSIS
For each recommended cryptocurrency, provide:
- Current technical indicators (RSI, MACD, Moving Averages)
- Key price levels (support, resistance, entry points)
- Chart pattern analysis if applicable
- Volume profile assessment

### 4. RISK MANAGEMENT STRATEGY
Develop a comprehensive risk management plan including:
- Position sizing methodology
- Stop-loss placement strategy
- Take-profit level recommendations
- Portfolio diversification approach
- Risk monitoring techniques

### 5. EXECUTION PLAN
Provide a step-by-step execution plan with:
- Optimal entry timing and conditions
- Order types and execution strategy
- Monitoring schedule and key metrics to watch
- Exit strategy for both profit-taking and loss-cutting

## OUTPUT FORMAT REQUIREMENTS
Please structure your response as follows:

1. **EXECUTIVE SUMMARY** (2-3 sentences)
2. **MARKET OUTLOOK** (Current conditions and short-term forecast)
3. **RECOMMENDED ALLOCATIONS** (Detailed breakdown with rationale)
4. **TECHNICAL ANALYSIS** (Key levels and indicators for each recommendation)
5. **RISK MANAGEMENT** (Specific strategies and guidelines)
6. **EXECUTION TIMELINE** (When and how to implement)
7. **MONITORING CHECKLIST** (Key metrics and warning signs)

## IMPORTANT NOTES
- Base all recommendations on the provided real-time market data
- Consider both fundamental and technical factors
- Provide specific, actionable advice with clear reasoning
- Include realistic profit targets and risk assessments
- Account for market volatility and potential black swan events
- Ensure recommendations align with the specified risk tolerance

This analysis should serve as a comprehensive guide for making informed cryptocurrency investment decisions based on current market conditions and the specified investment parameters.
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
