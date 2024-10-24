"use server"

import { db } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

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