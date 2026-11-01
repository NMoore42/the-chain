/**
 * Venue scene content: the people and props of the Penguin Club.
 * Every fact here is traceable to docs/research/history-notes.md. No lyrics, only titles, names, dates and places.
 * The club itself, the crew, Pearl, Judy and the chatter are written for the game.
 */

export interface VenueSpeaker {
  id: string
  name: string
  role: string
  lines: string[]
  sources: string[]
}

export interface VenueProp {
  id: string
  name: string
  text: string
  sources: string[]
}

const S = {
  fm: 'https://en.wikipedia.org/wiki/Fleetwood_Mac',
  fm68: 'https://en.wikipedia.org/wiki/Fleetwood_Mac_(1968_album)',
  green: 'https://en.wikipedia.org/wiki/Peter_Green_(musician)',
  mick: 'https://en.wikipedia.org/wiki/Mick_Fleetwood',
  john: 'https://en.wikipedia.org/wiki/John_McVie',
  christine: 'https://en.wikipedia.org/wiki/Christine_McVie',
  stevie: 'https://en.wikipedia.org/wiki/Stevie_Nicks',
  chickenShackChart: "https://www.officialcharts.com/search/singles/i'd-rather-go-blind/",
  kilnHouse: 'https://en.wikipedia.org/wiki/Kiln_House',
  penguin: 'https://en.wikipedia.org/wiki/Penguin_(album)',
  boston: 'https://en.wikipedia.org/wiki/Live_in_Boston_(Fleetwood_Mac_album)',
  buckinghamNicks: 'https://en.wikipedia.org/wiki/Buckingham_Nicks',
  olsen: 'https://en.wikipedia.org/wiki/Keith_Olsen',
  frozenLove: 'https://en.wikipedia.org/wiki/Frozen_Love',
  rhiannon: 'https://en.wikipedia.org/wiki/Rhiannon_(song)',
  landslide: 'https://en.wikipedia.org/wiki/Landslide_(Fleetwood_Mac_song)',
  fm75: 'https://en.wikipedia.org/wiki/Fleetwood_Mac_(1975_album)',
  rumours: 'https://en.wikipedia.org/wiki/Rumours_(album)',
  rumoursRiaa: 'https://www.riaa.com/gold-platinum/?tab_active=default-award&ar=Fleetwood+Mac&ti=Rumours',
  chain: 'https://en.wikipedia.org/wiki/The_Chain',
  songbird: 'https://en.wikipedia.org/wiki/Songbird_(Fleetwood_Mac_song)',
  dreams: 'https://en.wikipedia.org/wiki/Dreams_(Fleetwood_Mac_song)',
  goYourOwnWay: 'https://en.wikipedia.org/wiki/Go_Your_Own_Way',
  dontStop: 'https://en.wikipedia.org/wiki/Don%27t_Stop_(Fleetwood_Mac_song)',
  rsCovers: 'https://www.rollingstone.com/music/music-lists/rock-list-favorite-rolling-stone-covers-215797/',
  rsCoverList: 'https://en.wikipedia.org/wiki/List_of_people_on_the_United_States_cover_of_Rolling_Stone_(1970s)',
  grammy1978: 'https://www.grammy.com/awards/categories/album-of-the-year/1978/',
  rumoursTour: 'https://en.wikipedia.org/wiki/Rumours_Tour',
  dayOnTheGreen: 'https://en.wikipedia.org/wiki/Day_on_the_Green',
  rumoursLive: 'https://en.wikipedia.org/wiki/Rumours_Live',
  tuskSong: 'https://en.wikipedia.org/wiki/Tusk_(song)',
  tusk: 'https://en.wikipedia.org/wiki/Tusk_(album)',
  tuskTour: 'https://en.wikipedia.org/wiki/Tusk_Tour',
  tango: 'https://en.wikipedia.org/wiki/Tango_in_the_Night',
  littleLies: 'https://en.wikipedia.org/wiki/Little_Lies',
  everywhere: 'https://en.wikipedia.org/wiki/Everywhere_(Fleetwood_Mac_song)',
  bellaDonna: 'https://en.wikipedia.org/wiki/Bella_Donna_(album)',
  edge: 'https://en.wikipedia.org/wiki/Edge_of_Seventeen',
  rsMagicAct: 'https://www.rollingstone.com/music/music-news/stevie-nicks-magic-act-242776/',
  woodenBalls: 'https://americansongwriter.com/rumours-fleetwood-mac-album-cover-story/',
  woodenBallsAuction: 'https://www.musicradar.com/news/fleetwood-mac-auction-wooden-balls',
} as const

