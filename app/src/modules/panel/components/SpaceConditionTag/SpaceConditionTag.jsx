/* eslint-disable react/prop-types */
import './SpaceConditionTag.css'
const labels = {
    new: 'Nuevo',
    good: 'Bueno',
    regular: 'Regular',
    needs_maintenance: 'Mantenimiento'
}

const SpaceConditionTag = ({ condition = 'regular' }) => (
    <span className={`lx-space-condition lx-space-condition-${condition}`}>
        {labels[condition] || condition}
    </span>
)

export default SpaceConditionTag
