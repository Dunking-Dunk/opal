"use server"

import { db } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import nodemailer from 'nodemailer'
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET as string)

export const sendEmail = async (
    to: string,
    subject: string,
    text: string,
    html?: string
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD,
        },
    })

    const mailOptions = {
        to,
        subject,
        text,
        html,
    }
    return { transporter, mailOptions }
}

export const onAuthenticateUser = async () => {
    try {
        const user = await currentUser()

        if (!user) {
            return { status: 404 }
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


export const getNotifications = async () => {
    try {
        const user = await currentUser()

        if (!user) return { status: 404 }

        const notifications = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                notification: true,
                _count: {
                    select: {
                        notification: true
                    }
                }
            }
        })

        if (notifications && notifications.notification.length > 0) {
            return {
                status: 200,
                data: notifications
            }
        }

        return {
            status: 404,
            data: []
        }
    }
    catch (err) {
        return {
            status: 400
        }
    }
}

export const searchUsers = async (query: string) => {
    try {
        const user = await currentUser()

        if (!user) {
            return { status: 404 }
        }

        const users = await db.user.findMany({
            where: {
                OR: [
                    { firstname: { contains: query } },
                    { email: { contains: query } },
                    { lastname: { contains: query } }
                ],
                NOT: [{ clerkid: user.id }]
            },
            select: {
                id: true,
                subscription: {
                    select: {
                        plan: true
                    }
                },
                firstname: true,
                lastname: true,
                image: true,
                email: true
            }
        })

        if (users && users.length > 0) {
            return {
                status: 200,
                data: users
            }
        }

        return { status: 404, data: undefined }
    } catch (error) {
        return { status: 500, data: undefined }
    }
}

