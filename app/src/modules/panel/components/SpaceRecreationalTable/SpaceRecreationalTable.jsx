/* eslint-disable react/prop-types */
import './SpaceRecreationalTable.css'
import Table from '../../../../core/components/Table/Table'
import TableHeader from '../../../../core/components/Table/TableHeader'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import SpaceVerificationTag from '../SpaceVerificationTag/SpaceVerificationTag'

const SpaceRecreationalTable = ({ spaces = [], onView = () => { }, onEdit, onDelete }) => <div className='lx-c-space-recreational-table'>
    <TableHeader icon='table' title='Espacios recreativos' />
    <Table
        id='space-recreationals-table'
        objects={spaces}
        mapper={(space) => ({
            name: <div className='lx-t-space-recreational-name'>{space.name}</div>,
            type: space.type === 'event_hall' ? 'Salón de eventos' : 'Cancha sintética',
            address: space.address,
            pricePerHour: <span className='lx-t-space-recreational-price'>${Number(space.pricePerHour || 0).toLocaleString('es-CO')}</span>,
            verificationStatus: <SpaceVerificationTag status={space.verificationStatus} />
        })}
        translation={{ name: 'Nombre', type: 'Tipo', address: 'Dirección', pricePerHour: 'Precio por hora', verificationStatus: 'Estado' }}
        criteria={['name', 'type', 'address', 'verificationStatus']}
        sort={['name', 'type', 'pricePerHour']}
        selectionable={false}
        actions={(space) => <div className='lx-t-space-recreationals-actions'>
            <Button size='s' color='auto' variant='bordered' icon onClick={() => onView(space)} aria-label='Ver espacio' title='Ver espacio'><Icon name='visibility' /></Button>
            {onEdit && <Button size='s' color='auto' variant='bordered' icon onClick={() => onEdit(space)} aria-label='Editar espacio' title='Editar espacio'><Icon name='edit' /></Button>}
            {onDelete && <Button size='s' color='danger' variant='dimed' icon onClick={() => onDelete(space)} aria-label='Eliminar espacio' title='Eliminar espacio'><Icon name='delete' /></Button>}
        </div>}
        onClick={onView}
    />
</div>

export default SpaceRecreationalTable