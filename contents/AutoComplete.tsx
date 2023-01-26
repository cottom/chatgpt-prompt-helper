import linkIcon from 'data-base64:~assets/link.png'
import cssText from 'data-text:~/contents/AutoComplete.css'
import kebabCase from 'lodash/kebabCase'
import partition from 'lodash/partition'
import snakeCase from 'lodash/snakeCase'
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from 'plasmo'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLatest } from 'react-use'

import { useStorage } from '@plasmohq/storage/hook'

import { HISTORY_KEY, PROMOT_KEY, Row, fetchPromotWithRetry } from '../request'
import { sleep } from '../utils';

export type AutoCompleteProps = {}

export const config: PlasmoContentScript = {
  matches: ['https://chat.openai.com/*']
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const getTextArea = async () => {
  try {
    const textArea = document.querySelector('textarea')
    if (textArea) {
      if (!textArea.placeholder.trim()) {
        textArea.placeholder =
          'Try type / at first and seem some helpful prompts. Powered by ChatGPT prompt helper'
      }
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

const ITEM_PREFIX = `chatgpt-prompt-helper-item-_`
const TOP_ANCHOR = 'chatgpt-prompt-helper-panel-scroll-top-anchor'
const REPLACE_THIS = '{like this}'

function createSelection(
  field: HTMLTextAreaElement,
  start: number,
  end: number
) {
  if (field.setSelectionRange) {
    field.focus()
    field.setSelectionRange(start, end)
  } else if (typeof field.selectionStart != 'undefined') {
    field.selectionStart = start
    field.selectionEnd = end
    field.focus()
  }
}

const safeMath = (act: string, inputText: string) => {
  try {
    return act?.match(new RegExp(inputText.slice(1), 'ig'))
  } catch (error) {
    return false
  }
}

const AutoComplete = () => {
  const containerRef = useRef<HTMLDivElement>()
  const [inputText, setInputText] = useState<string>()
  const [activeIndex, setActiveIndex] = useState(-1)
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [panelVisible, setPanelVisible] = useState(false)
  const [promots, _un, { setStoreValue, setRenderValue }] = useStorage<Row[]>(
    {
      key: PROMOT_KEY,
      area: 'local'
    },
    []
  )

  const [
    history,
    _unc,
    {
      setStoreValue: setHistoryStoreValue,
      setRenderValue: setHistoryRenderValue
    }
  ] = useStorage<string[]>({ key: HISTORY_KEY, area: 'local' }, [])

  const uiPromots = useMemo(() => {
    if (!panelVisible) {
      return promots
    }
    const [hitItems, resetItems] = partition(
      promots,
      (item: Row) => inputText?.length > 1 && safeMath(item.act, inputText)
    ) as Row[][]

    const [historyItem, nonHistoryItem] = partition(
      resetItems,
      (item: Row) => history?.length && history.includes(item.act)
    )

    return [...hitItems, ...historyItem, ...nonHistoryItem]
  }, [promots, inputText, history, panelVisible])

  const latestPanelVisible = useLatest(panelVisible)
  const lastPromots = useLatest(uiPromots)
  const lastActiveIndex = useLatest(activeIndex)

  const lastActiveItem = lastPromots.current?.[lastActiveIndex?.current || 0]

  const targetUrl = useMemo(() => {
    const prompt = lastActiveItem?.prompt
    if (!prompt) {
      return ''
    }
    const startIndex = prompt.indexOf('act as', 0)
    const endIndex = prompt.indexOf('.', startIndex)

    return `https://prompts.chat/#${kebabCase(
      lastActiveItem?.prompt?.slice(startIndex, endIndex)?.toLowerCase()
    )}`
  }, [lastActiveItem])

  const activeItemUI = (index: number) => {
    setHoverIndex(-1)
    const currentPromots = lastPromots.current
    const item = currentPromots[index]
    if (item) {
      const itemEl = containerRef?.current.querySelector(
        `.${ITEM_PREFIX}${snakeCase(item.act)}`
      )
      itemEl?.scrollIntoView()
    }
  }

  const selectItem = (item: Row) => {
    const activeItemText = item?.prompt
    const textArea = document.querySelector('textarea')
    if (activeItemText && textArea) {
      textArea.value = activeItemText
      textArea.style.height = textArea.scrollHeight + 'px'
      const replaceIndex = activeItemText.indexOf(REPLACE_THIS)
      if (replaceIndex !== -1) {
        createSelection(
          textArea,
          replaceIndex,
          replaceIndex + REPLACE_THIS.length
        )
      }
      textArea.dispatchEvent(new Event('input', { bubbles: true }))
      textArea.focus()
      const newHistory = [item.act, ...(history || [])]
      setHistoryStoreValue(newHistory)
      setHistoryRenderValue(newHistory)
    }
    setPanelVisible(false)
  }

  useEffect(() => {
    const initData = async () => {
      const value = await fetchPromotWithRetry()
      if (value) {
        setRenderValue(value)
        await setStoreValue(value)
      }
    }
    initData()
  }, [])

  useEffect(() => {
    const textarea = document.querySelector(
      'textarea'
    ) as unknown as HTMLInputElement

    textarea?.addEventListener('input', (e) => {
      // @ts-ignore
      const value = e.target.value
      setInputText(value)
    })

    const preventKeyboardEvent = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
    }

    const handleKeyboardEvennt = (e: KeyboardEvent) => {
      if (latestPanelVisible.current) {
        const currentPromots = lastPromots.current
        if (e.key === 'ArrowUp') {
          preventKeyboardEvent(e)
          setActiveIndex((currentIndex) => {
            const activeIndex = (currentIndex - 1) % currentPromots.length
            activeItemUI(activeIndex)
            return activeIndex
          })
        } else if (e.key === 'ArrowDown') {
          preventKeyboardEvent(e)
          setActiveIndex((currentIndex) => {
            const activeIndex = (currentIndex + 1) % currentPromots.length
            activeItemUI(activeIndex)
            return activeIndex
          })
        } else if (e.key === 'Escape') {
          preventKeyboardEvent(e)
          setPanelVisible(false)
        } else if (e.key === 'Enter') {
          preventKeyboardEvent(e)
          selectItem(lastPromots.current?.[lastActiveIndex?.current || 0])
        }
      }
    }

    textarea?.addEventListener('keydown', (e) => handleKeyboardEvennt(e))
    document.addEventListener('keydown', (e) => handleKeyboardEvennt(e))
  }, [setInputText, lastPromots, latestPanelVisible, lastActiveIndex])

  useEffect(() => {
    if (inputText?.startsWith('/')) {
      setPanelVisible(true)
      setActiveIndex(0)
      containerRef.current?.querySelector(`#${TOP_ANCHOR}`)?.scrollIntoView()
    } else {
      setPanelVisible(false)
    }
  }, [inputText, setPanelVisible])

  const childrenEl = (
    <>
      <div
        id="chatgpt-prompt-helper-panel"
        style={{ display: panelVisible && promots.length ? 'block' : 'none' }}>
        <div id="chatgpt-prompt-helper-content">
          <div id="chatgpt-prompt-helper-panel-scroll">
            <div id={TOP_ANCHOR} />
            {uiPromots.map((item, index) => (
              <div
                key={item.act}
                onMouseEnter={() => setHoverIndex(index)}
                onClick={() => {
                  selectItem(item)
                }}
                className={`chatgpt-prompt-helper-item-container ${ITEM_PREFIX}${snakeCase(
                  item.act
                )} ${
                  hoverIndex === index ? 'chatgpt-prompt-helper-item-hover' : ''
                } ${
                  activeIndex === index
                    ? 'chatgpt-prompt-helper-item-active'
                    : ''
                }`}>
                <div className="chatgpt-prompt-helper-item-act">{item.act}</div>
                <div className="chatgpt-prompt-helper-item-prompt">
                  {item.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
        {lastActiveItem?.prompt && (
          <div id="chatgpt-prompt-helper-panel-explain">
            {lastActiveItem?.prompt}
            <a target="_blank" href={targetUrl}>
              <img
                alt="link"
                src={linkIcon}
                className="chatgpt-prompt-helper-panel-explain-link"
              />
            </a>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div ref={containerRef} id="chatgpt-prompt-helper-container">
      {childrenEl}
    </div>
  )
}

export default AutoComplete
