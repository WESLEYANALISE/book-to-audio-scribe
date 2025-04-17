
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Download, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      return () => {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      audioRef.current?.play();
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
      
      <div className="mb-3">
        <h3 className="text-lg font-medium text-gray-800 truncate">{title}</h3>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <Slider
        value={[currentTime]}
        max={duration || 100}
        step={0.1}
        onValueChange={handleTimeChange}
        className="my-2"
      />
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="bg-audiobook-primary hover:bg-audiobook-dark text-white rounded-full"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => skip(10)}>
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleDownload}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AudioPlayer;
