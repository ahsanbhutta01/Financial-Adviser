"use client"

import { useState, useEffect } from "react"
import menu from "../../../assets/menu.png"
import chat from "../../../assets/chat.png"
import profile_icon from "../../../assets/profile_icon 1.png"
import SideBar from "./SideBar/SideBar"
import Prompt from "./prompt/Prompt"
import { useDispatch, useSelector } from "react-redux"
import { useGetChatByIdQuery, useLogoutMutation } from "../../../redux/api"
import { logoutUser, setPromptResponse, setSetting, togglePrompt } from "../../../redux/authSlice"
import Message from "./message/Message"

const Trading = () => {
   const [expand, setExpand] = useState(false)
   const { user, openPromptBox, setting } = useSelector((state) => state.auth)
   const [logout] = useLogoutMutation()
   const dispatch = useDispatch()
   const [selectedChatId, setSelectedChatId] = useState(null)
   const [isNewChat, setIsNewChat] = useState(false)

   const {
      data: selectedChatData,
      isLoading: isChatLoading,
      error,
   } = useGetChatByIdQuery(selectedChatId, {
      skip: !selectedChatId,
   })

   // Clear prompt response when component mounts
   useEffect(() => {
      // This ensures we start with a clean state
      if (isNewChat) {
         dispatch(setPromptResponse(null))
      }
   }, [isNewChat, dispatch])

   const handleLabelClick = (chatId) => {
      if (chatId === null) {
         // This is a new chat
         setIsNewChat(true)
         dispatch(setPromptResponse(null))
      } else {
         // This is an existing chat
         setIsNewChat(false)
         setSelectedChatId(chatId)
      }

      // Toggle prompt box
      dispatch(togglePrompt(true))
   }

   async function handleLogout() {
      try {
         const res = await logout().unwrap()
         dispatch(logoutUser())
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <div className="bg-[#212121]">
         <section className="flex h-screen relative">
            <SideBar
               expand={expand}
               setExpand={setExpand}
               userName={user?.name}
               handleLogout={handleLogout}
               onLabelClick={handleLabelClick}
            />

            <aside className="bg-[#292a2d] flex flex-1 flex-col items-center justify-center px-4 pb-8 relative">
               {/* Header section */}
               <div className="absolute px-4 top-5 flex items-center justify-between w-full">
                  <div
                     onClick={() => setExpand(!expand)}
                     className="group relative flex items-center justify-center transition-all duration-300 size-9 cursor-pointer"
                  >
                     <img
                        src={menu || "/placeholder.svg"}
                        alt="Menu"
                        className={`h-5 w-7 cursor-pointer z-50 absolute ${expand ? "md:right-80" : ""}`}
                     />
                     <div
                        className={`absolute w-max ${expand ? "right-36 top-[3px] -translate-x-1/2 z-50" : "left-12"} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none`}
                     >
                        {expand ? "Close sidebar" : "Open sidebar"}
                        <div className="size-3 absolute bg-black rotate-45 top-1/2 -left-2 -translate-y-1/2"></div>
                     </div>
                  </div>

                  <div className="font-[Michroma] text-md md:text-2xl flex items-center">
                     <h2 className="text-[#5BB0FF]">Fin</h2>
                     <h2 className="text-[#FFFFFF]">Advisor</h2>
                  </div>

                  <img src={chat || "/placeholder.svg"} alt="Chat" className="size-10 cursor-pointer md:hidden" />

                  <div className="hidden md:flex items-center justify-center gap-3">
                     <p className="text-xl text-white">Hi, {user?.name}</p>
                     <img
                        src={profile_icon || "/placeholder.svg"}
                        alt="Profile"
                        className="size-13 cursor-pointer"
                        onClick={() => dispatch(setSetting())}
                     />
                  </div>
               </div>

               {/* Setting dropdown */}
               {setting && (
                  <div className="absolute right-7 top-18 transition-all duration-300 bg-white w-46 text-center rounded-2xl">
                     <p className="text-xl cursor-pointer w-46 hover:bg-gray-200 py-2.5 rounded-t-2xl transition-all duration-300">
                        Setting
                     </p>
                     <div className="w-46 border-b border-b-[#9A9A9A]"></div>
                     <button
                        className="text-lg bg-[#645c5c] text-white py-1.5 px-6 text-center rounded-[63px] mt-2 mb-2 cursor-pointer hover:bg-black"
                        onClick={handleLogout}
                     >
                        Logout
                     </button>
                  </div>
               )}

               {/* Main content area */}
               {openPromptBox ? (
                  <Prompt selectedChatDataById={null} /> // Always pass null to prevent using old data
               ) : (
                  <Message
                     openPromptBox={openPromptBox}
                     selectedChatDataById={isNewChat ? null : selectedChatData}
                     isChatLoading={isChatLoading}
                     isNewChat={isNewChat}
                  />
               )}
            </aside>
         </section>
      </div>
   )
}

export default Trading
