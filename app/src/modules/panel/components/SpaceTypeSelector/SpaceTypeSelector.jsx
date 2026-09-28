/* eslint-disable react/prop-types */
import './SpaceTypeSelector.css'
import Select from '../../../../core/components/Select/Select'

const options = [
    { value: 'synthetic_field', key: 'Cancha sintética' },
    { value: 'event_hall', key: 'Salón de eventos' }
]

const SpaceTypeSelector = ({ value, onChange, readOnly = false }) => {
    if (readOnly) return <span className='lx-space-type'>{options.find(option => option.value === value)?.key || value}</span>
    return <Select id='type' name='type' label='Tipo de espacio' value={value} onChange={onChange} options={options} required />
}

export default SpaceTypeSelector
