import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
   reducerPath: 'api',
   baseQuery: fetchBaseQuery({
      baseUrl: 'http://localhost:8000/api',
      credentials: "include"
   }),
   tagTypes: ["User", "Prompt"], // Added "Prompt" tag type
   endpoints: (builder) => ({
      googleLogin: builder.mutation({
         query: (tokenId) => ({
            url: '/user/google-auth',
            method: 'POST',
            body: { tokenId }
         }),
         invalidatesTags: ['User', 'Prompt']
      }),
      signup: builder.mutation({
         query: (data) => ({
            url: '/user/signup',
            method: 'POST',
            body: data
         })
      }),

      login: builder.mutation({
         query: (data) => ({
            url: '/user/login',
            method: 'POST',
            body: data
         }),
         invalidatesTags: ['User', "Prompt"],
      }),

      getCurrentUser: builder.query({
         query: () => '/user/current',
         providesTags: ['User'],
      }),

      logout: builder.mutation({
         query: () => ({
            url: '/user/logout',
            method: 'POST'
         }),
         invalidatesTags: ['User'],
      }),

      // Prompts api's
      giveAdvice: builder.mutation({
         query: (data) => ({
            url: '/trade/advice',
            method: "POST",
            body: data
         }),
         invalidatesTags: ['User', 'Prompt'],
      }),
      getPrompt: builder.mutation({
         query: (data) => ({
            url: '/trade/generate-crypto-prompt',
            method: "POST",
            body: data
         })
      }),

      getChatLabels: builder.query({
         query: (userEmail) => ({
            url: `/trade/${userEmail}`,
            method: "GET"
         }),
         providesTags: ['User', 'Prompt'],
      }),

      getChatById: builder.query({
         query: (chatId) => ({
            url: `/trade/chat/${chatId}`,
            method: 'GET'
         }),
         providesTags: ["Prompt", "User"]
      }),

      deleteChat: builder.mutation({
         query: (chatId) => ({
            url: `/trade/chat/${chatId}`,
            method: "DELETE"
         }),
         invalidatesTags: ['Prompt'],
      })

   })
})

export const {
   useGoogleLoginMutation,
   useSignupMutation,
   useLoginMutation,
   useGetCurrentUserQuery,
   useLogoutMutation,
   useGiveAdviceMutation,
   useGetPromptMutation,
   useGetChatLabelsQuery,
   useGetChatByIdQuery,
   useDeleteChatMutation
} = apiSlice;