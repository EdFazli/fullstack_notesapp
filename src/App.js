//import logo from './logo.svg';
import './App.css';
import React, {useEffect, useReducer} from "react";
import {API} from "aws-amplify";
import {List} from "antd";
import "antd/dist/antd.css";
import {listNotes} from "./graphql/queries";

//to hold an array for the notes, form values, error and loading state
const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: "", description: "" }
}

//reducer: only have cases either set the notes array or error state
function reducer(state, action) {
  switch(action.type) {
    case "SET_NOTES":
      return { ...state, notes: action.notes, loading: false}
    case "ERROR":
      return { ...state, loading: false, error: true}
    default:
      return state
  }
}

function App() {
  //create state and dispatch variables
  const [state, dispatch] = useReducer(reducer, initialState)

  //call the AppSync API and set notes array
  async function fetchNotes() {
    try {
      const notesData = await API.graphql({
        query: listNotes
      })
      dispatch({
        type: "SET_NOTES", notes: notesData.data.listNotes.items
      })
    } catch (err) {
      console.log("error: ", err)
      dispatch({ type: "ERROR"})
    }
  }

  //define renderItem
  function renderItem(item) {
    return (
      <List.Item style={styles.item}>
        <List.Item.Meta>
          title={item.name}
          description={item.description}
        </List.Item.Meta>
      </List.Item>
    )
  }

  //invoke fetchNotes
  useEffect (() => {
    fetchNotes()
  }, [])

  return (
    <div style={styles.container}>
      <List loading={state.loading} dataSource={state.notes} renderItem={renderItem} />
    </div>
  );
}

//styles
const styles = {
  container: {padding: 20},
  input: {marginBottom: 10},
  item: {textAlign: "left"},
  p: {color: "#1890ff"}
}

export default App;
