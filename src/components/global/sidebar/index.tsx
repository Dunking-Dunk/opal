"use client"

import { getWorkspaceFolders, getWorkspaces } from '@/actions/workspace'
import { Separator } from '@/components/ui/separator'
import { useQueryData } from '@/hooks/useQueryData'
import { FoldersProps, NotificationProps, WorkspaceProps } from '@/types/index.type'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import Modal from '../modal'
import { Menu, PlusCircle } from 'lucide-react'
import Search from '../search'
import { MENU_ITEMS } from '@/constants'
import SidebarItem from './sidebar-item'
import WorkspacePlaceholder from './workspace-placeholder'
import GlobalCard from '../global-card'
import { Button } from '@/components/ui/button'
import Loader from '../loader'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import InfoBar from '../info-bar'
import { useMutationDataState } from '@/hooks/useMutationData'
import { useDispatch } from 'react-redux'
import { WORKSPACES } from '@/redux/slices/workspaces'
import { FOLDERS } from '@/redux/slices/folders'
import { getNotifications } from '@/actions/user'
import PaymentButton from '../payment-button'

type Props = {
    activeWorkspaceId: string
}

const index = ({ activeWorkspaceId }: Props) => {
    //WIP:add the upgrade button
    const router = useRouter()
    const pathName = usePathname()
    const dispatch = useDispatch()

    const { data, isFetched } = useQueryData(["user-workspaces"], () => getWorkspaces())
    const { latestVariables } = useMutationDataState(['create-workspace'])
    const { data: workspace } = data as WorkspaceProps

    const { data: notification } = useQueryData(['user-notifications'], getNotifications)

    const { data: count } = notification as NotificationProps

    const { data: foldersData, isFetched: isFolderFetched } = useQueryData(['workspace-folders', activeWorkspaceId], () => getWorkspaceFolders(activeWorkspaceId))
    const { status, data: folders } = foldersData as FoldersProps


    const menuItems = MENU_ITEMS(activeWorkspaceId)
    const currentWorkspace = workspace.workspace.find((s) => s.id === activeWorkspaceId)


    const onChangeActiveWorkspace = (value: string) => {
        router.push(`/dashboard/${value}`)
    }

    if (isFetched && workspace) {
        dispatch(WORKSPACES({ workspaces: workspace.workspace }))
    }

    if (isFolderFetched && folders) {
        dispatch(FOLDERS({ folders }))
    }

    const SidebarSection = (
        <div className='bg-[#111111] flex-none relative p-4 h-full w-[250px] flex flex-col gap-4 items-center overflow-y-auto'>
            <div className='bg-[#111111] flex p-4 gap-2 justify-center items-center mb-4 absolute top-0 left-0 right-0'>
                <Image
                    src="/opal-logo.svg"
                    height={40}
                    width={40}
                    alt="logo"
                />
                <p className="text-2xl">Opal</p>
            </div>
            <Select
                defaultValue={activeWorkspaceId}
                onValueChange={onChangeActiveWorkspace}
            >
                <SelectTrigger className="mt-16 text-neutral-400 bg-transparent">
                    <SelectValue placeholder="Select a workspace"></SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#111111] backdrop-blur-xl">
                    <SelectGroup>
                        <SelectLabel>Workspaces</SelectLabel>
                        <Separator />
                        {workspace.workspace.map((workspace) => (
                            <SelectItem
                                value={workspace.id}
                                key={workspace.id}
                            >
                                {workspace.name}
                            </SelectItem>
                        ))}
                        {workspace.members.length > 0 &&
                            workspace.members.map(
                                (workspace) =>
                                    workspace.WorkSpace && (
                                        <SelectItem
                                            value={workspace.WorkSpace.id}
                                            key={workspace.WorkSpace.id}
                                        >
                                            {workspace.WorkSpace.name}
                                        </SelectItem>
                                    )
                            )}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {
                currentWorkspace?.type === 'PUBLIC' && workspace.subscription?.plan === 'PRO' && (
                    <Modal trigger={
                        <span className='text-sm cursor-pointer flex items-center justify-center bg-neutral-800/90 hover:bg-neutral-800/60 w-full rounded-sm p-[5px] gap-2'>
                            <PlusCircle size={15} className='text-neutral-800/90 fill-neutral-500' />
                            <span className='text-neutral-400 font-semibold text-xs'>
                                Invite To Workspace
                            </span>
                        </span>
                    } title="Invite To Workspace"
                        description='Invite other users to your workspace'
                    >
                        <Search workspaceId={activeWorkspaceId} />
                    </Modal>
                )
            }
            <p className='w-full text-[#9d9d9d] font-bold mt-4'>Menu</p>
            <nav className='w-full'>
                <ul>
                    {menuItems.map((item) => (
                        <SidebarItem
                            href={item.href}
                            icon={item.icon}
                            selected={pathName === item.href}
                            title={item.title}
                            key={item.title}
                            notifications={
                                (item.title === 'Notifications' &&
                                    count._count &&
                                    count._count.notification) ||
                                0
                            }
                        />
                    ))}
                </ul>
            </nav>
            <Separator className='w-4/5' />
            <p className='w-full text-[#9d9d9d] font-bold  mt-4'>Workspaces</p>
            {workspace.workspace.length === 1 && workspace.members.length === 0 && (
                <div className='w-full mt-[-10px]'>
                    <p className='text-[#3c3c3c] font-medium text-sm'>{workspace.subscription?.plan === 'FREE' ? 'Upgrade to create Workspaces' : "No Workspaces"}</p>
                </div>
            )}
            <nav className='w-full'>
                <ul className='max-h-[150px] overflow-auto overflow-x-hidden fade-layer'>
                    {workspace.workspace.length > 0 &&
                        workspace.workspace.map((item) => item.type !== 'PERSONAL' && (
                            <SidebarItem
                                href={`/dashboard/${item.id}`}
                                selected={pathName === `/dashboard/${item.id}`}
                                title={item.name}
                                notifications={0}
                                key={item.id}
                                icon={<WorkspacePlaceholder>
                                    {item.name.charAt(0)}
                                </WorkspacePlaceholder>}
                            />
                        ))}
                </ul>
            </nav>
            <Separator className='w-4/5' />
            <p className='w-full text-[#9d9d9d] font-bold  mt-4'>Workspace Member</p>
            <nav className='w-full'>
                {workspace.workspace.length === 1 && workspace.members.length === 0 && (
                    <div className='w-full mt-[-10px]'>
                        <p className='text-[#3c3c3c] font-medium text-sm'>{workspace.subscription?.plan === 'FREE' ? 'Upgrade to create Workspaces' : "No Workspaces"}</p>
                    </div>
                )}
                <ul className='max-h-[150px] overflow-auto overflow-x-hidden fade-layer'>
                    {workspace.members.length > 0 &&
                        workspace.members.map((workspace) => (
                            <SidebarItem
                                href={`/dashboard/${workspace.WorkSpace.id}`}
                                selected={pathName === `/dashboard/${workspace.WorkSpace.id}`}
                                title={workspace.WorkSpace.name}
                                notifications={0}
                                key={workspace.WorkSpace.id}
                                icon={<WorkspacePlaceholder>
                                    {workspace.WorkSpace.name.charAt(0)}
                                </WorkspacePlaceholder>}
                            />
                        ))}
                </ul>
            </nav>
            <Separator className='w-4/5' />
            {workspace.subscription?.plan === 'FREE' && (<GlobalCard title='Upgrade To Pro'
                description='Unlock AI Features like transcription, AI summary, and more.'
                footer={
                    <PaymentButton />
                }
            />)}
        </div>
    )

    return <div className='full'>
        <InfoBar />
        {/* sheet mobile and desktop */}
        <div className='md:hidden fixed my-4'>
            <Sheet>
                <SheetTrigger asChild className='ml-2'>
                    <Button variant={'ghost'} className='mt-[2px]'>
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side={'left'}
                    className='p-0 w-fit h-full'
                >
                    {SidebarSection}
                </SheetContent>
            </Sheet>
        </div>
        <div className='md:block hidden h-full'>
            {SidebarSection}
        </div>
    </div>
}

export default index