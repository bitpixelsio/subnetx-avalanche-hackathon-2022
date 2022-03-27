import Modal, { Props } from 'react-modal';
import React from "react";

export type ErrorPopupProps =
  Pick<Props, "onRequestClose">
  & Pick<Props, "isOpen">
  & { message?: string, message2?: string }

export default function ErrorPopup(props: ErrorPopupProps) {
  return (
    <Modal
      {...props}
      appElement={document.getElementById('root') as HTMLElement}
      style={{
        content: {
          width: 'auto',
          height: 'auto',
          maxWidth: '400px',
          backgroundColor: "var(--card-background)",
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        }
      }}>
      <h1>Error</h1>
      <span>{props.message ?? "An error occurred."}</span>
      <br />
      <span>{props.message2 ?? ""}</span>
    </Modal>
  )
}
