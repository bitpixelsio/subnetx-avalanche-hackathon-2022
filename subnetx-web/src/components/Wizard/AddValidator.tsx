import styles from './AddValidator.module.css'
import { useSearchParams } from "react-router-dom";
import { Api } from "../../api/Api";
import { useState } from "react";
import ErrorPopup from "../ErrorPopup";
import AdapterMoment from '@mui/lab/AdapterMoment';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import { Button, TextField } from "@mui/material";
import { useAppContext } from "../../AppContext";
import moment, { Moment } from "moment";
import ProgressOverlay from "../ProgressOverlay";

export default function AddValidator(props: { onClose: () => void }) {
  const { wallet } = useAppContext()
  const [searchParams] = useSearchParams();
  const [nodeId, setNodeId] = useState<string | null>("")
  const [weight, setWeight] = useState<number | null>(null)
  const [startDate, setStartDate] = useState<Moment | null>(null)
  const [endDate, setEndDate] = useState<Moment | null>(null)

  const [nodeIdError, setNodeIdError] = useState<string>()
  const [weightError, setWeightError] = useState<string>()
  const [startDateError, setStartDateError] = useState<string>()
  const [endDateError, setEndDateError] = useState<string>()

  const [progress, setProgress] = useState(false)

  const [error, setError] = useState<Error>()
  return (
    <div className={styles.root}>
      <h1>Add Validator</h1>

      <div className={styles.inputs}>
        <TextField label={"Node ID"} value={nodeId}
                   onChange={event => {
                     setNodeIdError(undefined)
                     setNodeId(event.target.value);
                   }}
                   error={nodeIdError !== undefined}
                   helperText={nodeIdError}
        />

        <TextField label={"Weight"} value={weight ?? ""}
                   onChange={event => {
                     setWeightError(undefined)
                     setWeight(parseInt(event.target.value));
                   }}
                   type={"number"}
                   error={weightError !== undefined}
                   helperText={weightError}
        />

        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateTimePicker
            label="Start Date & Time"
            value={startDate}
            onChange={value => {
              setStartDate(value);
            }}
            minDateTime={moment()}
            maxDateTime={endDate ?? undefined}
            renderInput={(params) => <TextField {...params}
                                                error={startDateError !== undefined}
                                                helperText={startDateError} />}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateTimePicker<Moment>
            label="End Date & Time"
            value={endDate}
            minDateTime={startDate ?? undefined}
            onChange={value => {
              setEndDateError(undefined)
              setEndDate(value);
            }}
            renderInput={(params) => <TextField {...params}
                                                error={endDateError !== undefined}
                                                helperText={endDateError} />}
          />
        </LocalizationProvider>
      </div>


      <Button variant="contained" onClick={_ => {
        if (nodeId === null || nodeId.trim().length === 0) {
          setNodeIdError("Please enter a node id")
          return
        } else {
          setNodeIdError(undefined)
        }

        if (weight === null || weight === 0) {
          setWeightError("Please enter a non-zero weight")
          return
        } else {
          setWeightError(undefined)
        }

        if (startDate === null) {
          setStartDateError("Please enter a start date")
          return
        } else {
          setStartDateError(undefined)
        }

        if (endDate === null) {
          setEndDateError("Please enter an end date")
          return
        } else {
          setEndDateError(undefined)
        }

        setProgress(true)
        Api.addSubnetValidator(wallet!!, searchParams.get("subnet")!!, nodeId, startDate.toDate(), endDate.toDate(), weight).then(_ => {
          props.onClose()
        }).catch(reason => {
          setError(reason)
        }).finally(() => {
          setProgress(false)
        })
      }}>Add</Button>

      <ErrorPopup isOpen={error !== undefined}
                  onRequestClose={_ => setError(undefined)}
                  message={"Cannot add the validator."} message2={error?.message} />

      <ProgressOverlay isOpen={progress} />
    </div>
  )
}