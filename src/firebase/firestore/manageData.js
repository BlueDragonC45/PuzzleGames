import { db } from "../firebase.browser";
import { doc, setDoc, getDoc } from "firebase/firestore";


export async function addData(collection, id, data) {
  let result = null;
  let error = null;

  try {
    result = await setDoc(doc(db, collection, id), data, {
      merge: true,
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}

export async function getDocument(collection, id) {
    const docRef = doc(db, collection, id);
    let result = null;
    let error = null;

    try {
        result = await getDoc(docRef);
    } catch (e) {
        error = e;
    }

    return { result, error };
}