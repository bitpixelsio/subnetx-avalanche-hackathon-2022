import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import ErrorPopup from "../ErrorPopup";
import AVMGenesisView from "./AVMGenesisView";
import styles from './AVMGenesisView.module.css'
import { Button, FormControl, FormGroup, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { AVMGenesis } from "../../api/ApiModels";
import { Api } from "../../api/Api";
import { useAppContext } from "../../AppContext";
import ProgressOverlay from "../ProgressOverlay";

type VM = "AVM" | "Custom VM"
const VMs: VM[] = ["AVM", "Custom VM"]

export default function AddBlockchain(props: { onClose: () => void }) {
  const { wallet } = useAppContext()
  const [searchParams] = useSearchParams();
  const [name, setName] = useState<string>("")

  const [nameError, setNameError] = useState<string>()

  const [vm, setVm] = useState<VM>("AVM")
  const [vmId, setVmId] = useState<string>()

  const [genesis, setGenesis] = useState<string>("")

  const [avmGenesis, setAvmGenesis] = useState<AVMGenesis>({})
  const [error, setError] = useState<Error>()

  const [progress, setProgress] = useState(false)

  const genesisView = (() => {
    switch (vm) {
      case "AVM":
        return <AVMGenesisView genesis={avmGenesis} onChange={newGenesis => setAvmGenesis(newGenesis)} />
      default:
        return <>
          <TextField
            label={"VM ID"}
            value={vmId}
            onChange={event => setVmId(event.target.value)}
          />
          <TextField
            label={"Genesis"}
            value={genesis}
            onChange={event => setGenesis(event.target.value)} />
        </>
    }
  })()

  return (
    <FormGroup className={styles.root}>
      <h1>Add Blockchain</h1>

      <Stack spacing={2}>
        <TextField
          fullWidth
          label={"Name"}
          value={name}
          onChange={event => {
            setNameError(undefined)
            setName(event.target.value);
          }}
          error={nameError !== undefined}
          helperText={nameError}
        />

        <FormControl fullWidth>
          <InputLabel>VM</InputLabel>
          <Select<VM>
            label={"VM"}
            value={vm}
            onChange={event => setVm(event.target.value as VM)}
          >
            {VMs.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </Select>
        </FormControl>

        {genesisView}

        <Button
          fullWidth
          variant={"contained"}
          onClick={_ => {
            const _vmId = vm === "AVM" ? "avm" : vmId
            const genesisData = vm === "AVM" ? { genesisData: avmGenesis } : genesis
            setProgress(true)
            Api.createBlockchain(
              wallet!!,
              searchParams.get("subnet")!!,
              name!!,
              _vmId!!,
              genesisData!!
            ).then(_ => {
              props.onClose()
            }).catch(reason => {
              setError(reason)
            }).finally(() => {
              setProgress(false)
            })
          }}>
          Create blockchain
        </Button>
      </Stack>
      <ErrorPopup isOpen={error !== undefined}
                  onRequestClose={_ => setError(undefined)}
                  message={"Cannot add the blockchain."} message2={error?.message} />

      <ProgressOverlay isOpen={progress} />
    </FormGroup>
  )
}