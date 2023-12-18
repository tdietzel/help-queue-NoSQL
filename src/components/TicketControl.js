import React from "react"
import NewTicketForm from './NewTicketForm'
import TicketList from './TicketList'
import EditTicketForm from './EditTicketForm'
import TicketDetail from './TicketDetail'
import { useState } from "react"
import { useEffect } from "react"
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore"
import db from './../firebase.js'

function TicketControl() {
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unSubscribe = onSnapshot(
      collection(db, 'tickets'),
      (collectionSnapshot) => {
        const tickets = [];
        collectionSnapshot.forEach((doc) => {
          tickets.push({
            ...doc.data(),
            id: doc.id
            // names: doc.data().names,
            // location: doc.data().location,
            // issue: doc.data().issue,
          });
        });
        setMainTicketList(tickets);
      },
      (error) => {
        setError(error.message);
      }
    );
    return () => unSubscribe();
  }, []);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, 'tickets', id));
    setSelectedTicket(null);
    // const newMainTicketList = mainTicketList.filter(ticket => ticket.id !== id);
    // setMainTicketList(newMainTicketList);
    // setSelectedTicket(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    await updateDoc(doc(db, 'tickets', ticketToEdit.id), ticketToEdit);
    setEditing(false);
    setSelectedTicket(null);
    
    // const editedMainTicketList = mainTicketList
    //   .filter(ticket => ticket.id !== selectedTicket.id)
    //   .concat(ticketToEdit);
    //   setMainTicketList(editedMainTicketList);
    // setEditing(false);
    // setSelectedTicket(null);
  }

  const handleAddingNewTicketToList = async (newTicketData) => {
    await addDoc(collection(db, "tickets"), newTicketData);
    setFormVisibleOnPage(false);

    // const newMainTicketList = mainTicketList.concat(newTicket);
    // setMainTicketList(newMainTicketList);
    // setFormVisibleOnPage(false);
  }

  const handleChangingSelectedTicket = (id) => {
    const selectedTicket = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selectedTicket);
  }

    let currentlyVisibleState = null;
    let buttonText = null;
    if(error) {
      currentlyVisibleState = <p>There was an error: {error}</p>
    } else if (editing) {      
      currentlyVisibleState = 
      <EditTicketForm
        ticket = {selectedTicket} 
        onEditTicket = {handleEditingTicketInList} />
      buttonText = "Return to Ticket List";
    } else if (selectedTicket != null) {
      currentlyVisibleState = 
      <TicketDetail 
        ticket={selectedTicket} 
        onClickingDelete={handleDeletingTicket}
        onClickingEdit = {handleEditClick} />
      buttonText = "Return to Ticket List";
    } else if (formVisibleOnPage) {
      currentlyVisibleState = 
      <NewTicketForm 
        onNewTicketCreation={handleAddingNewTicketToList}/>;
      buttonText = "Return to Ticket List"; 
    } else {
      currentlyVisibleState = 
      <TicketList 
        onTicketSelection={handleChangingSelectedTicket}
        ticketList={mainTicketList} />;
      buttonText = "Add Ticket"; 
    }
    return (
      <React.Fragment>
        {currentlyVisibleState}
        {error ? null : <button onClick={handleClick}>{buttonText}</button>}
      </React.Fragment>
    );

}

export default TicketControl;