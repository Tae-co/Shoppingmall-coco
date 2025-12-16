import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyCoMate() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/comate/me/review", { replace: true });
  }, [navigate]);

  return null; 
}

export default MyCoMate;