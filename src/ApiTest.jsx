import { useEffect, useState } from "react";
import axios from "axios";

function ApiTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BE_URL}/api/test`) // Make sure this matches your Flask API
      .then((response) => {
        console.log(response);
        setMessage(response.data.message);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Flask API Response:</h2>
      <p>{message || "Loading..."}</p>
      {`${import.meta.env.VITE_BE_URL}/api/test`}
    </div>
  );
}

export default ApiTest;
