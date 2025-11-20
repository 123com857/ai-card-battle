import React, { useEffect, useRef } from 'react';
import { GameLog } from '../types';

interface GameLogProps {
  logs: GameLog[];
}

const GameLogDisplay: React.FC<GameLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-full bg-black/50 border border-gray-700 rounded p-2 overflow-y-auto font-serif text-sm">
      {logs.map((log) => (
        <div 
            key={log.id} 
            className={`mb-1 
                ${log.source === 'system' ? 'text-gray-400 italic' : 
                  log.source === 'player' ? 'text-green-400' : 'text-red-400'}
            `}
        >
            <span className="opacity-50 text-xs mr-2">[{log.source.toUpperCase()}]</span>
            {log.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default GameLogDisplay;