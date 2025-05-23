import { useState } from "react";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const ThemedButton = ({ text }) => (
    <button
      className={`smooth-transition px-8 py-2 font-bold border-2 shadow flex-shrink-0 ${
        isDarkMode
          ? "bg-dark-secondary border-dark-light text-dark-text hover:bg-gradient-to-t hover:from-cyan-400/50 hover:via-blue-500/10 hover:to-transparent hover:backdrop-blur-lg hover:shadow-2xl hover:shadow-cyan-500/5"
          : "bg-light-light border-light-black text-light-text"
      }`}
    >
      {text}
    </button>
  );

  const ThemedInput = ({ placeholder, type = "text" }) => (
    <input
      type={type}
      placeholder={placeholder}
      className={`smooth-transition font-sans p-2 border-2 flex-grow shadow ${
        isDarkMode
          ? "bg-dark-secondary text-dark-text border-dark-light"
          : "bg-light-secondary text-light-text border-light-black"
      }`}
    />
  );

  return (
    <div
      className={`relative smooth-transition p-4 min-h-screen w-full ${
        isDarkMode
          ? "bg-gradient-to-t from-dark-darkest to-dark-black"
          : "bg-gradient-to-t from-light-secondary to-light-darkest"
      }`}
    >
      {isDarkMode && (
        <>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cyan-400/25 via-blue-500/10 to-transparent backdrop-blur-lg z-10 pointer-events-none animate-pulse shadow-2xl shadow-cyan-500/5" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cyan-400/25 via-blue-500/10 to-transparent backdrop-blur-lg z-10 pointer-events-none animate-pulse shadow-2xl shadow-cyan-500/5" />
        </>
      )}

      <div className="absolute inset-0 ring-inset ring-2 ring-black/20 pointer-events-none z-10" />

      <div className="relative z-20 flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className={`smooth-transition px-6 py-2 text-xl font-bold border-2 shadow box-border min-w-[120px] text-center ${
            isDarkMode
              ? "bg-dark-secondary border-dark-light text-dark-text hover:bg-gradient-to-t hover:from-cyan-400/35 hover:via-blue-500/10 hover:to-transparent hover:backdrop-blur-lg hover:shadow-2xl hover:shadow-cyan-500/5"
              : "bg-light-light border-light-black text-light-text"
          }`}
        >
          {isDarkMode ? "🌑 Dark" : "🌕 Light"}
        </button>
      </div>

      <div className="pl-4 flex flex-row items-center space-x-4">
        <p
          className={`smooth-transition text-2xl font-sans font-bold ${
            isDarkMode ? "text-dark-text" : "text-light-text"
          }`}
        >
          Add Account
        </p>
        <span
          className={`text-sm font-sans font-medium smooth-transition ${
            isDarkMode ? "" : "text-light-text"
          }`}
          style={isDarkMode ? { color: "#00FF9C" } : {}}
        >
          *Not affiliated with Riot Games
        </span>
      </div>

      <div className="relative z-20 pl-4 flex flex-col justify-start items-start space-y-2">
        <div className="flex w-9/10 flex-row space-x-2">
          <ThemedInput placeholder="Username Login" />
          <ThemedInput placeholder="Riot" />
          <ThemedInput placeholder="#Tag" />
        </div>

        <div className="flex w-9/10 flex-row space-x-2">
          <ThemedInput placeholder="Password" type="password" />
          <ThemedButton text="Add" />
        </div>

        <div className="relative w-full mt-4">
          <div
            className={`absolute left-0 right-4 rounded-2xl h-screen shadow ${
              isDarkMode ? "bg-dark-black" : "bg-light-secondary"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default App;
