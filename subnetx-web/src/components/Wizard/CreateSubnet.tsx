import styles from './CreateSubnet.module.css'
import { useSearchParams } from "react-router-dom";
import { Api } from "../../api/Api";
import { useState } from "react";
import ErrorPopup from "../ErrorPopup";
import { Button, Typography } from "@mui/material";
import { useAppContext } from "../../AppContext";
import ProgressOverlay from "../ProgressOverlay";

export default function CreateSubnet() {
  const { wallet, refreshSubnets } = useAppContext()
  const [, setSearchParams] = useSearchParams();
  const [error, setError] = useState<Error>()
  const [progress, setProgress] = useState(false)

  return (
    <div>
      <h1>Create Subnet</h1>
      <Typography className={styles.text}>Create a subnet. This wallet will be sole controller of the
        subnet.</Typography>
      <Button
        variant={"contained"}
        onClick={_ => {
          setProgress(true)
          Api.createSubnet(wallet!!).then(subnetId => {
            setSearchParams("?wizard=validators&subnet=" + subnetId)
            refreshSubnets()
          }).catch(reason => {
            setError(reason)
          }).finally(() => {
            setProgress(false)
          })
        }}>
        Create
      </Button>

      <ErrorPopup isOpen={error !== undefined}
                  onRequestClose={_ => setError(undefined)}
                  message={"Cannot create subnet."} message2={error?.message} />

      <ProgressOverlay isOpen={progress}/>
    </div>
  )
}