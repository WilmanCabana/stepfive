import Discover from '../pages/Discover/Discover'
import Users from '../pages/Users/Users'
import Authorization from '../pages/Authorization/Authorization'
import SpaceRecreationals from '../pages/Spaces/SpaceRecreationals'
import MyReservations from '../pages/MyReservations/MyReservations'

export const AUTHORITIES = {
  PANEL: {
    roles: []
  }
}

export const MENU = [
  {
    label: 'Discover',
    icon: 'travel_explore',
    description: 'Explora espacios recreativos disponibles',
    to: '',
    path: '',
    isBase: true,
    element: <Discover />,
    authorities: {
      permissions: ['AccessDashboard']
    },
    items: []
  },
  {
    label: 'Mis reservas',
    icon: 'event_available',
    description: 'Consulta y administra tus reservas',
    to: 'my-reservations',
    path: 'my-reservations',
    element: <MyReservations />,
    authorities: {
      permissions: ['ReadReservations']
    },
    items: []
  },
  {
    label: 'Autorizaciones',
    icon: 'shield_toggle',
    description: 'Gestión de roles y permisos',
    to: 'authorization',
    path: 'authorization',
    element: <Authorization />,
    authorities: {
      permissions: ['AccessAuthorization']
    },
    items: []
  },
  {
    label: 'Usuarios',
    icon: 'shield_person',
    description: 'Gestión de cuentas de usuarios',
    to: 'users',
    path: 'users/:userId?',
    element: <Users />,
    authorities: {
      permissions: ['AccessUsers']
    },
    items: []
  },
  {
    label: 'Mis espacios recreativos',
    icon: 'sports_soccer',
    description: 'Gestión de espacios recreativos',
    to: 'space-recreationals',
    path: 'space-recreationals/:spaceRecreationalId?',
    element: <SpaceRecreationals />,
    authorities: {
      permissions: ['AccessSpaces'] // AccessSpacesReacreationals
    },
    items: []
  }
]