export const SPEAKERS: Record<string, VenueSpeaker> = {
  stevie: {
    id: 'stevie',
    name: 'Stevie Nicks',
    role: 'Vocals',
    lines: [
      "Hi, crew. I wrote “Rhiannon” back in 1973 after reading a paperback called Triad. I only found out about the Welsh legend in 1978.",
      "“Landslide” came to me in Aspen, in a friend's living room facing the Rockies, while I was deciding whether to keep going with music.",
      "Mick rang Keith Olsen on New Year's Eve 1974 asking for Lindsey. Lindsey said we were a package. And I'd been cleaning Keith's house!",
      "Before all this I was a hostess, a waitress and a housekeeper. So yes, I know my way around a mop. Pass me that cable, would you?",
      "The chiffon and the shawls? Margi Kent and I worked those out. The boots are about six inches. I'm five foot one, so they help.",
    ],
    sources: [S.rhiannon, S.landslide, S.stevie, S.fm75, S.buckinghamNicks, S.olsen, S.rsMagicAct],
  },
  lindsey: {
    id: 'lindsey',
    name: 'Lindsey Buckingham',
    role: 'Guitar',
    lines: [
      "Mick heard “Frozen Love” at Sound City in the autumn of 1974. Keith Olsen played it for him while he was looking the studio over.",
      "When Mick called on New Year's Eve for a guitarist, I told him Stevie and I came as a package. We were both hired, no audition.",
      "“Go Your Own Way” went to number ten in the States. Number 38 in the UK, but who's counting.",
      "Tusk was the big swing: a double album, the most expensive rock record made to that point, with a marching band on the title track.",
      "The USC Trojan Marching Band cut it at an empty Dodger Stadium in June 1979. Each of them got paid a dollar. Hand me that pick, will you?",
    ],
    sources: [S.frozenLove, S.fm, S.fm75, S.goYourOwnWay, S.tusk, S.tuskSong],
  },
  christine: {
    id: 'christine',
    name: 'Christine McVie',
    role: 'Keyboards, vocals',
    lines: [
      "Before this lot I sang with Chicken Shack. Our “I'd Rather Go Blind” got to number 14 in the UK.",
      "I drew the cover for Kiln House while I was still only a guest on the record. They asked me to join about five days before the US tour.",
      "We cut “Songbird” overnight in an empty hall at Berkeley, with flowers and spotlights so it felt like a show. Ken Caillat's idea.",
      "“Don't Stop” reached number three in the States. Later came “Little Lies” and “Everywhere”, number four and number 14.",
    ],
    sources: [S.christine, S.chickenShackChart, S.kilnHouse, S.songbird, S.dontStop, S.tango, S.littleLies, S.everywhere],
  },
  mick: {
    id: 'mick',
    name: 'Mick Fleetwood',
    role: 'Drums',
    lines: [
      "Peter Green named us, you know. In 1967 at Decca he cut an instrumental called “Fleetwood Mac”, after John and me. The name came first.",
      "John and I are the only two on every studio album. Somebody has to keep time.",
      "These wooden balls? They started as lavatory chains, a joke from the club days. Now they're my good-luck charm, and they're on Rumours.",
      "Annie Leibovitz put all five of us in one bed for the Rolling Stone cover in March 1977. Cameron Crowe wrote the story.",
      "Right, that floor tom needs a hand getting up the step. Grab the other side, would you?",
    ],
    sources: [S.fm68, S.mick, S.woodenBalls, S.rumours, S.rsCovers, S.rsCoverList],
  },
  john: {
    id: 'john',
    name: 'John McVie',
    role: 'Bass',
    lines: [
      "I came over from John Mayall's Bluesbreakers in September 1967. Peter had already named the band after Mick and me, so here I am.",
      "The penguins? I lived near London Zoo early on, joined the Zoological Society and spent hours watching them. Now they're on everything.",
      "That bass outro on “The Chain” came out of a take with Mick. The BBC used it for their Formula 1 coverage for years.",
      "I missed the day the USC marching band recorded “Tusk” at Dodger Stadium. They stood a cardboard cutout of me in the line-up.",
    ],
    sources: [S.john, S.fm68, S.penguin, S.chain, S.tuskSong],
  },
  roadie: {
    id: 'roadie',
    name: 'Dusty',
    role: 'Road crew',
    lines: [
      "Hey, new kid. I'm Dusty. Stick with me and you'll be fine.",
      "Walk with the arrows or the pad, bump into someone and press Talk. The door at the back leads backstage.",
      "The setlist's pinned up by the stage if you want to know what's coming tonight.",
    ],
    sources: [],
  },
  bartender: {
    id: 'bartender',
    name: 'Pearl',
    role: 'Behind the bar',
    lines: [
      "Welcome to the Penguin Club, crew. Water's free. This band played its very first show at a festival in Windsor back in August 1967.",
      "Why penguins? John McVie used to spend hours watching them at London Zoo. The bird became the band's mascot, and this club took the name.",
    ],
    sources: [S.fm, S.green, S.penguin],
  },
  penguin: {
    id: 'penguin',
    name: 'Penguin',
    role: 'Mascot',
    lines: [
      "... (It waddles a slow circle around you. John McVie's hours watching the penguins at London Zoo made its kind the band's mascot.)",
      "... (It puffs out its chest. The band named a whole album Penguin in 1973. It clearly considers itself the star.)",
    ],
    sources: [S.penguin],
  },
  manager: {
    id: 'manager',
    name: 'Judy',
    role: 'Tour manager',
    lines: [
      "Judy, tour manager. The Rumours tour was 96 shows in five legs, Uniondale in February 1977 to Baton Rouge in August 1978. I counted.",
      "Day on the Green at the Oakland Coliseum, 7 May 1977, with the Doobie Brothers and Gary Wright. 57,500 people. Bill Graham's show.",
      "Three nights at the Forum that August. Ken Caillat taped the 29th from the Record Plant truck. It came out as Rumours Live in 2023.",
    ],
    sources: [S.rumoursTour, S.dayOnTheGreen, S.rumoursLive],
  },
}

