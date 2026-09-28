export const PERMISSIONS = {
    SPACE: {
        READ: 'ReadSpaces',
        CREATE: 'CreateSpaces',
        UPDATE: 'UpdateSpaces',
        DELETE: 'DeleteSpaces',
        VERIFY: 'VerifySpaces',
    }
}

export const SPACE_TYPES = ['synthetic_field', 'event_hall'] as const
export const SPACE_STATUSES = ['pending', 'approved', 'rejected'] as const
export const SPACE_CONDITIONS = ['new', 'good', 'regular', 'needs_maintenance'] as const
export const SPACE_FIELD_TYPES = ['futbol5', 'futbol7', 'futbol8'] as const

export const RESERVATION_DEFAULTS = {
    synthetic_field: {
        reservationMode: 'hourly',
        reservationUnitMinutes: 60,
    },
    event_hall: {
        reservationMode: 'block',
        reservationUnitMinutes: 240,
    },
} as const