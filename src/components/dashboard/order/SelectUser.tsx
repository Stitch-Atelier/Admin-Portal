import { useState, useEffect, useRef } from "react";
import { service } from "../../../services/service";

const CreateOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Debounced API call
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchUsers(searchTerm);
      } else {
        setUsers([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchUsers = async (query: string) => {
    try {
      setIsLoading(true);
      const res = await service.get(`/users/search?mobile=${query}`);
      setUsers(res.data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchTerm(`${user.firstname} ${user.lastname}`);
    setShowDropdown(false);
  };

  return (
    <main className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-2xl shadow-sm relative">
      <h2 className="text-xl font-semibold mb-4 text-center">Create Order</h2>

      <div ref={inputRef} className="relative">
        <input
          type="text"
          placeholder="Search by mobile number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedUser(null);
          }}
          className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onFocus={() => setShowDropdown(true)}
        />

        {/* 🔹 Dropdown List */}
        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isLoading && (
              <p className="p-2 text-sm text-gray-500 text-center">
                Searching...
              </p>
            )}

            {!isLoading && users.length > 0
              ? users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleSelectUser(user)}
                    className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-sm">
                        {user.firstname[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {user.firstname} {user.lastname}
                      </p>
                      <p className="text-sm text-gray-500">{user.mobile}</p>
                    </div>
                  </div>
                ))
              : !isLoading &&
                searchTerm.length >= 3 && (
                  <p className="p-2 text-sm text-gray-500 text-center">
                    No users found
                  </p>
                )}
          </div>
        )}
      </div>

      {/* 🔹 Selected User Display */}
      {selectedUser && (
        <div className="mt-6 p-4 border border-green-300 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-700 mb-2">Selected User:</h3>
          <p>
            👤 {selectedUser.firstname} {selectedUser.lastname}
          </p>
          <p>📞 {selectedUser.mobile}</p>
        </div>
      )}
    </main>
  );
};

export default CreateOrder;