export const getPaymentInfo = async () => {
    try {
        const user = await currentUser()

        if (!user) {
            return { status: 404 }
        }

        const payment = await db.user.findUnique({
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

        if (payment) {
            return {
                status: 200, data: payment
            }
        }

        return {
            status: 400,
            data: undefined
        }

    } catch (error) {
        return { status: 500, data: undefined }
    }
}

export const enableFirstView = async (state: boolean) => {
    try {
        const user = await currentUser()

        if (!user) return { status: 404 }

        const view = await db.user.update({
            where: {
                clerkid: user.id,
            },
            data: {
                firstView: state,
            },
        })

        if (view) {
            return { status: 200, data: 'Setting updated' }
        }
    } catch (error) {
        return { status: 400 }
    }
}

export const getFirstView = async () => {
    try {
        const user = await currentUser()
        if (!user) return { status: 404 }
        const userData = await db.user.findUnique({
            where: {
                clerkid: user.id,
            },
            select: {
                firstView: true,
            },
        })
        if (userData) {
            return { status: 200, data: userData.firstView }
        }
        return { status: 400, data: false }
    } catch (error) {
        return { status: 400 }
    }
}

export const createCommentAndReply = async (
    userId: string,
    comment: string,
    videoId: string,
    commentId?: string | undefined
) => {
    try {

        if (commentId) {
            const reply = await db.comment.update({
                where: {
                    id: commentId
                },
                data: {
                    reply: {
                        create: {
                            comment,
                            userId,
                            videoId
                        }
                    }
                }
            })

            if (reply) {
                return {
                    status: 201,
                    data: 'Reply posted successfully!'
                }
            }
        }

        const newComment = await db.video.update({
            where: {
                id: videoId
            },
            data: {
                Comment: {
                    create: {
                        comment,
                        userId
                    }
                }
            }
        })

        if (newComment) {
            return {
                status: 201,
                data: 'Comment is posted!'
            }
        }

        return {
            status: 401,
            data: 'Something failed while posting a comment'
        }
    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const getUserProfile = async () => {
    try {
        const user = await currentUser()

        if (!user) return { status: 404 }

        const userProfile = await db.user.findUnique({
            where: {
                clerkid: user.id
            },
            select: {
                id: true,
                image: true
            }
        })

        if (userProfile) {
            return {
                status: 200,
                data: userProfile
            }
        }

        return {
            status: 400,
            data: 'User Profile not found'
        }

    } catch (err) {
        return {
            status: 500,
            data: 'Someting went Wrong!'
        }
    }
}

export const inviteMembers = async (
    workspaceId: string,
    recieverId: string,
    email: string
) => {
    try {
        const user = await currentUser()
        if (!user) return { status: 404 }
        const senderInfo = await db.user.findUnique({
            where: {
                clerkid: user.id,
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
            },
        })

        const recieverInfo = await db.user.findUnique({
            where: {
                id: recieverId,
            },
            select: {
                id: true,
                firstname: true,
                lastname: true,
            },
        })


        if (senderInfo?.id && recieverInfo) {
            const workspace = await db.workSpace.findUnique({
                where: {
                    id: workspaceId,
                },
                select: {
                    name: true,
                },
            })
            if (workspace) {
                const invitation = await db.invite.create({
                    data: {
                        senderId: senderInfo.id,
                        recieverId,
                        workSpaceId: workspaceId,
                        content: `You are invited to join ${workspace.name} Workspace, click accept to confirm`,
                    },
                    select: {
                        id: true,
                    },
                })

                await db.notification.createMany({
                    data: [
                        { content: `${user.firstName} ${user.lastName} invited ${recieverInfo?.firstname} into ${workspace.name}`, userId: senderInfo.id },
                        { content: `${user.firstName} ${user.lastName} invited ${recieverInfo?.firstname} into ${workspace.name}`, userId: recieverId }
                    ]
                })

                if (invitation) {
                    const { transporter, mailOptions } = await sendEmail(
                        email,
                        'You got an invitation',
                        `You are invited to join ${workspace.name} Workspace, click accept to confirm`,
                        `<a href="${process.env.NEXT_PUBLIC_HOST_URL}/invite/${invitation.id}" style="background-color: #000; padding: 5px 10px; border-radius: 10px;">Accept Invite</a>`
                    )

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log('🔴', error.message)
                        } else {
                            console.log('✅ Email sent')
                        }
                    })
                    return { status: 200, data: 'Invite sent' }
                }
                return { status: 400, data: 'invitation failed' }
            }
            return { status: 404, data: 'workspace not found' }
        }
        return { status: 404, data: 'recipient not found' }
    } catch (error) {
        console.log(error)
        return { status: 400, data: 'Oops! something went wrong' }
    }
}

export const acceptInvite = async (inviteId: string) => {

    try {
        const user = await currentUser()

        if (!user) {
            return {
                status: 404
            }
        }

        const invite = await db.invite.findUnique({
            where: {
                id: inviteId
            },
            select: {
                workSpaceId: true,
                WorkSpace: {
                    select: {
                        name: true
                    }
                },
                recieverId: true,
                reciever: {
                    select: {
                        firstname: true,
                        clerkid: true
                    }
                },
                senderId: true,
                sender: {
                    select: {
                        firstname: true
                    }
                },
                accepted: true
            }
        })

        if (!invite) {
            return {
                status: 404,
                data: 'Invitation not found!'
            }
        }

        if (user.id !== invite.reciever?.clerkid) return { status: 401 }

        if (invite?.workSpaceId) {
            if (invite.accepted === false) {
                const inviteAccepted = db.invite.update({
                    where: {
                        id: inviteId
                    },
                    data: {
                        accepted: true
                    }
                })

                const updateMember = db.user.update({
                    where: {
                        clerkid: user.id
                    },
                    data: {
                        members: {
                            create: {
                                workSpaceId: invite.workSpaceId
                            }
                        }
                    }
                })

                const memberTransaction = await db.$transaction([
                    inviteAccepted,
                    updateMember
                ])

                if (memberTransaction) {
                    await db.notification.createMany({
                        data: [
                            { content: `${invite.reciever?.firstname} has joined your ${invite.WorkSpace?.name} Workspace`, userId: invite.senderId },
                            { content: `You have joined ${invite.WorkSpace?.name} Workspace created by ${invite.sender?.firstname}`, userId: invite.recieverId }
                        ]
                    })

                    return { status: 200, data: invite.workSpaceId }
                }
                return { status: 400, data: 'Failed to accept invitation!' }
            }
            return { status: 400, data: 'Invitation already accepted!' }
        }
        return { status: 400, data: 'Workspace not found!' }
    } catch (error) {
        console.log(error)
        return { status: 400, data: 'Oops! something went wrong' }
    }
}


export const completeSubscription = async (session_id: string) => {
    try {
        const user = await currentUser()

        if (!user) {
            return {
                status: 404
            }
        }

        const session = await stripe.checkout.sessions.retrieve(session_id)

        if (session) {
            const customer = await db.user.update({
                where: {
                    clerkid: user.id
                },
                data: {
                    subscription: {
                        update: {
                            data: {
                                customerId: session.customer as string,
                                plan: 'PRO'
                            }
                        }
                    }
                }
            })

            if (customer) {
                return { status: 200 }
            }
        }
        return { status: 404 }
    } catch (error) {
        console.log(error)
        return { status: 400, data: 'Oops! something went wrong' }
    }
}