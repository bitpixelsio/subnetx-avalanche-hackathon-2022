import Modal, { Props } from 'react-modal';
import React from "react";
import { CircularProgress } from '@mui/material';

export type FullScreenPopupProps = Omit<Props, "appElement"> & { children?: React.ReactNode }

export default function ProgressOverlay(props: FullScreenPopupProps) {
  return (
    <Modal
      {...props}
      appElement={document.getElementById('root') as HTMLElement}
      style={{
        overlay: props.style?.overlay,
        content: {
          backgroundColor: "transparent",
          border: "unset",
          width: 'auto',
          height: 'auto',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          ...props.style?.content,
        }
      }}>
      <CircularProgress />
    </Modal>
  )
}
