import React, { useContext, useEffect, useState } from "react";
import { Strings, localizedStrings } from "../strings";

function getCurrentLocaleStrings(): Strings {
  return localizedStrings.en;

  // TODO: Handle other languages
  for (let language of navigator.languages) {
    if (language == "en-US" || language == "en-CA") {
      return localizedStrings.en;
    } else if (language == "fr-CA") {
      return localizedStrings.fr;
    }
  }
}

const useProvideString = (): Strings => {
  const [strings, setStrings] = useState<Strings>(getCurrentLocaleStrings());

  useEffect(() => {
    window.addEventListener("languagechange", () => {
      setStrings(getCurrentLocaleStrings());
    });
  }, []);

  return strings;
};

const StringsContext = React.createContext<Strings>(getCurrentLocaleStrings());

export const ProvideStrings = (props: { children: React.ReactNode }) => {
  const cache = useProvideString();

  return (
    <StringsContext.Provider value={cache}>
      {props.children}
    </StringsContext.Provider>
  );
};

export const useStrings = () => useContext(StringsContext);
