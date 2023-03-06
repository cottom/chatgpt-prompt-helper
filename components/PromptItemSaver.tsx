import { StarIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import turndown from 'turndown'

import { DisplayRow, DisplayRowType } from '~request'

import { ID_TOKEN } from '../utils'
import { PromptEditor } from './PromptEditor'

export const PromptItemSaver: React.FC<{ idx: number }> = ({ idx }) => {
  const [initialValue, setInitialValue] = useState<DisplayRow>()
  const [visible, setVisible] = useState(false)

  if (idx % 2 !== 0) {
    return null
  }

  const onOpen = () => {
    const promptSelector = `.${ID_TOKEN}_${idx}`

    const anwserSelector = `.${ID_TOKEN}_${idx + 1} .markdown`

    const promptText = (
      document.querySelector(promptSelector) as HTMLDivElement
    )?.innerText
    const anwserText = document.querySelector(anwserSelector)?.innerHTML

    if (!promptText) {
      return
    }

    const anwserMarkdown = anwserText
      ? `example anwser: \n ${new turndown().turndown(anwserText)}`
      : undefined

    setInitialValue({
      act: promptText.slice(0, 10),
      prompt: promptText,
      description: anwserMarkdown,
      type: DisplayRowType.CUSTOM
    })
    setVisible(true)
  }

  return (
    <div className="inline-block">
      <StarIcon
        className="chatgpt-prompt-extension-save-prompt"
        onClick={onOpen}
      />
      <PromptEditor
        visible={visible}
        setOpen={setVisible}
        initialValue={initialValue}
      />
    </div>
  )
}
