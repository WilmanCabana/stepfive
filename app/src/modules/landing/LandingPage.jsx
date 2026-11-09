import './LandingPage.css'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../../core/contexts/AuthContext'
import { useTheme } from '../../core/hooks/useTheme'
import Button from '../../core/components/Button/Button'
import Modal from '../../core/components/Modal/Modal'
import Logo from '../../core/components/Logo/Logo'
import Icon from '../../core/components/Icon/Icon'
import SpaceRecreationalRequester from '../panel/services/SpaceRecreationalRequester.mjs'
import SpaceRecreationalDetail from '../panel/components/SpaceRecreationalDetail/SpaceRecreationalDetail'
import RatingSummary from '../../core/components/RatingSummary/RatingSummary'

const RESERVATION_STEPS = [
    { icon: 'travel_explore', title: 'Encuentra tu espacio', text: 'Explora canchas sintéticas y salones disponibles en Santa Marta.' },
    { icon: 'event_available', title: 'Elige cuándo ir', text: 'Revisa la información del espacio y solicita el horario que necesitas.' },
    { icon: 'task_alt', title: 'Confirma tu reserva', text: 'Sigue el proceso de reserva y recibe la confirmación en tu cuenta.' },
]

const PUBLISHING_STEPS = [
    { icon: 'person_add', title: 'Crea tu cuenta', text: 'Regístrate para administrar tu espacio desde un solo lugar.' },
    { icon: 'add_business', title: 'Publica tu espacio', text: 'Agrega sus datos, disponibilidad y tarifas para que puedan descubrirlo.' },
    { icon: 'calendar_month', title: 'Administra solicitudes', text: 'Consulta y gestiona las reservas desde tu panel.' },
]

