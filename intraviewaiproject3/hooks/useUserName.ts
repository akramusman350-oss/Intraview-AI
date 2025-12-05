import { useState, useEffect } from "react"

export function useUserName() {
  const [userName, setUserName] = useState<string>("Candidate")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("userName")
      if (storedName) {
        setUserName(storedName)
      }
    }
  }, [])

  return userName
}
