import styles from './CreateSubnetItem.module.css'
import { Link } from "react-router-dom";
import { ReactComponent as CreateIcon } from '../assets/create_icon.svg';

export default function CreateSubnetItem() {
  return (
    <div className={styles.root}>
      <Link to={"?wizard=subnet"}>
        <CreateIcon className={styles.icon} />
        <span>Create a subnet</span>
      </Link>
    </div>
  )
}