const LandingPage = () => {
    const { session } = useAuth()
    const { isDarkTheme, setThemePreference } = useTheme()
    const navigate = useNavigate()
    const [spaces, setSpaces] = useState([])
    const [selectedSpace, setSelectedSpace] = useState(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let active = true
        setLoading(true)
        setLoadError(false)

        SpaceRecreationalRequester.getDiscoverSpaces()
            .then(result => {
                if (active) setSpaces(Array.isArray(result) ? result.slice(0, 3) : [])
            })
            .catch(() => {
                if (active) setLoadError(true)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => { active = false }
    }, [reloadKey])

    const viewSpace = (space) => { setSelectedSpace(space); setDetailOpen(true) }

    if (session) return <Navigate to='/panel' replace />

    return (
        <div className='stepfive-landing'>
            <header className='stepfive-landing-header'>
                <Link className='stepfive-landing-brand' to='/' aria-label='Stepfive, inicio'>
                    <Logo size='xs' color='accent' />
                    <span>Stepfive</span>
                </Link>
                <nav className='stepfive-landing-nav' aria-label='Navegación principal'>
                    <Link to='/'>Inicio</Link>
                    <a href='#destacados'>Explorar</a>
                    <a href='#publicar'>Publicar</a>
                </nav>
                <div className='stepfive-landing-auth'>
                    <Button
                        color='auto'
                        variant='plain'
                        size='s'
                        radius='full'
                        icon
                        ariaLabel={`Cambiar a modo ${isDarkTheme ? 'claro' : 'oscuro'}`}
                        title={`Cambiar a modo ${isDarkTheme ? 'claro' : 'oscuro'}`}
                        onClick={() => setThemePreference(isDarkTheme ? 'light' : 'dark')}
                    >
                        <span className='material-symbols-rounded' translate='no' aria-hidden='true'>
                            {isDarkTheme ? 'light_mode' : 'dark_mode'}
                        </span>
                    </Button>
                    <Link className='stepfive-landing-login' to='/auth'>Iniciar sesión</Link>
                    <Link className='stepfive-landing-register' to='/auth?mode=register'>Registrarme</Link>
                </div>
            </header>

            <main>
                <section className='stepfive-landing-hero' id='inicio'>
                    <div className='stepfive-landing-hero-content'>
                        <p className='stepfive-landing-eyebrow'>
                            <span className='material-symbols-rounded' translate='no' aria-hidden='true'>location_on</span>
                            Santa Marta, Colombia
                        </p>
                        <h1>Encuentra el lugar perfecto para <span>tu próximo plan.</span></h1>
                        <p className='stepfive-landing-hero-copy'>
                            Descubre y reserva canchas sintéticas y salones de eventos en Santa Marta, todo en un mismo lugar.
                        </p>
                        <div className='stepfive-landing-hero-actions'>
                            <Link className='stepfive-landing-cta stepfive-landing-cta-primary' to='/panel'>
                                <span className='material-symbols-rounded' translate='no' aria-hidden='true'>search</span>
                                Buscar espacio
                            </Link>
                            <Link className='stepfive-landing-cta stepfive-landing-cta-secondary' to='/auth?mode=register'>
                                Publicar mi espacio
                                <span className='material-symbols-rounded' translate='no' aria-hidden='true'>arrow_forward</span>
                            </Link>
                        </div>
                        <div className='stepfive-landing-trust'>
                            <span className='material-symbols-rounded' translate='no' aria-hidden='true'>verified_user</span>
                            Explora opciones locales y administra tus reservas fácilmente
                        </div>
                    </div>
                    <div className='stepfive-landing-hero-art' aria-hidden='true'>
                        <div className='stepfive-landing-art-orbit'>
                            <span className='material-symbols-rounded' translate='no'>sports_soccer</span>
                        </div>
                        <div className='stepfive-landing-art-card stepfive-landing-art-card-top'>
                            <span className='material-symbols-rounded' translate='no'>stadium</span>
                            <span>Canchas para jugar</span>
                        </div>
                        <div className='stepfive-landing-art-card stepfive-landing-art-card-bottom'>
                            <span className='material-symbols-rounded' translate='no'>celebration</span>
                            <span>Espacios para celebrar</span>
                        </div>
                    </div>
                </section>

                <section className='stepfive-landing-section stepfive-landing-featured' id='destacados'>
                    <div className='stepfive-landing-section-heading'>
                        <div>
                            <p className='stepfive-landing-eyebrow'>EXPLORA CERCA DE TI</p>
                            <h2>Espacios destacados</h2>
                            <p>Encuentra el lugar ideal para jugar, reunirte o celebrar.</p>
                        </div>
                        <Link className='stepfive-landing-text-link' to='/panel'>
                            Ver todos <span className='material-symbols-rounded' translate='no' aria-hidden='true'>arrow_forward</span>
                        </Link>
                    </div>
                    {loading ? (
                        <p className='stepfive-landing-feedback' role='status'>Cargando espacios disponibles…</p>
                    ) : loadError ? (
                        <div className='stepfive-landing-feedback stepfive-landing-feedback-error' role='alert'>
                            <span>No pudimos cargar los espacios en este momento.</span>
                            <button type='button' onClick={() => setReloadKey(value => value + 1)}>Intentar de nuevo</button>
                        </div>
                    ) : spaces.length === 0 ? (
                        <p className='stepfive-landing-feedback'>Pronto encontrarás espacios disponibles aquí. Mientras tanto, explora la plataforma.</p>
                    ) : (
                        <div className='stepfive-landing-space-grid'>
                            {spaces.map(space => (
                                <article className='stepfive-landing-space-card' key={space.id}>
                                    <div className='stepfive-landing-space-image'>
                                        {space.coverImage
                                            ? <img src={space.coverImage} alt={`Vista de ${space.name}`} />
                                            : <span className='material-symbols-rounded' translate='no' aria-hidden='true'>
                                                {space.type === 'event_hall' ? 'celebration' : 'sports_soccer'}
                                            </span>}
                                        <RatingSummary className='stepfive-landing-space-rating' average={space.ratingAverage} count={space.ratingCount} />
                                    </div>
                                    <div className='stepfive-landing-space-info'>
                                        <span className='stepfive-landing-space-type'>
                                            {space.type === 'event_hall' ? 'Salón de eventos' : 'Cancha sintética'}
                                        </span>
                                        <h3>{space.name}</h3>
                                        <p>
                                            <span className='material-symbols-rounded' translate='no' aria-hidden='true'>location_on</span>
                                            {space.address || 'Santa Marta'}
                                        </p>
                                        <strong>${Number(space.pricePerHour || 0).toLocaleString('es-CO')} <small>{space.type === 'event_hall' ? 'por bloque' : '/ hora'}</small></strong>
                                    </div>
                                    <div className='stepfive-landing-space-actions'>
                                        <Button size='s' width='full' ariaLabel={`Ver ${space.name}`} onClick={() => viewSpace(space)}>
                                            Ver espacio <Icon name='arrow_forward' />
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className='stepfive-landing-section stepfive-landing-how'>
                    <div className='stepfive-landing-section-heading'>
                        <div>
                            <p className='stepfive-landing-eyebrow'>SENCILLO DESDE EL PRIMER PASO</p>
                            <h2>¿Cómo funciona?</h2>
                        </div>
                    </div>
                    <div className='stepfive-landing-how-columns'>
                        <StepGroup title='Quiero reservar' icon='event_available' steps={RESERVATION_STEPS} />
                        <StepGroup title='Quiero publicar' icon='storefront' steps={PUBLISHING_STEPS} />
                    </div>
                </section>

                <section className='stepfive-landing-benefits'>
                    <div className='stepfive-landing-benefits-copy'>
                        <p className='stepfive-landing-eyebrow'>UN SOLO LUGAR, MÁS PLANES</p>
                        <h2>Más fácil encontrar el espacio que necesitas.</h2>
                        <p>Stepfive conecta a quienes buscan un espacio con quienes tienen uno para ofrecer en Santa Marta.</p>
                    </div>
                    <div className='stepfive-landing-benefits-list'>
                        <Benefit icon='travel_explore' title='Opciones locales' text='Explora espacios recreativos y salones en tu ciudad.' />
                        <Benefit icon='calendar_month' title='Información clara' text='Consulta detalles y tarifas antes de iniciar una reserva.' />
                        <Benefit icon='manage_accounts' title='Gestión sencilla' text='Administra tus reservas o publicaciones desde tu cuenta.' />
                    </div>
                </section>

                <section className='stepfive-landing-publish' id='publicar'>
                    <div>
                        <p className='stepfive-landing-eyebrow'>¿TIENES UN ESPACIO?</p>
                        <h2>Haz que más personas lo descubran.</h2>
                        <p>Publica tu cancha o salón y gestiona tus espacios desde Stepfive.</p>
                    </div>
                    <Link className='stepfive-landing-cta stepfive-landing-cta-primary' to='/auth?mode=register'>
                        Publicar mi espacio
                        <span className='material-symbols-rounded' translate='no' aria-hidden='true'>arrow_forward</span>
                    </Link>
                </section>
            </main>

            <footer className='stepfive-landing-footer'>
                <div className='stepfive-landing-footer-main'>
                    <Link className='stepfive-landing-brand' to='/'>
                        <Logo size='xs' color='accent' />
                        <span>Stepfive</span>
                    </Link>
                    <p>Encuentra y comparte espacios para tus planes en Santa Marta.</p>
                    <nav aria-label='Enlaces del pie de página'>
                        <Link to='/terms'>Términos de uso</Link>
                        <Link to='/privacy'>Privacidad</Link>
                        <Link to='/contact'>Contacto</Link>
                    </nav>
                </div>
                <small className='stepfive-landing-copyright'>© {new Date().getFullYear()} Stepfive · Proyecto académico</small>
            </footer>
            <Modal show={detailOpen} title='Detalle del espacio' size='full' position='center' className='lx-c-modal-space-detail' onClose={() => setDetailOpen(false)}>
                <SpaceRecreationalDetail
                    space={selectedSpace}
                    onClose={() => setDetailOpen(false)}
                    onReserve={() => navigate('/auth')}
                    showPresentationPanel
                />
            </Modal>
        </div>
    )
}

const StepGroup = ({ title, icon, steps }) => (
    <article className='stepfive-landing-step-group'>
        <h3><span className='material-symbols-rounded' translate='no' aria-hidden='true'>{icon}</span>{title}</h3>
        <ol>
            {steps.map((step, index) => (
                <li key={step.title}>
                    <span className='stepfive-landing-step-number'>{String(index + 1).padStart(2, '0')}</span>
                    <span className='material-symbols-rounded stepfive-landing-step-icon' translate='no' aria-hidden='true'>{step.icon}</span>
                    <div><h4>{step.title}</h4><p>{step.text}</p></div>
                </li>
            ))}
        </ol>
    </article>
)

StepGroup.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    steps: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })).isRequired,
}

const Benefit = ({ icon, title, text }) => (
    <article className='stepfive-landing-benefit'>
        <span className='material-symbols-rounded' translate='no' aria-hidden='true'>{icon}</span>
        <div><h3>{title}</h3><p>{text}</p></div>
    </article>
)

Benefit.propTypes = {
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
}

export default LandingPage
