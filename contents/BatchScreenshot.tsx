import eraseIcon from 'data-base64:~assets/broom.png'
import cancelIcon from 'data-base64:~assets/cancel.png'
import batchDownloadCloudIcon from 'data-base64:~assets/download-from-cloud.png'
import batchDownloadIcon from 'data-base64:~assets/downloads.png'
import batchScreenshotIcon from 'data-base64:~assets/screenshotBatch.png'
import cssText from 'data-text:~/contents/SectionHandler.css'
import download from 'downloadjs'
import { toPng } from 'html-to-image'
import type { PlasmoContentScript, PlasmoGetInlineAnchor } from 'plasmo'

import { useStorage } from '@plasmohq/storage/hook'

import {
  ID_TOKEN,
  getScreenshotSelectedId,
  getScreenshotVisibleId,
  sleep,
  SECTION_ITEM_SELECTOR
} from '../utils'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

export const config: PlasmoContentScript = {
  matches: ['https://chat.openai.com/*']
}

const getContainer = async () => {
  try {
    const el =
      document.querySelector(SECTION_ITEM_SELECTOR)?.parentElement?.parentElement
    if (el) {
      return el
    }
  } catch (error) {
    // console.error(error)
  }
  await sleep(1000)
  return await getContainer()
}

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  return await getContainer()
}

const BatchScreenshot = () => {
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

  const onDownload = (innerSelected: number[] = selected) => {
    if (!innerSelected?.length) {
      return
    }

    console.log(innerSelected)

    const selectDoms = Array.from(innerSelected)
      .sort((a, b) => {
        if (a === b) {
          return 0
        }
        return a > b ? 1 : -1
      })
      .map((i) => document.querySelector(`.${ID_TOKEN}_${i}`))
      .filter(Boolean)
      .map((item) => {
        const returned = item.cloneNode(true) as HTMLDivElement
        returned.style.paddingLeft = '20px'
        returned.classList.add('bg-white', ...item.parentElement.classList)

        return returned
      })

    const container = document.createElement('div')
    container.style.paddingBottom = '20px'
    container.append(...selectDoms)

    const placeholder = document.createElement('div')

    placeholder.style.width = '80%'
    placeholder.style.height = '2px'

    placeholder.append(container)
    document.body.append(placeholder)

    toPng(container, {
      style: { margin: `20px 20px`, paddingLeft: `20px`, width: '60rem' }
    }).then((dataUrl) => {
      download(dataUrl, `section_batch.png`)
      placeholder.remove()
      setEnableRenderValue(false)
      setEnableStoreValue(false)
    })
  }

  const onErase = () => {
    setSelectedStoreValue([])
  }

  const onPageDownload = () => {
    const nodes = document.querySelectorAll(`.${ID_TOKEN}`)
    if (nodes?.length) {
      onDownload(Array.from(nodes).map((_n, index) => index))
    }
  }

  return (
    <div id="chatgpt-prompt-extension-batch-screenshot">
      {!enable ? (
        <>
          <a onClick={onPageDownload}>
            <img src={batchDownloadCloudIcon} alt="batch download icon" />
          </a>
          <a
            onClick={() => {
              setEnableRenderValue(true)
              setEnableStoreValue(true)
            }}>
            <img src={batchScreenshotIcon} alt="batch screenshot" />
          </a>
        </>
      ) : (
        <>
          <a onClick={() => onDownload()}>
            <img src={batchDownloadIcon} alt="batch download" />
          </a>
          <a onClick={onErase}>
            <img src={eraseIcon} alt="eraseIcon" />
          </a>
          <a
            onClick={() => {
              setEnableRenderValue(false)
              setEnableStoreValue(false)
            }}>
            <img src={cancelIcon} alt="cancel" />
          </a>
        </>
      )}
    </div>
  )
}

export default BatchScreenshot
