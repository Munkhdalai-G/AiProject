import { Send, X } from "lucide-react";

export default function Assistant() {
  return (
    <div className="absolute right-0 bottom-0">
      <div className="w-100 border">
        <div className="flex justify-between">
          Chat Assistant
          <X className="" />
        </div>
        <div></div>
        <div className="flex justify-between ">
          <div>Can you describe me detailed delicious pasta carbonara?</div>
          <Send />
        </div>
      </div>
    </div>
  );
}
