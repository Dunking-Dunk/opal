import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params: { id } }: { params: { id: string } }) {
    try {
        console.log('endpoint hit')
        const userProfile = await db.user.findUnique({
            where: {
                clerkid: id
            },
            include: {
                studio: true,
                subscription: {
                    select: {
                        plan: true
                    }
                }
            }
        })


        if (userProfile) return NextResponse.json({ status: 200, user: userProfile })

        const clerk = await clerkClient()
        const clerkUserInstance = await clerk.users.getUser(id)
        const createUser = await db.user.create({
            data: {
                clerkid: id,
                email: clerkUserInstance.emailAddresses[0].emailAddress,
                image: clerkUserInstance.imageUrl,
                firstname: clerkUserInstance.firstName,
                lastname: clerkUserInstance.lastName,
                studio: {
                    create: {}
                },
                subscription: {
                    create: {}
                },
                workspace: {
                    create: {
                        name: `${clerkUserInstance.firstName}'s Workspace`,
                        type: 'PERSONAL'
                    }
                }
            },
            include: {
                subscription: {
                    select: {
                        plan: true
                    }
                }
            }
        })

        if (createUser) return NextResponse.json({ status: 201, user: createUser })

        return NextResponse.json({ status: 400 })
    } catch (err) {
        console.log("Error:", err)
        return NextResponse.json({ status: 500 })
    }

}