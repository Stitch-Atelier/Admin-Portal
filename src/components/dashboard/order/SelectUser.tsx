import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  phone: string;
}

const dummyUsers: User[] = [
  { id: 1, name: "Rajat Kalotra", phone: "9876543210" },
  { id: 2, name: "Aman Verma", phone: "9876501234" },
  { id: 3, name: "Priya Sharma", phone: "9123456789" },
  { id: 4, name: "Neha Singh", phone: "9812345678" },
  { id: 5, name: "Karan Mehta", phone: "9998887776" },
];

const SelectUser = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = (searchText: string) => {
    if (!searchText.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const filtered = dummyUsers.filter((user) =>
        user.phone.toLowerCase().includes(searchText.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 400); // simulate network delay
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(query);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <main className="p-6 border border-gray-300 rounded-lg mx-auto shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">Create Order</h2>
      <label className="block text-sm font-medium mb-2">
        Search by Mobile Number
      </label>
      <input
        type="text"
        placeholder="Enter mobile number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-gray-400 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />

      {loading && <p className="text-sm text-gray-500 mt-2">Searching...</p>}

      {results.length > 0 && (
        <ul className="border border-gray-300 rounded-md mt-2 bg-white max-h-48 overflow-y-auto shadow-md">
          {results.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
              onClick={() => setQuery(user.phone)} // fill input on click
            >
              📞 {user.phone} — {user.name}
            </li>
          ))}
        </ul>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">No matching users found.</p>
      )}
    </main>
  );
};

export default SelectUser;
