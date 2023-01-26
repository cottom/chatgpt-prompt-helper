export const sleep = (time: number) => new Promise((r) => setTimeout(r, time))

export const SCREENSHOT_ID = 'SCREENSHOT_ID'

export const getScreenshotId = () => `${SCREENSHOT_ID}_${location.pathname}`;

export const getScreenshotVisibleId = () => `${getScreenshotId()}_visible`

export const getScreenshotSelectedId = () => `${getScreenshotId()}_selected`;

export const ID_TOKEN = 'CHAT_GPT_TOKEN_INDEX'
