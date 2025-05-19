import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ meetingData }: { meetingData: MeetingHeaderDetails }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!meetingData?.scheduleDateTime) return;

    const targetDate = new Date(meetingData.scheduleDateTime).getTime(); // Convert to timestamp
    
    const updateCountdown = () => {
      const now = new Date().getTime(); // Convert to timestamp
      const difference = targetDate - now;

      if (difference <= 0) {
        // The event has started or passed
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const timer = setInterval(updateCountdown, 1000);

    // Clean up on unmount
    return () => clearInterval(timer);
  }, [meetingData?.scheduleDateTime]);

  // Format the countdown in Albanian
  const formatCountdown = () => {
    const { days, hours, minutes, seconds } = timeLeft;
    const parts = [];

    if (days > 0) parts.push(`${days} ditë`);
    if (hours > 0) parts.push(`${hours} orë`);
    if (minutes > 0) parts.push(`${minutes} minuta`);
    if (seconds > 0 || parts.length === 0) parts.push(`${Math.floor(seconds)} sekonda`);

    return parts.join(' ');
  };

  if (!meetingData?.scheduleDateTime) {
    return <span>Nuk ka orar të caktuar</span>;
  }

  return (
    <span className="text-white font-psemibold uppercase">Nis për: {formatCountdown()}</span>
  );
};

export default CountdownTimer;