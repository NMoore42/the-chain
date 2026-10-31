import type { Achievement } from './types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-show', name: 'First Show', description: 'Complete your first concert.', icon: 'ticket' },
  { id: 'era-blues', name: 'Blues Graduate', description: 'Complete every concert in The Blues Years.', icon: 'pick' },
  { id: 'era-transition', name: 'Still Standing', description: 'Complete A Band in Transition.', icon: 'penguin' },
  { id: 'era-stevie', name: 'Package Deal', description: 'Complete Enter Stevie.', icon: 'tape' },
  { id: 'era-rumours', name: 'Rumours Has It', description: 'Complete the Rumours era.', icon: 'balls' },
  { id: 'era-storm', name: 'World Tour', description: 'Complete Taking the World by Storm.', icon: 'laminate' },
  { id: 'era-tusk', name: 'Marching On', description: 'Complete Tusk and Beyond.', icon: 'drum' },
  { id: 'era-solo', name: 'White Winged Dove', description: 'Complete Stevie’s Solo Journey.', icon: 'feather' },
  { id: 'era-legacy', name: 'Never Break the Chain', description: 'Finish the campaign.', icon: 'moon' },
  { id: 'setlist-two', name: 'Second Guess', description: 'Solve a Setlist puzzle in two guesses.', icon: 'star' },
  { id: 'no-hints', name: 'Unaided', description: 'Complete a concert without using a hint.', icon: 'star' },
  { id: 'chorus', name: 'Chorus!', description: 'Play a seven-letter word in The Songwriter.', icon: 'star' },
  { id: 'big-word', name: 'Showstopper', description: 'Score 40 or more points with a single word.', icon: 'trophy' },
  { id: 'par-chain', name: 'Shortest Link', description: 'Solve a Chain at par.', icon: 'star' },
  { id: 'all-stars', name: 'Standing Ovation', description: 'Earn three stars on every puzzle in a concert.', icon: 'trophy' },
  { id: 'encore-ten', name: 'Encore, Encore', description: 'Play ten Daily Encores.', icon: 'moon' },
  { id: 'scrapbook-full', name: 'Keeper of the Scrapbook', description: 'Unlock every memorabilia item.', icon: 'plaque' },
]
