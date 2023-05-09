export interface SearchTerms {
  date?: string
  text?: string[]
  people?: string[]
  places?: string[]
  organizations?: string[]
  things?: string[]
  emotions?: string[]
  moods?: string[]
  strength?: number[]
  [key: string]: string[] | string | number[] | undefined | null; // Add index signature
} 