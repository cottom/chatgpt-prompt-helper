import { StarIcon } from '@heroicons/react/24/outline'
import checkIcon from 'data-base64:~assets/check.png'
import screenshotIcon from 'data-base64:~assets/screenshot.png'
import uncheckIcon from 'data-base64:~assets/uncheck.png'
import cssText from 'data-text:~/contents/SectionHandler.css'
import download from 'downloadjs'
import { toPng } from 'html-to-image'
import type { PlasmoContentScript, PlasmoGetInlineAnchorList } from 'plasmo'
import type { PlasmoRender } from 'plasmo'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { useStorage } from '@plasmohq/storage/hook'

import { PromptItemSaver } from '../components/PromptItemSaver'
import {
  ID_TOKEN,
  SECTION_ITEM_SELECTOR,
  getScreenshotSelectedId,
  getScreenshotVisibleId,
  sleep
} from '../utils'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

export const config: PlasmoContentScript = {
  matches: ['https://chat.openai.com/*']
}

const getSections = async () => {
  const list = document.querySelectorAll(SECTION_ITEM_SELECTOR)
  if (list?.length) {
    return Array.from(list).map((item, index) => {
      if (item) {
        ;(item as HTMLDivElement).setAttribute(
          ID_TOKEN,
          index.toString()
        )
        ;(item as HTMLDivElement).classList.add(
          ID_TOKEN,
          `${ID_TOKEN}_${index}`
        )
      }
      return item
    })
  }
  await sleep(1000)
  return await getSections()
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const area = await getSections()
  return area
}

const filter = (node: HTMLElement) => {
  const exclusionClasses = [
    'chatgpt-prompt-extension-section-handler-container'
  ]
  return !exclusionClasses.some((classname) =>
    node.classList?.contains(classname)
  )
}

export const render: PlasmoRender = async (
  {
    anchor, // the observed anchor, OR document.body.
    createRootContainer // This creates the default root container
  },
  InlineCSUIContainer
) => {
  const rootContainer = await createRootContainer(anchor)

  const root = createRoot(rootContainer) // Any root
  const index = anchor.element.getAttribute(ID_TOKEN)
  root.render(
    <InlineCSUIContainer>
      <SectionHandler index={Number(index)} />
    </InlineCSUIContainer>
  )
}
const SectionHandler: React.FC<{ index: number }> = ({ index }) => {
  const onScreenShot = () => {
    const el = document.querySelector(`.${ID_TOKEN}_${index}`) as HTMLElement
    if (el) {
      const backgroundColor = window
        .getComputedStyle(el.parentElement, null)
        .getPropertyValue('background-color')
      toPng(el, {
        filter,
        backgroundColor,
        style: { margin: `20px 20px`, padding: `0 0` }
      }).then((dataUrl) =>
        download(dataUrl, `section_${Math.floor(index / 2)}_${index % 2}.png`)
      )
    }
  }

  const [
    selected,
    _unS,
    {
      setRenderValue: setSelectedRenderValue,
      setStoreValue: setSelectedStoreValue
    }
  ] = useStorage<number[]>({ key: getScreenshotSelectedId(), area: 'local' })

  const [
    enable,
    _usEnable,
    { setRenderValue: setEnableRenderValue, setStoreValue: setEnableStoreValue }
  ] = useStorage<boolean>({ key: getScreenshotVisibleId(), area: 'local' })

  const isItemSelect = selected?.some((item) => item === index)
  const toggle = () => {
    setSelectedRenderValue((previous) => {
      let items = [...(previous || [])]
      if (items.some((i) => i === index)) {
        items = items.filter((i) => i !== index)
      } else {
        items.push(index)
      }
      setSelectedStoreValue(items)
      return items
    })
  }

  return (
    <div className="chatgpt-prompt-extension-section-handler-container">
      <PromptItemSaver idx={index} />
      {enable && (
        <a onClick={toggle} rel="screenshot">
          <img
            className="chatgpt-prompt-extension-section-check-icon"
            alt="checked"
            src={isItemSelect ? checkIcon : uncheckIcon}
          />
        </a>
      )}

      <a onClick={onScreenShot}>
        <img
          className="chatgpt-prompt-extension-section-handler-screenshot md:invisible md:group-hover:visible"
          alt="screenshot"
          src={screenshotIcon}
        />
      </a>
    </div>
  )
}
