import { acceptInvite } from '@/actions/user'
import Loader from '@/components/global/loader'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params: {
        inviteId: string
    }
}

const InvitePage = async ({ params: { inviteId } }: Props) => {
    const invite = await acceptInvite(inviteId)

    if (invite.status === 404) redirect('/auth/sign-in')

    if (invite.status === 401) {
        return (
            <div className='h-screen container flex flex-col gap-y-2 justify-center items-center'>
                <h2 className='text-6xl font-bold text-white'>401</h2>
                <p>You are not authorized to accept this invite</p>
            </div>
        )
    }

    if (invite.status === 200) {
        redirect(`/dashboard/${invite.data}`)
    }

    if (invite.status === 400) {
        return (
            <div className='h-screen container flex flex-col gap-y-2 justify-center items-center'>
                <h2 className='text-6xl font-bold text-white'>400</h2>
                <p>Something went wrong!</p>
            </div>
        )
    }

    return (
        <div className='flex items-center justify-center w-full h-screen space-x-2'>
            <p className='text-white/60'>Invitation is being Processed</p>
            <Loader className='text-white/60' state={true} />
        </div>
    )
}

export default InvitePage