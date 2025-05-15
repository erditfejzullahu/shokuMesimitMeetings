import { setAuthCookies } from "@/lib/auth/auth";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        
        console.log("hini requesti ")
        if(req.headers.get('content-type') !== "application/json"){
            return NextResponse.json(
                {error: "invalid content type"},
                {status: 415}
            )
        }
        const data = await req.json();
        const {accessToken, refreshToken} = data;
        if(!accessToken || !refreshToken){
            return NextResponse.json(
                {error: "missing tokens"},
                {status: 400}
            )
        }

        if (typeof accessToken !== 'string' || accessToken.length < 10) {
            return NextResponse.json(
              { error: 'Invalid token format' },
              { status: 400 }
            );
        }

        await setAuthCookies({accessToken, refreshToken})
        const response =  NextResponse.json({message: "Authenticated via selected cookes"}, {status: 200})

        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return response;

    } catch (error) {
        console.error("authentication error, ", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}