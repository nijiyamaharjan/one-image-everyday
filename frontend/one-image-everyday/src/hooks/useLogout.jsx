
// Updated useLogout.js
import { useAuthContext } from './useAuthContext'
import { usePhotosContext } from './usePhotosContext'

export const useLogout = () => {
  const { dispatch: authDispatch } = useAuthContext()
  const { dispatch: photosDispatch } = usePhotosContext()

  const logout = () => {
    // remove user from storage
    localStorage.removeItem('user')

    // dispatch logout action
    authDispatch({ type: 'LOGOUT' })

    // clear photos
    photosDispatch({ type: 'CLEAR_PHOTOS' })
  }

  return { logout }
}