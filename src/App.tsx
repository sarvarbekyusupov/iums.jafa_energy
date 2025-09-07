import { Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'

const App = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default App