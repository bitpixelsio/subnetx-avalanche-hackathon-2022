import styles from './SubnetItem.module.css'
import { useSearchParams } from "react-router-dom";
import SubnetIdView from "./SubnetIdView";
import { useAppContext } from "../AppContext";
import { useMemo } from "react";
import { Button, Stack } from "@mui/material";
import { usePromise } from "../hooks/UsePromise";
import { Api } from "../api/Api";

export default function SubnetItem(props: { id: string, show_validators?: boolean }) {
  const { blockchains, subnets, subscriptions } = useAppContext()

  const [searchParams, setSearchParams] = useSearchParams();

  const subnet = useMemo(() => {
    return subnets.find(value => value.id === props.id)!!
  }, [subnets, props.id])

  const blockchainCount = useMemo(() => {
    return blockchains.filter(value => value.subnetID === props.id).length
  }, [blockchains, props.id])

  const [validators] = usePromise(Api.getSubnetValidators, {
    skip: props.show_validators !== true,
    cache: {
      cacheKey: "validators_" + props.id,
      isCachePersistent: true
    },
  }, props.id)

  console.log(subscriptions)
  return (
    <div className={styles.root}>
      <span>Subnet</span>
      <SubnetIdView className={styles.subnetId} subnet_id={props.id} />
      <Button onClick={_  => {
        searchParams.set("notifications", "")
        searchParams.set("subnet", props.id)
        setSearchParams(searchParams)
      }}>
        {(subscriptions.find(value => value.subnetId === props.id)?.webhook ?? "") !== "" ? "Manage Notification" : "Add Notification"}
      </Button>

      <div className={styles.info}>
        <span>Blockchains</span>
        <span>{blockchainCount}</span>
        {props.show_validators ?
          <>
            <span>Validators</span>
            <span>{validators?.length ?? "n/a"}</span>
          </> : <></>}
        <span>Control Keys</span>
        <span>{subnet.controlKeys.length}</span>
        <span>Threshold</span>
        <span>{subnet.threshold}</span>
      </div>

      {props.show_validators ? <Stack spacing={2}>
        <Button variant={"outlined"} color={"inherit"} onClick={event => {
          searchParams.set("wizard", "validators")
          searchParams.set("subnet", props.id)
          setSearchParams(searchParams)
          event.stopPropagation()
        }}>
          Edit Validators
        </Button>

        <Button variant={"outlined"} color={"inherit"} onClick={event => {
          searchParams.set("wizard", "blockchains")
          searchParams.set("subnet", props.id)
          setSearchParams(searchParams)
          event.stopPropagation()
        }}>
          Edit Blockchains
        </Button>
      </Stack> : <></>}
    </div>
  )
}