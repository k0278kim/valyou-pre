export type ChatType = {
  role: "persona" | "user";
  content: string;
  type: "CHAT" | "PHOTO";
  photo: string | null;
}