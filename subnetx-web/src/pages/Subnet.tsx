import { useParams } from "react-router-dom";

export default function Subnet() {
  let { subnetId } = useParams();

  return <div>Subnet {subnetId}</div>
}