export const PROPS: Record<string, VenueProp> = {
  setlist: {
    id: 'setlist',
    name: 'Setlist',
    text: "A setlist pinned up beside the stage. “The Chain” is the only song in the band's catalogue credited to all five Rumours members. “Dreams” is the band's only US number one single.",
    sources: [S.chain, S.dreams],
  },
  goldrecord: {
    id: 'goldrecord',
    name: 'Gold record',
    text: "A framed record for Rumours. It spent 31 non-consecutive weeks at number one on the Billboard 200 and won Album of the Year at the Grammys in February 1978. It is certified 21 times Platinum.",
    sources: [S.rumours, S.grammy1978, S.rumoursRiaa],
  },
  tophat: {
    id: 'tophat',
    name: 'Top hat',
    text: "A black top hat on a stand. Where Stevie's first one came from is not reliably documented, but Rolling Stone wrote about the top hat, the chiffon and the suede boots. It became her crown.",
    sources: [S.rsMagicAct, S.stevie],
  },
  tambourine: {
    id: 'tambourine',
    name: 'Tambourine',
    text: "A tambourine trailing ribbons. On the cover of Bella Donna, released in July 1981, Stevie stands in a flowing dress with a white cockatoo on her hand and a tambourine beside her.",
    sources: [S.bellaDonna],
  },
  balls: {
    id: 'balls',
    name: 'Wooden balls',
    text: "A pair of wooden balls on a cord. By Mick's own account they began as lavatory-chain pulls hung from his waist as a joke in the band's club days. They became his good-luck charm, appear on the Rumours cover, and the cover pair sold at auction for $128,000.",
    sources: [S.woodenBalls, S.woodenBallsAuction, S.rumours],
  },
  reel: {
    id: 'reel',
    name: 'Tape reel',
    text: "A tape reel marked Boston Tea Party. The band recorded three nights there on 5, 6 and 7 February 1970. The tapes were shelved and first issued in 1985 as Live in Boston.",
    sources: [S.boston],
  },
  poster: {
    id: 'poster',
    name: 'Windsor poster',
    text: "A poster for the National Jazz and Blues Festival at Windsor, Sunday 13 August 1967. The billing reads “Peter Green's Fleetwood Mac featuring Jeremy Spencer”. It was the band's first show.",
    sources: [S.fm, S.green],
  },
  piano: {
    id: 'piano',
    name: "Christine's keyboard",
    text: "Christine's keyboard. Overnight on 3 and 4 March 1976 she recorded “Songbird” alone at Zellerbach Auditorium in Berkeley, the empty hall dressed with flowers and spotlights. It was Ken Caillat's idea.",
    sources: [S.songbird],
  },
  drums: {
    id: 'drums',
    name: "Mick's kit",
    text: "Mick's drum kit. He and John McVie are the only members on every Fleetwood Mac studio album, and Peter Green named the band after the two of them in 1967, before there was a band.",
    sources: [S.mick, S.fm68],
  },
  shawls: {
    id: 'shawls',
    name: 'Rack of shawls',
    text: "A rack of chiffon shawls. Stevie worked with Los Angeles designer Margi Kent from about 1975 on the flowing chiffon and shawls that became her stage look.",
    sources: [S.stevie, S.rsMagicAct],
  },
  mirror: {
    id: 'mirror',
    name: 'Dressing-room mirror',
    text: "A dressing-room mirror with a pair of platform boots underneath. Stevie is five foot one; the boots, around six inches, were part of the look she built with Margi Kent.",
    sources: [S.stevie, S.rsMagicAct],
  },
  crate: {
    id: 'crate',
    name: 'Road case',
    text: "A road case stencilled TUSK TOUR. That tour ran 112 shows in six legs, from Pocatello, Idaho, on 26 October 1979 to the Hollywood Bowl on 1 September 1980.",
    sources: [S.tuskTour],
  },
  jukebox: {
    id: 'jukebox',
    name: 'Jukebox',
    text: "An old jukebox. The tune playing in the club tonight is an original lo-fi number written for this game, not a Fleetwood Mac record. The real records are a tap away in the scrapbook.",
    sources: [],
  },
}

export const VENUE_DISCLAIMER =
  'The Penguin Club and the chatter inside it are written for this game. The facts the characters mention are real, and every conversation links to its source.'
