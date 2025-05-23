import axios from "axios";
import { useState, useEffect } from "react";
import AccountCard from "./components/AccountCard";
import ThemedInput from "./components/ThemedInput";
import ThemedSelect from "./components/ThemedSelect";
import ThemedButton from "./components/ThemedButton";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const [newLogin, setNewLogin] = useState("");
  const [newRiotId, setNewRiotId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newRegion, setNewRegion] = useState("NA");
  const [newPassword, setNewPassword] = useState("");

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/accounts")
      .then((res) => {
        console.log("GET /api/accounts response:", res.data); // log the data
        setAccounts(res.data);
      })
      .catch((err) => {
        console.error("Failed to load accounts:", err);
      });
  }, []);

  const addAccount = () => {
    if (!newLogin || !newRiotId || !newTag || !newPassword) return;

    const newAccount = {
      login: newLogin,
      riotId: `${newRiotId}#${newTag}`,
      region: newRegion,
      password: newPassword,
      rank: "Unranked",
      lp: "0 LP",
      winRate: "0%",
      imageSrc: "Unranked.webp",
    };

    axios
      .post("http://localhost:4000/api/accounts", newAccount)
      .then((res) => {
        const accountData = res.data;
        if (!Array.isArray(accounts)) {
          console.error("Expected accounts to be an array", accounts);
          return;
        }
        setAccounts([...accounts, accountData]);
        setNewLogin("");
        setNewRiotId("");
        setNewTag("");
        setNewRegion("NA");
        setNewPassword("");
      })
      .catch((err) => {
        console.error("Failed to add account:", err);
      });
  };

  const handleCopy = (text) => navigator.clipboard.writeText(text);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      axios
        .delete(`http://localhost:4000/api/accounts/${id}`)
        .then(() => {
          setAccounts((prev) => prev.filter((acc) => acc.id !== id));
        })
        .catch((err) => {
          console.error("Failed to delete account:", err);
        });
    }
  };

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

      <div className="relative px-4 z-20 flex justify-between items-center mb-4">
        <div>
          <p
            className={`smooth-transition text-3xl font-sans font-bold ${
              isDarkMode ? "text-dark-text" : "text-light-text"
            }`}
          >
            Distort
          </p>
        </div>

        <div className="flex space-x-4">
          <ThemedButton
            text={isDarkMode ? "🌑 Dark" : "🌕 Light"}
            onClick={toggleTheme}
            isDarkMode={isDarkMode}
          />
          <ThemedButton text="⟳" onClick={() => {}} isDarkMode={isDarkMode} />
        </div>
      </div>

      <div className="relative z-20 px-4 flex flex-col justify-start items-start space-y-2">
        <div className="flex flex-wrap gap-2 w-full">
          <ThemedInput
            placeholder="Username Login"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            isDarkMode={isDarkMode}
          />
          <ThemedInput
            placeholder="Riot ID"
            value={newRiotId}
            onChange={(e) => setNewRiotId(e.target.value)}
            isDarkMode={isDarkMode}
          />
          <ThemedInput
            placeholder="#Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value.replace("#", ""))}
            onKeyDown={(e) => e.key === "#" && e.preventDefault()}
            isDarkMode={isDarkMode}
          />
          <ThemedSelect
            options={[
              "NA",
              "EUW",
              "EUNE",
              "KR",
              "OCE",
              "LAN",
              "BR",
              "TR",
              "RU",
              "JP",
            ]}
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            isDarkMode={isDarkMode}
          />
          <ThemedInput
            placeholder="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            isDarkMode={isDarkMode}
          />
          <ThemedButton
            text="Add"
            onClick={addAccount}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="relative w-full mt-4">
          <div
            className={`p-4 rounded-2xl shadow max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 ${
              isDarkMode ? "bg-dark-black" : "bg-light-secondary"
            }`}
            style={{ width: "calc(100% - 1rem)" }}
          >
            <div className="grid grid-cols-1 gap-4 h-full min-h-[16rem]">
              {accounts.length > 0 ? (
                accounts.map((account, index) => (
                  <AccountCard
                    key={account.id}
                    {...account}
                    handleDelete={() => handleDelete(account.id)}
                    handleCopy={handleCopy}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <div className="flex justify-center items-center h-full py-8">
                  <p
                    className={`text-xl font-semibold ${
                      isDarkMode ? "text-dark-text" : "text-light-text"
                    }`}
                  >
                    Add an account!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
