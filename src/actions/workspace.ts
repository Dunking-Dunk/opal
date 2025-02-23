"use server"

import { db } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { sendEmail } from "./user"

export const verifyAccessToWorkspace = async (workspaceId: string) => {
    try {
        const user = await currentUser()

        if (!user) return { status: 403 }

        const isUserInWorkspace = await db.workSpace.findUnique({
            where: {
                id: workspaceId,
                OR: [
                    {
                        User: {
                            clerkid: user.id
                        }
                    }, {
                        members: {
                            every: {
                                User: {
                                    clerkid: user.id
                                }
                            }
                        }
                    }
                ]
            }
        })

        return {
            status: 200,
            data: {
                workspace: isUserInWorkspace
            }
        }
    } catch (error) {
        return { status: 403, data: { workspace: null } }
    }
}

export const getWorkspaceFolders = async (workspaceId: string) => {
    try {
        const isFolders = await db.folder.findMany({
            where: {
                workSpaceId: workspaceId
            },
            include: {
                _count: {
                    select: {
                        videos: true
                    }
                }
            }
        })
        if (isFolders && isFolders.length > 0) {
            return {
                status: 200,
                data: isFolders
            }
        }

        return {
            status: 404, data: []
        }
    } catch (err) {
        return {
            status: 403, data: []
        }
    }
}

export const getAllUserVideos = async (workSpaceId: string) => {
    try {
        const user = await currentUser()

        if (!user) {
            return { status: 404 }
        }

        const videos = await db.video.findMany({
            where: {
                OR: [{
                    workSpaceId
                }, {
                    folderId: workSpaceId
                }]
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                source: true,
                processing: true,
                Folder: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                User: {
                    select: {
                        firstname: true,
                        lastname: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        if (videos && videos.length > 0) {
            return {
                status: 200, data: videos
            }
        }

        return {
            status: 404,
            data: []
        }
    } catch (err) {
        return {
            status: 400
        }
    }
}

export const getWorkspaces = async () => {
    try {
        const user = await currentUser()

        if (!user) return { status: 404 }

        const workspaces = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                subscription: {
                    select: {
                        plan: true
                    }
                },
                workspace: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                members: {
                    select: {
                        WorkSpace: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                }
            }
        })

        if (workspaces) {
            return {
                status: 200,
                data: workspaces
            }
        }

        return {
            status: 404,
            data: []
        }
    }
    catch (err) {
        return {
            status: 400,
            data: []
        }
    }
}

export const createWorkspace = async (name: string) => {
    try {
        const user = await currentUser()

        if (!user) return { status: 404 }

        const authorized = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                subscription: {
                    select: {
                        plan: true
                    }
                }
            }
        })

        if (authorized?.subscription?.plan === 'PRO') {
            const workspace = await db.user.update({
                where: {
                    clerkid: user.id
                },
                data: {
                    workspace: {
                        create: {
                            name,
                            type: 'PUBLIC',
                        }
                    }
                }
            })

            if (workspace) {
                return {
                    status: 200,
                    data: 'Workspace Created.'
                }
            }
        }

        return {
            status: 401,
            data: 'You are not authorized to create a workspace.'
        }

    } catch (err) {
        return {
            status: 400
        }
    }
}

export const renameFolders = async (folderId: string, name: string) => {
    try {
        const user = await currentUser()
        if (!user) return { status: 404 }

        const folder = await db.folder.update({
            where: {
                id: folderId
            },
            data: {
                name
            }
        })

        if (folder) {
            return { status: 200, data: 'Folder Renamed' }
        }

        return {
            status: 400,
            data: 'Folder does not exist'
        }

    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const createFolder = async (workspaceId: string) => {
    try {
        const user = await currentUser()
        if (!user) return { status: 404 }

        const folder = await db.workSpace.update({
            where: {
                id: workspaceId
            },
            data: {
                folders: {
                    create: {
                        name: 'Untitled'
                    }
                }
            }
        })

        if (folder) {
            return {
                status: 201,
                data: 'New Folder Created.'
            }
        }

        return {
            status: 401,
            data: 'Something Failed while creating a folder.'
        }

    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const getFolderInfo = async (folderId: string) => {
    try {
        const folder = await db.folder.findUnique({
            where: {
                id: folderId
            },
            select: {
                name: true,
                _count: {
                    select: {
                        videos: true
                    }
                }
            }
        })

        if (folder) {
            return {
                status: 200,
                data: folder
            }
        }

        return {
            status: 400,
            data: null
        }
    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const moveVideoLocation = async (
    videoId: string,
    workspaceId: string,
    folderId: string
) => {
    try {
        const location = await db.video.update({
            where: {
                id: videoId
            },
            data: {
                workSpaceId: workspaceId,
                folderId: folderId || null
            }
        })

        if (location) {
            return {
                status: 200,
                data: 'Folder changed Successfully!'
            }
        }

        return {
            status: 404,
            data: 'Folder/Workspace not found!'
        }
    }
    catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const getPreviewVideo = async (videoId: string) => {
    try {
        const user = await currentUser()

        const video = await db.video.findUnique({
            where: {
                id: videoId
            },
            select: {
                title: true,
                description: true,
                source: true,
                processing: true,
                views: true,
                createdAt: true,
                summery: true,
                User: {
                    select: {
                        firstname: true,
                        id: true,
                        subscription: {
                            select: {
                                plan: true
                            }
                        },
                        trial: true,
                        clerkid: true,
                        lastname: true,
                        image: true
                    }
                }
            }
        })

        if (video) {
            if (user)
                return {
                    status: 201,
                    data: video,
                    author: user.id === video.User?.clerkid ? true : false,
                    authenticated: true
                }
            else {
                return {
                    status: 201,
                    data: video,
                    author: false,
                    authenticated: false
                }
            }
        }
        return {
            status: 404,
        }
    }
    catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const getVideoComments = async (id: string) => {
    try {
        const comments = await db.comment.findMany({
            where: {
                OR: [{ videoId: id }, { commentId: id }],
                commentId: null
            },
            include: {
                reply: {
                    include: {
                        User: true
                    }
                },
                User: true
            }
        })

        if (comments && comments.length > 0) return { status: 200, data: comments }

        return {
            status: 404,
            data: []
        }

    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const sendEmailForFirstView = async (videoId: string) => {
    try {
        const user = await currentUser()
        if (!user) return { status: 404 }

        const firstViewSettings = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                firstView: true
            }
        })

        if (!firstViewSettings?.firstView) return { status: 404 }

        const video = await db.video.findUnique({
            where: {
                id: videoId
            },
            select: {
                title: true,
                views: true,
                User: {
                    select: {
                        email: true
                    }
                }
            }
        })

        if (video && video.views === 0) {
            await db.video.update({
                where: {
                    id: videoId
                },
                data: {
                    views: video.views + 1
                }
            })

            if (!video) return

            const { transporter, mailOptions } = await sendEmail(
                video.User?.email!,
                'You got a viewer',
                `Your video ${video.title} just got its first viewer`
            )

            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log('🔴', error.message)
                } else {
                    const notification = await db.user.update({
                        where: {
                            email: video.User?.email
                        },
                        data: {
                            notification: {
                                create: {
                                    content: mailOptions.text
                                }
                            }
                        }
                    })

                    if (notification) {
                        return { status: 200 }
                    }
                }
            })
        }


        return {
            status: 400,
            data: 'Something went wrong!'
        }

    } catch (e) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}