

import { useState } from "react"
import { MdOutlineContentCopy } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"
import { useGetPromptMutation } from "../../../../redux/api"
import { setAiPrompt } from "../../../../redux/authSlice"
import { useNavigate } from "react-router-dom"

const Spinner = () => (
   <div className="flex items-center justify-center h-40 w-full">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
   </div>
)

const Message = ({ openPromptBox, selectedChatDataById, isChatLoading, isNewChat }) => {
   const [copied, setCopied] = useState(false)
   const { promptResponse } = useSelector((state) => state.auth)
   const [getPrompt, {isLoading: isPromptLoading}] = useGetPromptMutation()
   const dispatch = useDispatch()
   const navigate = useNavigate()

   // Show spinner while loading
   if (isChatLoading) {
      return <Spinner />
   }

   const actualChatData = selectedChatDataById?.chatDataById || selectedChatDataById

   let dataToDisplay = null
   let promptData = null
   let investment, risk, tradeType, title

   if (isNewChat && promptResponse) {
      // For new chats, only use prompt response
      dataToDisplay = promptResponse
      promptData = promptResponse.prompt
      investment = promptResponse.investment
      risk = promptResponse.risk
      tradeType = promptResponse.tradeType
      title = promptResponse.title
   } else if (actualChatData && !isNewChat) {
      // For existing chats, use the selected chat data
      dataToDisplay = actualChatData
      promptData = actualChatData.content
      investment = actualChatData.investment
      risk = actualChatData.risk
      tradeType = actualChatData.tradeType
      title = actualChatData.title
   } else if (promptResponse && !isNewChat && !actualChatData) {
      // Fallback to prompt response if no chat is selected
      dataToDisplay = promptResponse
      promptData = promptResponse.prompt
      investment = promptResponse.investment
      risk = promptResponse.risk
      tradeType = promptResponse.tradeType
      title = promptResponse.title
   }

   // If no data is available, show spinner
   if (!dataToDisplay) {
      // console.log("No data to display - showing spinner")
      return <Spinner />
   }

   // Convert to string if needed for copying
   const promptText = typeof promptData === "object" ? JSON.stringify(promptData, null, 2) : promptData

   function handleCopy() {
      navigator.clipboard
         .writeText(promptText)
         .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
         })
         .catch((err) => {
            console.error("Failed to copy text: ", err)
         })
   }

   async function getAiPrompt (){
      try {
         const promptRes = await getPrompt({investment, risk, tradeType}).unwrap()
         if(promptRes.success){
            dispatch(setAiPrompt(promptRes))
            navigate('/aiprompt')
         }
         
      } catch (error) {
         console.log("Error generating prompt", error.message)
      }
   }
   return (
      <div className="flex flex-col items-center w-full max-w-3xl text-sm">
         <div className={`flex flex-col w-full mb-88 lg:mb-88 md:mb-120 ${openPromptBox === false && "items-end"}`}>
            <section
               className={`group relative top-7 md:top-0  flex flex-col md:max-w-2xl py-3 rounded-xl ${openPromptBox === false ? "bg-[#414158] md:px-5 px-0" : "gap-3"}`}
            >
               {openPromptBox === false && (
                  <>
                     <div className="flex flex-col w-[250px] font-lato md:text-xl text-lg gap-2 relative left-8">
                        <section className="flex items-center gap-2">
                           <h1 className="text-[#FFFFFF]">Investment:</h1>
                           <span className="text-[#A3A3A3]">{investment}$</span>
                        </section>
                        <section className="flex items-center gap-2">
                           <h1 className="text-[#FFFFFF]">Risk Tolerance:</h1>
                           <span className="text-[#A3A3A3]">{risk}%</span>
                        </section>
                        <section className="flex items-center gap-2">
                           <h1 className="text-[#FFFFFF]">Trade Type:</h1>
                           <span className="text-[#A3A3A3]">{tradeType}</span>
                        </section>
                     </div>
                  </>
               )}
            </section>
            {openPromptBox === false && (
               <>
                  <button
                     className={`text-white relative right-[700px] bottom-2 bg-[#5BB0FF] hover:bg-[#4a9fe8] cursor-pointer font-bold transition-colors text-xs sm:text-sm sm:px-4 py-1 sm:py-2 rounded-3xl ${isPromptLoading && "cursor-not-allowed bg-[#96c4f1]" }`}
                     onClick={getAiPrompt}
                     disabled={isPromptLoading}
                  >
                     {isPromptLoading ? "Generating..." : "Get Prompt"}
                  </button>
                  <div className="absolute top-64 w-full sm:w-[90%] md:w-[800px] overflow-y-auto font-lato text-base sm:text-lg max-h-[300px] md:max-h-[480px] lg:max-h-[380px] bg-[#1e1e2a] p-3 sm:p-4 rounded-lg">
                     {promptData && typeof promptData === "object" ? (

                        <div className="text-white ml-6 md:ml-28 lg:ml-0">

                           <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{title}</h2>

                           <h3 className="text-lg sm:text-xl font-semibold mb-2">Market Explanation</h3>
                           <p className="mb-4 text-sm sm:text-base">{promptData.market_explanation}</p>
                           <h3 className="text-lg sm:text-xl font-semibold mb-2">Recommended Allocations</h3>
                           {promptData.allocations &&
                              promptData.allocations.map((allocation, index) => (
                                 <div key={index} className="mb-4 p-2 sm:p-3 bg-[#2a2a3a] rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                                       <span className="font-bold">{allocation.asset}</span>
                                       <span className="text-sm sm:text-base">
                                          ${allocation.amount_usd} ({allocation.percentage})
                                       </span>
                                    </div>

                                    {/* Common fields for both trading types */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 text-sm sm:text-base">
                                       <div>
                                          <span className="text-gray-400">Entry Range:</span> {allocation.entry_range}
                                       </div>

                                       {/* Conditional rendering based on trade type */}
                                       {tradeType?.toLowerCase() === "future" || tradeType?.toLowerCase() === "futures" ? (
                                          // Futures-specific fields
                                          <>
                                             <div>
                                                <span className="text-gray-400">Leverage:</span> {allocation.recommended_leverage}
                                             </div>
                                             <div>
                                                <span className="text-gray-400">Stop Loss:</span> {allocation.stop_loss}
                                             </div>
                                             <div>
                                                <span className="text-gray-400">Liquidation Price:</span> {allocation.liquidation_price}
                                             </div>
                                             <div>
                                                <span className="text-gray-400">Position Duration:</span> {allocation.position_duration}
                                             </div>
                                             <div className="col-span-1 sm:col-span-2">
                                                <span className="text-gray-400">Take Profit Levels:</span>{" "}
                                                {Array.isArray(allocation.take_profit_levels)
                                                   ? allocation.take_profit_levels.join(", ")
                                                   : allocation.take_profit_levels}
                                             </div>
                                             <div className="col-span-1 sm:col-span-2">
                                                <span className="text-gray-400">Funding Rate Strategy:</span>{" "}
                                                {allocation.funding_rate_strategy}
                                             </div>
                                          </>
                                       ) : (
                                          // Spot-specific fields
                                          <>
                                             <div>
                                                <span className="text-gray-400">Target Exit:</span> {allocation.target_exit}
                                             </div>
                                             <div>
                                                <span className="text-gray-400">Stop Loss:</span> {allocation.stop_loss}
                                             </div>
                                             <div>
                                                <span className="text-gray-400">Time Horizon:</span> {allocation.time_horizon}
                                             </div>
                                             <div className="col-span-1 sm:col-span-2">
                                                <span className="text-gray-400">DCA Strategy:</span> {allocation.dca_strategy}
                                             </div>
                                          </>
                                       )}
                                    </div>

                                    {/* Common fields for both trading types */}
                                    <div className="mb-2 text-sm sm:text-base">
                                       <span className="text-gray-400">Rationale:</span> {allocation.rationale}
                                    </div>
                                    <div className="text-sm sm:text-base">
                                       <span className="text-gray-400">Example:</span> {allocation.example}
                                    </div>
                                 </div>
                              ))}
                           <h3 className="text-lg sm:text-xl font-semibold mb-2 md:ml-2">Risk Management</h3>
                           <p className="mb-4 text-sm md:ml-2 sm:text-base">{promptData.risk_management}</p>
                        </div>
                     ) : (
                        <pre className="text-white whitespace-pre-wrap text-sm sm:text-base">{promptText}</pre>
                     )}

                     {/* Copy button at bottom left */}
                     <div className="relative top-8 left-5 md:top-11 md:left-22 lg:left-0 ">
                        <button
                           onClick={handleCopy}
                           className="absolute bottom-2 left-2 px-3 gap-1 sm:px-4 py-1 sm:py-2 rounded-3xl text-white flex items-center bg-[#5BB0FF] hover:bg-[#4a9fe8] cursor-pointer font-bold transition-colors text-xs sm:text-sm"
                        >
                           <MdOutlineContentCopy size={18} className="hidden sm:block" />
                           <MdOutlineContentCopy size={14} className="sm:hidden" />
                           <span>Copy</span>
                           {copied && (
                              <span className="absolute -top-8 left-0 bg-[#414158] text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                 Copied!
                              </span>
                           )}
                        </button>
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
   )
}

export default Message
















