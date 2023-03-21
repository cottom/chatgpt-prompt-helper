import React from 'react'

import { useStorage } from '@plasmohq/storage/hook'

import { DisplayRow, DisplayRowType } from '../request'
import { CUSTOM_PROMPT } from '../request'

export const useMutatePrompt = () => {
  const [
    customPromots,
    _un1,
    {
      setStoreValue: setCustomPromptsStoreValue,
      setRenderValue: setCustomPromptRenderValue
    }
  ] = useStorage<DisplayRow[]>(
    {
      key: CUSTOM_PROMPT,
      area: 'sync'
    },
    []
  )

  const updatePrompts = (value: DisplayRow[]) => {
    setCustomPromptRenderValue(value)
    setCustomPromptsStoreValue(value)
  }

  const savePrompt = async (value: DisplayRow) => {
    const newPrompts = [
      { ...value, type: DisplayRowType.CUSTOM },
      ...customPromots
    ]
    updatePrompts(newPrompts)
  }

  const updatePrompt = async (value: DisplayRow, oldValue: DisplayRow) => {
    const toUpdateIndex = customPromots.findIndex(
      (item) =>
        item.act === oldValue.act &&
        item.prompt === oldValue.prompt &&
        item.description === oldValue.description
    )

    if (toUpdateIndex !== -1) {
        customPromots.splice(toUpdateIndex, 1, {
          ...value,
          type: DisplayRowType.CUSTOM
        })
      updatePrompts([...customPromots])
    } else {
      savePrompt(value)
    }
  }

  const deletePrompt = async (value: DisplayRow) => {
    const toDeleted = customPromots.find(
      (item) =>
        item.act === value.act &&
        item.prompt === value.prompt &&
        item.description === item.description
    )

    const newPrompts = customPromots.filter((item) => item !== toDeleted)

    updatePrompts(newPrompts)
  }

  return {
    savePrompt,
    deletePrompt,
    updatePrompt,
  }
}
