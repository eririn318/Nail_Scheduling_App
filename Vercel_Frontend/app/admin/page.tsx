'use client'
import {useState, useEffect} from 'react'

export default function AdminPage() {
   const [name, setName] = useState('')
   const [durationMinutes, setDurationMinutes] = useState('')
   const [isMobile, setIsMobile] = useState(false)
   const [bufferMinutes, setBufferMinutes] = useState('')
   const [services, setServices] = useState<{name:string, price: number, durationMinutes: number, bufferMinutes: number, isMobile: boolean}[]>([])
   const [serviceName, setServiceName] = useState('')
   const [servicePrice, setServicePrice] = useState('') 
// services → the actual running list that'll get submitted when creating the client
// serviceName / servicePrice → temporary holders for whatever's currently being typed into the "add a service" inputs, before she clicks "Add"
   const [error, setError] = useState('')

   const [bookingToken, setBookingToken] = useState('') //★ holds the real token once the client is created
   const [submitError, setSubmitError] = useState('')
   const [clientId, setClientId] = useState('')//Which client page are we currently displaying?
// clients = the list of existing clients
// _id = MongoDB ID
// name = client's name
// bookingToken = their booking link token
   const[clients, setClients] = useState<{
        _id: string
        name: string
        bookingToken: string
        services: {
            name: string
            price: number
            durationMinutes: number
            bufferMinutes: number
            isMobile: boolean
        }[]
        durationMinutes: number
        bufferMinutes: number
        isMobile: boolean
    }[]>([])
    const [selectedClientId, setSelectedClientId] = useState("")//Which client did I choose in the dropdown?
    const [editingIndex, setEditingIndex] = useState<number | null>(null)//null means you're adding a new service.// A number such as 0 means you're editing the service at index 0
    //to get all clients list right after admin page loads
   useEffect(() => {
    const getClients = async () => {
        try{
            const res = await fetch('http://localhost:4000/clients', {
                method: "GET",
                   headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': 'putaroErikoLove2026'
                }
            })
            const data = await res.json()
            if(!res.ok){
                console.error(data.error)
                return //stop function here
            }
            setClients(data) //copies the data into the clients state //clients state = [client1, client2, client3]
        }catch(err){
            console.error(err)
        }
    }
    getClients()
   }, [])//run once
   
   //add service
   const addService = ()=> {
        const priceNum = Number(servicePrice)
                //price "type" is a string from input, so we need to convert to number
        // if(!serviceName || !servicePrice || isNaN(priceNum)) return "add service name or service price"
                //if user doesn't type anything in name or price, or price is not a number, it does not click "Add Service", so this functin does not run
                //if either is empty or price is not a number(ex:'.'), stop this function here(return)
                //NaN = not a number, isNan(return true if it is not a number/if value is NaN(object)) checks if something is a number()
        if(!serviceName.trim()) {//empty name (or only spaces)
            setError("Add service name")
            return //exits addService here //everything below will skip
        } //.trim() ignores spaces at the start and end of the text
        if(!servicePrice){
            setError("Add service price")
            return
        }
        if(priceNum <= 0) {
            setError("Price must be greater than zero")
            return
        }
        if(!priceNum) {
            setError("Price must be a number")
            return
        }
        const durationMinutesNum = Number(durationMinutes)
        const bufferMinutesNum = Number(bufferMinutes)
        // setServices([...services, {name: serviceName, price: priceNum, durationMinutes: durationMinutesNum, bufferMinutes: bufferMinutesNum, isMobile: isMobile}])
        
        //write new service
        const newService = {
            name: serviceName.trim(),
            price: priceNum,
            durationMinutes: durationMinutesNum,
            bufferMinutes: bufferMinutesNum,
            isMobile: isMobile
        }
        //for "edit" button /replace existing service
        if(editingIndex !== null) {
            //if we're editing an existing service(if editingIndex is not null, replace with the index of the service we're editing), if not index, stay service
            // editingIndex !== null means we are editing an existing service because editingIndex contains its position, such as 0 or 1.

            //replace the existing service
            setServices(services.map((service, index) => 
                index === editingIndex ? newService : service))
            //"If the current service's index equals the index we're editing, use newService; otherwise, keep the original service."
                    // ex: 
                    // editingIndex = 1
                    // When .map() checks each service:
                    // Current index  index === editingIndex?    Returned value
                    //             0  0 === 1 → false            Original Gel Manicure
                    //             1  1 === 1 → true             New Service
                    //             2  2 === 1 → false            Original Nail Art


        //for "add service" button / add new service          
        }else{// editingIndex === null means we are adding a new service because no service is currently selected for editing.
            setServices([...services, newService])//"Copy all the existing services into a new array, then add newService at the end."
        }

        // clear the inputs for next service
        setServiceName('') 
        setServicePrice('')
        setDurationMinutes('') //this will clear the input and reset to 0 before click on save to mongoDB
        setBufferMinutes('')
        setIsMobile(false)
        setEditingIndex(null)
        setError('')//clear the error message after adding a service
        // ★ [...services] = copy of the current list, then add one new object at the end
        // name  (key the backend expects) = serviceName  (typed in the name input)
        // price (key the backend expects) = servicePrice (typed in the price input)
        // setServices replaces the old list with this new one
    }

    //create a new client
    const handleSubmit = async () => {
        setSubmitError('')
        try{
            const res = await fetch('http://localhost:4000/clients' , {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': 'putaroErikoLove2026'
                },
                body: JSON.stringify({
                    //from useState
                    name,
                    services,//has serviceName and servicePrice
                    durationMinutes: Number(durationMinutes),
                    bufferMinutes: Number(bufferMinutes),
                    isMobile
                })
            })

            const data = await res.json()
            if(!res.ok){
                setSubmitError(data.error || "Something went wrong")
                return //stop function here
            }
            //to get bookingToken to display, get generated bookingToken from backend 
            //backend returns the full client, including her new token
            setBookingToken(data.bookingToken)//For POST(create new client in admin page)
            setClientId(data._id)//For PATCH(add service in admin page)-which MongoDB client to update by _id
            
        }catch(err){
            setSubmitError(err.message)
        }
    }
    
    //go to selected client's page
    const selectExistingClient = () => {
        const client = clients.find(//clients is state
            //find the client that matches the selectedClientId
            (client) => client._id === selectedClientId
        )

        if(!client) return //if no client found, stop function here

        setClientId(client._id)
        setName(client.name)
        setServices(client.services)
        setDurationMinutes(String(client.durationMinutes ?? '')) //?? if it is null or undefined, use the value on the right ''
        setBufferMinutes(String(client.bufferMinutes ?? ''))
        setIsMobile(client.isMobile)
        setBookingToken(client.bookingToken)

        //clear the inputs
        setServiceName('') 
        setServicePrice('')
        setDurationMinutes('')
        setBufferMinutes('')
        setIsMobile(false)
        setError('')
    }


    const saveClient = async () => {
        // setSubmitError('')
        try{
            const res = await fetch(`http://localhost:4000/clients/${clientId}` , {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': 'putaroErikoLove2026'
                },
                body: JSON.stringify({
                    //from useState
                    name,
                    services,//has serviceName and servicePrice
                    durationMinutes: Number(durationMinutes),
                    bufferMinutes: Number(bufferMinutes),
                    isMobile
                })
            })

            const data = await res.json()
            if(!res.ok){
                setSubmitError(data.error || "Something went wrong")
                return //stop function here
            }
console.log({saveClient})
            //--> No need since only in editing page, id and token will not change
            //to get bookingToken to display, get generated bookingToken from backend 
            //backend returns the full client, including her new token
            //form stays visible until "Start a new client" is clicked
            // setBookingToken(data.bookingToken)//For POST(create new client in admin page) //bookingToken from data and put it into bookingToken state (bookingToken is saved in MongoDB, and data is the response received by AdminPage)//passed by fetching backend
            // setClientId(data._id)//For PATCH(add service in admin page) //_id from data and put it into clientId state(_id is saved in MongoDB, and data is the response received by AdminPage)//passed by fetching backend

        setServiceName('') // ★ clear leftover scratch-pad inputs after a successful save
        setServicePrice('')
        setError('')
        setSubmitError('') // ★ clear any old error too, since this save succeeded
            
// POST
// AdminPage
//    ↓
// Backend
//    ↓
// Client.create()
//    ↓
// MongoDB client
//    ├── _id
//    └── bookingToken
//    ↓
// res.json(client)
//    ↓
// AdminPage: data
//    ├── data._id → clientId state
//    └── data.bookingToken → bookingToken state

        }catch(err){
            setSubmitError(err.message)
        }
    }

    //cleared out including bookingToken
    const startNewClient = () => {
        setName('')
        setServices([])
        setDurationMinutes('')
        setBufferMinutes('')
        setIsMobile(false)
        setBookingToken('')
        setSubmitError('')
    }

    //cleared out when go back to loading page
    const goBack = () => {
        setClientId('')
        setSelectedClientId('')
        setName('')
        setServices([])
        setDurationMinutes('')
        setBufferMinutes('')
        setIsMobile(false)
        setServiceName('')
        setServicePrice('')
        setBookingToken('')
        setSubmitError('')
        setError('')
    }

    const editService = (index: number) => {
        const service = services[index]
//to load the selected service's information into the form
        setServiceName(service.name)
        setServicePrice(service.price)
        setDurationMinutes(service.durationMinutes)
        setBufferMinutes(service.bufferMinutes)
        setIsMobile(service.isMobile)

        setEditingIndex(index)
        setError('')
    }

    const deleteService = (index: number) => {
        //keep this item if its position i id not equal to index to be deleted

// index = the one specific position you clicked delete on — "the one you want to remove"
// filter keeps everything where the condition is true — so it keeps every i that is not index
// In other words: everything survives except the one you pointed at(which is index)
// i !== index is true --> stay
// i === index is false --> remove


// services.filter((_, i) => i !== index)
//                ^   ^
//                |   └─ i: the index (position) of this item — this is what we actually use(The item itself (the actual service object, e.g. {name: "Gel Mani", price: 85}))
//                └───── _: the item itself (the service object) — ignored, not used()


        setServices(services.filter((_, i) => i !== index))//keep every service except the one at index/ remove the service at index
    } 

