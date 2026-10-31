import type { SetlistPuzzle } from '../types'

const s = (id: string, answer: string, clue: string, intro: string): SetlistPuzzle => ({ kind: 'setlist', id, answer, clue, intro })

/** Campaign Setlist words. Five letters through Era 5; six letters appear from Era 6 on. */
export const SETLISTS: Record<string, SetlistPuzzle> = Object.fromEntries(
  [
    s('sl-blues', 'blues', 'The music this band was born to play.', 'The festival running order is pinned to the tent pole. One word is smudged. Work it out and the set can start.'),
    s('sl-green', 'green', 'A colour, and the surname of the guitarist whose name was on the first album.', 'The Marquee’s chalkboard needs the headliner’s name finished before the doors open.'),
    s('sl-birds', 'birds', 'An albatross is one of these.', 'The set closes on an instrumental. The crew nickname for it is the word on the card.'),
    s('sl-house', 'house', 'Kiln ____: the 1970 album named for the band’s home.', 'The band has moved into a converted oast house. The setlist on the kitchen wall has one word missing.'),
    s('sl-trees', 'trees', 'Bare ____, the 1972 album.', 'The album title is half-painted on the flight case. Finish the word.'),
    s('sl-coast', 'coast', 'The band moved to the west one in 1974.', 'Everything is boxed for the move to California. Find the word on the label.'),
    s('sl-voice', 'voice', 'What Mick heard on a tape at Sound City, and what changed everything.', 'A reel is playing in the control room. Name what stopped Mick in his tracks.'),
    s('sl-magic', 'magic', 'Rhiannon is said to have a touch of this.', 'The first show with the new lineup. The word on the setlist is the feeling in the room.'),
    s('sl-chart', 'chart', 'The album climbed to the top of it in September 1976.', 'Fourteen months after release, the album is still climbing. Name what it is climbing.'),
    s('sl-dream', 'dream', 'Stevie wrote a song with this word, plural, in a borrowed studio room in Sausalito.', 'A song Stevie wrote alone in a borrowed studio room. Finish the title on the tape box.'),
    s('sl-piano', 'piano', 'Christine recorded Songbird alone with one of these in an empty concert hall.', 'An empty auditorium, a single microphone. Name the instrument on the stage.'),
    s('sl-chain', 'chain', 'The only song credited to all five members of the band.', 'The last song on side two was built from pieces. Name the word that held them together.'),
    s('sl-crowd', 'crowd', 'Fifty-seven thousand of them filled the Oakland Coliseum.', 'Day on the Green. The stage manager wants one word for what is waiting outside.'),
    s('sl-stars', 'stars', 'What the band had become by 1977, and what the stage lights were pointed at.', 'The Forum, Inglewood. The lighting plot is labelled with one word.'),
    s('sl-light', 'light', 'What a rainbow is made of, and what the Rainbow Theatre is named for.', 'London, April 1977. The band is home. The lighting cue sheet has one word missing.'),
    s('sl-brass', 'brass', 'The marching band’s horn section recorded on a baseball field.', 'Dodger Stadium, a hundred-plus musicians and a mobile truck. Name the section being recorded.'),
    s('sl-double', 'double', 'Tusk was this kind of album: two records in one sleeve.', 'The sleeve mock-up says “____ album”. Six letters now. The band has grown ambitious.'),
    s('sl-gypsy', 'gypsy', 'Stevie’s 1982 single about the free spirit she used to be.', 'Mirage is out. The single sleeve needs its one-word title.'),
    s('sl-doves', 'doves', 'White-winged ones fly through Stevie’s first solo album.', 'Bella Donna. A tattered sheet on the music stand names the birds on the cover.'),
    s('sl-heart', 'heart', 'The Wild ____, Stevie’s second solo album.', 'Second solo album, 1983. Finish the title.'),
    s('sl-shawl', 'shawl', 'Stevie’s signature stage garment, trailing in the Colorado wind.', 'Red Rocks. The wardrobe case is labelled with the one item that must not be forgotten.'),
    s('sl-silver', 'silver', '____ Springs, the song cut from Rumours and finally given its moment in 1997.', 'A song that waited twenty years. Finish its title.'),
    s('sl-dance', 'dance', 'The ____: the 1997 reunion concert and album.', 'The Burbank soundstage is ready. One word on the marquee.'),
    s('sl-legend', 'legend', 'What the Hall of Fame makes official.', 'The induction program is being printed. Six letters for the word in the headline.'),
    s('sl-encore', 'encore', 'What a crowd shouts when it is not ready to go home.', 'The house lights stay down. The crowd is chanting one word.'),
  ].map((p) => [p.id, p]),
)
