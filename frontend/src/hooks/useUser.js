export default function useUser() {
  const userStr = localStorage.getItem("userdetails");
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem("token");

  return { user, token };
}
