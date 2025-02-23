import { getNotifications, onAuthenticateUser } from '@/actions/user'
import { getAllUserVideos, getWorkspaceFolders, getWorkspaces, verifyAccessToWorkspace } from '@/actions/workspace'
import { redirect } from 'next/navigation'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'
import Sidebar from '@/components/global/sidebar'
import GlobalHeader from '@/components/global/global-header'

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

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ["workspace-folders", workspaceId],
        queryFn: () => getWorkspaceFolders(workspaceId)
    })

    await queryClient.prefetchQuery({
        queryKey: ["user-videos", workspaceId],
        queryFn: () => getAllUserVideos(workspaceId)
    })

    await queryClient.prefetchQuery({
        queryKey: ["user-workspaces"],
        queryFn: () => getWorkspaces()
    })

    await queryClient.prefetchQuery({
        queryKey: ["user-notifications"],
        queryFn: () => getNotifications()
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className='flex w-screen h-screen'>
                <Sidebar activeWorkspaceId={workspaceId} />
                <div className='w-full pt-28 p-6 overflow-y-scroll overflow-x-hidden'>
                    <GlobalHeader workspace={hasAccess.data.workspace} />
                    <div className='mt-4'>
                        {children}
                    </div>
                </div>
            </div>
        </HydrationBoundary>
    )
}

export default Layout