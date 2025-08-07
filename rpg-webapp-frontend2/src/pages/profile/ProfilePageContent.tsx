type ProfileContentProps = {
  basicUserData: {
    nickname: string;
    email: string;
    password: string;
  };
  image?: string;
  setIsEditing: (isEditing: boolean) => void;
};

export function ProfilePageContent({
  basicUserData,
  image,
  setIsEditing,
}: ProfileContentProps) {
  const handleEditButtonPress = () => {
    setIsEditing(true);
  };
  return (
    <>
      <div className="profile-page">
        <img className="profile-picture" src={image} />
        <p>Nickname: {basicUserData.nickname}</p>
        <p>Email: {basicUserData.email}</p>
        <button onClick={handleEditButtonPress}>Edit</button>
      </div>
    </>
  );
}
