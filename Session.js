// session.js

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = parseInt(params.get('sessionId'));
    const eventList = document.getElementById('eventLogList');
    const storedSessions = JSON.parse(localStorage.getItem('sessions')) || [];
    
    const session = storedSessions[sessionId];
    if (session && session.events) {
        session.events.forEach(event => {
            const li = document.createElement('li');
            li.textContent = event;
            eventList.appendChild(li);
        });
    } else {
        eventList.innerHTML = '<li>No events found for this session.</li>';
    }
});