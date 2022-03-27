import styles from './ConnectPrivateKey.module.css'
import { Button, TextField } from "@mui/material";
import { getPrivateKeyWallet } from "../api/WalletSource";
import { useAppContext } from "../AppContext";
import { useState } from "react";
import ErrorPopup from "./ErrorPopup";
import FullScreenPopup from "./FullScreenPopup";

export default function ConnectPrivateKey() {
  const { updateWallet } = useAppContext()

  const [progress, setProgress] = useState<boolean>(false)
  const [error, setError] = useState<Error>()

  const [privateKey, setPrivateKey] = useState<string>("")

  return (

    <div>
      <Button fullWidth variant={"outlined"} onClick={_ => {
        setProgress(true)
      }}>
        Import private key
      </Button>

      <FullScreenPopup
        style={{content: {
            width: 'auto',
            height: 'auto'
          }}}
        isOpen={progress} onRequestClose={event => {
        setProgress(false);
        setPrivateKey("")
      }}>
        <div className={styles.popup_root}>
          <TextField label={"Private Key"} type={"password"} value={privateKey} onChange={event => setPrivateKey(event.target.value)}>

          </TextField>
          <Button variant={"contained"} onClick={_ => {
            getPrivateKeyWallet(privateKey).then(value => {
              updateWallet(value)
            }).catch( reason => {
              setError(reason)
            }).finally(() => {
              setProgress(false)
              setPrivateKey("")
            })
          }}>
            Import
          </Button>
        </div>

      </FullScreenPopup>

      <ErrorPopup isOpen={error !== undefined}
                  onRequestClose={_ => setError(undefined)}
                  message={"Cannot connect to the ledger."} message2={error?.message} />

    </div>
  )
}