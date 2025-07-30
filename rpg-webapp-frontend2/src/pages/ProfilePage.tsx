import { useEffect } from "react";

export function ProfilePage({ userId }: { userId: number }) {
  useEffect(() => {
    console.log(userId);
  }, []);

  return (
    <>
      <p>Profile page</p>
    </>
  );
}
