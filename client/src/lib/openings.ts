/**
 * Chess opening name detection database
 * Maps opening sequences to their names
 */

export const OPENING_PATTERNS: Record<string, string> = {
  'e2e4c7c5': 'Sicilian Defense',
  'e2e4e7e5g1f3b8c6': 'Ruy Lopez',
  'e2e4e7e5g1f3b8c6f1b5': 'Ruy Lopez - Open',
  'e2e4e7e5g1f3b8c6f1c4': 'Italian Game',
  'e2e4e7e5g1f3b8c6f1c4f8c5': 'Italian Game - Two Knights',
  'e2e4e7e6d2d4d7d5': 'French Defense',
  'e2e4c7c6d2d4d7d5': 'Caro-Kann Defense',
  'e2e4d7d5': 'Scandinavian Defense',
  'e2e4n8f6': 'Alekhine\'s Defense',
  'e2e4d7d6g1f3g8f6': 'Pirc Defense',
  'e2e4g7g6g1f3f8g7d2d4': 'King\'s Indian Defense',
  'd2d4g8f6c2c4e7e6b1c3f8b4': 'Nimzo-Indian Defense',
  'd2d4d7d5c2c4': 'Queen\'s Gambit',
  'd2d4d7d5c2c4e7e6': 'Queen\'s Gambit Declined',
  'd2d4d7d5c2c4c7c6': 'Slav Defense',
  'd2d4d7d5c2c4c7c6g1f3g8f6': 'Semi-Slav Defense',
  'd2d4g8f6c2c4e7e6g2g3': 'Catalan Opening',
  'g1f3': 'Reti Opening',
  'c2c4': 'English Opening',
  'f2f4': 'Bird\'s Opening',
  'b2b4': 'Orangutan Opening',
  'a2a4': 'Sokolsky Opening',
};

/**
 * Detect opening name from move sequence
 */
export function detectOpening(moves: string[]): string {
  if (moves.length === 0) return 'Starting Position';

  const moveSequence = moves.join('').toLowerCase();

  for (const [pattern, name] of Object.entries(OPENING_PATTERNS)) {
    if (moveSequence.startsWith(pattern)) {
      return name;
    }
  }

  for (const [pattern, name] of Object.entries(OPENING_PATTERNS)) {
    if (pattern.startsWith(moveSequence)) {
      return name + ' (Variation)';
    }
  }

  return 'Custom Opening';
}

/**
 * Get opening description
 */
export function getOpeningDescription(openingName: string): string {
  const descriptions: Record<string, string> = {
    'Sicilian Defense': 'The most popular and complex defense to 1.e4, offering Black excellent winning chances.',
    'Ruy Lopez': 'One of the oldest and most respected openings, known for its strategic depth.',
    'Italian Game': 'A classical opening emphasizing rapid development and central control.',
    'French Defense': 'A solid defense where Black accepts a space disadvantage for positional strength.',
    'Caro-Kann Defense': 'A reliable defense offering Black a solid position with good piece coordination.',
    'Scandinavian Defense': 'An aggressive defense where Black immediately challenges the center.',
    'Alekhine\'s Defense': 'An unconventional defense where Black provokes White\'s pawns forward.',
    'Pirc Defense': 'A flexible defense allowing Black to counterattack after White\'s center advance.',
    'King\'s Indian Defense': 'A hypermodern opening where Black controls the center from afar.',
    'Nimzo-Indian Defense': 'A sophisticated defense combining solid structure with active piece play.',
    'Queen\'s Gambit': 'A classical opening where White sacrifices a pawn for rapid development.',
    'Slav Defense': 'A solid defense to the Queen\'s Gambit with good piece coordination.',
    'Catalan Opening': 'A modern opening combining elements of the Queen\'s Gambit and Reti.',
    'Reti Opening': 'A flexible opening emphasizing piece play over pawn advances.',
    'English Opening': 'A flexible opening giving White various strategic possibilities.',
  };

  return descriptions[openingName] || 'A chess opening with its own unique characteristics and strategic ideas.';
}
