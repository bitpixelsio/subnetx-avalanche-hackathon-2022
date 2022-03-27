import { Button } from "@mui/material";
import { getLedgerWallet } from "../api/WalletSource";
import { useAppContext } from "../AppContext";
import { useState } from "react";
import ErrorPopup from "./ErrorPopup";
import FullScreenPopup from "./FullScreenPopup";

export default function ConnectLedger() {
  const { updateWallet } = useAppContext()

  const [progress, setProgress] = useState<boolean>(false)
  const [error, setError] = useState<Error>()
  return (

    <div>
      <Button fullWidth variant={"outlined"} onClick={_ => {
        setProgress(true)
        getLedgerWallet().then(value => {
          updateWallet(value)
        }).catch(reason => {
          setError(reason)
        }).finally(() => {
          setProgress(false)
        })
      }}>
        Connect Ledger
      </Button>

      <FullScreenPopup
        style={{content: {
            width: 'auto',
            height: 'auto'
          }}}
        isOpen={progress}>
        <div>
          Please follow the instruction on your browser and ledger.
        </div>
      </FullScreenPopup>

      <ErrorPopup isOpen={error !== undefined}
                  onRequestClose={_ => setError(undefined)}
                  message={"Cannot connect to the ledger."} message2={error?.message} />

    </div>
  )
}