import { describe, expect, it } from 'vitest'
import { hintPosition, keyboardStates, scoreGuess, setlistStars } from './setlist'

describe('scoreGuess', () => {
  it('marks exact matches correct', () => {
    expect(scoreGuess('dream', 'dream')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })
  it('marks misplaced letters present', () => {
    expect(scoreGuess('storm', 'moths')).toEqual(['present', 'present', 'present', 'absent', 'present'])
  })
  it('handles duplicate letters in guess when answer has one', () => {
    // answer has a single L; guess "llama" should mark only one L (the one in position 0? no — neither is correct, first gets present)
    expect(scoreGuess('llama', 'tulip')).toEqual(['present', 'absent', 'absent', 'absent', 'absent'])
  })
  it('prefers correct over present for duplicates', () => {
    // answer "sassy": guess "ssass" -> s at index 0 correct, s at 1 present? answer s positions 0,2,3.
    expect(scoreGuess('ssass', 'sassy')).toEqual(['correct', 'present', 'present', 'correct', 'absent'])
  })
  it('does not over-mark duplicates', () => {
    // answer "abbey", guess "babes": b(0) present, a(1) present, b(2) correct, e(3) correct, s absent
    expect(scoreGuess('babes', 'abbey')).toEqual(['present', 'present', 'correct', 'correct', 'absent'])
    // answer "eerie", guess "eeeee": positions 0,1,4 correct, 2 and 3 absent (no more e's)
    expect(scoreGuess('eeeee', 'eerie')).toEqual(['correct', 'correct', 'absent', 'absent', 'correct'])
  })
  it('is case-insensitive', () => {
    expect(scoreGuess('GYPSY', 'gypsy')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
  })
})

describe('keyboardStates', () => {
  it('keeps the best state per letter', () => {
    const s = keyboardStates(['storm', 'moths'], 'moths')
    expect(s.m).toBe('correct')
    expect(s.r).toBe('absent')
  })
})

describe('setlistStars', () => {
  it('rewards fewer guesses', () => {
    expect(setlistStars(2, true)).toBe(3)
    expect(setlistStars(4, true)).toBe(3)
    expect(setlistStars(5, true)).toBe(2)
    expect(setlistStars(6, true)).toBe(1)
    expect(setlistStars(6, false)).toBe(0)
  })
})

describe('hintPosition', () => {
  it('returns first unrevealed slot', () => {
    expect(hintPosition(['dxxxx'], 'dream')).toBe(1)
    expect(hintPosition(['dream'], 'dream')).toBeNull()
  })
})
