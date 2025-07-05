"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { togglePrompt } from "../../../../redux/authSlice"

export default function AiPrompt() {
   const [activeTab, setActiveTab] = useState("prompt")
   const [copiedSection, setCopiedSection] = useState(null)
   const [notification, setNotification] = useState(null)
   const { aiPrompt } = useSelector((state) => state.auth)
   const dispatch = useDispatch()

   const copyToClipboard = async (text, section) => {
      try {
         await navigator.clipboard.writeText(text)
         setCopiedSection(section)
         setNotification(`${section} copied to clipboard!`)
         setTimeout(() => {
            setCopiedSection(null)
            setNotification(null)
         }, 2000)
      } catch (err) {
         setNotification("Failed to copy to clipboard")
         setTimeout(() => setNotification(null), 2000)
      }
   }

   const getSentimentColor = (sentiment) => {
      if (!sentiment) return "bg-yellow-100 text-yellow-800 border-yellow-300"
      switch (sentiment.toLowerCase()) {
         case "bullish":
            return "bg-green-100 text-green-800 border-green-300"
         case "bearish":
            return "bg-red-100 text-red-800 border-red-300"
         default:
            return "bg-yellow-100 text-yellow-800 border-yellow-300"
      }
   }

   const getSentimentIcon = (sentiment) => {
      if (!sentiment) return "💰"
      switch (sentiment.toLowerCase()) {
         case "bullish":
            return "📈"
         case "bearish":
            return "📉"
         default:
            return "💰"
      }
   }

   const formatDate = (dateString) => {
      if (!dateString) return "Unknown"
      return new Date(dateString).toLocaleString("en-US", {
         year: "numeric",
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      })
   }

   // Show message when no data is available
   if (!aiPrompt) {
      return (
         <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md border p-6">
               <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">📝</span>
                  <span>No AI prompt generated yet. Click "Get Prompt" to generate your trading analysis.</span>
               </div>
            </div>
         </div>
      )
   }

   // Show error if generation failed
   if (!aiPrompt.success) {
      return (
         <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md border p-6">
               <div className="flex items-center gap-2 text-red-600">
                  <span className="text-xl">⚠️</span>
                  <span>Failed to generate trading prompt</span>
               </div>
               {aiPrompt.error && <p className="text-red-500 mt-2 text-sm">{aiPrompt.error}</p>}
            </div>
         </div>
      )
   }

   useEffect(() => {
      const handlePopState = (event) => {
         dispatch(togglePrompt())
      }
      window.addEventListener("popstate", handlePopState)
   }, [dispatch])
   return (
      <div className="max-w-6xl mx-auto space-y-6 p-4 ">
         {/* Notification */}
         {notification && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
               {notification}
            </div>
         )}

         {/* Header */}
         <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
               <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900">{aiPrompt.title || "Trading Analysis"}</h1>
                     <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <span>📅</span>
                        <span>Generated on {formatDate(aiPrompt.generatedAt)}</span>
                     </div>
                  </div>
                  {aiPrompt.marketSummary?.sentiment && (
                     <div
                        className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center gap-2 ${getSentimentColor(aiPrompt.marketSummary.sentiment)}`}
                     >
                        <span>{getSentimentIcon(aiPrompt.marketSummary.sentiment)}</span>
                        {aiPrompt.marketSummary.sentiment} Market
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Market Summary */}
         {aiPrompt.marketSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="bg-white rounded-lg shadow-md border p-4">
                  <div className="flex items-center gap-3">
                     <div className="text-2xl">💰</div>
                     <div>
                        <p className="text-sm text-gray-600">Total Market Cap</p>
                        <p className="text-xl font-bold text-gray-900">{aiPrompt.marketSummary.totalMarketCap || "N/A"}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow-md border p-4">
                  <div className="flex items-center gap-3">
                     <div className="text-2xl">📈</div>
                     <div>
                        <p className="text-sm text-gray-600">Top Gainer</p>
                        <p className="text-xl font-bold text-green-600">{aiPrompt.marketSummary.topGainer || "N/A"}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow-md border p-4">
                  <div className="flex items-center gap-3">
                     <div className="text-2xl">📉</div>
                     <div>
                        <p className="text-sm text-gray-600">Top Loser</p>
                        <p className="text-xl font-bold text-red-600">{aiPrompt.marketSummary.topLoser || "N/A"}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow-md border p-4">
                  <div className="flex items-center gap-3">
                     <div
                        className={`w-5 h-5 rounded-full ${aiPrompt.marketSummary.averageChange?.startsWith("-") ? "bg-red-500" : "bg-green-500"}`}
                     ></div>
                     <div>
                        <p className="text-sm text-gray-600">Avg 24h Change</p>
                        <p
                           className={`text-xl font-bold ${aiPrompt.marketSummary.averageChange?.startsWith("-") ? "text-red-600" : "text-green-600"}`}
                        >
                           {aiPrompt.marketSummary.averageChange || "N/A"}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Tabs */}
         <div className="bg-white rounded-lg shadow-md border">
            <div className="border-b">
               <div className="flex">
                  <button
                     onClick={() => setActiveTab("prompt")}
                     className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors md:text-xl lg:text-lg ${activeTab === "prompt"
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 "
                        }`}
                  >
                     Generated Prompt
                  </button>
                  <button
                     onClick={() => setActiveTab("instructions")}
                     className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors md:text-xl lg:text-lg ${activeTab === "instructions"
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                  >
                     How to Use
                  </button>
               </div>
            </div>

            <div className="p-6">
               {activeTab === "prompt" && (
                  <div className="space-y-4">
                     <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                           <h2 className="text-xl font-bold text-gray-900 ">Complete Trading Analysis Prompt</h2>
                           <p className="text-gray-600 mt-1 md:text-lg">
                              Copy this comprehensive prompt and paste it into your preferred AI tool for detailed cryptocurrency
                              analysis.
                           </p>
                        </div>
                        <button
                           onClick={() => copyToClipboard(aiPrompt.prompt || "", "Complete Prompt")}
                           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors md:text-xl"
                        >
                           <span>{copiedSection === "Complete Prompt" ? "✅" : "📋"}</span>
                           {copiedSection === "Complete Prompt" ? "Copied!" : "Copy Prompt"}
                        </button>
                     </div>

                     <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto text-gray-800 md:text-xl lg:text-sm">
                           {aiPrompt.prompt || "No prompt available"}
                        </pre>
                     </div>
                  </div>
               )}

               {activeTab === "instructions" && (
                  <div className="space-y-6">
                     <div className="flex items-center gap-2">
                        <span className="text-xl">ℹ️</span>
                        <h2 className="text-xl font-bold text-gray-900">How to Use This Prompt</h2>
                     </div>

                     {aiPrompt.instructions?.howToUse && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                           <p className="text-blue-800">{aiPrompt.instructions.howToUse}</p>
                        </div>
                     )}

                     {aiPrompt.instructions?.recommendedAI && (
                        <div>
                           <h3 className="font-semibold mb-3 text-gray-900">Recommended AI Tools</h3>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {aiPrompt.instructions.recommendedAI.map((ai, index) => (
                                 <div
                                    key={index}
                                    className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-center text-sm font-medium"
                                 >
                                    {ai}
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <hr className="border-gray-200" />

                     {aiPrompt.instructions?.tips && (
                        <div>
                           <h3 className="font-semibold mb-3 text-gray-900">Pro Tips</h3>
                           <ul className="space-y-2">
                              {aiPrompt.instructions.tips.map((tip, index) => (
                                 <li key={index} className="flex items-start gap-2 text-xl">
                                    <span className="text-green-600 mt-0.5">✅</span>
                                    <span className="text-sm text-gray-700">{tip}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}

                     <hr className="border-gray-200" />

                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                           <span className="text-yellow-600 text-xl">⚠️</span>
                           <div>
                              <h4 className="font-semibold text-yellow-800">Important Disclaimer</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                 This prompt generates analysis based on current market data. Always conduct your own research and
                                 consider your risk tolerance before making any investment decisions. Cryptocurrency trading
                                 involves significant risk.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Quick Actions */}
         <div className="bg-white rounded-lg shadow-md border">
            <div className="p-6">
               <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
               <div className="flex flex-wrap gap-3">
                  <button
                     onClick={() => copyToClipboard(aiPrompt.prompt || "", "Full Prompt")}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     <span>📋</span>
                     {copiedSection === "Full Prompt" ? "Copied!" : "Copy Full Prompt"}
                  </button>
                  <button
                     onClick={() => window.open("https://chat.openai.com", "_blank")}
                     className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     <span>🔗</span>
                     Open ChatGPT
                  </button>
                  <button
                     onClick={() => window.open("https://claude.ai", "_blank")}
                     className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     <span>🔗</span>
                     Open Claude
                  </button>
                  <button
                     onClick={() => window.open("https://gemini.google.com", "_blank")}
                     className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                     <span>🔗</span>
                     Open Gemini
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
