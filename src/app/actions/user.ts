"use server"

import { db } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const onAuthenticateUser = async () => {
    try {
        const user = await currentUser()

        if (!user) {
            return { status: 403 }
        }

        const userExist = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            include: {
                workspace: {
                    where: {
                        User: {
                            clerkid: user.id
                        }
                    }
                }
            }
        })

        if (userExist) {
            return { status: 200, user: userExist }
        }

        const newUser = await db.user.create({
            data: {
                clerkid: user.id,
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
                firstname: user.firstName,
                lastname: user.lastName,
                studio: {
                    create: {}
                },
                subscription: {
                    create: {}
                },
                workspace: {
                    create: {
                        name: `${user.firstName}'s Workspace`,
                        type: 'PERSONAL'
                    }
                }
            },
            include: {
                workspace: {
                    where: {
                        User: {
                            clerkid: user.id
                        }
                    }
                },
                subscription: {
                    select: {
                        plan: true
                    }
                }
            }
        })

        if (newUser) {
            return { status: 201, user: newUser }
        }

        return { status: 400 }

    } catch (error) {
        return { status: 500 }
    }
}
