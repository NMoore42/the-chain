import { GameProvider } from './state/store'
import { useRoute } from './state/router'
import { useSettingsEffects } from './ui/hooks'
import { Starfield } from './ui/components/Starfield'
import { Toasts } from './ui/components/Toasts'
import { TitleScreen } from './ui/screens/Title'
import { MapScreen } from './ui/screens/Map'
import { ConcertScreen } from './ui/screens/Concert'
import { PlayScreen } from './ui/screens/Play'
import { StoryScreen } from './ui/screens/Story'
import { ScrapbookScreen } from './ui/screens/Scrapbook'
import { SettingsScreen } from './ui/screens/Settings'
import { DailyScreen } from './ui/screens/Daily'
import { FreePlayScreen } from './ui/screens/FreePlay'
import { AboutScreen } from './ui/screens/About'
import { JamScreen } from './ui/screens/Jam'
import { TriviaScreen } from './ui/screens/Trivia'

function Router() {
  const route = useRoute()
  useSettingsEffects()
  switch (route.name) {
    case 'title': return <TitleScreen />
    case 'map': return <MapScreen />
    case 'concert': return <ConcertScreen concertId={route.concertId} />
    case 'play': return <PlayScreen key={`${route.concertId}:${route.index}`} concertId={route.concertId} index={route.index} />
    case 'story': return <StoryScreen storyId={route.storyId} next={route.next} />
    case 'scrapbook': return <ScrapbookScreen tab={route.tab} />
    case 'settings': return <SettingsScreen />
    case 'daily': return <DailyScreen />
    case 'free': return <FreePlayScreen mode={route.mode} />
    case 'about': return <AboutScreen />
    case 'jam': return <JamScreen />
    case 'trivia': return <TriviaScreen />
  }
}

export default function App() {
  return (
    <GameProvider>
      <Starfield />
      <Router />
      <Toasts />
    </GameProvider>
  )
}
