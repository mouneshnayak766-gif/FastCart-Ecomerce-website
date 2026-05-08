import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

export function Login () {
    return (
        <div className="flex gap-4 items-center">
        <button className="bg-white text-blue-700 px-4 py-1 rounded font-semibold">
          Login
        </button>

        <button className="flex items-center gap-1">
          🛒 Cart
        </button>
      </div>

    </div>
    ); }
   