import './SpaceRecreationals.css'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../../../core/contexts/AuthContext'
import { useLoad } from '../../../../core/hooks/useLoad'
import Loader from '../../../../core/components/Loader/Loader'
import Footer from '../../../../core/components/Footer/Footer'
import Icon from '../../../../core/components/Icon/Icon'
import Button from '../../../../core/components/Button/Button'
import Modal from '../../../../core/components/Modal/Modal'
import TabGroup from '../../../../core/components/TabGroup/TabGroup'
import SpaceRecreationalRequester from '../../services/SpaceRecreationalRequester.mjs'
import InputSearch from '../../../../core/components/InputSearch/InputSearch.jsx'
import SpaceRecreationalCards from '../../components/SpaceRecreationalCards/SpaceRecreationalCards.jsx'
import SpaceRecreationalTable from '../../components/SpaceRecreationalTable/SpaceRecreationalTable.jsx'
import SpaceRecreationalForm from '../../components/SpaceRecreationalForm/SpaceRecreationalForm.jsx'
import SpaceRecreationalDetail from '../../components/SpaceRecreationalDetail/SpaceRecreationalDetail.jsx'
import SpaceRecreationalDeleteForm from '../../components/SpaceRecreationalDeleteForm/SpaceRecreationalDeleteForm.jsx'
import SpaceReservations from '../../components/SpaceReservations/SpaceReservations.jsx'

const SpaceRecreationals = () => {
    const { session, user, hasAuthorities } = useAuth()
    const [spaces, setSpaces] = useState([])
    const [mode, setMode] = useState(null)
    const [selectedSpace, setSelectedSpace] = useState(null)
    const [tab, setTab] = useState('cards')
    const { loading, withLoad } = useLoad(true)
    const isAdmin = user?.roles?.includes('Admin')
    const canCreate = hasAuthorities(session, { permissions: ['CreateSpaces'] })
    const canUpdate = hasAuthorities(session, { permissions: ['UpdateSpaces'] })
    const canDelete = hasAuthorities(session, { permissions: ['DeleteSpaces'] })

    const load = useCallback(() => withLoad(async () => {
        const result = isAdmin ? await SpaceRecreationalRequester.getSpaces() : await SpaceRecreationalRequester.getMySpaces()
        setSpaces(result || [])
    }), [isAdmin, withLoad])

    useEffect(() => { load() }, [load])

    const reset = () => { setMode(null); setSelectedSpace(null) }
    const open = (nextMode, space = null) => { setSelectedSpace(space); setMode(nextMode) }

    const save = async (data) => {
        const result = selectedSpace
            ? await SpaceRecreationalRequester.updateSpace({ ...data, id: selectedSpace.id })
            : await SpaceRecreationalRequester.createSpace(data)
        if (result) { setSpaces(current => selectedSpace ? current.map(item => item.id === result.id ? result : item) : [result, ...current]); reset() }
    }

    const remove = (space) => open('delete', space)
    const onDeleted = ({ id }) => { setSpaces(current => current.filter(item => item.id !== id)); reset() }
    const onVerified = (space) => { setSpaces(current => current.map(item => item.id === space.id ? space : item)); setSelectedSpace(space) }

    const canVerify = isAdmin || hasAuthorities(session, { permissions: ['VerifySpaces'] })

    return <div className='lx-p-spaces'>
        <Loader loading={loading} background='special' />
        <header className='lx-p-spaces-header'>
            <div className='info'><h1 className='--name'>Espacios recreativos</h1><p className='--description'>Administra canchas sintéticas y salones de eventos en Santa Marta</p><div className='--overview'><div className='summary'>{spaces.length} espacios registrados</div></div></div>
            {canCreate && <div className='actions'><Button onClick={() => open('form')}><Icon name='add' />Nuevo espacio</Button></div>}
        </header>
        <div className='lx-p-spaces-content'>
            <div className='lx-p-spaces-actions'><TabGroup tabs={[<>Tarjetas <Icon name='square' /></>, <>Tabla <Icon name='table' /></>, <>Reservas <Icon name='calendar_month' /></>]} options={['cards', 'table', 'reservations']} onClick={setTab} activeIndex={['cards', 'table', 'reservations'].indexOf(tab)} /></div>
            <div className='lx-p-spaces-container'>
                {tab === 'cards' && <div className='lx-p-spaces-cards'><InputSearch context='.lx-c-space-recreationals' element='.lx-space-card' /><SpaceRecreationalCards spaces={spaces} onView={item => open('detail', item)} onEdit={canUpdate ? item => open('form', item) : null} onDelete={canDelete ? remove : null} /></div>}
                {tab === 'table' && <div className='lx-p-spaces-table'><SpaceRecreationalTable spaces={spaces} onView={item => open('detail', item)} onEdit={canUpdate ? item => open('form', item) : null} onDelete={canDelete ? remove : null} /></div>}
                {tab === 'reservations' && <SpaceReservations />}
            </div>
        </div>
        <Footer />
        <Modal show={mode === 'detail'} title='Detalle del espacio' size='large' position='right' onClose={reset}><SpaceRecreationalDetail space={selectedSpace} onEdit={canUpdate ? item => open('form', item) : null} onDelete={canDelete ? remove : null} onVerified={onVerified} onClose={reset} canVerify={canVerify} /></Modal>
        <Modal show={mode === 'form'} title={selectedSpace ? 'Editar espacio recreativo' : 'Nuevo espacio recreativo'} size='large' position='right' onClose={reset}><SpaceRecreationalForm space={selectedSpace} onSubmit={save} onCancel={reset} /></Modal>
        <Modal show={mode === 'delete'} title='Eliminar espacio recreativo' size='min' position='center' onClose={reset}><SpaceRecreationalDeleteForm space={selectedSpace} onCancel={reset} handler={onDeleted} /></Modal>
    </div>
}

export default SpaceRecreationals
