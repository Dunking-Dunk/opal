import { getNotifications } from '@/actions/user'
import Notification from '@/components/global/notification'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'

type Props = {}

const Notifications = async (props: Props) => {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['user-notifications'],
        queryFn: getNotifications
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Notification />
        </HydrationBoundary >
    )
}

export default Notifications