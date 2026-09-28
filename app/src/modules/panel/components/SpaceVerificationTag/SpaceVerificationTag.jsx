/* eslint-disable react/prop-types */
import './SpaceVerificationTag.css'

const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado'
}

const SpaceVerificationTag = ({ status = 'pending' }) => (
    <span className={`lx-space-verification lx-space-verification-${status}`}>
        {labels[status] || status}
    </span>
)

export default SpaceVerificationTag
