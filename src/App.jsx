import { useEffect, useState } from "react";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`smooth-transition p-4 min-h-screen w-full ${
        isDarkMode
          ? "bg-linear-to-t from-dark-black to-dark-darkest"
          : "bg-linear-to-t from-light-secondary to-light-darkest"
      }`}
    >
      <div className="flex flex-1 justify-end">
        {" "}
        <button
          onClick={toggleTheme}
          className={`smooth-transition p-2 text-4xl rounded-4xl shadow ${
            isDarkMode
              ? "bg-radial-[at_25%_25%] from-dark-light to-dark-lighter"
              : "bg-light-light"
          }`}
        >
          {isDarkMode ? "🌑" : "🌕"}
        </button>
      </div>

      <div className="pl-4 flex flex-1 flex-col justify-start items-start space-y-2">
        <p
          className={`smooth-transition pb-2 text-2xl font-sans font-bold ${
            isDarkMode ? "text-dark-text" : "text-light-text"
          }`}
        >
          Add Account
        </p>

        <input
          className={`smooth-transition font-sans p-2 rounded-2xl w-9/10 shadow ${
            isDarkMode
              ? "bg-dark-secondary text-dark-text"
              : "bg-light-secondary text-light-text"
          }`}
          placeholder="Username"
        />

        <div className="flex flex-1 w-9/10 flex-row space-x-2">
          <input
            className={`smooth-transition font -sans p-2 rounded-2xl flex-grow shadow ${
              isDarkMode
                ? "bg-dark-secondary text-dark-text"
                : "bg-light-secondary text-light-text"
            }`}
            placeholder="Password"
          />

          <button
            className={`smooth-transition px-8 font-bold rounded-2xl shadow flex-shrink-0 ${
              isDarkMode
                ? "bg-radial-[at_25%_25%] from-dark-light to-dark-lighter text-dark-text"
                : "bg-light-light text-light_text"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
  110110;
};

export default App;
