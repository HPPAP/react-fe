import { useEffect, useState } from "react";
import axios from "axios";

function ApiTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/test")  // Make sure this matches your Flask API
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Flask API Response:</h2>
      <p>{message || "Loading..."}</p>
    </div>
  );
}

export default ApiTest;