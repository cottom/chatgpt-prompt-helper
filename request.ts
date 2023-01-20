import axios from "axios"
import once from "lodash/once"

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

const DATA_SET_URL =
  "https://datasets-server.huggingface.co/first-rows?dataset=fka%2Fawesome-chatgpt-prompts&config=fka--awesome-chatgpt-prompts&split=train"

export const fetchPromots = async () => {
  return (await a.get<DataSet>(DATA_SET_URL))?.data?.rows?.map(
    (item) => item.row
  )
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

export const PROMOT_KEY = "PROMOT_KEY"

export const HISTORY_KEY = "HISTORY_KEY"

export const fetchPromotWithRetry = once(retrify(fetchPromots, 3))
