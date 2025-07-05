
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser, setSetting, setShowLogin } from '../../redux/authSlice'
import profile_icon from '../../assets/profile_icon 1.png'
import { useLogoutMutation } from '../../redux/api'

const Navbar = () => {
   const dispatch = useDispatch()
   const { isAuthenticated, user, setting } = useSelector(state => state.auth)
   const [ logout ] = useLogoutMutation()
   async function handleLogout() {
      try {
         const res = await logout().unwrap();
         console.log("success")
         dispatch(logoutUser())
      } catch (error) {
         console.log(error)
      }
   }
   return (
      <nav className='container flex items-center justify-between px-4 py-3  mx-auto'>
         <div className='font-michroma text-md md:text-2xl flex items-center'>
            <h2 className='text-[#5BB0FF]'>Fin</h2>
            <h2 className='text-[#1B1B1B]'>Advisor</h2>
         </div>
         <div className="font-lato hidden md:inline space-x-6 text-xl">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
         </div>
         <div className="flex items-center space-x-2">
            {/* <Link to='/buycredit' className='font-[Lato] text-md text-[#2B2B2B] md:text-xl cursor-pointer'>
               Pricing
            </Link> */}
            {
               isAuthenticated ? (
                  <>
                     <p className='md:text-xl text-lg'>Hi, {user.name}</p>
                     <img
                        src={profile_icon}
                        alt="Profile"
                        className='size-13 cursor-pointer'
                        onClick={() => dispatch(setSetting())}
                     />


                     {
                        setting && (
                           <div
                              className="absolute right-5 top-18 transition-all duration-300 bg-white w-46 text-center rounded-2xl z-100"
                           >
                              <p className='text-xl cursor-pointer w-46 hover:bg-gray-200  py-2.5 rounded-t-2xl transition-all duration-300'>
                                 Setting
                              </p>
                              <div className='w-46 border-b border-b-[#9A9A9A]'></div>
                              <button
                                 className='text-lg bg-[#645c5c] text-white py-1.5 px-6 text-center rounded-[63px] mt-2 mb-2 cursor-pointer hover:bg-black'
                                 onClick={handleLogout}
                              >
                                 Logout
                              </button>
                           </div>
                        )
                     }
                  </>


               ) : (
                  <button
                     className='bg-[#2B2B2B] text-[#FFFFFF] rounded-[63px] md:px-9 px-7 py-1.5 md:text-xl text-md cursor-pointer'
                     onClick={() => dispatch(setShowLogin(true))}
                  >
                     Login
                  </button>
               )
            }

         </div>
      </nav >
   )
}

export default Navbar

