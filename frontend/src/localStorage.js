import { useState, useEffect } from "react";

export function getLocalStorage(key, defaultValue) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved);
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

  useEffect(() => {
    // storing input name
    setLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue];
};