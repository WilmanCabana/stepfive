import './Discover.css'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../../core/contexts/AuthContext'
import Input from '../../../../core/components/Input/Input'
import Modal from '../../../../core/components/Modal/Modal'
import Select from '../../../../core/components/Select/Select'
import SpaceRecreationalCards from '../../components/SpaceRecreationalCards/SpaceRecreationalCards'
import SpaceRecreationalDetail from '../../components/SpaceRecreationalDetail/SpaceRecreationalDetail'
import ReservationBooking from '../../components/ReservationBooking/ReservationBooking'
import { SPACE } from '../../constants/space.constant.mjs'
import SpaceRecreationalRequester from '../../services/SpaceRecreationalRequester.mjs'
import Notify from '../../../../core/lib/notify.mjs'

const PRICE_ORDERS = [
    { key: 'Menor precio', value: 'asc' },
    { key: 'Mayor precio', value: 'desc' }
]

const Discover = () => {
    const { session } = useAuth()
    const [spaces, setSpaces] = useState([])
    const [filters, setFilters] = useState({ type: '', search: '', priceOrder: '' })
    const [selectedSpace, setSelectedSpace] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [bookingOpen, setBookingOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        SpaceRecreationalRequester.getDiscoverSpaces()
            .then(result => { if (active) setSpaces(result || []) })
            .catch(() => { if (active) setError('No fue posible cargar los espacios. Inténtalo de nuevo.') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const updateFilter = (name) => (event) => setFilters(current => ({ ...current, [name]: event.target.value }))
    const visibleSpaces = spaces
        .filter(space =>
            (!filters.type || space.type === filters.type)
            && (!filters.search || String(space.name || '').toLocaleLowerCase('es').includes(filters.search.trim().toLocaleLowerCase('es')))
        )
        .sort((left, right) => filters.priceOrder
            ? (Number(left.pricePerHour) - Number(right.pricePerHour)) * (filters.priceOrder === 'asc' ? 1 : -1)
            : 0)
    const viewSpace = (space) => { setSelectedSpace(space); setDetailOpen(true) }
    const bookSpace = (space = selectedSpace) => {
        setSelectedSpace(space)
        setDetailOpen(false)
        setBookingOpen(true)
    }
    const canReserveSelected = selectedSpace?.ownerId !== session?.user?.id

    return <div className='lx-p-discover'>
        <header className='lx-p-discover-head'>
            <div>
                <p>Espacios recreativos</p>
                <h1>Descubre espacios en Santa Marta</h1>
            </div>
            <div className='lx-p-discover-filters'>
                <Select id='discover-type' name='type' label='Tipo de espacio' value={filters.type} onChange={updateFilter('type')} options={SPACE.OPTIONS.TYPES} />
                <Input id='discover-search' name='search' label='Buscar por nombre' value={filters.search} onChange={updateFilter('search')} />
                <Select id='discover-price-order' name='priceOrder' label='Ordenar por precio' value={filters.priceOrder} onChange={updateFilter('priceOrder')} options={PRICE_ORDERS} />
            </div>
        </header>
        {error && <p className='lx-p-discover-message --error' role='alert'>{error}</p>}
        {loading
            ? <p className='lx-p-discover-message'>Cargando espacios...</p>
            : <SpaceRecreationalCards
                spaces={visibleSpaces}
                currentUserId={session?.user?.id}
                onView={viewSpace}
                onReserve={bookSpace}
                emptyMessage='No encontramos espacios que coincidan con tu búsqueda.'
            />}
        <Modal show={detailOpen} title='Detalle del espacio' size='large' position='right' onClose={() => setDetailOpen(false)}>
            <SpaceRecreationalDetail
                space={selectedSpace}
                onClose={() => setDetailOpen(false)}
                onReserve={canReserveSelected ? () => bookSpace() : undefined}
            />
        </Modal>
        <Modal show={bookingOpen} title='Reservar espacio' size='large' position='right' onClose={() => setBookingOpen(false)}>
            {selectedSpace && <ReservationBooking
                space={selectedSpace}
                onCancel={() => setBookingOpen(false)}
                onCreated={() => {
                    setBookingOpen(false)
                    Notify.notice('Reserva creada y pagada.', 'success')
                }}
            />}
        </Modal>
    </div>
}

export default Discover