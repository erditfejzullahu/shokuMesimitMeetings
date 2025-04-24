interface User {
    id: number;
    name: string;
    email: string;
    profilePic: string;
    role: string;
}

interface MeetingHeaderDetails {
    meetingDetails: {
      id: number;
      intructor: string;
      title: string;
      description: string;
      scheduleDateTime: string;
      durationTime?: string;
      status: string;
      course: string;
      lesson: string;
    }
  }