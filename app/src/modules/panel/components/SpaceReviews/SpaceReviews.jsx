/* eslint-disable react/prop-types */
import './SpaceReviews.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../../core/contexts/AuthContext'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import RatingStars from '../../../../core/components/RatingStars/RatingStars'
import RatingSummary from '../../../../core/components/RatingSummary/RatingSummary'
import Textarea from '../../../../core/components/Textarea/Textarea'
import Notify from '../../../../core/lib/notify.mjs'
import ReviewRequester from '../../services/ReviewRequester.mjs'

const MAX_COMMENT_LENGTH = 500
const PREVIEW_COUNT = 3 // reseñas visibles antes de "Ver todas"
const REVIEW_AUTHORITIES = { permissions: ['ReadReviews', 'CreateReviews'] }

const formatDate = (value) => new Date(value).toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota', dateStyle: 'medium'
})

// onRatingChange(spaceId, { ratingAverage, ratingCount }) avisa a la pantalla que abrió el detalle
// para que actualice la tarjeta sin recargar.
// focus = true: al abrir, baja suavemente hasta esta sección.
const SpaceReviews = ({ space, onRatingChange, focus = false }) => {
    const sectionRef = useRef(null)
    const { session, hasAuthorities } = useAuth()
    const spaceId = space?.id
    const isApproved = space?.verificationStatus === 'approved'
    const isOwner = space?.ownerId && space.ownerId === session?.user?.id
    const canUseReviews = hasAuthorities(session, REVIEW_AUTHORITIES)

    const [data, setData] = useState({ ratingAverage: 0, ratingCount: 0, reviews: [] })
    const [mine, setMine] = useState({ review: null, canReview: false, reason: null })
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ rating: 0, comment: '' })
    const [saving, setSaving] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const load = useCallback(async () => {
        const [reviews, myReview] = await Promise.all([
            ReviewRequester.getSpaceReviews(spaceId),
            canUseReviews ? ReviewRequester.getMyReview(spaceId) : Promise.resolve(null)
        ])
        setData(reviews)
        if (myReview) setMine(myReview)
        return reviews
    }, [spaceId, canUseReviews])

    useEffect(() => {
        if (!spaceId || !isApproved) return
        let active = true
        setLoading(true)
        setShowAll(false)
        load()
            .catch(error => { if (active) Notify.notice(error.message || 'No fue posible cargar las reseñas', 'error') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [spaceId, isApproved, load])

    // Baja a la sección apenas se abre el detalle, sin esperar a que carguen las reseñas,
    // y ajusta la posición cuando terminan de cargar (por si el contenido de arriba cambió de alto).
    useEffect(() => {
        if (!focus) return
        const frame = requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
        return () => cancelAnimationFrame(frame)
    }, [focus, spaceId])

    useEffect(() => {
        if (focus && !loading) sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [focus, loading])

    if (!spaceId || !isApproved) return null

    const startEditing = () => {
        setForm({ rating: mine.review?.rating || 0, comment: mine.review?.comment || '' })
        setEditing(true)
    }

    const save = async () => {
        if (!form.rating) return
        setSaving(true)
        try {
            await ReviewRequester.saveReview(spaceId, { rating: form.rating, comment: form.comment })
            const updated = await load()
            onRatingChange?.(spaceId, { ratingAverage: updated.ratingAverage, ratingCount: updated.ratingCount })
            setEditing(false)
            Notify.notice(mine.review ? 'Tu reseña se actualizó' : 'Gracias por tu reseña', 'success')
        } catch (error) {
            Notify.notice(error.message || 'No fue posible guardar tu reseña', 'error')
        } finally {
            setSaving(false)
        }
    }

    const showForm = mine.canReview && (editing || !mine.review)
    // Tu reseña ya se muestra arriba; la lista solo tiene las de los demás (el promedio sí la cuenta).
    const otherReviews = data.reviews.filter(review => review.userId !== session?.user?.id)
    const visibleReviews = showAll ? otherReviews : otherReviews.slice(0, PREVIEW_COUNT)
    const hiddenCount = otherReviews.length - PREVIEW_COUNT

    return (
        <section ref={sectionRef} className='lx-c-space-recreational-detail-section lx-c-space-reviews'>
            <h3 className='lx-c-space-recreational-detail-section-title'><Icon name='reviews' />Reseñas</h3>

            {loading
                ? <p className='lx-c-space-reviews-muted'>Cargando reseñas...</p>
                : <>
                    {data.ratingCount > 0
                        ? <RatingSummary variant='full' average={data.ratingAverage} count={data.ratingCount} />
                        : <p className='lx-c-space-reviews-muted'>Aún no tiene reseñas.</p>}

                    {mine.review && !editing && <div className='lx-c-space-reviews-mine'>
                        <div className='lx-c-space-reviews-mine-head'>
                            <strong>Tu reseña</strong>
                            {mine.canReview && <Button size='xs' variant='bordered' onClick={startEditing}><Icon name='edit' />Editar</Button>}
                        </div>
                        <RatingStars value={mine.review.rating} />
                        {mine.review.comment && <p>{mine.review.comment}</p>}
                    </div>}

                    {showForm && <div className='lx-c-space-reviews-form'>
                        <strong>{mine.review ? 'Edita tu reseña' : 'Califica este espacio'}</strong>
                        <RatingStars size='xl' value={form.rating} disabled={saving} onChange={rating => setForm(current => ({ ...current, rating }))} />
                        <Textarea
                            id={`review-comment-${spaceId}`}
                            name='comment'
                            label='Comentario (opcional)'
                            value={form.comment}
                            maxLength={MAX_COMMENT_LENGTH}
                            disabled={saving}
                            onChange={event => setForm(current => ({ ...current, comment: event.target.value }))}
                        />
                        <span className='lx-c-space-reviews-counter'>{form.comment.length}/{MAX_COMMENT_LENGTH}</span>
                        <div className='lx-c-space-reviews-form-actions'>
                            {editing && <Button size='s' variant='bordered' disabled={saving} onClick={() => setEditing(false)}>Cancelar</Button>}
                            <Button size='s' disabled={!form.rating || saving} loading={saving} onClick={save}><Icon name='send' />Guardar</Button>
                        </div>
                    </div>}

                    {canUseReviews && !mine.canReview && !mine.review && !isOwner && mine.reason &&
                        <p className='lx-c-space-reviews-muted'><Icon name='info' />{mine.reason}</p>}

                    {otherReviews.length > 0 && <ul className='lx-c-space-reviews-list'>
                        {visibleReviews.map(review => <li key={review.id} className='lx-c-space-reviews-item'>
                            <div className='lx-c-space-reviews-item-head'>
                                <strong>{review.authorName}</strong>
                                <span>{formatDate(review.updatedAt || review.createdAt)}{review.updatedAt ? ' (editada)' : ''}</span>
                            </div>
                            <RatingStars value={review.rating} size='s' />
                            {review.comment && <p>{review.comment}</p>}
                        </li>)}
                    </ul>}

                    {hiddenCount > 0 && <Button size='s' variant='bordered' width='full' onClick={() => setShowAll(current => !current)}>
                        <Icon name={showAll ? 'expand_less' : 'expand_more'} />
                        {showAll ? 'Ver menos' : `Ver todas las reseñas (${otherReviews.length})`}
                    </Button>}
                </>}
        </section>
    )
}

export default SpaceReviews
