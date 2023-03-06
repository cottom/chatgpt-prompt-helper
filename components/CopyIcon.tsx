import {
  CheckCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import React, { useState } from 'react'

const defaultStyles: React.SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  display: 'inline-block',
  cursor: 'pointer'
}

export const CopyIcon: React.FC<{ delay?: number; onClick?: () => void }> = ({
  delay = 1500,
  onClick
}) => {
  const [showCheckIcon, setShowCheckIcon] = useState(false)

  const onCopy = () => {
    onClick?.()
    setShowCheckIcon(true)
    setTimeout(() => setShowCheckIcon(false), delay)
  }

  return (
    <>
      {showCheckIcon ? (
        <CheckCircleIcon {...defaultStyles} stroke="green" />
      ) : (
        <ClipboardDocumentIcon onClick={onCopy} {...defaultStyles} />
      )}
    </>
  )
}
