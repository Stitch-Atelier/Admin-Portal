import { useState, useEffect, useRef } from "react";
import { service } from "../../../services/service";

interface User {
  id: number;
  firstname: string;
  mobile: string;
}

interface UserSelectorProps {
  onSelect: (user: User | null) => void;
  defaultValue?: string;
}

const UserSelector = ({ onSelect, defaultValue = "" }: UserSelectorProps) => {
  const [query, setQuery] = useState(defaultValue);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setFiltered([]);
      setShowList(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await service.get(`/users/search?mobile=${query}`);
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        setFiltered(data);
        setShowList(true);
      } catch (err) {
        console.error("Error fetching users:", err);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (user: User) => {
    setQuery(`${user.firstname} (${user.mobile})`);
    setSelectedUser(user);
    onSelect(user);
    setShowList(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedUser(null);
    setFiltered([]);
    setShowList(false);
    onSelect(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showList || filtered.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filtered[focusedIndex]) {
          handleSelect(filtered[focusedIndex]);
        }
        break;
      case "Escape":
        setShowList(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        Select User
      </label>

      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            selectedUser
              ? "border-green-300 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          placeholder="Search by mobile number..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedUser(null);
            setShowList(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 3 && filtered.length > 0) {
              setShowList(true);
            }
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Selected Checkmark */}
        {selectedUser && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {query.trim().length > 0 && query.trim().length < 3 && (
        <p className="mt-1 text-xs text-gray-500">
          Type at least 3 characters to search
        </p>
      )}

      {/* Dropdown List */}
      {showList && (
        <ul className="absolute mt-2 z-50 bg-white w-full shadow-xl rounded-xl border border-gray-200 max-h-64 overflow-auto">
          {loading ? (
            <li className="p-4 flex items-center justify-center text-gray-500">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </li>
          ) : filtered.length > 0 ? (
            <>
              <li className="px-4 py-2 text-xs text-gray-500 bg-gray-50 font-medium border-b">
                {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
              </li>
              {filtered.map((user, index) => (
                <li
                  key={index}
                  className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === focusedIndex ? "bg-indigo-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(user)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {user.firstname}
                      </p>
                      <p className="text-sm text-gray-500">{user.mobile}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </li>
              ))}
            </>
          ) : (
            query.trim().length >= 3 && (
              <li className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">No users found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different mobile number
                </p>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default UserSelector;
