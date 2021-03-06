import { addDoc, collection, query, where } from "firebase/firestore";
import React, { useRef, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRecoilState } from "recoil";
import { inboxModalState } from "../../atoms/modalAtom";
import { db } from "../../firebase";
import * as EmailValidator from "email-validator";
import { useSession } from "next-auth/react";
// import { useSpring, animated } from "react-spring";

function InboxModal() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useRecoilState(inboxModalState);
  const [input, setInput] = useState("");
  const modalRef = useRef();

  // const animation = useSpring({
  //   config: {
  //     duration: 250,
  //   },
  //   opacity: showModal ? 1 : 0,
  //   transform: showModal ? `translateY(0%)` : `translateY(-100%)`,
  // });

  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", session.user.email)
  );

  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = async (e) => {
    e.preventDefault();

    if (!input) return;

    if (
      EmailValidator.validate(input) &&
      !chatAlreadyExists(input) &&
      input !== session.user.email
    ) {
      // Add If valid and the chat doesn't already exists in 'chats' db
      // Add chat into chats collection
      const collectionRef = collection(db, "chats");
      const payload = { users: [session.user.email, input] };
      await addDoc(collectionRef, payload);
    }

    setInput("");
    setShowModal((prev) => !prev);
  };

  const chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  return (
    <div>
      {showModal ? (
        <div
          ref={modalRef}
          onClick={closeModal}
          className="fixed flex bg-black/40 top-0 right-0 left-0 bottom-0 items-center justify-center z-10 "
        >
          {/* <animated.div style={animation}> */}
          <div className="centeredOnScreen bg-white min-w-[300px] max-w-[350px] min-h-[400px] rounded-xl">
            <div className="p-2 min-w-[300px] max-w-[350px] border-b-2 border-gray-300  text-center font-semibold">
              <div className="m-2">
                <h1>New Message</h1>
              </div>
            </div>

            <form className="flex items-center justify-center p-2 bg-white border-b-2 border-gray-300">
              <p className="mr-2">To:</p>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter contact email..."
                className="flex-1 bg-transparent placeholder-black focus:ring-0 shadow-none focus:shadow-none outline-none focus:outline-none border-none focus:border-none"
              />
              <button hidden disabled={!input} onClick={createChat}>
                send
              </button>
            </form>
          </div>
          {/* </animated.div> */}
        </div>
      ) : null}
    </div>
  );
}

export default InboxModal;
