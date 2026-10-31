import type { ChainPuzzle } from '../types'

const c = (id: string, solution: string, intro: string): ChainPuzzle => {
  const words = solution.split(' ')
  return { kind: 'chain', id, start: words[0], end: words[words.length - 1], solution: words, intro }
}

/**
 * Curated word ladders. The model solution uses common words; the validator
 * confirms every link is a dictionary word differing by exactly one letter.
 */
export const CHAINS: Record<string, ChainPuzzle> = Object.fromEntries(
  [
    c('ch-bell', 'bell tell toll', 'A first rehearsal. Change one letter at a time, and every link must be a real word.'),
    c('ch-note', 'note tote tone tune', 'From a single note to a tune. Three changes.'),
    c('ch-band', 'band bond bold gold', 'A band in search of its first gold record.'),
    c('ch-hall', 'hall hale dale dole dome', 'From halls to domes: the venues are growing.'),
    c('ch-cold', 'cold cord card ward warm', 'The band warms to its newcomers.'),
    c('ch-moon', 'moon moan mean bean beam', 'Moonbeams. Stevie’s favourite kind of light.'),
    c('ch-rose', 'rose hose hole hold gold', 'From a single rose to a gold record.'),
    c('ch-love', 'love cove cave have hate', 'Sausalito, 1976. The shortest distance between two feelings.'),
    c('ch-gold', 'gold bold bolt dolt dost dust', 'Gold dust. Five links.'),
    c('ch-rock', 'rock rack back bank band', 'From rock to band, and back again.'),
    c('ch-stars', 'stars stare share shire shine', 'Five-letter links now. From stars to shine.'),
    c('ch-lose', 'lose lone line fine find', 'What is lost on the road can be found again.'),
    c('ch-ring', 'ring wing wind wild gild gold', 'A ring of gold. Five links.'),
    c('ch-hush', 'hush lush lust lost lout loud', 'From a hush to a marching band.'),
    c('ch-road', 'road goad gold hold hole home', 'The long road home from the Tusk tour.'),
    c('ch-chord', 'chord chore shore snore store stare stage', 'From a chord to the stage. Six links, all common words.'),
    c('ch-doves', 'doves loves lives lines wines wings', 'White-winged doves. Five links.'),
    c('ch-heart', 'heart hears bears beats', 'The wild heart has a beat.'),
    c('ch-moonstar', 'moon moor boor boar soar star', 'Under the Red Rocks sky, from moon to star.'),
    c('ch-hold', 'hold held heed feed fled flee free', 'Hold on, then let go. Six links.'),
    c('ch-dream', 'dream bream bread breed bleed bleep sleep', 'Twenty years of dreams. Six links.'),
    c('ch-sail', 'sail said slid slip ship', 'Sailing into the Hall of Fame.'),
    c('ch-choir', 'chain chair choir', 'The Chain becomes a choir. Two links.'),
    c('ch-wind', 'wind bind band bald balm calm', 'After the storm, calm. Five links.'),
  ].map((p) => [p.id, p]),
)
