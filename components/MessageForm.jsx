import React from "react";
import classes from "../styles/MessageForm.module.scss";
import UploadImg from "./svg/UploadImg";


import SendIcon from "@mui/icons-material/Send";

const MessageForm = (props) => {
  const { handleSubmit, text, setText, setImg } = props;
  return (
    <>
      <div className={classes.message_container}>
        <form className={classes.message_form} onSubmit={handleSubmit}>
          <label htmlFor="img">
            <UploadImg />
            </label>
          <input
            onChange={(e) => setImg(e.target.files[0])}
            type="file"
            id="img"
            accept="image/*"
            style={{ display: "none" }}
            />
          <input
            type="text"
            placeholder="新しいメッセージを作成"
            className={classes.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <SendIcon color="primary" className={classes.sendButton} />
        </form>
      </div>
    </>
  );
};

export default MessageForm;
