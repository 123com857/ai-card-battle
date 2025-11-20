import { Card, CardName, CardType, Hero, Suit } from './types';

export const HEROES: Hero[] = [
  {
    id: 'liubei',
    name: 'Liu Bei',
    title: 'Virtuous Ruler',
    maxHp: 4,
    avatarUrl: 'https://picsum.photos/seed/liubei/200/200',
    skillName: 'Ren De',
    skillDescription: 'Benevolence: Heals allies (Passive in 1v1: Draw 1 extra card when HP < 2)',
  },
  {
    id: 'caocao',
    name: 'Cao Cao',
    title: 'Hero of Chaos',
    maxHp: 4,
    avatarUrl: 'https://picsum.photos/seed/caocao/200/200',
    skillName: 'Jian Xiong',
    skillDescription: 'Ambition: When damaged, you may draw a card.',
  },
  {
    id: 'sunquan',
    name: 'Sun Quan',
    title: 'Young Emperor',
    maxHp: 4,
    avatarUrl: 'https://picsum.photos/seed/sunquan/200/200',
    skillName: 'Zhi Heng',
    skillDescription: 'Balance: Once per turn, discard any number of cards to draw that many + 1.',
  },
  {
    id: 'diaochan',
    name: 'Diao Chan',
    title: 'Beauty',
    maxHp: 3,
    avatarUrl: 'https://picsum.photos/seed/diaochan/200/200',
    skillName: 'Bi Yue',
    skillDescription: 'Moon: Draw 1 extra card during Draw Phase.',
  }
];

// Helper to create deck
const createCard = (name: CardName, suit: Suit, rank: string, type: CardType, desc: string): Card => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  suit,
  rank,
  type,
  description: desc,
});

export const INITIAL_DECK: Card[] = [
  // SHA (Slash) - Approx 30% of deck in real game, reduced here
  createCard(CardName.SHA, Suit.SPADE, '7', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.SPADE, '8', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.SPADE, '8', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.SPADE, '9', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.SPADE, '10', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.CLUB, '2', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.CLUB, '3', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.CLUB, '4', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.HEART, '10', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.DIAMOND, 'K', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.DIAMOND, '6', CardType.BASIC, 'Deal 1 damage to target in range.'),
  createCard(CardName.SHA, Suit.DIAMOND, '7', CardType.BASIC, 'Deal 1 damage to target in range.'),

  // SHAN (Dodge)
  createCard(CardName.SHAN, Suit.DIAMOND, '2', CardType.BASIC, 'Negate a Slash attack.'),
  createCard(CardName.SHAN, Suit.DIAMOND, '2', CardType.BASIC, 'Negate a Slash attack.'),
  createCard(CardName.SHAN, Suit.DIAMOND, '3', CardType.BASIC, 'Negate a Slash attack.'),
  createCard(CardName.SHAN, Suit.HEART, '2', CardType.BASIC, 'Negate a Slash attack.'),
  createCard(CardName.SHAN, Suit.HEART, 'K', CardType.BASIC, 'Negate a Slash attack.'),
  createCard(CardName.SHAN, Suit.HEART, 'K', CardType.BASIC, 'Negate a Slash attack.'),

  // TAO (Peach)
  createCard(CardName.TAO, Suit.HEART, '3', CardType.BASIC, 'Heal 1 HP. Usable when dying.'),
  createCard(CardName.TAO, Suit.HEART, '4', CardType.BASIC, 'Heal 1 HP. Usable when dying.'),
  createCard(CardName.TAO, Suit.HEART, 'Q', CardType.BASIC, 'Heal 1 HP. Usable when dying.'),
  createCard(CardName.TAO, Suit.DIAMOND, 'Q', CardType.BASIC, 'Heal 1 HP. Usable when dying.'),

  // SCROLLS
  createCard(CardName.WUZHONG, Suit.HEART, '7', CardType.SCROLL, 'Draw 2 cards.'),
  createCard(CardName.WUZHONG, Suit.HEART, '8', CardType.SCROLL, 'Draw 2 cards.'),
  createCard(CardName.JUEDOU, Suit.SPADE, 'A', CardType.SCROLL, 'Duel: Target plays Slash, then you, until one fails and takes damage.'),
  createCard(CardName.JUEDOU, Suit.DIAMOND, 'A', CardType.SCROLL, 'Duel: Target plays Slash, then you, until one fails and takes damage.'),
  createCard(CardName.NANMAN, Suit.SPADE, '7', CardType.SCROLL, 'All other players must play Slash or take damage.'),
  createCard(CardName.WANJIAN, Suit.HEART, 'A', CardType.SCROLL, 'All other players must play Dodge or take damage.'),

  // EQUIPMENT
  createCard(CardName.BAGUA, Suit.CLUB, '2', CardType.EQUIPMENT, 'Armor: When needing to Dodge, 50% chance to succeed automatically.'),
  createCard(CardName.CHITU, Suit.HEART, '5', CardType.EQUIPMENT, 'Horse (-1): You are closer to others.'),
];