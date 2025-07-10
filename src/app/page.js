import Link from 'next/link'

import { getDocs } from "firebase/firestore";
import { energyGameCollection } from '../firebase/firebase.browser'

import signIn from '../firebase/auth/signIn';
import { getDocument } from '../firebase/firestore/manageData.js';

await signIn("dillon.45.chaney@gmail.com", "bdc456");
// console.log((await getDocs(energyGameCollection)));
console.log((await getDocument("EnergyGame", "ulZk0mqFfr13OQf6Vfij")).result.data());




export default function Page() {
  return <Link className="text-3xl" href="/wordplex">WordPlex</Link>
}