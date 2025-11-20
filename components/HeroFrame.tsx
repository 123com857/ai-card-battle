import React from 'react';
import { PlayerState, Card, Suit } from '../types';
import CardComponent from './CardComponent';

interface HeroFrameProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  isRightSide?: boolean; // For layout purposes if we did side-by-side
}

const HeroFrame: React.FC<HeroFrameProps> = ({ player, isCurrentTurn }) => {
  // Calculate HP orbs
  const hpOrbs = [];
  for (let i = 0; i < player.hero.maxHp; i++) {
    const isFull = i < player.hp;
    // Yin-yang style orb colors
    const colorClass = isFull 
        ? (i < 2 ? 'bg-green-600' : 'bg-yellow-500') // Green for healthy, Yellow for mid
        : 'bg-gray-700';
    
    // Override for critical health
    const finalColor = (isFull && player.hp === 1) ? 'bg-red-600' : colorClass;

    hpOrbs.push(
      <div 
        key={i} 
        className={`w-4 h-4 rounded-full border border-white shadow-sm ${finalColor} mb-1`}
      />
    );
  }

  return (
    <div className={`
      relative flex flex-row items-start p-2 rounded-lg border-2
      ${isCurrentTurn ? 'border-sgs-gold bg-sgs-wood/80 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-gray-700 bg-sgs-bg/90'}
      w-[320px] h-[160px] transition-all duration-500
    `}>
      {/* Avatar */}
      <div className="relative w-28 h-full mr-3 shrink-0 border border-gray-600">
        <img 
            src={player.hero.avatarUrl} 
            alt={player.hero.name} 
            className="w-full h-full object-cover grayscale-[20%]" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-center text-sm py-1 font-serif">
            {player.hero.name}
        </div>
      </div>

      {/* Info Area */}
      <div className="flex flex-col flex-grow h-full">
          {/* Title */}
          <div className="text-xs text-gray-400 mb-1">{player.hero.title}</div>
          
          {/* Equipment Slots */}
          <div className="flex space-x-1 mb-2">
            <div className="w-8 h-8 bg-black/30 border border-gray-600 flex items-center justify-center text-xs text-gray-500" title="Weapon">
                {player.equipment.weapon ? '⚔️' : ''}
            </div>
            <div className="w-8 h-8 bg-black/30 border border-gray-600 flex items-center justify-center text-xs text-gray-500" title="Armor">
                {player.equipment.armor ? '🛡️' : ''}
            </div>
            <div className="w-8 h-8 bg-black/30 border border-gray-600 flex items-center justify-center text-xs text-gray-500" title="Offensive Horse">
                {player.equipment.horseOff ? '-1' : ''}
            </div>
            <div className="w-8 h-8 bg-black/30 border border-gray-600 flex items-center justify-center text-xs text-gray-500" title="Defensive Horse">
                {player.equipment.horseDef ? '+1' : ''}
            </div>
          </div>

          {/* Card Count (if hidden hand) */}
          <div className="text-sgs-text text-sm mt-auto mb-1">
             Cards in Hand: {player.hand.length}
          </div>
      </div>

      {/* HP Bar (Absolute Right) */}
      <div className="absolute right-2 top-2 flex flex-col items-center">
        <div className="font-bold text-white mb-1 text-xs">HP</div>
        {hpOrbs.reverse()} 
      </div>
    </div>
  );
};

export default HeroFrame;