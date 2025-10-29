export const PhotoEmptyCard = () => {
  return <div className={"w-full grid grid-cols-3 gap-1 relative"}>
    {
      ["", "", "", "", "", ""].map((_, i) => <div key={i} className={"w-full aspect-square bg-gray-100"}></div>)
    }
    <div className={"w-full h-full absolute top-0 left-0 bg-gradient-to-b from-white/0 to-white/100 flex items-center justify-center"}>
      <p className={"text-gray-700 font-bold"}>아직 올린 사진이 없어요.</p>
    </div>
  </div>
}