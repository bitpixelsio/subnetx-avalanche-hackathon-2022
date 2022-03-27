import styles from './Header.module.css'
import { Link } from "react-router-dom";
import logo from '../assets/logo.png'
import { useAppContext } from "../AppContext";
import ConnectLedger from "./ConnectLedger";
import ConnectPrivateKey from "./ConnectPrivateKey";
import { BN, bnToAvaxP, bnToAvaxX } from "@avalabs/avalanche-wallet-sdk";

export default function Header() {
  const { wallet } = useAppContext()
  return (
    <header className={styles.root}>
      <div className={styles.top}>
        <Link to={"/"}>
          <img alt={"Go To Home"} src={logo} />
        </Link>

        <div className={styles.connect}>
          <ConnectLedger />
          <ConnectPrivateKey/>
          <span>Active wallet: {wallet?.getAllAddressesPSync()[0] ?? "N/A"}</span>
          <span>{bnToAvaxP(wallet?.getAvaxBalanceP()?.unlocked??new BN(0))} AVAX P</span>
          <span>{bnToAvaxX(wallet?.getAvaxBalanceX()?.unlocked??new BN(0))} AVAX X</span>
        </div>

      </div>


      <div className={styles.divider} />
    </header>
  )
}