import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { BsThreeDots } from "react-icons/bs";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useSelector } from 'react-redux';
import { useDeleteChatMutation, useGetChatLabelsQuery } from '../../../../redux/api';

const ChatLabel = ({ openMenu, setOpenMenu, onLabelClick }) => {
   const { user } = useSelector(state => state.auth);
   const menuRef = useRef(null);
   const [deleteChat] = useDeleteChatMutation()
   
   // Always call hooks at the top level
   const { data, isLoading } = useGetChatLabelsQuery(user?.email, {
      skip: !user?.email
   });

   // Close menu when clicking outside
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenMenu({ id: 0, open: false });
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, [setOpenMenu]);

   if (!user) return null;

   const handleOptionClick = async (itemId) => {
      try {
         await deleteChat(itemId).unwrap()
         console.log("Delete success")
      } catch (error) {
         console.log("Failed to delete chat", error.message)
      }
   };

   const handleLabelClick = (chatId) => {
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
                     <div key={item._id} className='bg-[#373943] px-2 py-1 rounded-lg group hover:bg-gray-600 transition-colors relative'>
                        <div className='flex justify-between items-center'>
                           <button
                              onClick={() => handleLabelClick(item._id)}
                              className='text-white text-sm md:text-base truncate flex-1 text-left'
                           >
                              {item.title}
                           </button>
                           <button
                              onClick={() => setOpenMenu(prev => ({
                                 id: item._id,
                                 open: prev.id === item._id ? !prev.open : true
                              }))}
                              className='text-gray-400 hover:text-white p-1 rounded transition-colors'
                           >
                              <BsThreeDots size={16} />
                           </button>
                        </div>
                        
                        {openMenu.open && openMenu.id === item._id && (
                           <div ref={menuRef} className='absolute right-0 top-8 bg-[#2a2d35] border border-gray-600 rounded shadow-lg z-50 min-w-[120px]'>
                              <button
                                 onClick={() => {
                                    handleOptionClick(item._id);
                                    setOpenMenu({ id: 0, open: false });
                                 }}
                                 className='w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors'
                              >
                                 <RiDeleteBin5Line size={14} />
                                 Delete
                              </button>
                           </div>
                        )}
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

ChatLabel.propTypes = {
   openMenu: PropTypes.shape({
      open: PropTypes.bool.isRequired,
      id: PropTypes.number.isRequired
   }).isRequired,
   setOpenMenu: PropTypes.func.isRequired,
   onLabelClick: PropTypes.func.isRequired
};

export default ChatLabel;
