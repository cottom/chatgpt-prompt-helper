import { Dialog, Transition } from '@headlessui/react'
import reactToolCssText from 'data-text:rc-tooltip/assets/bootstrap_white.css'
import cssText from 'data-text:~style.css'
import React, { Fragment } from 'react'
import { useField, useForm } from 'react-final-form-hooks'

import { useMutatePrompt } from '../hooks/savePrompt'
import type { DisplayRow } from '../request'

const required = (value) => (value ? undefined : 'Required')

const EditorForm: React.FC<{
  initialValue?: Omit<DisplayRow, 'type'>
  onSubmit: (value: DisplayRow) => void
  setOpen: (visible: boolean) => void
}> = ({ initialValue, onSubmit, setOpen }) => {
  const { form, handleSubmit, values, pristine, submitting } = useForm({
    onSubmit, // the function to call with your form values upon valid submit
    // validate // a record-level validation function to check all form values
    initialValues: initialValue
  })
  const act = useField('act', form, required)
  const prompt = useField('prompt', form, required)
  const description = useField('description', form)

  return (
    <form
      className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 m-auto"
      onSubmit={handleSubmit}>
      <h2>Add Custom Prompt</h2>
      <div className="mb-6">
        <label
          htmlFor="act"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          ACT
        </label>
        <input
          type="text"
          id="act"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Act for promopt"
          required
          {...act.input}
        />
        <p className="invisible peer-invalid:visible text-red-700 font-light">
          Please enter ACT
        </p>
      </div>
      <div className="mb-6">
        <label
          htmlFor="prompt"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Prompt
        </label>
        <textarea
          id="prompt"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="prompt"
          required
          {...prompt.input}
        />
        <p className="invisible peer-invalid:visible text-red-700 font-light">
          Please enter prompt
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Description
        </label>
        <textarea
          id="description"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          {...description.input}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={submitting}>
          Save
        </button>
      </div>
    </form>
  )
}

export const PromptEditor: React.FC<{
  visible: boolean
  setOpen: (visible: boolean) => void
  initialValue?: Omit<DisplayRow, 'type'>
}> = ({ visible, setOpen, initialValue }) => {
  const { savePrompt, updatePrompt } = useMutatePrompt()

  const onSubmit = async (value: DisplayRow) => {
    if (initialValue?.act) {
      await updatePrompt(value, initialValue as DisplayRow)
    } else {
      await savePrompt(value)
    }
    setOpen(false)
  }

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-40 overflow-y-auto p-4 sm:p-6 md:p-20"
        onClose={setOpen}>
        <style type="text/css">
          {cssText}
          {reactToolCssText}
        </style>
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
          <div className="z-50">
            {visible && (
              <EditorForm
                onSubmit={onSubmit}
                setOpen={setOpen}
                initialValue={initialValue}
              />
            )}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}
