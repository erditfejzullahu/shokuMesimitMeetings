"use server"

import { apiClient } from "../api";

export const addNewStudent = async (meetingDetails: MeetingHeaderDetails, userId: number): Promise<number> => {
    
    try {
        const response = await apiClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Instructors/StartCourse`, {
            method: "POST",
            body: JSON.stringify({
                userId,
                courseId: meetingDetails.courseId,
                onlineMeetId: meetingDetails.id,
                instructorId: meetingDetails.instructorId
            })
        })

        if(!response.ok){
            console.log("User not added to meeting")
            return 0;
        }
        const data = await response.json();
        console.log("User added to meeting", data)
        return 1; //1 is added 0 is not added1
    } catch (error) {
        console.log("Error adding participant", error)
        return 0;
    }
}

export const participantJoined = async (meetingId: number) => {
    const dateNow = new Date().toISOString();
    try {
        const response = await apiClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/OnlineMeetings/StartMeeting?meetingId${meetingId}`, {
            method: "PATCH",
        })
        if(!response.ok) return false;
        console.log(await response.json())
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const meetingCompletation = async (meetingId: number) => {
    try {
        const response = await apiClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/OnlineMeetings/MeetingCompletedFromInstructor?meetingId${meetingId}`, {method: "PATCH"})
        if(!response.ok){
            return false;
        }
        console.log(await response.json())
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}