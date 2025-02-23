"use client"

import { enableFirstView } from '@/actions/user'
import { getFirstView } from '@/actions/user'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { useQueryData } from '@/hooks/useQueryData'
import React, { useEffect, useState } from 'react'

type Props = {}

const FirstView = (props: Props) => {
    const [firstView, setFirstView] = useState<undefined | boolean>(undefined)

    const { data, isFetching } = useQueryData(
        ['user-firstview'],
        getFirstView
    )

    const { data: firstview, status } = data as {
        status: number;
        data: boolean
    }

    useEffect(() => {
        setFirstView(firstview)
    }, [firstview])

    const switchState = async (checked: boolean) => {
        const view = await enableFirstView(checked)
        if (view) {
            toast({
                title: view.status === 200 ? 'Success' : 'Failed',
                description: view.data,
            })
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mt-4">Video Sharing Settings</h2>
            <p className="text-muted-foreground">
                Enabling this feature will send you notifications when someone watched
                your video for the first time. This feature can help during client
                outreach.
            </p>
            <Label className="flex items-center gap-x-3 mt-4 text-md">
                Enable First View
                <Switch
                    onCheckedChange={switchState}
                    disabled={firstView === undefined}
                    checked={firstView}
                    onClick={() => setFirstView(!firstView)}
                />
            </Label>
        </div>
    )
}

export default FirstView