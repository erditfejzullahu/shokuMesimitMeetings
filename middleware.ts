import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest){
    const session = await getSession();
    const {pathname, searchParams} = request.nextUrl;
    
    if(pathname.startsWith("/login")){
        if(session){
            if(!searchParams.has('callbackUrl')){
                const roomUrl = new URL('/room', request.url);
                return NextResponse.redirect(roomUrl);
            }
        }
        return NextResponse.next();
    }

    if(pathname.startsWith('/room') || pathname.startsWith('/api/room')) {
        if(!session){
            if(pathname.startsWith('/api')){
                return NextResponse.json({error: "Unauthorized"}, {status: 401})
            }
            const loginUrl = new URL('/login', request.url);
            const callback = pathname; //for example that requested url gets appended to search aprams
            loginUrl.searchParams.set('callbackUrl', callback);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}