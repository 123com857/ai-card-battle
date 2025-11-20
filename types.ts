export enum Suit {
  SPADE = '♠',
  HEART = '♥',
  CLUB = '♣',
  DIAMOND = '♦',
}

export enum CardType {
  BASIC = 'Basic',
  SCROLL = 'Scroll',
  EQUIPMENT = 'Equipment',
}

export enum CardName {
  SHA = 'Sha (Slash)',
  SHAN = 'Shan (Dodge)',
  TAO = 'Tao (Peach)',
  WUZHONG = 'Wu Zhong Sheng You',
  JUEDOU = 'Jue Dou (Duel)',
  NANMAN = 'Nan Man Ru Qin',
  WANJIAN = 'Wan Jian Qi Fa',
  CHITU = 'Chi Tu (Horse)', // -1 distance
  BAGUA = 'Ba Gua Zhen', // Armor
}

export interface Card {
  id: string;
  name: CardName;
  suit: Suit;
  rank: string; // A, 2-10, J, Q, K
  type: CardType;
  description: string;
  image?: string; // Placeholder URL
}

export interface Hero {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  avatarUrl: string;
  skillName: string;
  skillDescription: string;
}

export interface PlayerState {
  hero: Hero;
  hp: number;
  hand: Card[];
  equipment: {
    weapon?: Card;
    armor?: Card;
    horseDef?: Card;
    horseOff?: Card;
  };
  isAi: boolean;
}

export enum GamePhase {
  START = 'START',
  DRAW = 'DRAW',
  PLAY = 'PLAY',
  DISCARD = 'DISCARD',
  END = 'END',
  GAME_OVER = 'GAME_OVER',
}

export interface GameLog {
  id: number;
  text: string;
  source: 'system' | 'player' | 'ai';
}