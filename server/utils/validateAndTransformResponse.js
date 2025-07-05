
export function validateAndTransformResponse(response, tradeType) {
   // Create a deep copy to avoid modifying the original
   const result = JSON.parse(JSON.stringify(response))

   // Normalize trade type
   const normalizedTradeType = tradeType.toLowerCase().replace(/s$/, "")
   const isFutures = normalizedTradeType === "future"

   // Check if we have allocations
   if (!result.allocations || !Array.isArray(result.allocations) || result.allocations.length === 0) {
      console.warn("Response missing allocations array or empty allocations")
      result.allocations = []
      return result
   }

   // Transform each allocation based on trade type
   result.allocations = result.allocations.map((allocation) => {
      // For futures trading
      if (isFutures) {
         // Add missing futures-specific fields if they don't exist
         return {
            ...allocation,
            recommended_leverage: allocation.recommended_leverage || "3x", // Default leverage
            liquidation_price:
               allocation.liquidation_price ||
               calculateLiquidationPrice(
                  allocation.entry_range?.split(" - ")[0]?.replace("$", "") || 0,
                  allocation.stop_loss?.replace("$", "") || 0,
                  allocation.recommended_leverage || "3x",
               ),
            take_profit_levels: allocation.take_profit_levels || [
               allocation.target_exit ||
               `$${calculateTakeProfit(allocation.entry_range?.split(" - ")[0]?.replace("$", "") || 0, 1.05)}`,
            ],
            position_duration: allocation.position_duration || allocation.time_horizon || "Short-term",
            funding_rate_strategy:
               allocation.funding_rate_strategy ||
               "Monitor funding rates every 8 hours and consider closing position if rates exceed 0.05% against your position",
            // Remove spot-specific fields
            dca_strategy: undefined,
         }
      }
      // For spot trading
      else {
         // Remove futures-specific fields and ensure spot fields exist
         return {
            ...allocation,
            dca_strategy:
               allocation.dca_strategy ||
               `Invest 50% initially at ${allocation.entry_range}, then 25% if price drops 5%, and remaining 25% if price drops another 5%`,
            // Remove futures-specific fields
            recommended_leverage: undefined,
            liquidation_price: undefined,
            take_profit_levels: undefined,
            funding_rate_strategy: undefined,
            position_duration: undefined,
         }
      }
   })

   return result
}

/**
 * Calculate a simple liquidation price based on entry, stop loss and leverage
 */
function calculateLiquidationPrice(entryPrice, stopLoss, leverage) {
   // Parse values
   const entry = Number.parseFloat(entryPrice)
   const stop = Number.parseFloat(stopLoss)
   const lev = Number.parseFloat(leverage.replace("x", ""))

   if (isNaN(entry) || isNaN(stop) || isNaN(lev)) {
      return "$0" // Default if parsing fails
   }

   // Simple liquidation calculation (this is simplified)
   // In reality, liquidation price depends on position size, maintenance margin, etc.
   const direction = entry > stop ? "short" : "long"
   let liquidationPrice

   if (direction === "long") {
      // For long positions, liquidation is below entry
      liquidationPrice = entry - entry * (1 / lev)
   } else {
      // For short positions, liquidation is above entry
      liquidationPrice = entry + entry * (1 / lev)
   }

   return `$${liquidationPrice.toFixed(2)}`
}

/**
 * Calculate take profit based on entry price and multiplier
 */
function calculateTakeProfit(entryPrice, multiplier) {
   const entry = Number.parseFloat(entryPrice)
   if (isNaN(entry)) return 0
   return (entry * multiplier).toFixed(2)
}