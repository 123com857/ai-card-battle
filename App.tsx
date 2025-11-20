import React, { useState, useEffect, useCallback } from 'react';
import { Hero, PlayerState, Card, GamePhase, CardName, CardType, GameLog } from './types';
import { INITIAL_DECK, HEROES } from './constants';
import CardComponent from './components/CardComponent';
import HeroFrame from './components/HeroFrame';
import GameLogDisplay from './components/GameLog.tsx';
import { getAiDecision } from './services/gemini';

// Helper to shuffle
const shuffle = (cards: Card[]) => {
  return [...cards].sort(() => Math.random() - 0.5);
};

export default function App() {
  // --- State ---
  const [gameStarted, setGameStarted] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [turnIndex, setTurnIndex] = useState(0); // 0 = Player, 1 = AI
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [logs, setLogs] = useState<GameLog[]>([]);
  
  const [player, setPlayer] = useState<PlayerState>({
    hero: HEROES[0],
    hp: 4,
    hand: [],
    equipment: {},
    isAi: false,
  });

  const [ai, setAi] = useState<PlayerState>({
    hero: HEROES[1],
    hp: 4,
    hand: [],
    equipment: {},
    isAi: true,
  });

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [hasPlayedSha, setHasPlayedSha] = useState(false); // Limit 1 Sha per turn
  const [pendingAction, setPendingAction] = useState<{ type: 'DODGE_REQUEST', source: 'player' | 'ai', damage: number } | null>(null);

  // --- Logging ---
  const addLog = (text: string, source: 'system' | 'player' | 'ai' = 'system') => {
    setLogs(prev => [...prev, { id: Date.now(), text, source }]);
  };

  // --- Initialization ---
  const startGame = (selectedHero: Hero) => {
    const deckCopy = shuffle([...INITIAL_DECK, ...INITIAL_DECK]); // Double deck for length
    
    // Deal 4 cards to each
    const pHand = deckCopy.splice(0, 4);
    const aHand = deckCopy.splice(0, 4);

    // AI Hero Random Selection (excluding player's choice)
    const availableHeroes = HEROES.filter(h => h.id !== selectedHero.id);
    const aiHero = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];

    setPlayer({
        hero: selectedHero,
        hp: selectedHero.maxHp,
        hand: pHand,
        equipment: {},
        isAi: false
    });

    setAi({
        hero: aiHero,
        hp: aiHero.maxHp,
        hand: aHand,
        equipment: {},
        isAi: true
    });

    setDeck(deckCopy);
    setGameStarted(true);
    setTurnIndex(0);
    setPhase(GamePhase.START);
    addLog(`Game Start! You are ${selectedHero.name} vs ${aiHero.name}.`);
  };

  // --- Turn Management ---

  // Start Phase
  useEffect(() => {
    if (!gameStarted) return;

    if (phase === GamePhase.START) {
       // Reset turn counters
       setHasPlayedSha(false);
       setPhase(GamePhase.DRAW);
    }
  }, [phase, gameStarted]);

  // Draw Phase
  useEffect(() => {
    if (phase !== GamePhase.DRAW) return;

    const currentPlayer = turnIndex === 0 ? player : ai;
    const setCurrentPlayer = turnIndex === 0 ? setPlayer : setAi;

    addLog(`${currentPlayer.hero.name} draws 2 cards.`, turnIndex === 0 ? 'player' : 'ai');

    setTimeout(() => {
        const drawn = deck.slice(0, 2);
        const remainingDeck = deck.slice(2);
        
        // Refill deck if empty (simplified)
        if (remainingDeck.length < 2) {
             addLog("Deck reshuffled.");
             setDeck(shuffle([...INITIAL_DECK, ...INITIAL_DECK]));
        } else {
            setDeck(remainingDeck);
        }

        setCurrentPlayer(prev => ({ ...prev, hand: [...prev.hand, ...drawn] }));
        setPhase(GamePhase.PLAY);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, turnIndex]);

  // --- Gameplay Actions ---

  const handleDamage = (targetIsAi: boolean, amount: number) => {
      const setter = targetIsAi ? setAi : setPlayer;
      setter(prev => {
          const newHp = prev.hp - amount;
          addLog(`${prev.hero.name} takes ${amount} damage! HP: ${newHp}`, 'system');
          if (newHp <= 0) {
              setPhase(GamePhase.GAME_OVER);
              addLog(`${prev.hero.name} has been defeated!`, 'system');
          }
          // Cao Cao Skill Check
          if (prev.hero.id === 'caocao' && newHp > 0) {
             addLog("Cao Cao triggers [Jian Xiong] (implied: gets cards - logic omitted for brevity)", 'system');
          }
          return { ...prev, hp: newHp };
      });
  };

  const discardCard = (actorIsAi: boolean, cardIndex: number) => {
      const actor = actorIsAi ? ai : player;
      const setter = actorIsAi ? setAi : setPlayer;
      
      const card = actor.hand[cardIndex];
      const newHand = [...actor.hand];
      newHand.splice(cardIndex, 1);

      setDiscardPile(prev => [...prev, card]);
      setter(prev => ({ ...prev, hand: newHand }));
      return card;
  };

  // --- AI Logic ---
  useEffect(() => {
    if (phase === GamePhase.PLAY && turnIndex === 1 && !pendingAction) {
        // Identify valid moves
        const validIndices = ai.hand.map((c, i) => {
            if (c.name === CardName.SHA && !hasPlayedSha) return i;
            if (c.name === CardName.TAO && ai.hp < ai.hero.maxHp) return i;
            if (c.type === CardType.SCROLL) return i;
            if (c.type === CardType.EQUIPMENT) return i;
            return -1;
        }).filter(i => i !== -1);

        // Send to Gemini
        getAiDecision(ai, player, phase, validIndices).then(move => {
            setTimeout(() => {
                if (move.action === 'END_TURN') {
                    addLog(`AI: ${move.reasoning}`, 'ai');
                    addLog("AI ends turn.", 'ai');
                    setPhase(GamePhase.DISCARD);
                } else if (move.action === 'PLAY_CARD' && move.cardIndex !== undefined) {
                    addLog(`AI: ${move.reasoning}`, 'ai');
                    playCard(true, move.cardIndex);
                }
            }, 1500); // Think time
        });
    } else if (phase === GamePhase.DISCARD && turnIndex === 1) {
        // AI Discard Logic
        const excess = ai.hand.length - ai.hp;
        if (excess > 0) {
             setTimeout(() => {
                 discardCard(true, 0); // Naive discard first
                 addLog("AI discards a card.", 'ai');
                 // Force re-eval by not changing phase immediately inside discardCard, rely on loop
             }, 500);
        } else {
            setTurnIndex(0);
            setPhase(GamePhase.START);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, turnIndex, ai.hand.length, pendingAction]);

  // --- Response Logic (Dodge/Peach interaction) ---
  useEffect(() => {
      if (!pendingAction) return;

      if (pendingAction.type === 'DODGE_REQUEST' && pendingAction.source === 'player') {
          // AI needs to dodge
          const dodgeIndex = ai.hand.findIndex(c => c.name === CardName.SHAN);
          if (dodgeIndex !== -1) {
              setTimeout(() => {
                  addLog("AI plays Dodge!", 'ai');
                  discardCard(true, dodgeIndex);
                  setPendingAction(null); // Dodged
              }, 1000);
          } else {
              // Armor check (Ba Gua) - simplified 50%
              if (ai.equipment.armor?.name === CardName.BAGUA) {
                   addLog("AI uses Ba Gua Zhen...", 'ai');
                   if (Math.random() > 0.5) {
                       addLog("Ba Gua SUCCEEDS! Attack negated.", 'ai');
                       setPendingAction(null);
                       return;
                   } else {
                       addLog("Ba Gua FAILS.", 'ai');
                   }
              }

              setTimeout(() => {
                  addLog("AI cannot dodge!", 'ai');
                  handleDamage(true, pendingAction.damage);
                  setPendingAction(null);
              }, 1000);
          }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction]);


  // --- Player Action Handling ---

  const playCard = (isAi: boolean, index: number) => {
      const actor = isAi ? ai : player;
      const card = actor.hand[index];
      
      // Remove card from hand
      discardCard(isAi, index);

      addLog(`${isAi ? 'AI' : 'Player'} plays [${card.name}].`, isAi ? 'ai' : 'player');

      // Card Effects
      if (card.name === CardName.SHA) {
          if (!isAi) setHasPlayedSha(true);
          // Trigger Dodge Request
          setPendingAction({ type: 'DODGE_REQUEST', source: isAi ? 'ai' : 'player', damage: 1 });
      } 
      else if (card.name === CardName.TAO) {
          const setter = isAi ? setAi : setPlayer;
          setter(prev => ({ ...prev, hp: Math.min(prev.hp + 1, prev.hero.maxHp) }));
          addLog(`${isAi ? 'AI' : 'Player'} recovers 1 HP.`, 'system');
      }
      else if (card.name === CardName.WUZHONG) {
           const setter = isAi ? setAi : setPlayer;
           const drawn = deck.slice(0, 2);
           setDeck(d => d.slice(2));
           setter(prev => ({ ...prev, hand: [...prev.hand, ...drawn] }));
           addLog("Draws 2 cards.", 'system');
      }
      else if (card.name === CardName.NANMAN) {
          // AoE Damage simplified
          if (isAi) {
               // Player must respond (simplified: player takes damage for now in this demo logic)
               addLog("Nan Man Ru Qin! (Simplified: Auto-hit)", 'system');
               handleDamage(false, 1);
          } else {
               handleDamage(true, 1);
          }
      }
      else if (card.type === CardType.EQUIPMENT) {
          const setter = isAi ? setAi : setPlayer;
          // Equip logic
          setter(prev => ({
              ...prev,
              equipment: {
                  ...prev.equipment,
                  [card.name === CardName.BAGUA ? 'armor' : 'weapon']: card
              }
          }));
          addLog(`Equipped ${card.name}`, 'system');
      }
  };

  const handlePlayerCardClick = (index: number) => {
      if (turnIndex !== 0 || phase !== GamePhase.PLAY || pendingAction) {
          // Handling user response to AI attack
          if (pendingAction && pendingAction.source === 'ai' && pendingAction.type === 'DODGE_REQUEST') {
              const card = player.hand[index];
              if (card.name === CardName.SHAN) {
                  discardCard(false, index);
                  addLog("You played Dodge!", 'player');
                  setPendingAction(null);
              } else {
                  addLog("Must play Dodge!", 'system');
              }
          }
          return;
      }

      const card = player.hand[index];

      // Validation
      if (card.name === CardName.SHA && hasPlayedSha && !player.equipment.weapon /* Assume weapon allows more later, strictly 1 for now */) {
          addLog("Already used Slash this turn.", 'system');
          return;
      }
      if (card.name === CardName.TAO && player.hp === player.hero.maxHp) {
          addLog("Already at full health.", 'system');
          return;
      }

      setSelectedCardIndex(index);
      // For simple interaction, double click or confirm button usually needed, 
      // but here we act on single click for "Self" cards, confirm for targets.
      // Since 1v1, target is always AI.
      playCard(false, index);
      setSelectedCardIndex(null);
  };

  const endPlayerTurn = () => {
      if (turnIndex !== 0) return;
      setPhase(GamePhase.DISCARD);
  };

  const handleDiscardPhase = (index: number) => {
      if (phase !== GamePhase.DISCARD || turnIndex !== 0) return;
      discardCard(false, index);
  };

  useEffect(() => {
      if (phase === GamePhase.DISCARD && turnIndex === 0) {
          if (player.hand.length <= player.hp) {
              setTurnIndex(1);
              setPhase(GamePhase.START);
              addLog("End of Player Turn.", 'system');
          }
      }
  }, [player.hand.length, player.hp, phase, turnIndex]);


  // --- Render ---

  if (!gameStarted) {
      return (
          <div className="min-h-screen flex items-center justify-center flex-col bg-black/80 text-sgs-text p-4">
              <h1 className="text-5xl font-serif font-bold mb-2 text-sgs-gold tracking-widest">三國殺</h1>
              <h2 className="text-xl mb-8 text-gray-400">SanGuoSha: AI Duel</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {HEROES.slice(0,2).map(h => (
                      <div key={h.id} onClick={() => startGame(h)} 
                           className="cursor-pointer hover:scale-105 transition-transform border-2 border-sgs-wood rounded-lg p-4 bg-sgs-bg/90 flex flex-col items-center w-64">
                          <img src={h.avatarUrl} alt={h.name} className="w-full h-48 object-cover mb-4 rounded border border-gray-600" />
                          <h3 className="text-xl font-bold text-sgs-gold">{h.name}</h3>
                          <p className="text-xs text-gray-400 mt-2 text-center">{h.skillDescription}</p>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen flex flex-col relative overflow-hidden">
      {/* Background Overlay for darkening */}
      <div className="absolute inset-0 pointer-events-none bg-black/20" />

      {/* Top Area: AI Opponent */}
      <div className="flex justify-center pt-4 relative z-10">
         <HeroFrame player={ai} isCurrentTurn={turnIndex === 1} />
         {/* AI Hand (Back of cards) */}
         <div className="absolute right-4 top-4 flex -space-x-12">
             {ai.hand.map((_, i) => (
                 <CardComponent key={i} card={_} isFaceUp={false} small />
             ))}
         </div>
      </div>

      {/* Middle Area: Board & Logs */}
      <div className="flex-1 flex flex-row items-center justify-between px-8 relative z-10">
         
         {/* Left: Game Log */}
         <div className="w-64 h-48 z-20">
            <GameLogDisplay logs={logs} />
         </div>

         {/* Center: Decks */}
         <div className="flex gap-8 items-center justify-center">
             {/* Draw Pile */}
             <div className="relative">
                 <div className="text-white text-center text-xs mb-1">Deck ({deck.length})</div>
                 <CardComponent card={INITIAL_DECK[0]} isFaceUp={false} disabled />
             </div>
             {/* Discard Pile */}
             <div className="relative">
                 <div className="text-white text-center text-xs mb-1">Discard</div>
                 {discardPile.length > 0 ? (
                     <CardComponent card={discardPile[discardPile.length-1]} disabled />
                 ) : (
                     <div className="w-24 h-36 border-2 border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 text-xs">Empty</div>
                 )}
             </div>
         </div>

         {/* Right: Action Prompts */}
         <div className="w-64 flex flex-col items-end justify-center text-white">
             {phase === GamePhase.GAME_OVER && (
                 <div className="text-4xl font-bold text-red-500 mb-4 animate-bounce">GAME OVER</div>
             )}
             
             {pendingAction && pendingAction.source === 'ai' && (
                 <div className="bg-red-900/80 border border-red-500 p-4 rounded animate-pulse mb-4">
                     <p className="font-bold text-red-100">ATTACKED!</p>
                     <p className="text-sm">Play [Dodge] to avoid damage.</p>
                 </div>
             )}

             {phase === GamePhase.PLAY && turnIndex === 0 && !pendingAction && (
                 <button 
                    onClick={endPlayerTurn}
                    className="px-6 py-2 bg-sgs-wood text-sgs-text border border-sgs-gold rounded hover:bg-sgs-gold hover:text-black transition-colors font-serif"
                 >
                     End Turn
                 </button>
             )}
              {phase === GamePhase.DISCARD && turnIndex === 0 && (
                 <div className="text-yellow-400 text-sm bg-black/50 p-2 rounded">
                     Discard {Math.max(0, player.hand.length - player.hp)} cards.
                 </div>
             )}
         </div>
      </div>

      {/* Bottom Area: Player */}
      <div className="flex flex-col items-center pb-4 relative z-10 bg-gradient-to-t from-black/80 to-transparent pt-8">
         
         {/* Hand Area */}
         <div className="flex justify-center items-end space-x-[-40px] hover:space-x-1 transition-all duration-300 min-h-[160px] px-4">
             {player.hand.map((card, i) => (
                 <div key={card.id} className="transform hover:z-50 hover:translate-y-[-20px] transition-all">
                    <CardComponent 
                        card={card} 
                        onClick={() => phase === GamePhase.DISCARD ? handleDiscardPhase(i) : handlePlayerCardClick(i)}
                        selected={selectedCardIndex === i}
                    />
                 </div>
             ))}
         </div>

         {/* Player Info Frame (Bottom Left absolute or flex) */}
         <div className="absolute bottom-4 left-4 scale-90 origin-bottom-left">
             <HeroFrame player={player} isCurrentTurn={turnIndex === 0} />
         </div>
      </div>

    </div>
  );
}