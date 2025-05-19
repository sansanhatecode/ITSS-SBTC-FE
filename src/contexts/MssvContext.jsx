import { createContext, useContext, useState } from "react";

const MssvContext = createContext();

export const MssvProvider = ({ children }) => {
  const [mssv, setMssv] = useState("");

  return (
    <MssvContext.Provider value={{ mssv, setMssv }}>
      {children}
    </MssvContext.Provider>
  );
};

export const useMssv = () => {
  const context = useContext(MssvContext);
  if (!context) {
    throw new Error("useMssv must be used within a MssvProvider");
  }
  return context;
};
