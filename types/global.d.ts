

interface User {
  id: number; // sub is typically string
  name: string;
  username: string;
  role: string;
  email: string;
  profilePicture: string;
}

interface MeetingHeaderDetails {
    id: number;
    instructor: string;
    instructorId: number;
    title: string;
    description: string;
    category?: string;
    scheduleDateTime: string;
    durationTime?: number;
    status: string;
    course: string;
    courseId: number;
    lesson: string;
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