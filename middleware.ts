import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest){
    const session = await getSession();
    const {pathname} = request.nextUrl;
    
    if(pathname.startsWith('/room') || pathname.startsWith('/api/room')) {
        console.log("op[[[[");
        
        if(!session){
            if(pathname.startsWith('/api')){
                return NextResponse.json({error: "Unauthorized"}, {status: 401})
            }else{
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname));
                return NextResponse.redirect(loginUrl);
            }
        }
    }

    return NextResponse.next();
}