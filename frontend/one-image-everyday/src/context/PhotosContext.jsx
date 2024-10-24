import { createContext, useReducer, useContext } from 'react'

export const PhotosContext = createContext()

const photosReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PHOTOS':
      return {
        photos: action.payload
      }
    case 'CLEAR_PHOTOS':
      return {
        photos: []
      }
    default:
      return state
  }
}

export const PhotosContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(photosReducer, {
    photos: []
  })

  return (
    <PhotosContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PhotosContext.Provider>
  )
}
