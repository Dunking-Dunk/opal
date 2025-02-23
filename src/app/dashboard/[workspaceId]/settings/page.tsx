import SwitchTheme from '@/components/theme'
import FirstView from '@/components/global/settings/first-view'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getFirstView } from '@/actions/user'

const SettingsPage = async () => {
    const client = new QueryClient()

    await client.prefetchQuery({
        queryKey: ['user-firstview'],
        queryFn: getFirstView
    })

    return (
        <HydrationBoundary state={dehydrate(client)}>
            <SwitchTheme />
            <FirstView />
        </HydrationBoundary>
    )
}

export default SettingsPage