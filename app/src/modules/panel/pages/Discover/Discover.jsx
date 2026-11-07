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
import useFavorites from '../../hooks/useFavorites'

const PRICE_ORDERS = [
    { key: 'Menor precio', value: 'asc' },
    { key: 'Mayor precio', value: 'desc' }
]

const Discover = () => {
    const { session } = useAuth()
    const { canUseFavorites, favoriteIds, toggleFavorite } = useFavorites()
    const [spaces, setSpaces] = useState([])
    const [filters, setFilters] = useState({ type: '', search: '', priceOrder: '' })
    const [selectedSpace, setSelectedSpace] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [focusReviews, setFocusReviews] = useState(false)
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
    // reviews = true: abre el detalle y baja directo a la sección de reseñas.
    const viewSpace = (space, reviews = false) => { setSelectedSpace(space); setFocusReviews(reviews); setDetailOpen(true) }
    const updateRating = (spaceId, rating) => setSpaces(current => current.map(space => space.id === spaceId ? { ...space, ...rating } : space))
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
                <div className='lx-p-discover-filter'>
                    <span className='material-symbols-rounded' aria-hidden='true'>search</span>
                    <Input id='discover-search' name='search' label='Buscar por nombre' value={filters.search} onChange={updateFilter('search')} />
                </div>
                <div className='lx-p-discover-filter'>
                    <span className='material-symbols-rounded' aria-hidden='true'>category</span>
                    <Select id='discover-type' name='type' label='Tipo de espacio' value={filters.type} onChange={updateFilter('type')} options={SPACE.OPTIONS.TYPES} />
                </div>
                <div className='lx-p-discover-filter'>
                    <span className='material-symbols-rounded' aria-hidden='true'>sort</span>
                    <Select id='discover-price-order' name='priceOrder' label='Ordenar por precio' value={filters.priceOrder} onChange={updateFilter('priceOrder')} options={PRICE_ORDERS} />
                </div>
            </div>
        </header>
        {error && <p className='lx-p-discover-message --error' role='alert'>{error}</p>}
        {loading
            ? <p className='lx-p-discover-message'>Cargando espacios...</p>
            : <SpaceRecreationalCards
                spaces={visibleSpaces}
                currentUserId={session?.user?.id}
                onView={space => viewSpace(space)}
                onViewReviews={space => viewSpace(space, true)}
                onReserve={bookSpace}
                favoriteIds={favoriteIds}
                onToggleFavorite={canUseFavorites ? toggleFavorite : undefined}
                emptyMessage='No encontramos espacios que coincidan con tu búsqueda.'
            />}
        <Modal show={detailOpen} title='Detalle del espacio' size='full' position='center' className='lx-c-modal-space-detail' onClose={() => setDetailOpen(false)}>
            <SpaceRecreationalDetail
                space={selectedSpace}
                onClose={() => setDetailOpen(false)}
                focusReviews={focusReviews}
                onReserve={canReserveSelected ? () => bookSpace() : undefined}
                onRatingChange={updateRating}
                showPresentationPanel
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