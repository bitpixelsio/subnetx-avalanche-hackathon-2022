import styles from './SubnetIdView.module.css'
import { ReactComponent as CopyIcon } from '../assets/copy_icon.svg';
import { DetailedHTMLProps, HTMLAttributes } from "react";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & { subnet_id: string }

export default function SubnetIdView(props: Props) {
  return <span {...props}
               title={props.subnet_id}
               className={`${styles.root} ${props.className ?? ""}`}>
    {props.subnet_id.ellipsize(5, 5)}<CopyIcon className={styles.icon} fill={"var(--text-color)"} /></span>
}
