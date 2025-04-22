import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {roomUrl: string}}){
    try {
        const url = await params.roomUrl;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`)
        const data = await res.json();
        return NextResponse.json(data, {status: res.status});
    } catch (error) {
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}