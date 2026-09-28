export const SPACE = {
    FORM: {
        INITIAL: {
            name: '',
            type: 'synthetic_field',
            description: '',
            condition: 'good',
            address: '',
            neighborhood: '',
            commune: '',
            coordinates: '',
            referencePoint: '',
            phone: '',
            whatsapp: '',
            email: '',
            instagram: '',
            facebook: '',
            maxCapacity: '',
            totalArea: '',
            bathrooms: '',
            hasParking: false,
            parkingCapacity: '',
            hasKitchen: false,
            hasDressingRooms: false,
            hasShowers: false,
            hasLighting: false,
            hasSound: false,
            hasStage: false,
            hasWifi: false,
            hasGenerator: false,
            isAccessible: false,
            pricePerHour: '',
            paymentMethods: ['cash', 'pse'],
            allowsAlcohol: false,
            allowsFood: false,
            allowsMusic: false,
            requiresDeposit: false,
            depositAmount: '',
            openingHours: {},
            coverImage: '',
            gallery: [],
            fieldType: 'futbol5',
            fieldDimensions: '',
            hasNets: false,
            hasBalls: false,
            hasVests: false,
            seatedCapacity: '',
            standingCapacity: '',
            hasDanceFloor: false,
            hasFurniture: false,
            hasVIPArea: false,
            reservationMode: 'hourly',
            reservationUnitMinutes: 60
        }
    },
    OPTIONS: {
        TYPES: [
            { key: 'Cancha sintética', value: 'synthetic_field' },
            { key: 'Salón de eventos', value: 'event_hall' }
        ],
        CONDITIONS: [
            { key: 'Nuevo', value: 'new' },
            { key: 'Bueno', value: 'good' },
            { key: 'Regular', value: 'regular' },
            { key: 'Necesita mantenimiento', value: 'needs_maintenance' }
        ],
        FIELD_TYPES: [
            { key: 'Fútbol 5', value: 'futbol5' },
            { key: 'Fútbol 7', value: 'futbol7' },
            { key: 'Fútbol 8', value: 'futbol8' }
        ],
        PAYMENT_METHODS: [
            { key: 'Efectivo', value: 'cash' },
            { key: 'PSE', value: 'pse' }
        ],
        WEEK_DAYS: [
            { key: 'Lunes', value: 'monday' },
            { key: 'Martes', value: 'tuesday' },
            { key: 'Miércoles', value: 'wednesday' },
            { key: 'Jueves', value: 'thursday' },
            { key: 'Viernes', value: 'friday' },
            { key: 'Sábado', value: 'saturday' },
            { key: 'Domingo', value: 'sunday' }
        ],
        RESERVATION: {
            synthetic_field: { mode: 'hourly', unitMinutes: 60 },
            event_hall: { mode: 'block', unitMinutes: 240 }
        }
    }
}