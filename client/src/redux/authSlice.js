import { createSlice } from '@reduxjs/toolkit'


const initialState = {
   showLogin: false,
   isAuthenticated: false,
   user: {email: '', name:''},
   openPromptBox: true,
   promptResponse: null,
   aiPrompt:null,
   setting: false
}

export const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      setShowLogin: (state, action) => {
         state.showLogin = action.payload
      },
      setUser: (state, action) => {
         state.user = action.payload;
         state.isAuthenticated = true;
         state.showLogin = false;
      },
      logoutUser: (state) => {
         state.user = {email: '', name:''};
         state.isAuthenticated = false;
      },
      setSetting : (state) =>{
         state.setting = !state.setting
      },
      togglePrompt: (state, action) => {
         state.openPromptBox = !action.payload;
      },
      setPromptResponse: (state, action) => {
         state.promptResponse = action.payload;
      },
      setAiPrompt: (state,action)=>{
         state.aiPrompt = action.payload
      }

   }
})


export const { setShowLogin, setUser, logoutUser, togglePrompt, setPromptResponse, setSetting, setAiPrompt } = authSlice.actions
export default authSlice.reducer