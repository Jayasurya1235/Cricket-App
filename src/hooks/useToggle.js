import { useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((current) => !current);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  return [value, toggle, { set: setValue, setTrue, setFalse }];
}

export default useToggle;