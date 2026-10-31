import type { Collectible } from './types'

/** One memorabilia item per concert. Icons are drawn by the Memorabilia component. */
export const COLLECTIBLES: Record<string, Collectible> = Object.fromEntries(
  (
    [
      { id: 'ticket-windsor', name: 'Windsor Festival Ticket', icon: 'ticket', description: 'A stub from the National Jazz and Blues Festival, August 1967. The first show.' },
      { id: 'pick-green', name: 'Tortoiseshell Pick', icon: 'pick', description: 'A guitar pick from the Marquee Club days, when the blues were the whole point.' },
      { id: 'reel-boston', name: 'Boston Tea Party Reel', icon: 'reel', description: 'A tape box from three February nights in 1970, shelved for fifteen years.' },
      { id: 'sketch-kiln', name: 'Kiln House Sketch', icon: 'sketch', description: 'A pencil drawing in the style of the Kiln House cover, which Christine drew herself.' },
      { id: 'penguin-pin', name: 'Penguin Pin', icon: 'penguin', description: 'John McVie loved the penguins at London Zoo. The bird became the band’s emblem.' },
      { id: 'map-la', name: 'Road Map to Los Angeles', icon: 'map', description: 'The band moved west in 1974. Everything changed after that.' },
      { id: 'tape-frozen', name: 'Sound City Demo Tape', icon: 'tape', description: 'A cassette labelled Frozen Love, the song that caught Mick Fleetwood’s ear.' },
      { id: 'shawl-black', name: 'Black Chiffon Shawl', icon: 'shawl', description: 'Flowing fabric, the beginning of a stage identity.' },
      { id: 'record-white', name: 'Gold Record: Fleetwood Mac', icon: 'record', description: 'The 1975 album that took fourteen months to reach number one.' },
      { id: 'rhodes-key', name: 'Rhodes Piano Key', icon: 'key', description: 'A single key from an electric piano in Sausalito, where Dreams was written.' },
      { id: 'rose-songbird', name: 'Pressed Rose', icon: 'rose', description: 'From the flowers set on stage at Zellerbach Auditorium the night Songbird was recorded.' },
      { id: 'balls-wooden', name: 'Wooden Balls', icon: 'balls', description: 'Mick’s lucky charms, which began life as lavatory chain pulls and ended up on the Rumours cover.' },
      { id: 'laminate-rumours', name: 'Rumours Tour Laminate', icon: 'laminate', description: 'Crew access for ninety-six shows across five legs.' },
      { id: 'stub-oakland', name: 'Day on the Green Stub', icon: 'ticket', description: 'Oakland Coliseum, 7 May 1977. Fifty-seven thousand people.' },
      { id: 'trophy-1978', name: 'Album of the Year', icon: 'trophy', description: 'Rumours won the Grammy for Album of the Year on 23 February 1978.' },
      { id: 'drum-usc', name: 'Marching Band Drum', icon: 'drum', description: 'The USC Trojan Marching Band recorded Tusk at Dodger Stadium for a dollar each.' },
      { id: 'boots-platform', name: 'Platform Boots', icon: 'boots', description: 'Six inches of suede. Stevie is five foot one.' },
      { id: 'record-mirage', name: 'Mirage', icon: 'record', description: 'Recorded in a French chateau, number one for five weeks in 1982.' },
      { id: 'feather-dove', name: 'White Dove Feather', icon: 'feather', description: 'The white-winged dove flies through Bella Donna and the 1981 tour that carried its name.' },
      { id: 'tambourine', name: 'Ribboned Tambourine', icon: 'tambourine', description: 'Stevie’s instrument of choice on stage, trailing ribbons.' },
      { id: 'hat-top', name: 'Black Top Hat', icon: 'hat', description: 'The hat that became a crown.' },
      { id: 'ribbon-1993', name: 'Inaugural Gala Ribbon', icon: 'ribbon', description: 'Capital Centre, 19 January 1993. Five people on one stage for the first time since 1987.' },
      { id: 'record-dance', name: 'The Dance', icon: 'record', description: 'Filmed in Burbank in May 1997, number one in August.' },
      { id: 'plaque-hall', name: 'Hall of Fame Plaque', icon: 'plaque', description: 'Inducted 12 January 1998 at the Waldorf-Astoria.' },
      { id: 'moon-crescent', name: 'Crescent Moon', icon: 'moon', description: 'For the first woman inducted into the Rock and Roll Hall of Fame twice.' },
    ] as Collectible[]
  ).map((c) => [c.id, c]),
)
