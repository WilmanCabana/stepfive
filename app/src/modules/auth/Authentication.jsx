import './Authentication.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../core/contexts/AuthContext'
import { useTheme } from '../../core/hooks/useTheme'
import Button from '../../core/components/Button/Button'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

const Authentication = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, signIn, signUp } = useAuth()
  const { isDarkTheme, setThemePreference } = useTheme()
  const [authenticationMode, setAuthenticationMode] = useState(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )

  useEffect(() => {
    if (session) {
      navigate('/panel', { replace: true })
    }
  }, [session, navigate])

  return !session && (
    <div className='lx-m-authentication'>

      <Link className='lx-m-authentication-home' to='/' aria-label='Volver al inicio'>
        <span className='material-symbols-rounded' translate='no' aria-hidden='true'>arrow_back</span>
        Volver al inicio
      </Link>

      <div className='lx-m-authentication-mode'>
        <Button color='auto' variant='plain' size='s' radius='full' icon ariaLabel={`Cambiar a modo ${isDarkTheme ? 'claro' : 'oscuro'}`} onClick={() => {
          setThemePreference(isDarkTheme ? 'light' : 'dark')
        }}>
          <span className='material-symbols-rounded' translate='no'>{isDarkTheme ? 'light_mode' : 'dark_mode'}</span>
        </Button>
      </div>

      <LoginForm
        authenticationMode={authenticationMode}
        setAuthenticationMode={setAuthenticationMode}
        signIn={signIn}
      />

      <RegisterForm
        authenticationMode={authenticationMode}
        setAuthenticationMode={setAuthenticationMode}
        signUp={signUp}
      />

    </div>
  )
}

export default Authentication