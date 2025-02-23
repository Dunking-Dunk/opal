"use client"

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import Loader from '../loader';
import FolderDuotone from '@/components/icons/folder-duotone';
import { useMutationData, useMutationDataState } from '@/hooks/useMutationData';
import { renameFolders } from '@/actions/workspace';
import { Input } from '@/components/ui/input';

type Props = {
    name: string;
    id: string;
    optimistic?: boolean
    count?: number;
    workspaceId: string;
}

const Folder = ({ id, name, optimistic, count, workspaceId }: Props) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const folderCardRef = useRef<HTMLDivElement | null>(null)
    const pathName = usePathname()
    const router = useRouter()
    const [onRename, setOnRename] = useState(false)
    const Rename = () => setOnRename(true)
    const Renamed = () => setOnRename(false)

    console.log()
    //optimistic
    const { mutate, isPending } = useMutationData(["rename-folders"], (data: { name: string }) => renameFolders(id, data.name), ['workspace-folders', workspaceId], Renamed)

    const { latestVariables } = useMutationDataState(['rename-folders'])

    const handleFolderClick = () => {
        router.push(`${pathName}/folder/${id}`)
    }

    const handleNameDoubleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
        e.stopPropagation()
        Rename()
    }

    const updateFolderName = (e: React.FocusEvent<HTMLInputElement>) => {

        if (inputRef.current && folderCardRef.current) {
            if (inputRef.current.value) {
                mutate({ name: inputRef.current.value, id })
            } else Renamed()
        }
    }

    return (
        <div
            onClick={handleFolderClick}
            className={cn(optimistic && "opacity-60", "flex cursor-pointer hover:bg-neutral-800 transition duration-150 items-center gap-2 justify-between min-w-[250px] py-4 px-4 rounded-lg border-[1px]")}
            ref={folderCardRef}
        >
            <Loader state={isPending}>
                <div className='flex flex-col gap-[1px]'>
                    {onRename ? <Input placeholder={name} ref={inputRef} className='border-none  text-base w-full outline-none text-neutral-300 bg-transparent p-0'
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            updateFolderName(e)
                        }}
                    /> :
                        <p
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={handleNameDoubleClick}
                            className='text-neutral-300 z-[20]'
                        >{latestVariables && latestVariables.variables.id === id && latestVariables?.status !== 'success' ? latestVariables.variables.name : name}</p>}
                    <span className='text-sm text-neutral-500'>{count || 0} videos</span>
                </div>
            </Loader>
            <FolderDuotone />
        </div >
    )
}

export default Folder