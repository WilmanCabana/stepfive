import './core/styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './core/contexts/AuthContext'
import { ThemeProvider } from './core/contexts/ThemeContext'
import { NotificationProvider } from './core/contexts/NotificationContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MENU, AUTHORITIES } from './modules/panel/config/panel.config'
import App from './core/pages/App/App'
import ProtectedRoute from './core/components/ProtectedRoute/ProtectedRoute'
import Authentication from './modules/auth/Authentication'
import PanelLayout from './modules/panel/layouts/PanelLayout'
import NotFound from './core/pages/NotFound/NotFound'
import LandingPage from './modules/landing/LandingPage'
import { TermsPage, PrivacyPage, ContactPage } from './modules/public-pages/PublicPages'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>

                <Route path='/' element={<LandingPage />} />
                <Route path='/auth' element={<Authentication />} />
                <Route path='/terms' element={<TermsPage />} />
                <Route path='/privacy' element={<PrivacyPage />} />
                <Route path='/contact' element={<ContactPage />} />

                <Route path='/panel' element={<ProtectedRoute authorities={AUTHORITIES.PANEL}><PanelLayout menu={MENU} /></ProtectedRoute>}>
                  {MENU.map((item) => item.isBase ? (
                    <Route
                      key={`route-${item.to}`}
                      index
                      element={<ProtectedRoute authorities={item.authorities}>{item.element}</ProtectedRoute>}
                    />
                  ) : (
                    <Route
                      key={`route-${item.to}`}
                      path={item.path}
                      element={<ProtectedRoute authorities={item.authorities}>{item.element}</ProtectedRoute>}
                    />
                  ))}
                  {MENU.flatMap((item) =>
                    (item.items || []).map(subItem => (
                      <Route
                        key={`sub-route-${subItem.to}`}
                        path={subItem.to}
                        element={<ProtectedRoute authorities={subItem.authorities}>{subItem.element}</ProtectedRoute>}
                      />
                    ))
                  )}
                </Route>
                <Route path='*' element={<NotFound />} />

              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </App>
  </StrictMode>
)