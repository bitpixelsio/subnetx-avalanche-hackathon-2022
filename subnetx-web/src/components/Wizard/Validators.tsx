import styles from './Validators.module.css'
import { useSearchParams } from "react-router-dom";
import FullScreenPopup from "../FullScreenPopup";
import AddValidator from "./AddValidator";
import { usePromise } from "../../hooks/UsePromise";
import { Api } from "../../api/Api";
import { useState } from "react";
import SubnetIdView from "../SubnetIdView";
import { Button, Stack } from "@mui/material";
import { ReactComponent as ValidatorsIcon } from '../../assets/validators_icon.svg';

export default function Validators() {
  const [searchParams, setSearchParams] = useSearchParams();
  const subnetId = searchParams.get("subnet")!!
  const [refreshData, setRefreshDate] = useState(Date.now())

  const [validators] = usePromise(Api.getSubnetValidators, {
    refresh: refreshData,
    cache: {
      cacheKey: "validators_" + subnetId,
      isCachePersistent: true
    },
  }, subnetId)

  return (
    <div className={styles.root}>
      <h1>Add Validators</h1>

      <div className={styles.info}>
        <span>Your subnet has been created! Your subnet ID is</span>
        <SubnetIdView className={styles.subnetId} subnet_id={subnetId} />
        <span>Please start adding validators below</span>
        <h2><ValidatorsIcon />Validators</h2>
        <div className={styles.list}>
          {validators?.map(validator => <div key={validator.txID}>{validator.nodeID}</div>)}
        </div>
      </div>

      <Stack spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          onClick={_ => {
            searchParams.append("validator", "add")
            setSearchParams(searchParams)
          }}>
          Add Validator
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={_ => {
            searchParams.set("wizard", "blockchains")
            setSearchParams(searchParams)
          }}>Next</Button>
      </Stack>


      <FullScreenPopup isOpen={searchParams.has("validator")}
                       style={{ content: { backgroundColor: "var(--card-background)" } }}
                       onRequestClose={_ => {
                         searchParams.delete("validator")
                         setSearchParams(searchParams)
                       }}>
        <AddValidator onClose={() => {
          searchParams.delete("validator")
          setSearchParams(searchParams)
          setRefreshDate(Date.now())
          setTimeout(() => {
            setRefreshDate(Date.now())
          }, 2000)
        }} />
      </FullScreenPopup>
    </div>
  )
}