import './PublicPages.css'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Logo from '../../core/components/Logo/Logo'
import { useTheme } from '../../core/hooks/useTheme'

const PublicPage = ({ title, eyebrow, children }) => {
    const { isDarkTheme, setThemePreference } = useTheme()

    return (
        <div className='stepfive-public-page'>
            <header className='stepfive-public-header'>
                <Link className='stepfive-public-brand' to='/' aria-label='Stepfive, inicio'>
                    <Logo size='xxs' color='accent' />
                    <span>Stepfive</span>
                </Link>
                <nav aria-label='Navegación principal'>
                    <Link to='/'>Inicio</Link>
                    <Link to='/terms'>Términos</Link>
                    <Link to='/privacy'>Privacidad</Link>
                    <Link to='/contact'>Contacto</Link>
                </nav>
                <button
                    className='stepfive-public-theme'
                    type='button'
                    aria-label={`Cambiar a modo ${isDarkTheme ? 'claro' : 'oscuro'}`}
                    title={`Cambiar a modo ${isDarkTheme ? 'claro' : 'oscuro'}`}
                    onClick={() => setThemePreference(isDarkTheme ? 'light' : 'dark')}
                >
                    <span className='material-symbols-rounded' translate='no' aria-hidden='true'>
                        {isDarkTheme ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
            </header>
            <main className='stepfive-public-content'>
                <p className='stepfive-public-eyebrow'>{eyebrow}</p>
                <h1>{title}</h1>
                {children}
            </main>
            <footer className='stepfive-public-footer'>
                <Link to='/terms'>Términos de uso</Link>
                <Link to='/privacy'>Privacidad</Link>
                <Link to='/contact'>Contacto</Link>
                <span>© {new Date().getFullYear()} Stepfive</span>
            </footer>
        </div>
    )
}

PublicPage.propTypes = {
    title: PropTypes.string.isRequired,
    eyebrow: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}

export const TermsPage = () => (
    <PublicPage title='Términos de uso' eyebrow='STEPFIVE · INFORMACIÓN DEL PROYECTO'>
        <section>
            <h2>Uso de la plataforma</h2>
            <p>Stepfive es un proyecto académico que permite explorar espacios recreativos y salones de eventos, y enviar solicitudes de reserva. La información publicada es de carácter referencial; confirma con el responsable del espacio la disponibilidad, las tarifas y las condiciones antes de asistir.</p>
        </section>
        <section>
            <h2>Reservas y contacto comercial</h2>
            <p>Al registrarte y reservar, aceptas que los administradores de espacios recreativos puedan contactarte como potencial cliente para sus servicios.</p>
        </section>
        <section>
            <h2>Alcance</h2>
            <p>Esta plataforma se desarrolla con fines académicos y no representa una promesa de intermediación comercial ni sustituye los acuerdos directos entre las personas usuarias y quienes administran los espacios.</p>
        </section>
    </PublicPage>
)

export const PrivacyPage = () => (
    <PublicPage title='Privacidad' eyebrow='STEPFIVE · INFORMACIÓN DEL PROYECTO'>
        <section>
            <h2>Datos que se utilizan</h2>
            <p>El proyecto puede solicitar datos de cuenta y contacto para permitir el registro, la administración de espacios y la gestión de solicitudes de reserva. La información se muestra a las personas responsables de atender esas solicitudes.</p>
        </section>
        <section>
            <h2>Uso académico</h2>
            <p>Stepfive es un prototipo académico. No ingreses información sensible que no sea necesaria para probar sus funciones. Los datos de prueba pueden ser eliminados al finalizar el proyecto.</p>
        </section>
        <section>
            <h2>Consultas</h2>
            <p>Para consultar o solicitar la eliminación de información asociada al proyecto, escribe a <a href='mailto:stepfive0@gmail.com'>stepfive0@gmail.com</a>.</p>
        </section>
    </PublicPage>
)

export const ContactPage = () => (
    <PublicPage title='Contacto' eyebrow='¿TIENES UNA PREGUNTA?'>
        <section>
            <h2>Escríbenos</h2>
            <p>Para consultas sobre el proyecto, el registro o la información publicada, puedes contactarnos por correo electrónico.</p>
            <a className='stepfive-public-contact-link' href='mailto:stepfive0@gmail.com'>
                <span className='material-symbols-rounded' translate='no' aria-hidden='true'>mail</span>
                stepfive0@gmail.com
            </a>
        </section>
    </PublicPage>
)
