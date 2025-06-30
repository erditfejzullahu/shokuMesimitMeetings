

interface User {
  id: number; // sub is typically string
  name: string;
  username: string;
  role: string;
  email: string;
  profilePicture: string;
}


// sliders
interface Instructors {
  instructorId: number;
  userId: number;
  instructorName: string;
  profilePictureUrl: string;
  email: string;
  expertise: string;
  bio: string;
  instructorStudents: number;
  instructorCourses: number;
  whenBecameInstructor: Date;
  rating: 3.5 //TODO: implement rating system
}

interface AllOnlineMeetings {
  id: number;
  title: string;
  status: number;
  outputStatus: string;
  registered: number;
  instructorName: string;
  scheduleDateTime: Date;
  durationTime: number | null;
  createdAt: Date; 
}

interface AllStudents {
  id: number;
  profilePictureUrl: string;
  email: string;
  name: string;
  createdAt: Date; // kur u bo student i kurseve
  coursesEnrolled: number;
}
// sliders

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