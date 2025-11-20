import { GoogleGenAI, Type } from "@google/genai";
import { PlayerState, Card, CardName, GamePhase } from '../types';

// Initialize API
const getAiClient = () => {
    // Safely handle missing API key
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
};

export interface AiMove {
    action: 'PLAY_CARD' | 'USE_SKILL' | 'END_TURN' | 'DISCARD';
    cardIndex?: number; // Index in hand
    target?: 'player'; // For 1v1, almost always player
    reasoning?: string; // Flavor text
}

export const getAiDecision = async (
    aiState: PlayerState,
    playerState: PlayerState,
    phase: GamePhase,
    validMoves: number[] // Indices of cards in hand that are valid to play
): Promise<AiMove> => {
    const client = getAiClient();

    // Fallback logic if no API key or client fails
    const fallbackMove = (): AiMove => {
        console.warn("Using fallback AI logic");
        
        if (phase === GamePhase.DISCARD) {
             // Discard first card if we have too many (naive)
             return { action: 'DISCARD', cardIndex: 0, reasoning: "Too many cards." };
        }

        // Naive Strategy: Play Peach if hurt, Play Slash if possible, Play Scrolls
        for (const index of validMoves) {
            const card = aiState.hand[index];
            if (card.name === CardName.TAO && aiState.hp < aiState.hero.maxHp) {
                return { action: 'PLAY_CARD', cardIndex: index, reasoning: "I need healing." };
            }
            if (card.name === CardName.SHA) {
                return { action: 'PLAY_CARD', cardIndex: index, target: 'player', reasoning: "Take this!" };
            }
            if (card.name === CardName.WUZHONG) {
                return { action: 'PLAY_CARD', cardIndex: index, reasoning: "More cards for me." };
            }
             if (card.name === CardName.JUEDOU) {
                return { action: 'PLAY_CARD', cardIndex: index, target: 'player', reasoning: "Let's duel!" };
            }
             if (card.name === CardName.NANMAN || card.name === CardName.WANJIAN) {
                return { action: 'PLAY_CARD', cardIndex: index, target: 'player', reasoning: "Chaos ensues!" };
            }
        }
        return { action: 'END_TURN', reasoning: "I end my turn." };
    };

    if (!client) return fallbackMove();

    try {
        const prompt = `
        You are playing SanGuoSha (1v1). You are the AI. 
        Your Hero: ${aiState.hero.name} (${aiState.hp}/${aiState.hero.maxHp} HP).
        Your Hand: ${aiState.hand.map((c, i) => `${i}: ${c.name}`).join(', ')}.
        Opponent Hero: ${playerState.hero.name} (${playerState.hp}/${playerState.hero.maxHp} HP).
        Opponent Equipment: ${playerState.equipment.armor ? 'Armor' : 'None'}.
        Current Phase: ${phase}.
        Valid Card Indices you can play: ${JSON.stringify(validMoves)}.

        Decide your next move.
        If playing a card, return 'PLAY_CARD' and the index.
        If you need to discard cards (Phase is DISCARD), return 'DISCARD' and the index.
        If you have no good moves, return 'END_TURN'.
        
        Response format: JSON.
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, enum: ['PLAY_CARD', 'USE_SKILL', 'END_TURN', 'DISCARD'] },
                        cardIndex: { type: Type.INTEGER },
                        target: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                    },
                    required: ['action', 'reasoning']
                }
            }
        });

        if (response.text) {
             const move = JSON.parse(response.text) as AiMove;
             // Validate move strictly
             if (move.action === 'PLAY_CARD' && !validMoves.includes(move.cardIndex!)) {
                 return fallbackMove();
             }
             return move;
        }
        return fallbackMove();
    } catch (e) {
        console.error("AI Error", e);
        return fallbackMove();
    }
};