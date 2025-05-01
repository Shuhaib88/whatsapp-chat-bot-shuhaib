// Set active nav item
function setActive(element) {
    const items = document.querySelectorAll(".nav-links li");
    items.forEach((item) => item.classList.remove("active"));
    element.classList.add("active");
}

// Handle update button clicks
function handleUpdateClick(event) {
    const row = event.target.closest("tr");
    const status = row.querySelector(".status-select").value;
    const reply = row.querySelector(".reply-textarea").value;

    // In a real app, you would send this data to the server
    console.log("Updating booking:", { status, reply });

    // Show a confirmation message
    alert("Booking updated successfully!");

    // If status changed from pending, remove the row
    if (status !== "pending") {
        row.remove();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {

    // Set the active nav item based on current page
        const currentPage = window.location.pathname.split("/").pop();
        const navItems = document.querySelectorAll(".nav-links li");

        navItems.forEach((item) => {
            if (
                (currentPage === "index.html" &&
                    item.textContent.includes("Dashboard")) ||
                (currentPage === "pending.html" &&
                    item.textContent.includes("Pending")) ||
                (currentPage === "confirmed.html" &&
                    item.textContent.includes("Confirmed")) ||
                (currentPage === "postponded.html" &&
                    item.textContent.includes("Postponed")) ||
                (currentPage === "cancelled.html" &&
                    item.textContent.includes("Cancelled")) ||
                (currentPage === "total.html" && item.textContent.includes("Total"))
            ) {
                item.classList.add("active");
            }
        });

    // Function to fetch and display bookings
    function loadBookings() {
        fetch('json/database.json')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('tbody');
                tbody.innerHTML = ''; // Clear existing rows

                // Detect current status based on URL
                const currentPage = window.location.pathname.split("/").pop();
                let filteredBookings = data.bookings;

                if (currentPage === "pending.html") {
                    filteredBookings = data.bookings.filter(b => b.status === "pending");
                } else if (currentPage === "confirmed.html") {
                    filteredBookings = data.bookings.filter(b => b.status === "confirmed");
                } else if (currentPage === "postponded.html") {
                    filteredBookings = data.bookings.filter(b => b.status === "postponed");
                } else if (currentPage === "cancelled.html") {
                    filteredBookings = data.bookings.filter(b => b.status === "cancel");
                }
                // Else, show all for dashboard or total.html

                filteredBookings.forEach(booking => {
                    const row = document.createElement('tr');
                    
                    // Create table cells
                    row.innerHTML = `
                        <td>${booking.id}</td>
                        <td>${booking.name}</td>
                        <td>${booking.date}</td>
                        <td>${booking.time}</td>
                        <td>
                            <select class="status-select">
                                <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="postponed" ${booking.status === 'postponed' ? 'selected' : ''}>Postponed</option>
                                <option value="cancel" ${booking.status === 'cancel' ? 'selected' : ''}>Cancel</option>
                            </select>
                        </td>
                        <td>
                            <textarea class="reply-textarea" placeholder="Type your reply...">${booking.reply || ''}</textarea>
                        </td>
                        <td>
                            <button class="update-btn" data-id="${booking.id}" onclick="updateBooking(${booking.id})">Update</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // Add event listeners to all update buttons
                document.querySelectorAll('.update-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        const row = this.closest('tr');
                        const status = row.querySelector('.status-select').value;
                        const reply = row.querySelector('.reply-textarea').value;

                        updateBooking(id, status, reply);
                    });
                });
            })
            .catch(error => console.error('Error loading bookings:', error));
    }
    
    function updateBooking(id, status, reply) {
        fetch(`/api/bookings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status, reply: reply })
        })
        .then(res => {
            if (res.ok) {
                alert('Booking confirmed');
                location.reload();
            } else {
                alert('Failed to update');
            }
        });
    }
    // Initial load
    loadBookings();
});
