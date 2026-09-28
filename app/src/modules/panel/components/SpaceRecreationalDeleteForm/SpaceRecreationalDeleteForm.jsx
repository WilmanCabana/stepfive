import './SpaceRecreationalDeleteForm.css'
import Button from '../../../../core/components/Button/Button'
import Icon from '../../../../core/components/Icon/Icon'
import SpaceRecreationalRequester from '../../services/SpaceRecreationalRequester.mjs'

const SpaceRecreationalDeleteForm = ({ space, onCancel = () => { }, handler = () => { } }) => {
    const submit = async () => {
        if (await SpaceRecreationalRequester.deleteSpace(space)) handler({ id: space.id })
        else onCancel()
    }

    return <div className='lx-f-space-recreational-delete'>
        <div className='icon'><Icon name='warning' size='xxxl' className='lx-text-color-danger' /></div>
        <p className='message'>¿Deseas eliminar el espacio recreativo <strong>{space?.name}</strong>?</p>
        <div className='actions'>
            <Button size='s' width='full' color='danger' onClick={submit}>Eliminar</Button>
            <Button size='s' width='full' color='auto' variant='bordered' onClick={onCancel}>Cancelar</Button>
        </div>
    </div>
}

export default SpaceRecreationalDeleteForm