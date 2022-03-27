import styles from './Finish.module.css'
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { useAppContext } from "../../AppContext";
import { Button, Stack } from "@mui/material";
import SubnetIdView from "../SubnetIdView";
import { usePromise } from "../../hooks/UsePromise";
import { Api } from "../../api/Api";
import completedImage from './../../assets/completed.png'

export default function Finish() {
  const { blockchains, subnets } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams();
  const subnetId = searchParams.get("subnet")!!


  const [validators] = usePromise(Api.getSubnetValidators, {
    cache: {
      cacheKey: "validators_" + subnetId,
      isCachePersistent: true
    },
  }, subnetId)

  const subnet = useMemo(() => {
    return subnets.find(value => value.id === subnetId)!!
  }, [subnets, subnetId])

  const blockchainCount = useMemo(() => {
    return blockchains.filter(value => value.subnetID === subnetId).length
  }, [blockchains, subnetId])

  return (
    <div className={styles.root}>

      <div>
        <img  alt={"completed"} src={completedImage} />
        <h1>Completed</h1>
      </div>

      <div className={styles.info}>
        <span>Your subnet id is</span>
        <SubnetIdView className={styles.subnetId} subnet_id={subnetId} />
        <div className={styles.info_grid}>
          <span>Blockchains</span>
          <span>{blockchainCount}</span>
          <span>Validators</span>
          <span>{validators?.length ?? "n/a"}</span>
          <span>Control Keys</span>
          <span>{subnet?.controlKeys?.length ?? "n/a"}</span>
          <span>Threshold</span>
          <span>{subnet?.threshold ?? "n/a"}</span>
        </div>
      </div>


      <Stack spacing={2}>
        <Button
          fullWidth
          variant={"contained"}
          onClick={_ => {
            setSearchParams("")
          }}>
          Close
        </Button>
      </Stack>
    </div>
  )
}