return (
    <div>
     {!clientId ? (//admin landing page(before I create a client)
        <div>
            <div>
                <input type="text" placeholder="Name" value={name} onChange = {(e) => setName(e.target.value)} /> 
                <input type="text" placeholder="Service Time (mins)" value={durationMinutes} onChange = {(e) => setDurationMinutes(e.target.value)} /> 
                <input type="text" placeholder="Extra Time (mins)" value={bufferMinutes} onChange = {(e) => setBufferMinutes(e.target.value)} /> 
                {/* ★ checkbox uses "checked", not "value" */}
                <label><input type="checkbox" checked={isMobile} onChange = {(e) => setIsMobile(e.target.checked)} /> Mobile service </label>
                <input type="text" placeholder="Service Name" value={serviceName} onChange = {(e) => setServiceName(e.target.value)} /> 
                {/* value={serviceName} connects to useState, input displays this state */}
                <input type="text" placeholder="Price" value={servicePrice} onChange = {(e)=> setServicePrice((e.target.value))}/>
            </div>
            <p>{error}</p>
            <button onClick = {addService}>Add Service</button>
            <ul>
                {services.map((s,i)=> (
                    <li key={i}>{s.name} - ${s.price} - service time: {s.durationMinutes} mins - buffer time: {s.bufferMinutes} mins - {s.isMobile ? "mobile" : "not mobile"}</li>
                ))}
            </ul>
                {/* handleSubmit gets the newly created client's MongoDB _id-> clientId is no longer empty, so it will change to existing client page */}
            <button type="button" onClick={handleSubmit}>Create New Client</button>
        {/* if submitError a message, show a <p>{submitError}</p> */}
            {submitError && <p>{submitError}</p>} 
            {/* if bookingToken has a real value, show the link */}
            {bookingToken && 
                <p>Link: http://localhost:3000/book/{bookingToken}</p>
            
            }
        <div>
                <p>=============================</p>
        <label htmlFor="client">Select an existing Client</label>
            {/* id attribute: Links the dropdown to a label via the for attribute. */}
        <br></br>
        
        <select 
            name="client" 
            id="client"
            value={selectedClientId} //connects to useState
            onChange={(e)=> setSelectedClientId(e.target.value)}//select from dropdown and change to the selected client
            > 
            {/* disabled display initially, but does not allow the user to select it */}
            <option value=""  disabled>Select a client</option>
            {clients.map((client)=> (
                // client._id is the MongoDB client's _id
                 <option 
                 key={client._id} // key={client._id} / Helps React identify this item in the list
                 // value={client._id} /The value the dropdown returns when selected / connects to <select> (e.target.value)
                 value={client._id}
                 > 
                {client.name}
                </option>
            ))}
        </select>
<br></br>   
            {/* Will navigate to selected existing client page */}
            {/* ====setClientId(selectedClientId)===== */}
            {/* setClientId-> pick admin landing page to existing client page */}
            {/* and then selectedClientId -> select existing client from the dropdown*/}
                <button onClick={selectExistingClient} type="button" >
                        [Edit/Add Services]
                </button>
            </div>
        </div>
        ) : 
        (//existing client's page (after I create a client)
      <div>
            <button //empty clientId is admin landing page, if clientId, selected client's page + cleared all data including clientId will go back to admin loading page
            type="button"
            onClick={goBack}
            >
            Back
            </button>
            <div>
                <input type="text" placeholder="Name" value={name} onChange = {(e) => setName(e.target.value)} /> 
                <input type="text" placeholder="Service Time (mins)" value={durationMinutes} onChange = {(e) => setDurationMinutes(e.target.value)} /> 
                <input type="text" placeholder="Extra Time (mins)" value={bufferMinutes} onChange = {(e) => setBufferMinutes(e.target.value)} /> 
                {/* ★ checkbox uses "checked", not "value" */}
                <label><input type="checkbox" checked={isMobile} onChange = {(e) => setIsMobile(e.target.checked)} /> Mobile service </label>
                <input type="text" placeholder="Service Name" value={serviceName} onChange = {(e) => setServiceName(e.target.value)} /> 
                {/* value={serviceName} connects to useState, input displays this state */}
                <input type="text" placeholder="Price" value={servicePrice} onChange = {(e)=> setServicePrice((e.target.value))}/>
            </div>
            <p>{error}</p>

            {/* if editing, "Update Service" button, if adding new service, "add service" button */}
            <button onClick = {addService}>
                {editingIndex !== null 
                ? "Update Service" 
                : "Add Service"}
                </button><br></br>
            <br/>
            <ul>
                {services.map((s,i)=> (
                    <li key={i}>{s.name} - ${s.price} - service time: {s.durationMinutes} mins - buffer time: {s.bufferMinutes} mins - {s.isMobile ? "mobile" : "not mobile"}
                        <button type="button" onClick={()=> editService(i)}>[Edit]</button>
                        <button type="button" onClick={()=> deleteService(i)}>[Delete]</button>
                    </li>
                ))}
            </ul>

             <br/>
        {/* save added service into mongoDB */}
            <button type="button" onClick={saveClient}>Save</button>
        {/* if submitError a message, show a <p>{submitError}</p> */}
            {submitError && <p>{submitError}</p>} 
        {/* if bookingToken has a real value, show the link
            {bookingToken && 
                <p>Link: http://localhost:3000/book/{bookingToken}</p>
            
            } */}
        </div>
        )}

    </div>
   )
}

// {addService} → adds a service to the current services array in React.
// {editService} → would edit one service in the React services array.
// {saveClient} → sends the current client data to MongoDB.
// PATCH → tells the backend to update the existing client with the data you send(Add service and Edit Service).

// addService() - Adds a new service to the services array - React state(display input changes)
// editService() - Loads an existing service into the inputs - Inputs only
// updateService() - Replaces an existing service in the services array - React state(display input changes)
// saveClient() - Sends the complete client data using PATCH - MongoDB