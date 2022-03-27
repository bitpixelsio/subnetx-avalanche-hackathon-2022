import styles from './Blockchains.module.css'
import { useSearchParams } from "react-router-dom";
import FullScreenPopup from "../FullScreenPopup";
import { useMemo } from "react";
import AddBlockchain from "./AddBlockchain";
import { useAppContext } from "../../AppContext";
import { Button, Stack } from "@mui/material";
import { ReactComponent as BlockchainsIcon } from '../../assets/blockchain_icon.svg';
import { BinTools } from "avalanche";
import { StringDecoder } from "string_decoder";

export default function Blockchains() {
  const { blockchains, refreshBlockchains } = useAppContext()
  const [searchParams, setSearchParams] = useSearchParams();
  const subnetId = searchParams.get("subnet")!!

  const subnetBlockchains = useMemo(() => {
    return blockchains.filter(value => value.subnetID === subnetId)
  }, [blockchains, subnetId])

  return (
    <div className={styles.root}>
      <h1>Add Blockchains</h1>

      <div className={styles.info}>
        <span>Please start adding blockchains below</span>

        <h2><BlockchainsIcon />Blockchains</h2>
        <div className={styles.list}>
          {subnetBlockchains.map(blockchain => {
            const vmBuffer = BinTools.getInstance().cb58Decode(
              blockchain.vmID
            )
            const vm = new StringDecoder().write(vmBuffer as any)
            return <div key={blockchain.name}>{blockchain.name}<span className={styles.vm}>{vm}</span></div>;
          })}
        </div>

      </div>


      <Stack spacing={2}>

        <Button
          fullWidth
          variant={"outlined"}
          onClick={_ => {
            searchParams.append("blockchain", "add")
            setSearchParams(searchParams)
          }}>
          Add
        </Button>

        <Button
          fullWidth
          variant={"contained"}
          onClick={_ => {
            searchParams.set("wizard", "finish")
            setSearchParams(searchParams)
          }}>
          Finish
        </Button>
      </Stack>

      <FullScreenPopup isOpen={searchParams.has("blockchain")} onRequestClose={_ => {
        searchParams.delete("blockchain")
        setSearchParams(searchParams)
      }}>
        <AddBlockchain onClose={() => {
          searchParams.delete("blockchain")
          setSearchParams(searchParams)
          refreshBlockchains()
          setTimeout(() => {
            refreshBlockchains()
          }, 2000)
        }} />
      </FullScreenPopup>
    </div>
  )
}