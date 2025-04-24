import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest){
    const session = await getSession();
    const {pathname} = request.nextUrl;

    if(pathname.startsWith('/room') && pathname.startsWith('/api/room')) {
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
    }

    return NextResponse.next();
}