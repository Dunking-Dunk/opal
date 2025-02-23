import { Spinner } from '@/components/global/loader/spinner'
import React from 'react'

type Props = {}

const Loading = () => {
    return (
        <div className='flex h-screen w-full justify-center items-center'>
            <Spinner />
        </div>
    )
}

export default Loading