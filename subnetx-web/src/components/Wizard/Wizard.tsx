import styles from './Wizard.module.css'
import { useSearchParams } from "react-router-dom";
import React from "react";
import Validators from "./Validators";
import CreateSubnet from "./CreateSubnet";
import FullScreenPopup from "../FullScreenPopup";
import Blockchains from "./Blockchains";
import Finish from "./Finish";
import { ReactComponent as ProgressIcon } from '../../assets/progress_icon.svg';

export default function Wizard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const wizardContent = (() => {
    switch (searchParams.get("wizard")) {
      case "subnet":
        return <CreateSubnet />
      case "validators":
        return <Validators />
      case "blockchains":
        return <Blockchains />
      case "finish":
        return <Finish />
      default:
        return undefined
    }
  })()

  if (wizardContent) {
    return (
      <FullScreenPopup
        style={{ content: { backgroundColor: "var(--card-background)", height: "500px", width: "400px" } }}
        isOpen={true}
        onRequestClose={_ => {
          setSearchParams("")
        }}>
        <div className={styles.root}>
          {wizardContent}

          <div className={styles.progress}>
            <span className={searchParams.get("wizard") === "subnet" ? styles.selected : undefined}>Create subnet</span>
            <ProgressIcon />
            <span className={searchParams.get("wizard") === "validators" ? styles.selected : undefined}>Add validators</span>
            <ProgressIcon />
            <span className={searchParams.get("wizard") === "blockchains" ? styles.selected : undefined}>Create blockchains</span>
            <ProgressIcon />
            <span className={searchParams.get("wizard") === "finish" ? styles.selected : undefined}>Finish</span>

          </div>
        </div>
      </FullScreenPopup>
    )
  } else {
    return <></>
  }
}