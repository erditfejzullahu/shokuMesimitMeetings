
interface User {
  id: number; // sub is typically string
  name: string;
  username: string;
  role: string;
  email: string;
  profilePicture: string;
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

interface CustomJwtClaims { 
  id: string;
  sub: string;
  Name: string;
  Email: string;
  Username: string;
  ProfilePicture: string;
  Role: string;
  exp: number;
}

interface Session {
  user: {
    id: string;
    name: string;
    username: string;
    role: string;
    email: string;
    profilePicture: string;
    token: string;
  };
  expires: Date;
}