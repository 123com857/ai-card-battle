import React from 'react';
import { Card, Suit, CardType } from '../types';

interface CardProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  isFaceUp?: boolean;
  small?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, disabled, selected, isFaceUp = true, small = false }) => {
  const isRed = card.suit === Suit.HEART || card.suit === Suit.DIAMOND;
  
  if (!isFaceUp) {
    return (
      <div 
        className={`
          ${small ? 'w-16 h-24' : 'w-24 h-36'} 
          bg-sgs-red border-2 border-sgs-wood rounded-md shadow-md 
          flex items-center justify-center 
          bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]
        `}
      >
        <div className="text-sgs-gold opacity-50 font-serif text-2xl">SGS</div>
      </div>
    );
  }

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative
        ${small ? 'w-16 h-24 text-xs' : 'w-24 h-36 text-sm'}
        bg-[#e8dcca] border-2 rounded-md shadow-lg card-shadow transition-transform duration-200
        ${selected ? 'border-blue-500 -translate-y-4 ring-2 ring-blue-300' : 'border-gray-400 hover:-translate-y-2'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        flex flex-col
      `}
    >
      {/* Top Left: Rank and Suit */}
      <div className={`absolute top-1 left-1 font-bold text-lg leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="text-center">{card.rank}</div>
        <div className="text-center">{card.suit}</div>
      </div>

      {/* Center Image Placeholder */}
      <div className="absolute top-8 left-2 right-2 bottom-10 bg-gray-200 overflow-hidden border border-gray-300 opacity-80">
         {/* Abstract pattern or simplified art based on type */}
         <div className={`w-full h-full flex items-center justify-center text-gray-400 ${
             card.type === CardType.BASIC ? 'bg-stone-100' :
             card.type === CardType.SCROLL ? 'bg-yellow-50' :
             'bg-green-50'
         }`}>
             {card.type === CardType.BASIC ? '⚔️' : card.type === CardType.SCROLL ? '📜' : '🛡️'}
         </div>
      </div>

      {/* Name */}
      <div className="absolute bottom-1 w-full text-center font-serif font-bold text-gray-800 leading-tight px-1">
        {card.name.split(' (')[0]} 
      </div>
      
      {/* Type Indicator Tag */}
       <div className={`absolute top-1 right-1 text-[10px] px-1 rounded text-white
          ${card.type === CardType.BASIC ? 'bg-gray-600' : card.type === CardType.SCROLL ? 'bg-yellow-600' : 'bg-green-600'}
       `}>
          {card.type === CardType.BASIC ? 'Basic' : card.type === CardType.SCROLL ? 'Trick' : 'Equip'}
       </div>
    </div>
  );
};

export default CardComponent;