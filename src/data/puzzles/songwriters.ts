import type { SongwriterPuzzle } from '../types'

const w = (id: string, takes: number, target: number, intro: string, golden?: string): SongwriterPuzzle => ({
  kind: 'songwriter', id, takes, target, intro, ...(golden ? { golden } : {}),
})

/**
 * Songwriter sessions: a number of takes (words) and a target score. The
 * validator simulates a modest player and a strong player on several seeds to
 * confirm every target is fair and three stars are attainable.
 */
export const SONGWRITERS: Record<string, SongwriterPuzzle> = Object.fromEntries(
  [
    w('sw-marquee', 6, 30, 'Sound check at the Marquee. Turn these tiles into words and the set list writes itself.'),
    w('sw-boston', 6, 35, 'The Boston Tea Party, two nights of tape rolling. Every word is a bar of music.'),
    w('sw-kiln', 7, 40, 'A kitchen table in Hampshire. Christine has joined. Write the next song.'),
    w('sw-whisky', 7, 45, 'Los Angeles, a new guitarist, a new sound. Build the words that build the album.'),
    w('sw-heroes', 7, 50, 'Heroes Are Hard to Find. So are good words. Reach the target to finish the session.'),
    w('sw-soundcity', 7, 50, 'Sound City, Van Nuys. Two newcomers in the room. The chemistry is in the tiles.'),
    w('sw-tour75', 7, 55, 'First tour with the new lineup. A long bus ride and a notebook full of words.'),
    w('sw-numberone', 7, 60, 'The album is number one. Keep the words coming while the ride lasts.'),
    w('sw-sausalito', 8, 60, 'The Record Plant, Sausalito. Nobody is speaking to anybody. The songs are speaking for them.'),
    w('sw-berkeley', 8, 65, 'Zellerbach Auditorium, after midnight. One piano, one voice, and a session that must earn its keep.'),
    w('sw-thechain', 8, 70, 'Pieces of unfinished songs on the floor. Link enough words and the track comes together.'),
    w('sw-oakland', 8, 75, 'Day on the Green. The golden letter is worth double. Make the crowd roar.', 'd'),
    w('sw-forum', 8, 80, 'The Forum, Inglewood. The home crowd is listening. Find the big words.'),
    w('sw-rainbow', 8, 70, 'The Rainbow Theatre, London. The band is home. The golden letter is worth double tonight.', 'g'),
    w('sw-dodger', 8, 80, 'Dodger Stadium. A marching band waits for its cue. Write the arrangement.'),
    w('sw-bowl', 8, 85, 'The Hollywood Bowl, last night of the Tusk tour. The golden letter is K. Risky, but worth it.', 'k'),
    w('sw-mirage', 8, 90, 'Mirage, 1982. A lighter, brighter album. Lighter, brighter words.'),
    w('sw-belladonna', 8, 90, 'Bella Donna. Stevie’s own session. The golden letter is W, for white-winged.', 'w'),
    w('sw-wildheart', 8, 85, 'The Wild Heart. Stand back and let the words come.'),
    w('sw-redrocks', 8, 95, 'Red Rocks, under a Colorado sky. The golden letter is X. Make it count.', 'x'),
    w('sw-inaugural', 8, 90, 'The Capital Centre, January 1993. Five people on one stage again. Don’t stop.'),
    w('sw-thedance', 8, 100, 'Warner Bros. soundstage, Burbank. Twenty years of songs. The golden letter is Z.', 'z'),
    w('sw-hall', 8, 90, 'The Hall of Fame. Every word you find is a line in the citation.'),
    w('sw-finale', 8, 100, 'The final encore. The golden letter is Q. Write the ending.', 'q'),
  ].map((p) => [p.id, p]),
)
