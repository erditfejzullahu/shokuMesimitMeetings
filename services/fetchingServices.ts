"use client"

export const fetchClientSide = async (endpoint: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {method: "GET" ,headers: {
        "ngrok-skip-browser-warning": "69420",
        "Content-Type": "application/json",
    },})
      
    if(!response.ok){
        if(response.status === 404){
            return []
        }else{
            throw new Error(`Failed to fetch ${endpoint}`)
        }
    }
    // try {
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            const text = await response.text();
            console.warn("Expected JSON, got:", text);
            throw new Error(`Invalid JSON response for ${endpoint}`);
        }
        return await response.json();
    // } catch (error) {
    //     console.log(error, ' error')
    //     return null;
    // }
}

export const getAllInstructors = async (): Promise<Instructors[]> => {        
    // await new Promise(resolve => setTimeout(resolve, 10000))
    return await fetchClientSide(`/api/Instructors/GetAllInstructorsUnAuth`);
}

export const getAllOnlineMeetings = async (): Promise<AllOnlineMeetings[]> => {
    // await new Promise(resolve => setTimeout(resolve, 10000))
    return await fetchClientSide(`/api/Instructors/GetAllOnlineMeetingsUnAuth`);
}

export const getAllStudents = async (): Promise<AllStudents[]> => {
    // await new Promise(resolve => setTimeout(resolve, 10000))
    return await fetchClientSide(`/api/Instructors/GetAllStudentsUnAuth`);
}