import { PhotosContext } from '../context/PhotosContext'
import { useContext } from 'react'

export const usePhotosContext = () => {
  const context = useContext(PhotosContext)

  if (!context) {
    throw Error('usePhotosContext must be used inside a PhotosContextProvider')
  }

  return context
}
