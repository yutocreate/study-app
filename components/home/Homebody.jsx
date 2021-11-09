import React, { useState, useEffect } from "react";

import classes from "../../styles/home/Homebody.module.scss";
import { db, auth, storage } from "../../firebase/firebase";
import firebase from "firebase/app";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import Channel from "./Channel";
import HomeForm from "../MessageForm/HomeForm";
import Router, {useRef} from "next/router";
import MessageHome from "./MessageHome";
import { useRouter } from "next/router";

const Homebody = () => {
  const [channel, setChannel] = useState();
  const [channels, setChannels] = useState([]);
  const [user, setUser] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [messages, setMessages] = useState([]);
  const router = useRouter();
  const id = router.query.channelId;
  const user1 = auth.currentUser.uid;
  

  useEffect(() => {
    const f = async () => {
      await db.collection("channels").onSnapshot((snapshot) => {
        const names = [];
        snapshot.forEach((doc) => {
          names.push({ id: doc.id, ...doc.data() });
        });
        setChannels(names);
      });

       db
        .collection("channels")
        .doc(id)
        .onSnapshot((snapshot) => {
          setChannel({ id, ...snapshot.data() });
        });

      const messagesRef =  db
        .collection("channels")
        .doc(id)
        .collection("chat");
      messagesRef.orderBy("createdAt").onSnapshot((querySnapshot) => {
        const texts = [];
        querySnapshot.forEach((doc) => {
          texts.push(doc.data());
        });
        setMessages(texts);
      });

       db
        .collection("users")
        .doc(user1)
        .onSnapshot((snapshot) => {
          setUser({ id: user1, ...snapshot.data() });
        });
    };
    f();
  }, []);

  //チャンネルを追加した時の挙動
  const addChannel = () => {
    const channelName = window.prompt("チャンネル名を入力してください！");
    if (channelName) {
      db.collection("channels").add({
        name: channelName,
      });
    }
  };

  //チャンネルを選択した時の挙動
  const selectedChannel = async (channel) => {
    setChannel(channel);

  

    const messagesRef = await db
      .collection("channels")
      .doc(channel.id)
      .collection("chat");
    messagesRef.orderBy("createdAt").onSnapshot((querySnapshot) => {
      const texts = [];
      querySnapshot.forEach((doc) => {
        texts.push(doc.data());
      });
      setMessages(texts);
    });

    await Router.push(`/home/${channel.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (img) {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await imageRef.put(img);
      await snap.ref.getDownloadURL().then(function (URL) {
        db.collection("channels").doc(id).collection("chat").add({
          text,
          from: user1,
          createdAt: firebase.firestore.Timestamp.now(),
          image: URL,
          avatarURL: user.avatarURL,
          name: user.name,
        });
        setText("");
        setImg("");
      });
    } else {
      if (text === "") return;
      await db.collection("channels").doc(id).collection("chat").add({
        text,
        from: user1,
        createdAt: firebase.firestore.Timestamp.now(),
        avatarURL: user.avatarURL,
        name: user.name,
      });
      setText("");
    }
  };

  return (
    <div className={classes.homebody}>
      <div className={classes.sidebar_container}>
        <div className={classes.sidebar_channel}>
          <ExpandMoreIcon className={classes.expandIcon} />
          <h3>チャンネル</h3>
        </div>
        <hr />
        <div className={classes.addchannels_container} onClick={addChannel}>
          <AddIcon />
          <h3>チャンネルを追加</h3>
        </div>
        <hr />
        <div className={classes.channels}>
          {channels &&
            channels.map((doc, index) => (
              <Channel
                key={index}
                doc={doc}
                selectedChannel={selectedChannel}
              />
            ))}
        </div>
      </div>

      <div className={classes.appbody_container}>
        <div className={classes.header_container}>
          <h2>＃{channel && channel.name}</h2>
        </div>
        <div className={classes.messages_wrapper}>
          {messages.length
            ? messages.map((message, index) => {
              const {avatarURL, image, name, text, from, createdAt} = message
              return (
                <MessageHome key={index} message={message} avatarURL={avatarURL} image={image} name={name} text={text} from={from} timestamp={createdAt}/>
              )
              })
            : null}
        </div>
        <div className={classes.form_container}>
          <HomeForm
            channel={channel}
            handleSubmit={handleSubmit}
            text={text}
            setText={setText}
            setImg={setImg}
          />
        </div>
      </div>
    </div>
  );
};

export default Homebody;