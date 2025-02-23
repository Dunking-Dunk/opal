"use client"

import FormGenerator from '@/components/global/form-generator';
import Loader from '@/components/global/loader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useMoveVideos } from '@/hooks/useFolders';
import React from 'react'

type Props = {
    videoId: string;
    currentWorkspace?: string;
    currentFolder?: string;
    currentFolderName?: string;
}

const ChangeVideoLocation = ({
    videoId,
    currentWorkspace,
    currentFolder,
    currentFolderName,
}: Props) => {

    const { onFormSubmit,
        errors,
        register,
        isPending,
        folders,
        workspaces,
        isFetching,
        isFolders } = useMoveVideos(videoId, currentWorkspace!, currentFolder!)

    const folder = folders.find(f => f.id === currentFolder)
    const workspace = workspaces.find(f => f.id === currentWorkspace)

    return (
        <form className='flex flex-col gap-y-5' onSubmit={(e) => {
            onFormSubmit(e)
        }}>
            <div className='border-[1px] rounded-xl p-5'>
                <h2 className='text-xs text-[#a4a4a4]'>Current Workspace</h2>
                {workspace && <p >{workspace?.name}</p>}
                <h2 className='text-xs text-[#a4a4a4] mt-4'>Current Folder</h2>
                {folder ? <p>{folder?.name}</p> : "This video has no folder"}
            </div>
            <Separator orientation='horizontal' />
            <div className='flex flex-col gap-y-5 p-5 border-[1px] rounded-xl'>
                <h2 className='text-xs text-[#a4a4a4]'>To</h2>
                <FormGenerator inputType="select" placeholder='Workspaces' name='workspace_id' register={register} errors={errors} label='Workspaces' options={workspaces.map((space) => ({ id: space.id, label: space.name, value: space.id }))} />
                {isFetching ? (
                    <Skeleton className='w-full h-[40px] rounded-xl' />
                ) : (isFolders && isFolders.length > 0 ? <FormGenerator inputType="select" placeholder='Folders' name='folder_id' register={register} errors={errors} label='Folders' defaultOption={currentFolder as string} options={isFolders?.map((folder, key) => ({ id: folder.id, label: folder.name, value: folder.id }))} /> : <p className='text-[#a4a4a4] text-sm'>This Workspace has no folders</p>)}
            </div>
            <Button>
                <Loader state={isPending} color='#000'>
                    Transfer
                </Loader>
            </Button>
        </form>
    )
}

export default ChangeVideoLocation