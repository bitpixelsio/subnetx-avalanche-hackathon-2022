import styles from './Dashboard.module.css'
import SubnetItem from "../components/SubnetItem";
import CreateSubnetItem from "../components/CreateSubnetItem";
import { useAppContext } from "../AppContext";
import { useEffect, useMemo, useState } from "react";
import { Subnet } from "../api/RestApiModels";
import { ReactComponent as YourSubnetsIcon } from '../assets/your_subnets_icon.svg';
import { ReactComponent as OtherSubnetsIcon } from '../assets/other_subnets_icon.svg';

export default function Dashboard() {
  const { wallet, subnets } = useAppContext()

  const [allAddressesP, setAllAddressesP] = useState<string[]>([])

  useEffect(() => {
    wallet?.getAllAddressesP().then(value => {
      setAllAddressesP(value)
    })
  }, [wallet])

  console.log(allAddressesP)

  const splitSubnets = useMemo(() => {
    const response = {
      controlledSubnets: [] as Subnet[],
      otherSubnets: [] as Subnet[],
    }

    for (let subnet of subnets) {
      if (subnet.controlKeys.find(c => allAddressesP.find(cc => cc === c) !== undefined) !== undefined) {
        response.controlledSubnets.push(subnet)
      } else {
        response.otherSubnets.push(subnet)
      }
    }

    return response
  }, [allAddressesP, subnets])


  return (
    <div className={styles.root}>
      <h2><YourSubnetsIcon />Your Subnets</h2>
      <div className={styles.subnet_grid}>
        {splitSubnets.controlledSubnets.map(s => <SubnetItem key={s.id} id={s.id} show_validators={true} />)}
        <CreateSubnetItem />
      </div>

      <h2><OtherSubnetsIcon />All Subnets</h2>
      <div className={styles.subnet_grid}>
        {splitSubnets.otherSubnets.map(s => <SubnetItem key={s.id} id={s.id} />)}
      </div>

    </div>
  )
}
