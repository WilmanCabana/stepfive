import './FavoriteSpaces.css'
import { useState } from 'react'
import { useAuth } from '../../../../core/contexts/AuthContext'
import Modal from '../../../../core/components/Modal/Modal'
import Notify from '../../../../core/lib/notify.mjs'
import SpaceRecreationalCards from '../../components/SpaceRecreationalCards/SpaceRecreationalCards'
import SpaceRecreationalDetail from '../../components/SpaceRecreationalDetail/SpaceRecreationalDetail'
import ReservationBooking from '../../components/ReservationBooking/ReservationBooking'
import useFavorites from '../../hooks/useFavorites'

const FavoriteSpaces = () => {
    const { session } = useAuth()
    const { favorites, favoriteIds, toggleFavorite, updateFavoriteSpace, loading, error } = useFavorites()
    const [selectedSpace, setSelectedSpace] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [focusReviews, setFocusReviews] = useState(false)
    const [bookingOpen, setBookingOpen] = useState(false)

    // reviews = true: abre el detalle y baja directo a la sección de reseñas.
    const viewSpace = (space, reviews = false) => { setSelectedSpace(space); setFocusReviews(reviews); setDetailOpen(true) }
    const bookSpace = (space = selectedSpace) => {
        setSelectedSpace(space)
        setDetailOpen(false)
        setBookingOpen(true)
    }
    const canReserveSelected = selectedSpace?.ownerId !== session?.user?.id

    return <div className='lx-p-favorite-spaces'>
        <header className='lx-p-favorite-spaces-head'>
            <div>
                <p>Espacios recreativos</p>
                <h1>Mis lugares favoritos</h1>
            </div>
            {!loading && favorites.length > 0 && <span>{favorites.length} {favorites.length === 1 ? 'lugar guardado' : 'lugares guardados'}</span>}
        </header>
        {error && <p className='lx-p-favorite-spaces-message --error' role='alert'>{error}</p>}
        {loading
            ? <p className='lx-p-favorite-spaces-message'>Cargando tus lugares favoritos...</p>
            : <SpaceRecreationalCards
                spaces={favorites}
                currentUserId={session?.user?.id}
                onView={space => viewSpace(space)}
                onViewReviews={space => viewSpace(space, true)}
                onReserve={bookSpace}
                onEdit={null}
                onDelete={null}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                emptyIcon='favorite'
                emptyMessage='Aún no tienes lugares favoritos. Toca el corazón de un espacio en Discover para guardarlo aquí.'
            />}
        <Modal show={detailOpen} title='Detalle del espacio' size='full' position='center' className='lx-c-modal-space-detail' onClose={() => setDetailOpen(false)}>
            <SpaceRecreationalDetail
                space={selectedSpace}
                onClose={() => setDetailOpen(false)}
                focusReviews={focusReviews}
                onReserve={canReserveSelected ? () => bookSpace() : undefined}
                onRatingChange={updateFavoriteSpace}
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

export default FavoriteSpaces
