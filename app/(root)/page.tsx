"use client"
import { useState, useEffect } from 'react';

type Participant = {
  id: string;
  name: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isSpeaking: boolean;
};

export default function VideoConference() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', videoEnabled: true, audioEnabled: true, isSpeaking: false },
    { id: '2', name: 'John Doe', videoEnabled: true, audioEnabled: true, isSpeaking: true },
    { id: '3', name: 'Jane Smith', videoEnabled: false, audioEnabled: true, isSpeaking: false },
    { id: '4', name: 'Mike Johnson', videoEnabled: true, audioEnabled: false, isSpeaking: false },
  ]);
  
  const [controls, setControls] = useState({
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    isRecording: false,
  });

  const toggleControl = (control: keyof typeof controls) => {
    setControls(prev => ({ ...prev, [control]: !prev[control] }));
  };

  // Simulate speaking participants
  useEffect(() => {
    const interval = setInterval(() => {
      setParticipants(prev => prev.map(p => ({
        ...p,
        isSpeaking: p.id === '2' ? Math.random() > 0.5 : p.isSpeaking
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    // <div className="flex flex-col h-screen bg-white">
    //   {/* Main video area */}
    //   <div className="flex-grow grid participant-grid gap-4 p-4">
    //     {participants.map((participant) => (
    //       <div 
    //         key={participant.id}
    //         className={`
    //           relative rounded-lg overflow-hidden bg-surface
    //           ${participant.isSpeaking ? 'speaking-border' : ''}
    //         `}
    //       >
    //         {participant.videoEnabled ? (
    //           <div className="w-full h-full bg-surface flex items-center justify-center">
    //             <video
    //               className="w-full h-full object-cover"
    //               autoPlay
    //               muted={participant.id === '1' || controls.isMuted}
    //             />
    //           </div>
    //         ) : (
    //           <div className="w-full h-full bg-surface-dark/10 flex items-center justify-center">
    //             <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center">
    //               <span className="text-2xl font-semibold text-surface">
    //                 {participant.name.split(' ').map(n => n[0]).join('')}
    //               </span>
    //             </div>
    //           </div>
    //         )}
            
    //         <div className="absolute bottom-2 left-2 bg-surface/80 px-2 py-1 rounded-md text-sm text-surface-dark">
    //           {participant.name} {participant.id === '1' && '(You)'}
    //         </div>
            
    //         <div className="absolute top-2 right-2 flex gap-1">
    //           {!participant.audioEnabled && (
    //             <span className="bg-surface/80 p-1 rounded-full">
    //               <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    //               </svg>
    //             </span>
    //           )}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
      
    //   {/* Controls */}
    //   <div className="bg-surface py-3 px-6 flex justify-center items-center gap-6">
    //     <ControlButton
    //       active={controls.isMuted}
    //       onClick={() => toggleControl('isMuted')}
    //       activeColor="error"
    //       icon={
    //         controls.isMuted ? (
    //           <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    //           </svg>
    //         ) : (
    //           <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    //           </svg>
    //         )
    //       }
    //       label={controls.isMuted ? 'Unmute' : 'Mute'}
    //     />
        
    //     <ControlButton
    //       active={controls.isVideoOff}
    //       onClick={() => toggleControl('isVideoOff')}
    //       activeColor="error"
    //       icon={
    //         <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    //         </svg>
    //       }
    //       label={controls.isVideoOff ? 'Start Video' : 'Stop Video'}
    //     />
        
    //     <ControlButton
    //       active={controls.isScreenSharing}
    //       onClick={() => toggleControl('isScreenSharing')}
    //       activeColor="success"
    //       icon={
    //         <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    //         </svg>
    //       }
    //       label={controls.isScreenSharing ? 'Stop Share' : 'Share Screen'}
    //     />
        
    //     <ControlButton
    //       active={controls.isRecording}
    //       onClick={() => toggleControl('isRecording')}
    //       activeColor="error"
    //       icon={
    //         <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    //         </svg>
    //       }
    //       label={controls.isRecording ? 'Stop Recording' : 'Record'}
    //     />
        
    //     <button
    //       onClick={() => console.log('Leave meeting')}
    //       className="flex flex-col items-center text-surface-dark bg-error hover:opacity-80 transition p-3 rounded-full"
    //     >
    //       <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    //       </svg>
    //       <span className="text-xs mt-1">Leave</span>
    //     </button>
    //   </div>
    // </div>

    <div>Test</div>
  );
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
  activeColor = "primary",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeColor?: "primary" | "error" | "success" | "warning";
}) {
  const colorMap = {
    primary: "bg-primary",
    error: "bg-error",
    success: "bg-success",
    warning: "bg-warning",
  };
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center"
    >
      <div className={`
        p-3 rounded-full transition
        ${active ? colorMap[activeColor] : "bg-primary-dark"}
        hover:opacity-80
      `}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}