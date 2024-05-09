import reactToolCssText from 'data-text:rc-tooltip/assets/bootstrap_white.css'
import cssText from 'data-text:~/contents/PromptManagement.css'
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from 'plasmo'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { PromptModal } from '../components/PromptModal'
import { SettingIcon } from '../icons/SettingIcon'

import { sleep } from '../utils'

export type AutoCompleteProps = {}

export const config: PlasmoContentScript = {
  matches: ['https://chat.openai.com/*', "https://chatgpt.com/*"]
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText + '\n' + reactToolCssText
  return style
}

const getTextArea = async () => {
  try {
    const textArea = document.querySelector('textarea')
    if (textArea) {
      return textArea.parentElement
    }
  } catch (error) {
    // console.error(error)
  }
  await sleep(1000)
  return await getTextArea()
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const area = await getTextArea()
  return area
}

const AutoComplete = () => {
  const containerRef = useRef<HTMLDivElement>()
  const [promptVisible, setPromptVisible] = useState(false)

  return (
    <div ref={containerRef} id="chatgpt-prompt-helper-container">
      <div>
        <SettingIcon
          onClick={() => setPromptVisible(true)}
          className="chatgpt-prompt-extension-prompt-manager"
        />
        <PromptModal visible={promptVisible} setOpen={setPromptVisible} />
      </div>
    </div>
  )
}

export default AutoComplete
