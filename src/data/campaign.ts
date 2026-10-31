import type { Concert, Era, Puzzle } from './types'
import { SETLISTS } from './puzzles/setlists'
import { SONGWRITERS } from './puzzles/songwriters'
import { CHAINS } from './puzzles/chains'

const P = (id: string): Puzzle => {
  const p = SETLISTS[id] ?? SONGWRITERS[id] ?? CHAINS[id]
  if (!p) throw new Error(`Unknown puzzle ${id}`)
  return p
}

const concert = (c: Omit<Concert, 'puzzles'> & { puzzles: string[] }): Concert => ({ ...c, puzzles: c.puzzles.map(P) })

export const ERAS: Era[] = [
  {
    id: 'blues', number: 1, title: 'The Blues Years', years: '1967–1970',
    tagline: 'A guitarist, a drummer, a bassist, and the London blues.',
    introStoryId: 'era-blues',
    concerts: [
      concert({
        id: 'c01', era: 'blues', title: 'National Jazz & Blues Festival', location: 'Windsor, England', date: '13 August 1967',
        venueKind: 'documented', capacityLabel: 'Festival tent', scale: 1,
        blurb: 'The band’s first show, billed as “Peter Green’s Fleetwood Mac featuring Jeremy Spencer”.',
        puzzles: ['sl-blues'], storyId: 'st-windsor', collectibleId: 'ticket-windsor',
      }),
      concert({
        id: 'c02', era: 'blues', title: 'The Marquee Club', location: 'Soho, London', date: '1968',
        venueKind: 'representative', capacityLabel: 'Small club', scale: 1,
        blurb: 'The band played the Marquee in 1968. This show is a game stage; the dates are not documented.',
        puzzles: ['sl-green', 'sw-marquee'], storyId: 'st-name', collectibleId: 'pick-green',
      }),
      concert({
        id: 'c03', era: 'blues', title: 'The Boston Tea Party', location: 'Boston, Massachusetts', date: '5–7 February 1970',
        venueKind: 'documented', capacityLabel: 'Ballroom', scale: 2,
        blurb: 'Three nights on tape, shelved for fifteen years, now treasured as Live at the Boston Tea Party.',
        puzzles: ['sl-birds', 'sw-boston', 'ch-bell'], storyId: 'st-albatross', collectibleId: 'reel-boston',
      }),
    ],
  },
  {
    id: 'transition', number: 2, title: 'A Band in Transition', years: '1970–1974',
    tagline: 'One member at a time, the band became something new.',
    introStoryId: 'era-transition',
    concerts: [
      concert({
        id: 'c04', era: 'transition', title: 'The Warehouse', location: 'New Orleans, Louisiana', date: '1 August 1970',
        venueKind: 'documented', capacityLabel: 'Warehouse hall', scale: 2,
        blurb: 'Christine McVie’s first show as a member of the band, days after being asked to join.',
        puzzles: ['sl-house', 'sw-kiln', 'ch-note'], storyId: 'st-christine', collectibleId: 'sketch-kiln',
      }),
      concert({
        id: 'c05', era: 'transition', title: 'Whisky a Go Go', location: 'West Hollywood, California', date: 'February 1971',
        venueKind: 'representative', capacityLabel: 'Sunset Strip club', scale: 2,
        blurb: 'On the day of a Whisky show, Jeremy Spencer walked out for a book and never came back. This stage stands in for that strange week.',
        puzzles: ['sl-trees', 'sw-whisky', 'ch-band'], storyId: 'st-welch', collectibleId: 'penguin-pin',
      }),
      concert({
        id: 'c06', era: 'transition', title: 'Cal State Northridge', location: 'Los Angeles, California', date: '5 December 1974',
        venueKind: 'documented', capacityLabel: 'College hall', scale: 2,
        blurb: 'The last show of the Heroes Are Hard to Find tour, and Bob Welch’s last with the band.',
        puzzles: ['sl-coast', 'sw-heroes', 'ch-hall'], storyId: 'st-fakemac', collectibleId: 'map-la',
      }),
    ],
  },
  {
    id: 'stevie', number: 3, title: 'Enter Stevie', years: '1975–1976',
    tagline: 'A phone call on New Year’s Eve changed everything.',
    introStoryId: 'era-stevie',
    concerts: [
      concert({
        id: 'c07', era: 'stevie', title: 'Sound City Studios', location: 'Van Nuys, California', date: 'January 1975',
        venueKind: 'studio', capacityLabel: 'Recording studio', scale: 2,
        blurb: 'The studio where Mick heard a tape called Frozen Love, and where the new lineup cut its first album.',
        puzzles: ['sl-voice', 'sw-soundcity', 'ch-cold'], storyId: 'st-package', collectibleId: 'tape-frozen',
      }),
      concert({
        id: 'c08', era: 'stevie', title: 'On the Road, 1975', location: 'Across America', date: '1975',
        venueKind: 'representative', capacityLabel: 'Theaters', scale: 3,
        blurb: 'The new five-piece toured hard through 1975, winning crowds one city at a time. This stage stands for that whole year.',
        puzzles: ['sl-magic', 'sw-tour75', 'ch-moon'], storyId: 'st-rhiannon', collectibleId: 'shawl-black',
      }),
      concert({
        id: 'c09', era: 'stevie', title: 'Number One', location: 'The American tour', date: 'September 1976',
        venueKind: 'representative', capacityLabel: 'Arenas', scale: 3,
        blurb: 'Fourteen months after release, the white album reached number one. This stage marks the night the news arrived.',
        puzzles: ['sl-chart', 'sw-numberone', 'ch-rose'], storyId: 'st-landslide', collectibleId: 'record-white',
      }),
    ],
  },
  {
    id: 'rumours', number: 4, title: 'Rumours', years: '1976–1977',
    tagline: 'Heartbreak in every room, and the best songs of their lives.',
    introStoryId: 'era-rumours',
    concerts: [
      concert({
        id: 'c10', era: 'rumours', title: 'The Record Plant', location: 'Sausalito, California', date: 'February 1976',
        venueKind: 'studio', capacityLabel: 'Studio B', scale: 2,
        blurb: 'Where Rumours began. Two couples coming apart, one drummer divorcing, and the tape kept rolling.',
        puzzles: ['sl-dream', 'sw-sausalito', 'ch-love'], storyId: 'st-dreams', collectibleId: 'rhodes-key',
      }),
      concert({
        id: 'c11', era: 'rumours', title: 'Zellerbach Auditorium', location: 'Berkeley, California', date: '3–4 March 1976',
        venueKind: 'studio', capacityLabel: 'Empty concert hall', scale: 3,
        blurb: 'An overnight session to capture Songbird: Christine alone, a piano, flowers, and spotlights.',
        puzzles: ['sl-piano', 'sw-berkeley', 'ch-gold'], storyId: 'st-songbird', collectibleId: 'rose-songbird',
      }),
      concert({
        id: 'c12', era: 'rumours', title: 'Nassau Coliseum', location: 'Uniondale, New York', date: '24 February 1977',
        venueKind: 'documented', capacityLabel: 'Arena', scale: 4,
        blurb: 'Opening night of the Rumours tour, three weeks after the album came out.',
        puzzles: ['sl-chain', 'sw-thechain', 'ch-rock'], storyId: 'st-thechain', collectibleId: 'balls-wooden',
      }),
    ],
  },
  {
    id: 'storm', number: 5, title: 'Taking the World by Storm', years: '1977–1978',
    tagline: 'Ninety-six shows, thirty-one weeks at number one.',
    introStoryId: 'era-storm',
    concerts: [
      concert({
        id: 'c13', era: 'storm', title: 'The Rainbow Theatre', location: 'Finsbury Park, London', date: '8–10 April 1977',
        venueKind: 'documented', capacityLabel: 'Theatre', scale: 3,
        blurb: 'Three nights in London, ten years after a blues band first played Windsor.',
        puzzles: ['sl-light', 'sw-rainbow', 'ch-stars'], storyId: 'st-rollingstone', collectibleId: 'laminate-rumours',
      }),
      concert({
        id: 'c14', era: 'storm', title: 'Day on the Green', location: 'Oakland Coliseum, California', date: '7 May 1977',
        venueKind: 'documented', capacityLabel: 'Stadium, 57,500', scale: 5,
        blurb: 'Bill Graham’s Day on the Green, with the Doobie Brothers and Gary Wright. The band’s biggest crowd yet.',
        puzzles: ['sl-crowd', 'sw-oakland', 'ch-lose'], storyId: 'st-dreamsone', collectibleId: 'stub-oakland',
      }),
      concert({
        id: 'c15', era: 'storm', title: 'The Forum', location: 'Inglewood, California', date: '29–31 August 1977',
        venueKind: 'documented', capacityLabel: 'Arena', scale: 4,
        blurb: 'Three hometown nights. The first was taped and finally released in 2023 as Rumours Live.',
        puzzles: ['sl-stars', 'sw-forum', 'ch-ring'], storyId: 'st-grammy', collectibleId: 'trophy-1978',
      }),
    ],
  },
  {
    id: 'tusk', number: 6, title: 'Tusk and Beyond', years: '1979–1987',
    tagline: 'A million-dollar double album, a marching band, and a mirage.',
    introStoryId: 'era-tusk',
    concerts: [
      concert({
        id: 'c16', era: 'tusk', title: 'Dodger Stadium', location: 'Los Angeles, California', date: '4 June 1979',
        venueKind: 'studio', capacityLabel: 'Empty stadium', scale: 5,
        blurb: 'The USC Trojan Marching Band recorded the title track of Tusk here while the Dodgers were out of town.',
        puzzles: ['sl-brass', 'sw-dodger', 'ch-hush'], storyId: 'st-tusk', collectibleId: 'drum-usc',
      }),
      concert({
        id: 'c17', era: 'tusk', title: 'Hollywood Bowl', location: 'Los Angeles, California', date: '1 September 1980',
        venueKind: 'documented', capacityLabel: 'Amphitheatre', scale: 4,
        blurb: 'The final night of the Tusk tour: 112 shows across six legs, ending at home.',
        puzzles: ['sl-double', 'sw-bowl', 'ch-road'], storyId: 'st-sara', collectibleId: 'boots-platform',
      }),
      concert({
        id: 'c18', era: 'tusk', title: 'The Forum', location: 'Inglewood, California', date: '21–22 October 1982',
        venueKind: 'documented', capacityLabel: 'Arena', scale: 4,
        blurb: 'Two Mirage tour nights, filmed for television. Lindsey’s last tour with the band until 1997.',
        puzzles: ['sl-gypsy', 'sw-mirage', 'ch-chord'], storyId: 'st-gypsy', collectibleId: 'record-mirage',
      }),
    ],
  },
  {
    id: 'solo', number: 7, title: 'Stevie’s Solo Journey', years: '1981–2019',
    tagline: 'A white-winged dove, a wild heart, and a hat that became a crown.',
    introStoryId: 'era-solo',
    concerts: [
      concert({
        id: 'c19', era: 'solo', title: 'The White Wing Dove Tour', location: 'United States', date: '1981',
        venueKind: 'representative', capacityLabel: 'Arenas', scale: 4,
        blurb: 'Bella Donna went to number one in September 1981. This stage stands for Stevie’s first tour under her own name.',
        puzzles: ['sl-doves', 'sw-belladonna', 'ch-doves'], storyId: 'st-belladonna', collectibleId: 'feather-dove',
      }),
      concert({
        id: 'c20', era: 'solo', title: 'The Wild Heart Tour', location: 'United States', date: '1983',
        venueKind: 'representative', capacityLabel: 'Arenas', scale: 4,
        blurb: 'Stand Back went to number five. This stage stands for the 1983 tour behind The Wild Heart.',
        puzzles: ['sl-heart', 'sw-wildheart', 'ch-heart'], storyId: 'st-standback', collectibleId: 'tambourine',
      }),
      concert({
        id: 'c21', era: 'solo', title: 'Red Rocks Amphitheatre', location: 'Morrison, Colorado', date: '20 August 1986',
        venueKind: 'documented', capacityLabel: 'Amphitheatre', scale: 4,
        blurb: 'Filmed for Live at Red Rocks, with Peter Frampton and Mick Fleetwood as guests.',
        puzzles: ['sl-shawl', 'sw-redrocks', 'ch-moonstar'], storyId: 'st-redrocks', collectibleId: 'hat-top',
      }),
    ],
  },
  {
    id: 'legacy', number: 8, title: 'Reunions and Legacy', years: '1993–2019',
    tagline: 'Five people, one stage, and a chain that never broke.',
    introStoryId: 'era-legacy',
    concerts: [
      concert({
        id: 'c22', era: 'legacy', title: 'Capital Centre', location: 'Landover, Maryland', date: '19 January 1993',
        venueKind: 'documented', capacityLabel: 'Arena', scale: 4,
        blurb: 'The Rumours lineup reunited to play Don’t Stop at the Presidential Inaugural Gala.',
        puzzles: ['sl-silver', 'sw-inaugural', 'ch-hold'], storyId: 'st-inaugural', collectibleId: 'ribbon-1993',
      }),
      concert({
        id: 'c23', era: 'legacy', title: 'Warner Bros. Studios', location: 'Burbank, California', date: 'May 1997',
        venueKind: 'documented', capacityLabel: 'Soundstage', scale: 4,
        blurb: 'The Dance, filmed on a soundstage for MTV. The album went straight to number one.',
        puzzles: ['sl-dance', 'sw-thedance', 'ch-dream'], storyId: 'st-thedance', collectibleId: 'record-dance',
      }),
      concert({
        id: 'c24', era: 'legacy', title: 'Waldorf-Astoria', location: 'New York City', date: '12 January 1998',
        venueKind: 'documented', capacityLabel: 'Grand ballroom', scale: 3,
        blurb: 'Inducted into the Rock and Roll Hall of Fame by Sheryl Crow. Eight members, three songs.',
        puzzles: ['sl-legend', 'sw-hall', 'ch-sail'], storyId: 'st-hall', collectibleId: 'plaque-hall',
      }),
      concert({
        id: 'c25', era: 'legacy', title: 'Barclays Center', location: 'Brooklyn, New York', date: '29 March 2019',
        venueKind: 'documented', capacityLabel: 'Arena', scale: 5,
        blurb: 'Stevie Nicks becomes the first woman inducted into the Rock and Roll Hall of Fame twice. The final encore.',
        puzzles: ['sl-encore', 'ch-choir', 'sw-finale', 'ch-wind'], storyId: 'st-twice', collectibleId: 'moon-crescent',
      }),
    ],
  },
]

export const ALL_CONCERTS: Concert[] = ERAS.flatMap((e) => e.concerts)

export function concertById(id: string): Concert | undefined {
  return ALL_CONCERTS.find((c) => c.id === id)
}

export function eraById(id: string): Era | undefined {
  return ERAS.find((e) => e.id === id)
}

export function eraOfConcert(concertId: string): Era | undefined {
  return ERAS.find((e) => e.concerts.some((c) => c.id === concertId))
}

export function nextConcert(concertId: string): Concert | undefined {
  const i = ALL_CONCERTS.findIndex((c) => c.id === concertId)
  return i >= 0 ? ALL_CONCERTS[i + 1] : undefined
}

export function puzzleKey(concertId: string, index: number): string {
  return `${concertId}:${index}`
}
