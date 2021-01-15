//import logo from './logo.svg';
import './App.css';
import React, {useEffect, useReducer} from "react";
import {API} from "aws-amplify";
import {List, Input, Button} from "antd";
import "antd/dist/antd.css";
import {listNotes} from "./graphql/queries";
import { v4 as uuid} from "uuid";
import { createNote as CreateNote} from "./graphql/mutations";

const CLIENT_ID = uuid()

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
    case "ADD_NOTE":
      return { ...state, notes: [action.note, ...state.notes]}
    case "RESET_FORM":
      return { ...state, form: initialState.form}
    case "SET_INPUT":
      return { ...state, form: { ...state.form, [action.name]: action.value}}
    default:
      return state
  }
}

function App() {
  //create state and dispatch variables
  const [state, dispatch] = useReducer(reducer, initialState)

  //createNote
  async function createNote() {
    const {form} = state
    if (!form.name || !form.description) {
      return alert('please enter a name and description')
    }

    const note = { ...form, clientId: CLIENT_ID, completed: false, id: uuid()}
    dispatch ({ type: "ADD_NOTE", note})
    dispatch ({ type: "RESET_FORM"})
    try {
      await API.graphql({
        query: CreateNote,
        variables: {input: note}
      })
      console.log("Successfully created note!")
    } catch(err) {
      console.log("error: ", err)
    }
  }
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

  //handler to update form state when user interact with an input
  function onChange(e) {
    dispatch({ 
      type: "SET_INPUT", name: e.target.name, value: e.target.value
    })
  }

  //define renderItem
  function renderItem(item) {
    return (
      <List.Item style={styles.item}>
        <List.Item.Meta
          title={item.name}
          description={item.description}
        />
      </List.Item>
    )
  }

  //invoke fetchNotes
  useEffect (() => {
    fetchNotes()
  }, [])

  return (
    <div style={styles.container}>
      <Input onChange={onChange} value={state.form.name} placeholder="Note name" name= "name" style={styles.input} />
      <Input onChange={onChange} value={state.form.description} placeholder="Note description" name= "description" style={styles.input} />
      <Button onClick={createNote} type="primary">Create Note</Button>
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
