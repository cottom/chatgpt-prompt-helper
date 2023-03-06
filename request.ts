import axios from 'axios'
import once from 'lodash/once'

const a = axios.create()

export type DataSet = {
  dataset: string
  config: string
  split: string
  rows: RowWrap[]
}

export type RowWrap = {
  row_idx: number
  row: Row
}

export type Row = {
  act: string
  prompt: string
}

export type DisplayRow = Row & {
  type: DisplayRowType
  description?: string
}

export enum DisplayRowType {
  AWESOME_CHATGPT_PROMPTS = 'AWESOME_CHATGPT_PROMPTS',
  CUSTOM = 'CUSTOM',
}

const DATA_SET_URL =
  'https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv'

function parseCSVLine(line: string) {
  let values = []
  let currentValue = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    let char = line[i]
    if (char === ',' && !inQuotes) {
      values.push(currentValue)
      currentValue = ''
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else {
      currentValue += char
    }
  }
  values.push(currentValue)
  return values
}

export const fetchPromots = async () => {
  return (await a.get<string>(DATA_SET_URL))?.data
    ?.split('\n')
    .slice(1)
    .map((item) => item.trim())
    .filter((item) => Boolean(item))
    .map((item) => parseCSVLine(item))
    .map(([act, prompt], index) => ({
      act: act?.replaceAll('"', ''),
      prompt: prompt?.replace('"', '')
    }))
    .reverse()
}

export const retrify =
  <T>(requestFun: () => Promise<T>, times = 1) =>
  async () => {
    for (let i = 0; i < times; i++) {
      try {
        return await requestFun()
      } catch (error) {
        // ignore
        console.error(error)
      }
    }
  }

export const PROMOT_KEY = 'PROMOT_KEY'

export const CUSTOM_PROMPT = 'CUSTOM_KEY'

export const HISTORY_KEY = 'HISTORY_KEY'

export const fetchPromotWithRetry = once(retrify(fetchPromots, 3))
