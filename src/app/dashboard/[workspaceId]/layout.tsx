import { onAuthenticateUser } from '@/app/actions/user'
import { verifyAccessToWorkspace } from '@/app/actions/workspace'
import { SignOutButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params: { workspaceId: string },
    children: React.ReactNode
}

const Layout = async ({ params: { workspaceId }, children }: Props) => {
    const auth = await onAuthenticateUser()
    if (!auth.user?.workspace) redirect('/auth/sign-in')
    if (!auth.user?.workspace.length) redirect('/auth/sign-in')
    const hasAccess = await verifyAccessToWorkspace(workspaceId)

    if (hasAccess.status !== 200) {
        redirect(`/dashboard/${auth.user?.workspace[0].id}`)
    }

    if (!hasAccess.data?.workspace) return null

    const query = new QueryClient()

    return (
        <div>
            <SignOutButton />
            Layout

        </div>
    )
}

export default Layout