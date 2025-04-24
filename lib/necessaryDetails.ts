"use server"
import { apiClient } from "./api"

export const fetchUserData = async () => {
    try {
        const response = await apiClient('/api/OnlineMeetings/GetParticipantData', {method: "GET"})
        if(!response.ok){
            return null; 
        }
        const data = await response.json();
        if(!response.ok){
            console.log("sosht ok");
            
            throw new Error("Error in getting participant data")
        }
        return data
    } catch (error) {
        console.error(error);
        return null;
    }
    
}