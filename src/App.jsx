import axios from "axios";
import { decrypt } from "./utils/cryptoUtils.js";
import { useState, useEffect } from "react";
import AccountCard from "./components/AccountCard";
import ThemedInput from "./components/ThemedInput";
import ThemedSelect from "./components/ThemedSelect";
import ThemedButton from "./components/ThemedButton";

const App = () => {
  // Theme state - controls dark/light mode
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Form states for adding new accounts
  const [newLogin, setNewLogin] = useState("");
  const [newRiotId, setNewRiotId] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newRegion, setNewRegion] = useState("NA");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State to store all accounts
  const [accounts, setAccounts] = useState([]);

  // Loading states for better UX
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Load all accounts from the backend when the app starts
   * This runs once when the component mounts
   */
  useEffect(() => {
    loadAccounts();
  }, []);

  /**
   * Fetch all accounts from the backend API
   */
  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/accounts");
      console.log("✅ Successfully loaded accounts:", response.data);
      setAccounts(response.data);
    } catch (error) {
      console.error("❌ Failed to load accounts:", error);
      alert("❌ Failed to load accounts. Please check your server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add a new account to the system
   * Validates input, sends to backend, and updates the UI
   */
  const addAccount = async () => {
    // Validate all required fields are filled
    if (!newLogin || !newRiotId || !newTag || !newPassword) {
      alert("⚠️ Please fill in all fields before adding an account.");
      return;
    }

    // Validate Riot ID format (basic check)
    if (newRiotId.length < 3 || newTag.length < 3) {
      alert("⚠️ Riot ID and Tag must be at least 3 characters long.");
      return;
    }

    setIsLoading(true);

    const newAccount = {
      login: newLogin,
      riotId: `${newRiotId}#${newTag}`,
      region: newRegion,
      password: newPassword, // Backend will encrypt this
      rank: "Unranked",
      lp: "0 LP",
      winRate: "0%",
      imageSrc: "Unranked.webp",
    };

    try {
      const response = await axios.post(
        "http://localhost:4000/api/accounts",
        newAccount
      );
      console.log("✅ Successfully added account:", response.data);

      // Add the new account to our local state
      setAccounts([...accounts, response.data]);

      // Clear the form after successful addition
      setNewLogin("");
      setNewRiotId("");
      setNewTag("");
      setNewRegion("NA");
      setNewPassword("");

      alert("✅ Account added successfully!");
    } catch (error) {
      console.error("❌ Failed to add account:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        alert(
          "❌ Invalid account information. Please check your Riot ID, tag, and region spelling."
        );
      } else if (error.response?.status === 500) {
        alert(
          "❌ Server error. Please check your Riot ID and tag spelling, and make sure the region is correct."
        );
      } else {
        alert(
          "❌ Failed to add account. Please check your internet connection and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Copy account information to clipboard
   * Handles both regular text and encrypted passwords
   */
  const handleCopy = async (value, isPassword = false) => {
    console.log(`🔄 Copying ${isPassword ? "password" : "login"}...`);

    try {
      let textToCopy;

      if (isPassword) {
        // Decrypt the encrypted password before copying
        console.log("🔓 Decrypting password...");
        textToCopy = decrypt(value);

        if (!textToCopy) {
          throw new Error("Failed to decrypt password");
        }
        console.log("✅ Password decrypted successfully");
      } else {
        textToCopy = value;
      }

      // Copy to clipboard using the modern API
      await navigator.clipboard.writeText(textToCopy);
      alert(`📋 ${isPassword ? "Password" : "Login"} copied to clipboard!`);
    } catch (error) {
      console.error("❌ Failed to copy:", error);
      alert("❌ Failed to copy to clipboard. Please try again.");
    }
  };

  /**
   * Delete an account from the system
   * Shows confirmation dialog before deletion
   */
  const handleDelete = async (id) => {
    // Confirm deletion with user
    if (
      !window.confirm(
        "⚠️ Are you sure you want to delete this account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/api/accounts/${id}`);
      console.log(`✅ Successfully deleted account with ID: ${id}`);

      // Remove the deleted account from our local state
      setAccounts((prevAccounts) =>
        prevAccounts.filter((acc) => acc.id !== id)
      );
      alert("✅ Account deleted successfully!");
    } catch (error) {
      console.error("❌ Failed to delete account:", error);
      alert("❌ Failed to delete account. Please try again.");
    }
  };

  /**
   * Refresh account data from Riot Games API
   * Updates rank, LP, and win rate information
   */
  const refreshAccounts = async () => {
    setIsRefreshing(true);

    try {
      console.log("🔄 Refreshing account data from Riot Games...");
      const response = await axios.get(
        "http://localhost:4000/api/accounts/refresh"
      );

      setAccounts(response.data);
      console.log("✅ Successfully refreshed all accounts");
      alert(
        "✅ Account data refreshed! Rank, LP, and win rates have been updated."
      );
    } catch (error) {
      console.error("❌ Failed to refresh accounts:", error);
      alert(
        "❌ Failed to refresh account data. Please check your internet connection and try again."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className={`relative smooth-transition p-4 h-screen w-full flex flex-col justify-between overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-t from-dark-darkest to-dark-black"
          : "bg-gradient-to-t from-light-secondary to-light-darkest"
      }`}
    >
      {/* Animated background blur bars - only shown in dark mode */}
      {isDarkMode && (
        <>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cyan-400/25 via-blue-500/10 to-transparent backdrop-blur-lg z-10 pointer-events-none animate-pulse shadow-2xl shadow-cyan-500/5" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cyan-400/25 via-blue-500/10 to-transparent backdrop-blur-lg z-10 pointer-events-none animate-pulse shadow-2xl shadow-cyan-500/5" />
        </>
      )}

      {/* Subtle border around the entire app */}
      <div className="absolute inset-0 ring-inset ring-2 ring-black/20 pointer-events-none z-10" />

      {/* Header Section */}
      <div className="relative px-4 z-20 flex justify-between items-center mb-4">
        <h1
          className={`smooth-transition text-3xl font-sans font-bold ${
            isDarkMode ? "text-dark-text" : "text-light-text"
          }`}
        >
          Distort
        </h1>

        {/* Header buttons */}
        <div className="flex space-x-4">
          <ThemedButton
            text={isDarkMode ? "🌑 Dark" : "🌕 Light"}
            onClick={toggleTheme}
            isDarkMode={isDarkMode}
            disabled={isLoading || isRefreshing}
          />
          <ThemedButton
            text={isRefreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
            onClick={refreshAccounts}
            isDarkMode={isDarkMode}
            disabled={isLoading || isRefreshing || accounts.length === 0}
          />
        </div>
      </div>

      {/* Add Account Form Section */}
      <div className="relative z-20 px-4 flex flex-col justify-start items-start space-y-4 flex-shrink-0">
        <h2
          className={`text-xl font-semibold ${
            isDarkMode ? "text-dark-text" : "text-light-text"
          }`}
        >
          Add New Account
        </h2>

        <div className="flex flex-wrap gap-2 w-full">
          {/* Username/Login input */}
          <ThemedInput
            placeholder="Username/Login"
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />

          {/* Riot ID input */}
          <ThemedInput
            placeholder="Riot ID"
            value={newRiotId}
            onChange={(e) => setNewRiotId(e.target.value)}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />

          {/* Tag input - automatically removes # symbol */}
          <ThemedInput
            placeholder="Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value.replace("#", ""))}
            onKeyDown={(e) => e.key === "#" && e.preventDefault()}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />

          {/* Region selector */}
          <ThemedSelect
            options={[
              "NA", // North America
              "EUW", // Europe West
              "EUNE", // Europe Nordic & East
              "KR", // Korea
              "OCE", // Oceania
              "LAN", // Latin America North
              "BR", // Brazil
              "TR", // Turkey
              "RU", // Russia
              "JP", // Japan
            ]}
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            isDarkMode={isDarkMode}
            disabled={isLoading}
          />

          {/* Password input with show/hide toggle */}
          <div className="relative flex flex-grow w-full sm:w-auto">
            <ThemedInput
              placeholder="Account Password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isDarkMode={isDarkMode}
              disabled={isLoading}
            />
            <button
              onClick={() => setShowPassword((prev) => !prev)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-sm hover:opacity-80 transition-opacity ${
                isDarkMode ? "text-gray-400" : "text-gray-700"
              }`}
              title="Toggle Password Visibility"
              disabled={isLoading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Add account button */}
          <ThemedButton
            text={isLoading ? "Adding..." : "Add Account"}
            onClick={addAccount}
            isDarkMode={isDarkMode}
            disabled={isLoading || isRefreshing}
          />
        </div>
      </div>

      {/* Account Cards Display Section */}
      <div className="relative z-20 px-4 pt-4 flex-grow overflow-hidden">
        <div
          className={`p-4 rounded-2xl shadow h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 ${
            isDarkMode ? "bg-dark-black" : "bg-light-secondary"
          }`}
        >
          <div className="grid grid-cols-1 gap-4 min-h-[16rem]">
            {isLoading && accounts.length === 0 ? (
              // Loading state for initial load
              <div className="flex justify-center items-center h-full py-8">
                <p
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-dark-text" : "text-light-text"
                  }`}
                >
                  🔄 Loading accounts...
                </p>
              </div>
            ) : accounts.length > 0 ? (
              // Display all accounts
              accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  imageSrc={account.imageSrc}
                  riotId={account.riotId}
                  login={account.login}
                  password={account.password}
                  rank={account.rank}
                  lp={account.lp}
                  winRate={account.winRate}
                  handleDelete={() => handleDelete(account.id)}
                  handleCopy={handleCopy}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              // Empty state when no accounts exist
              <div className="flex justify-center items-center h-full py-8">
                <div className="text-center">
                  <p
                    className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? "text-dark-text" : "text-light-text"
                    }`}
                  >
                    🎮 No accounts yet!
                  </p>
                  <p
                    className={`text-sm opacity-75 ${
                      isDarkMode ? "text-dark-text" : "text-light-text"
                    }`}
                  >
                    Add your first League of Legends account above to get
                    started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative z-20 px-4 mt-4 flex justify-between items-end w-full flex-shrink-0">
        {/* Disclaimer */}
        <p
          className={`text-xs font-bold ${
            isDarkMode ? "text-green-500" : "text-black"
          }`}
        >
          ⚠️ Not affiliated with Riot Games.
        </p>

        {/* Info button */}
        <button
          className={`text-xs hover:underline font-bold transition-colors ${
            isDarkMode
              ? "text-green-500 hover:text-green-400"
              : "text-black hover:text-gray-700"
          }`}
          onClick={() =>
            alert(
              "🔒 Privacy Information:\n\n" +
                "• All account data is stored locally in your database\n" +
                "• Passwords are encrypted before storage\n" +
                "• Only rank and win rate data are fetched from Riot Games\n" +
                "• Your login credentials are never sent to external servers\n" +
                "• This app is not affiliated with or endorsed by Riot Games"
            )
          }
        >
          ℹ️ Privacy Info
        </button>
      </div>
    </div>
  );
};

export default App;
