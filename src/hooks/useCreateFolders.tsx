import { useMutationData } from "./useMutationData"
import { createFolder } from "@/actions/workspace"

export const useCreateFolders = (workspaceId: string) => {
    const { mutate } = useMutationData(['create-folder'], () => createFolder(workspaceId), ['workspace-folders', workspaceId])

    const onCreateNewFolder = () => mutate({ name: 'Untitled', id: 'optimistic--id' })

    return { onCreateNewFolder }
}
