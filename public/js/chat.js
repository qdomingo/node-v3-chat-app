const socket = io()

// Elements
const $chatForm = document.querySelector('#message-form')
const $messageFormInput = $chatForm.querySelector('input')
const $messageFormButton = $chatForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemaplate = document.querySelector('#message-template').innerHTML
const locationTemaplate = document.querySelector('#location-template').innerHTML
const sidebarTemaplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {

    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessagesStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// Add Listeners to the elements
$chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    $messageFormButton.setAttribute('disabled','disabled')

    // const sentence =  event.target.elements.message.value // To access to the input value using the event
    const sentence = $messageFormInput.value
    socket.emit('messageToServer', sentence, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log('The message was delivered')
    })
});

$locationButton.addEventListener('click', (event) => {
    if(!navigator.geolocation) {
        return alert('Geolocation is no supported by your broser')
    }

    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', currentPosition, (cbMessage) => {
            $locationButton.removeAttribute('disabled')
            console.log(cbMessage)
        })
    })
    
});

// Socket part
socket.on('messageToClient', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemaplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendLocation', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemaplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('H:mm:ss')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemaplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

socket.emit('join', { username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})