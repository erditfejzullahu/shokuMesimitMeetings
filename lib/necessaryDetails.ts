import { apiClient } from "./api"

export const fetchUserData = async () => {
    try {
        const response = await apiClient('/api/OnlineMeetings/GetParticipantData', {method: "GET"})
        const data = await response.json();
        console.log(data, '  asdasdasd');
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