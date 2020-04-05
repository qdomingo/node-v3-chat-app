const users = []

const addUser = ({ id, username, room}) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.name === username
    })

    // Validate username
    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room}
    users.push(user)

    return { user }
}

const removeUser = (id) => {
    // We find the index
    const index = users.findIndex((user) => user.id === id)
    // We remove the item
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {

    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {

    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}