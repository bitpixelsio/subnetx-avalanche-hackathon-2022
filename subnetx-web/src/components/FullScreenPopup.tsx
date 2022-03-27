import Modal, { Props } from 'react-modal';
import React from "react";

export type FullScreenPopupProps = Omit<Props, "appElement"> & { children?: React.ReactNode }

export default function FullScreenPopup(props: FullScreenPopupProps) {
  return (
    <Modal
      {...props}
      appElement={document.getElementById('root') as HTMLElement}
      style={{
        overlay: props.style?.overlay,
        content: {
          width: '400px',
          height: '500px',
          backgroundColor: "var(--card-background)",
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          ...props.style?.content,
        }
      }} />
  )
}
