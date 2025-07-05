import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDots } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { useSelector } from 'react-redux';
import { useDeleteChatMutation, useGetChatLabelsQuery } from '../../../../redux/api';

const ChatLabel = ({ openMenu, setOpenMenu, onLabelClick }) => {
   const { user } = useSelector(state => state.auth);
   const menuRef = useRef(null);
   const [selectedChatId, setSelectedChatId] = useState(null);
   const [deleteChat] = useDeleteChatMutation()

   // Close menu when clicking outside
   useEffect(() => {
      const handleClickOutside = (e) => {
         if (menuRef.current && !menuRef.current.contains(e.target)) {
            setOpenMenu({ open: false });
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [setOpenMenu]);

   if (!user) return null;
   const { data, isLoading } = useGetChatLabelsQuery(user.email);

   const handleOptionClick = async (itemId) => {
         try {
            await deleteChat(itemId).unwrap()
            console.log("Delete success")
         } catch (error) {
            console.log("Failed to delete chat", error.message)
         }
   };
   
   const handleChatClick = (chatId) => {
      setSelectedChatId(chatId);
      onLabelClick(chatId);
   };

   return (
      <>
         {isLoading ? (
            <h1 className='text-white text-2xl mt-2'>Loading...</h1>
         ) : (
            <div className='flex flex-col gap-1 max-h-[400px] overflow-y-auto p-2'>
               {data?.chatLabels?.length > 0 ? (
                  data.chatLabels.map((item) => (
                     <div
                        key={item._id}
                        className={`flex items-center justify-between text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer p-2 relative ${selectedChatId === item._id ? 'bg-white/20' : ''}`}
                        onClick={() => 
                        handleChatClick(item._id)
                        }
                     >
                        <p className='truncate group-hover:max-w-5/6'>{item.title}</p>

                        <div className="relative" ref={menuRef}>
                           <div
                              className="flex items-center justify-center size-6 aspect-square hover:bg-black/80 rounded-lg cursor-pointer"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setOpenMenu(prev => ({
                                    open: prev.id === item._id ? !prev.open : true,
                                    id: item._id
                                 }));
                              }}
                           >
                              <BsThreeDots className="size-5" />
                           </div>

                           {openMenu.open && openMenu.id === item._id && (
                              <div className="absolute -right-1 -top-3 bg-gray-800 rounded-lg shadow-xl border border-gray-600 min-w-[130px] z-30">
                                 {/* <section
                                    className='flex items-center gap-3 hover:bg-gray-700 px-4 py-2.5 rounded-t-lg cursor-pointer transition-colors'
                                    onClick={(e) => handleOptionClick(e, 'RENAME', item._id)}
                                 >
                                    <MdOutlineDriveFileRenameOutline className='size-5 text-blue-400' />
                                    <p className="font-medium">Rename</p>
                                 </section> */}
                                 <div className="border-t border-gray-600"></div>
                                 <button
                                    className='flex items-center gap-3 hover:bg-gray-700 px-4 py-2.5 rounded-b-lg cursor-pointer transition-colors'
                                    onClick={() => handleOptionClick(item._id)}
                                 >
                                    <RiDeleteBin5Line className='size-5 text-red-400' />
                                    <p className="font-medium text-red-300">Delete</p>
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  ))
               ) : (
                  <p className="text-gray-400">No labels found.</p>
               )}
            </div>
         )}
      </>
   );
};

export default ChatLabel;