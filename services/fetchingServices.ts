"use client"

export const fetchClientSide = async (endpoint: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {method: "GET" ,headers: {
        'Content-Type': 'application/json',
      },})
    if(!response.ok){
        if(response.status === 404){
            return []
        }else{
            throw new Error(`Failed to fetch ${endpoint}`)
        }
    }
    try {
        var data = await response.json()
        return data;
    } catch (error) {
        return null;
    }
}

export const getAllInstructors = async (): Promise<Instructors[]> => {    
    await new Promise(resolve => setTimeout(resolve, 10000))
    return fetchClientSide(`/GetAllInstructorsUnAuth`);
}

export const getAllOnlineMeetings = async (): Promise<AllOnlineMeetings[]> => {
    return fetchClientSide(`/GetAllOnlineMeetingsUnAuth`);
}

export const getAllStudents = async (): Promise<AllStudents[]> => {
    return fetchClientSide(`/GetAllStudentsUnAuth`);
}