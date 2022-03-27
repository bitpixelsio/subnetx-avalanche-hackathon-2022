import styles from './NotificationWizard.module.css'
import { useSearchParams } from "react-router-dom";
import React, { useMemo, useState } from "react";
import FullScreenPopup from "../FullScreenPopup";
import SubnetIdView from "../SubnetIdView";
import { Button, Stack, TextField } from "@mui/material";
import { useAppContext } from "../../AppContext";
import { CloudFunctions } from "../../api/NotificationApi";
import ErrorPopup from "../ErrorPopup";
import ProgressOverlay from "../ProgressOverlay";

export default function NotificationWizard() {
  const { wallet, subscriptions, refreshSubscriptions } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams();
  const subnetId = searchParams.get("subnet")!!

  const activeSubscription = useMemo(() => {
    return subscriptions.find(value => value.subnetId === subnetId)
  }, [subscriptions, subnetId])

  const [progress, setProgress] = useState(false)

  const [error, setError] = useState<Error>()

  const [webhook, setWebhook] = useState<string>(activeSubscription?.webhook ?? "")

  if (searchParams.has("notifications")) {
    return (
      <FullScreenPopup
        style={{ content: { backgroundColor: "var(--card-background)", height: "500px", width: "400px" } }}
        isOpen={true}
        onRequestClose={_ => {
          setSearchParams("")
        }}>
        <div className={styles.root}>

          <h1>Manage Notifications</h1>

          <div className={styles.info}>
            <span>Subnet</span>
            <SubnetIdView className={styles.subnetId} subnet_id={searchParams.get("subnet")!!} />
            <span>Create a subnet notification for expiring validators</span>

            <TextField fullWidth label={"Webhook Endpoint"} value={webhook}
                       onChange={event => {
                         setWebhook(event.target.value)
                       }}
            />

            <div className={styles.list}>
              {/*notifications?.map(e => <div key={e.txID}>{e.nodeID}</div>)*/}
            </div>
          </div>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={_ => {
                setProgress(true)
                CloudFunctions.subscribeToSubnet(
                  wallet?.getAllAddressesPSync()[0]!!,
                  subnetId,
                  webhook
                ).then(_ => {
                  refreshSubscriptions()
                }).catch(reason => {
                  console.log(reason)
                  setError(reason)
                }).finally(() => {
                  setProgress(false)
                })
              }}>
              Update
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={_ => {
                setSearchParams("")
              }}>Close</Button>
          </Stack>
        </div>

        <ErrorPopup isOpen={error !== undefined}
                    onRequestClose={_ => setError(undefined)}
                    message={"Cannot add the notification."} message2={error?.message} />

        <ProgressOverlay isOpen={progress} />

      </FullScreenPopup>
    )
  } else {
    return <></>
  }
}