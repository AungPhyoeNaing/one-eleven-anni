import { Heart } from "lucide-react";
import { Modal } from "./Modal";
interface LoveLetterProps {
  isOpen: boolean;
  onClose: () => void;
}
export function LoveLetter({ isOpen, onClose }: LoveLetterProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="A letter, just for you"
      className="letter-dialog"
    >
      <div className="letter-mark">
        <Heart size={23} />
      </div>
      <p className="letter-salutation">Dear Jia,</p>
      <p>
        I created this little universe because sometimes three songs can hold
        thousands of feelings.
      </p>
      <p>
        Every time you listen to these songs, I hope you remember that someone
        is always cheering for your happiness.
      </p>
      <p className="letter-signature">
        With love, always,
        <br />
        <span>Ko Ko APN</span>
      </p>
      <span className="letter-ending">
        You’re my favorite part of this universe.
      </span>
    </Modal>
  );
}
