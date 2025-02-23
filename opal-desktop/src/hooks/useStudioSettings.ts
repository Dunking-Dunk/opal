import { updateStudioSettingSchema } from "@/schemas/studio-setting.schema"
import useZodForm from "./useZodForm"
import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { updateStudioSettings } from "@/lib/utils"
import { toast } from "sonner"

export const useStudioSettings = (id: string, screen?: string | null, audio?: string | null, preset?: 'HD' | 'SD', plan?: 'PRO' | 'FREE') => {
    const [onPreset, setPreset] = useState<'HD' | 'SD' | undefined>()

    const { register, watch } = useZodForm(updateStudioSettingSchema, {
        screen: screen!,
        audio: audio!,
        preset: preset!
    })

    const { mutate, isPending } = useMutation({
        mutationKey: ['update-studio'],
        mutationFn: (data: {
            screen: string | null, audio: string | null, preset: 'HD' | 'SD', id: string
        }) => updateStudioSettings(data.id, data.screen, data.audio, data.preset),
        onSuccess: (data) => {
            return toast(data.status === 200 ? 'Success' : 'Error',
                {
                    description: data.message
                }
            )
        }
    })

    useEffect(() => {
        if (screen && audio) {
            window.ipcRenderer.send("media-sources", {
                screen,
                id,
                audio,
                preset,
                plan
            })
        }
    }, [screen, audio])

    useEffect(() => {
        const subscribe = watch((value) => {
            setPreset(value.preset)
            mutate({
                screen: value.screen,
                id,
                audio: value.audio,
                preset: value.preset
            })
            window.ipcRenderer.send("media-sources", {
                screen: value.screen,
                id,
                audio: value.audio,
                preset: value.preset,
                plan
            })
        })

        return () => subscribe.unsubscribe()
    }, [watch])

    return {
        isPending,
        register,
        onPreset
    }
}