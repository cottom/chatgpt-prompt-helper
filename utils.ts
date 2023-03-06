export const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

export const SCREENSHOT_ID = 'SCREENSHOT_ID'

export const getScreenshotId = () => `${SCREENSHOT_ID}_${location.pathname}`

export const getScreenshotVisibleId = () => `${getScreenshotId()}_visible`

export const getScreenshotSelectedId = () => `${getScreenshotId()}_selected`

export const ID_TOKEN = 'CHAT_GPT_TOKEN_INDEX'

export const SECTION_ITEM_SELECTOR = 'main .w-full.border-b'

export const NAV_CONTAINER_SELECTOR = '.scrollbar-trigger nav.flex'

export const FORM_BUTTON_SELECTOR = 'form .flex.ml-1.justify-center .btn.btn-neutral.relative'

export const getContainerFun = (containerSelector: string, postSelector?: (el: Element) => Element) =>
  async function getContainerEl() {
    try {
      const el = document.querySelector(containerSelector)
      if (el) {
        return postSelector ? postSelector(el) : el
      }
    } catch (error) {
      // console.error(error)
    }
    await sleep(1000)
    return await getContainerEl()
  }
