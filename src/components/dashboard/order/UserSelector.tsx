import { useState, useEffect } from "react";
import { service } from "../../../services/service";

interface User {
  id: number;
  firstname: string;
  mobile: string;
}

interface UserSelectorProps {
  onSelect: any;
}

const UserSelector = ({ onSelect }: UserSelectorProps) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setFiltered([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await service.get(`/users/search?mobile=${query}`);
        console.log("API response:", res.data); // 👈 check this structure
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        setFiltered(data);
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
    onSelect(user);
    setShowList(false);
  };

  return (
    <div className="relative">
      <label className="block mb-1 font-medium">Select User</label>
      <input
        type="text"
        className="w-full border rounded-md p-2"
        placeholder="Search by mobile..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowList(true);
        }}
      />

      {showList && (
        <ul className="absolute z-10 border rounded-md mt-1 bg-white max-h-40 overflow-auto shadow w-full">
          {loading ? (
            <li className="p-2 text-gray-500 italic">Searching...</li>
          ) : filtered.length > 0 ? (
            filtered.map((user) => (
              <li
                key={user.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(user)}
              >
                {user.firstname} ({user.mobile})
              </li>
            ))
          ) : (
            query.trim().length >= 3 && (
              <li className="p-2 text-gray-500">No matches found</li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default UserSelector;
