import { useState } from "react";

export function getLocalStorage(key, defaultValue) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = saved && JSON.parse(saved);
  return initial || defaultValue;
}

export function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value)); 
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getLocalStorage(key, defaultValue);
  });
  console.log(value);
  
  const mySetValue = (value) => {
    setLocalStorage(key, value);
    setValue(value);
  }

  return [value, mySetValue];
};