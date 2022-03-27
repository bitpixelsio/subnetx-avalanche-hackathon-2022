import styles from './AVMGenesisView.module.css'
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AVMGenesis } from "../../api/ApiModels";

type Cap = "fixedCap" | "variableCap"
const Caps: Cap[] = ["fixedCap", "variableCap"]

export default function AVMGenesisView(props: { genesis: AVMGenesis, onChange: (newGenesis: AVMGenesis) => void }) {
  const [expanded, setExpanded] = useState<number>(-1);
  const [fixedCapExpanded, setFixedCapExpanded] = useState<number>(-1);
  const [variableCapExpanded, setVariableCapExpanded] = useState<number>(-1);

  return (
    <Stack className={styles.root} spacing={2}>
      {Object.keys(props.genesis).map((alias, index) => {
        const asset = props.genesis[alias]
        return (
          <Accordion key={index} expanded={expanded === index}
                     onChange={(_, expanded) => setExpanded(expanded ? index : -1)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                Asset {index + 1}
              </Typography>
              <IconButton aria-label="delete" onClick={event => {
                const newGenesis = { ...props.genesis }
                delete newGenesis[alias]
                props.onChange(newGenesis)
                event.stopPropagation()
              }}>
                <DeleteIcon />
              </IconButton>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={"Alias"}
                  value={alias}
                  onChange={event => {
                    const newGenesis = { ...props.genesis }
                    delete newGenesis[alias]
                    newGenesis[event.target.value] = props.genesis[alias]
                    props.onChange(newGenesis)
                  }}
                />

                <TextField
                  fullWidth
                  label={"Name"}
                  value={asset.name}
                  onChange={event => {
                    const newGenesis = { ...props.genesis }
                    newGenesis[alias] = { ...newGenesis[alias], name: event.target.value }
                    props.onChange(newGenesis)
                  }}
                />

                <TextField
                  fullWidth
                  label={"Symbol"}
                  value={asset.symbol}
                  onChange={event => {
                    const newGenesis = { ...props.genesis }
                    newGenesis[alias] = { ...newGenesis[alias], symbol: event.target.value }
                    props.onChange(newGenesis)
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Cap Type</InputLabel>
                  <Select<Cap>
                    label={"Cap Type"}
                    value={"fixedCap" in asset.initialState ? "fixedCap" : "variableCap"}
                    onChange={event => {
                      let newKey = event.target.value
                      const newInitialState: any = {}
                      newInitialState[newKey] = []

                      const newGenesis = { ...props.genesis }
                      newGenesis[alias] = { ...newGenesis[alias], initialState: newInitialState as any }
                      props.onChange(newGenesis)
                    }}
                  >
                    {Caps.map(e => <MenuItem key={e}
                                             value={e}>{e === "fixedCap" ? "Fixed Cap" : "Variable Cap"}</MenuItem>)}
                  </Select>
                </FormControl>


                {"fixedCap" in asset.initialState ?
                  <> {asset.initialState.fixedCap.map((e, index) => {
                    return (
                      <Accordion key={index} expanded={fixedCapExpanded === index}
                                 onChange={(_, expanded) => setFixedCapExpanded(expanded ? index : -1)}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1bh-content"
                          id="panel1bh-header"
                        >
                          <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Fixed Cap {index + 1}
                          </Typography>
                          <IconButton aria-label="delete" onClick={event => {
                            const newGenesis = { ...props.genesis }
                            const initialState = newGenesis[alias].initialState
                            if ("fixedCap" in initialState) {
                              initialState.fixedCap = initialState.fixedCap.filter(f => f !== e)
                            }
                            props.onChange(newGenesis)
                            event.stopPropagation()
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={2}>
                            <TextField
                              label={"Address"}
                              value={e.address}
                              onChange={event => {
                                const newGenesis = { ...props.genesis }
                                e.address = event.target.value
                                props.onChange(newGenesis)
                              }}
                            />

                            <TextField
                              label={"Amount"}
                              value={e.amount}
                              onChange={event => {
                                const newGenesis = { ...props.genesis }
                                e.amount = parseInt(event.target.value)
                                if (isNaN(e.amount)) {
                                  e.amount = 0
                                }
                                props.onChange(newGenesis)
                              }} />
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                    <Button
                      variant={"outlined"}
                      onClick={_ => {
                        const newGenesis = { ...props.genesis }
                        const initialState = newGenesis[alias].initialState
                        if ("fixedCap" in initialState) {
                          initialState.fixedCap.push({ address: "", amount: 0 })
                          setFixedCapExpanded(initialState.fixedCap.length - 1)
                        }
                        props.onChange(newGenesis)
                      }}>
                      Add a fixed cap
                    </Button>
                  </>
                  :
                  <></>
                }

                {"variableCap" in asset.initialState ?
                  <> {asset.initialState.variableCap.map((e, index) => {
                    return (
                      <Accordion key={index} expanded={variableCapExpanded === index}
                                 onChange={(_, expanded) => setVariableCapExpanded(expanded ? index : -1)}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1bh-content"
                          id="panel1bh-header"
                        >
                          <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Variable Cap {index + 1}
                          </Typography>
                          <IconButton aria-label="delete" onClick={event => {
                            const newGenesis = { ...props.genesis }
                            const initialState = newGenesis[alias].initialState
                            if ("variableCap" in initialState) {
                              initialState.variableCap = initialState.variableCap.filter(f => f !== e)
                            }
                            props.onChange(newGenesis)
                            event.stopPropagation()
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TextField
                            fullWidth
                            label={"Minters"}
                            value={e.minters.join(", ")}
                            onChange={event => {
                              const newGenesis = { ...props.genesis }
                              e.minters = event.target.value.split(",").map(value => value.trim())
                              props.onChange(newGenesis)
                            }} />

                          <TextField
                            fullWidth
                            label={"Threshold"}
                            type={"number"}
                            value={e.threshold}
                            onChange={event => {
                              const newGenesis = { ...props.genesis }
                              e.threshold = parseInt(event.target.value)
                              props.onChange(newGenesis)
                            }} />

                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                    <Button
                      variant={"outlined"}
                      onClick={_ => {
                        const newGenesis = { ...props.genesis }
                        const initialState = newGenesis[alias].initialState
                        if ("variableCap" in initialState) {
                          initialState.variableCap.push({ minters: [], threshold: 1 })
                          setVariableCapExpanded(initialState.variableCap.length - 1)
                        }
                        props.onChange(newGenesis)
                      }}>
                      Add a variable cap
                    </Button>
                  </>
                  :
                  <></>
                }
              </Stack>
            </AccordionDetails>
          </Accordion>
        )
      })}
      <Button
        fullWidth
        variant={"outlined"}
        onClick={_ => {
          const newGenesis = { ...props.genesis, "": { name: "", symbol: "", initialState: { fixedCap: [] } } }
          setExpanded(Object.keys(newGenesis).length - 1)
          props.onChange(newGenesis)
        }}>
        Add an asset
      </Button>
    </Stack>
  )
}
