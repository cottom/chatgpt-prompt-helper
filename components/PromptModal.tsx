import { Dialog, Transition } from '@headlessui/react'
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import linkIcon from 'data-base64:~assets/link.png'
import reactToolCssText from 'data-text:rc-tooltip/assets/bootstrap_white.css'
import cssText from 'data-text:~style.css'
import Tooltip from 'rc-tooltip'
import React, { Fragment, useMemo, useState } from 'react'
import kebabCase from 'lodash/kebabCase'
import { useStorage } from '@plasmohq/storage/hook'

import { useMutatePrompt } from '../hooks/savePrompt'
import {
  CUSTOM_PROMPT,
  DisplayRow,
  DisplayRowType,
  PROMOT_KEY,
  Row
} from '../request'
import { CopyIcon } from './CopyIcon'
import { PromptEditor } from './PromptEditor'

const DEFAULT_PAGE_SIZE = 8

const getACPTargetUrl = (prompt: string) => {
  if (!prompt) {
    return ''
  }
  const startIndex = prompt.indexOf('act as', 0)
  const endIndex = prompt.indexOf('.', startIndex)

  return `https://prompts.chat/#${kebabCase(
    prompt?.slice(startIndex, endIndex)?.toLowerCase()
  )}`
}

export const PromptModal: React.FC<{
  visible: boolean
  setOpen: (visible: boolean) => void
}> = ({ visible, setOpen }) => {
  const { deletePrompt } = useMutatePrompt()
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
      area: 'local'
    },
    []
  )

  const [
    remotePrompts,
    _un,
    {
      setStoreValue: setRemotePromptsStoreValue,
      setRenderValue: setRemotePromptsRenderValue
    }
  ] = useStorage<Row[]>(
    {
      key: PROMOT_KEY,
      area: 'local'
    },
    []
  )

  const prompts = useMemo(() => {
    return [
      ...customPromots?.map((item) => ({
        ...item,
        type: DisplayRowType.CUSTOM
      })),
      ...((remotePrompts?.map((item) => ({
        ...item,
        type: DisplayRowType.AWESOME_CHATGPT_PROMPTS
      })) as DisplayRow[]) || [])
    ]
  }, [customPromots, remotePrompts])

  const [pageIndex, setPageIndex] = useState(0)
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<DisplayRow>()
  const pageSize = DEFAULT_PAGE_SIZE

  const total = useMemo(() => {
    return Math.ceil(prompts.length / pageSize)
  }, [prompts, pageSize])

  const displayPrompts = useMemo(() => {
    return prompts.slice(
      pageIndex * pageSize,
      Math.min(prompts.length, (pageIndex + 1) * pageSize)
    )
  }, [pageIndex, prompts, pageSize])

  const editPrompt = (prompt: DisplayRow) => {
    setEditingPrompt(prompt)
    setEditorVisible(true)
  }

  const setEditorModal = (visible: boolean) => {
    setEditorVisible(visible)
    if (!visible) {
      setEditingPrompt(undefined)
    }
  }

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-20 overflow-y-auto p-4 sm:p-6 md:p-20"
        onClose={setOpen}>
        <div>
          <style type="text/css">
            {cssText}
            {reactToolCssText}
          </style>
        </div>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95">
          <div
            style={{ position: 'absolute', transform: 'translateX(-50%)' }}
            className="h-3/4 left-1/2 w-3/4 transform overflow-y-auto overscroll-y-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all opacity-100 scale-100">
            <XMarkIcon className='' onClick={() => setOpen(false)}/>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Prompts
                  </h1>
                  <p className="mt-2 text-sm text-gray-700">
                    List of ChatGPT Prompts
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    onClick={() => setEditorVisible(true)}>
                    Add Custom Prompt
                  </button>
                </div>
              </div>
              {
                <PromptEditor
                  visible={editorVisible}
                  setOpen={setEditorModal}
                  initialValue={editingPrompt}
                />
              }

              <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full table-fixed divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="sticky min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                              Act
                            </th>
                            <th
                              scope="col"
                              className="sticky min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                              Tags
                            </th>
                            <th
                              scope="col"
                              className="sticky px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Prompt
                            </th>
                            <th
                              scope="col"
                              className="sticky px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Description
                            </th>
                            <th
                              scope="col"
                              className="sticky px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Edit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {displayPrompts.map((prompt, index) => (
                            <tr key={prompt.act + index}>
                              <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium">
                                {prompt.act}
                                {prompt.type ===
                                  DisplayRowType.AWESOME_CHATGPT_PROMPTS && (
                                  <a target="_blank" href={getACPTargetUrl(prompt.prompt)}>
                                    <img
                                      alt="link"
                                      src={linkIcon}
                                      className="chatgpt-prompt-helper-panel-explain-link"
                                    />
                                  </a>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {prompt.type
                                    ?.toLocaleLowerCase()
                                    ?.replaceAll('_', ' ')}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div
                                  className="max-w-md line-clamp-2 inline-flex"
                                  style={{ display: 'inline-flex' }}>
                                  <div
                                    style={{
                                      display: 'inline-block',
                                      width: '88%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                    {prompt.prompt}
                                  </div>
                                  <Tooltip
                                    placement="top"
                                    overlay={
                                      <div
                                        className="chatgpt-prompt-helper-item-tooltip"
                                        style={{ width: 400 }}>
                                        {prompt.prompt}
                                      </div>
                                    }>
                                    <div style={{ display: 'inline-block' }}>
                                      <InformationCircleIcon
                                        style={{
                                          width: 24,
                                          height: 24,
                                          display: 'inline-block',
                                          cursor: 'pointer'
                                        }}
                                      />
                                    </div>
                                  </Tooltip>
                                  <div style={{ display: 'inline-block' }}>
                                    <CopyIcon
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          prompt.prompt
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div
                                  className="w-20 line-clamp-2 inline-flex"
                                  style={{
                                    display: 'inline-flex',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                  {prompt.description ?? '/'}
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                                {prompt.type === DisplayRowType.CUSTOM ? (
                                  <>
                                    <a
                                      href="#"
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => editPrompt(prompt)}>
                                      Edit
                                    </a>
                                    <a
                                      href="#"
                                      className="text-indigo-600 hover:text-indigo-900"
                                      onClick={() => deletePrompt(prompt)}>
                                      Delete
                                    </a>
                                  </>
                                ) : (
                                  <>/</>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <nav
                        className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                        aria-label="Pagination">
                        <div className="hidden sm:block">
                          <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                              {1 + pageIndex * pageSize}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(
                                (pageIndex + 1) * pageSize,
                                prompts.length
                              )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                              {prompts.length}
                            </span>{' '}
                            results
                          </p>
                        </div>
                        <div className="flex-1 flex justify-between sm:justify-end">
                          <a
                            href="#"
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() =>
                              setPageIndex((p) => Math.max(0, p - 1))
                            }>
                            Previous
                          </a>
                          <a
                            href="#"
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() =>
                              setPageIndex((p) => Math.min(total - 1, p + 1))
                            }>
                            Next
                          </a>
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}
