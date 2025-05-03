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

    // Global variable to store all bookings
    let allBookings = [];

    // Function to fetch and display bookings
    function loadBookings() {
        fetch('json/database.json')
            .then(response => response.json())
            .then(data => {
                allBookings = data.bookings;
                applyFilters();
            })
            .catch(error => console.error('Error loading bookings:', error));
    }

    // Main filtering function
    function applyFilters() {
        const textFilter = document.getElementById('text-filter').value.toLowerCase();
        const dateFilter = document.getElementById('date-filter').value;
        const timeFilter = document.getElementById('time-filter').value;
        const statusFilter = document.getElementById('status-filter').value;

        // Detect current status based on URL
        const currentPage = window.location.pathname.split("/").pop();
        let filteredBookings = allBookings;

        // First apply page-specific filter
        if (currentPage === "pending.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Pending");
        } else if (currentPage === "confirmed.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Confirmed");
        } else if (currentPage === "postponded.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Postponed");
        } else if (currentPage === "cancelled.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Cancel");
        } else if (currentPage === "completed.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Complete");
        } else if (currentPage === "notarrived.html") {
            filteredBookings = filteredBookings.filter(b => b.status === "Not Arrived");
        }

        // Apply text filter (search across multiple fields)
        if (textFilter) {
            filteredBookings = filteredBookings.filter(booking => 
                booking.name.toLowerCase().includes(textFilter) ||
                booking.phone_no.toLowerCase().includes(textFilter) ||
                booking.date.toLowerCase().includes(textFilter) ||
                booking.time.toLowerCase().includes(textFilter) ||
                booking.status.toLowerCase().includes(textFilter) ||
                (booking.id && booking.id.toString().includes(textFilter))
            );
        }

        // Apply date filter
        if (dateFilter) {
            filteredBookings = filteredBookings.filter(booking => 
                booking.date === dateFilter
            );
        }

        // Apply time filter
        if (timeFilter) {
            const [startHour, endHour] = timeFilter.split('-').map(Number);
            filteredBookings = filteredBookings.filter(booking => {
                const bookingHour = parseInt(booking.time.split(':')[0]);
                return bookingHour >= startHour && bookingHour < endHour;
            });
        }

        // Apply status filter (only if not on a status-specific page)
        if (statusFilter && !currentPage.includes(statusFilter.toLowerCase())) {
            filteredBookings = filteredBookings.filter(booking => 
                booking.status === statusFilter
            );
        }

        // Display the filtered results
        displayBookings(filteredBookings);
    }

    // Function to display bookings in the table
    function displayBookings(bookings) {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        bookings.forEach(booking => {
            const row = document.createElement('tr');
            
            // Create table cells
            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.name}</td>
                <td>${booking.phone_no}</td>
                <td>${booking.date}</td>
                <td>${booking.time}</td>
                <td>
                    <select class="status-select">
                        <option value="Pending" ${booking.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${booking.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Postponed" ${booking.status === 'Postponed' ? 'selected' : ''}>Postponed</option>
                        <option value="Cancel" ${booking.status === 'Cancel' ? 'selected' : ''}>Cancel</option>
                        <option value="Complete" ${booking.status === 'Complete' ? 'selected' : ''}>Complete</option>
                        <option value="Not Arrived" ${booking.status === 'Not Arrived' ? 'selected' : ''}>Not Arrived</option>
                    </select>
                </td>
                <td>
                    <textarea class="reply-textarea" placeholder="Type your reply...">${booking.reply || ''}</textarea>
                </td>
                <td>
                    <button class="update-btn" data-id="${booking.id}">Update</button>
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
    }
    
    function updateBooking(id, status, reply) {
        // In a real app, this would be a fetch call to your API
        console.log(`Updating booking ${id} to status ${status} with reply: ${reply}`);
        
        // For demo purposes, we'll just update the local data and refresh
        const booking = allBookings.find(b => b.id == id);
        if (booking) {
            booking.status = status;
            booking.reply = reply;
        }
        
        // Reapply filters to refresh the view
        applyFilters();
        
        // In a real app, you might want to show a success message
        alert('Booking updated successfully!');
    }

    // Add event listeners for filter controls
    document.querySelector('.apply-filters').addEventListener('click', applyFilters);
    
    document.querySelector('.clear-filters').addEventListener('click', function() {
        // Reset all filter inputs
        document.getElementById('text-filter').value = '';
        document.getElementById('date-filter').value = '';
        document.getElementById('time-filter').value = '';
        document.getElementById('status-filter').value = '';
        
        // Reapply filters (which will now show all)
        applyFilters();
    });

    // Add event listeners for instant filtering (optional)
    // document.getElementById('text-filter').addEventListener('input', applyFilters);
    // document.getElementById('date-filter').addEventListener('change', applyFilters);
    // document.getElementById('time-filter').addEventListener('change', applyFilters);
    // document.getElementById('status-filter').addEventListener('change', applyFilters);

    // Initial load
    loadBookings();
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize datepicker
    $(".datepicker").datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true
    });

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

    // Function to filter table rows
    function filterTable() {
        const dateFilter = document.getElementById('date-filter').value.toLowerCase();
        const nameFilter = document.getElementById('name-filter').value.toLowerCase();
        const timeFilter = document.getElementById('time-filter').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value.toLowerCase();
        const replyFilter = document.getElementById('reply-filter').value.toLowerCase();

        const rows = document.querySelectorAll('.booking-table tbody tr');
        
        rows.forEach(row => {
            const date = row.cells[2].textContent.toLowerCase();
            const name = row.cells[1].textContent.toLowerCase();
            const time = row.cells[3].textContent.toLowerCase();
            const status = row.querySelector('.status-select').value.toLowerCase();
            const reply = row.cells[5].querySelector('textarea').value.toLowerCase();

            const dateMatch = date.includes(dateFilter) || !dateFilter;
            const nameMatch = name.includes(nameFilter) || !nameFilter;
            const timeMatch = time.includes(timeFilter) || !timeFilter;
            const statusMatch = status.includes(statusFilter) || !statusFilter;
            const replyMatch = reply.includes(replyFilter) || !replyFilter;

            if (dateMatch && nameMatch && timeMatch && statusMatch && replyMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Add event listeners to all filter inputs
    document.getElementById('date-filter').addEventListener('change', filterTable);
    document.getElementById('name-filter').addEventListener('input', filterTable);
    document.getElementById('time-filter').addEventListener('input', filterTable);
    document.getElementById('status-filter').addEventListener('change', filterTable);
    document.getElementById('reply-filter').addEventListener('input', filterTable);

    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', function() {
        document.getElementById('date-filter').value = '';
        document.getElementById('name-filter').value = '';
        document.getElementById('time-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('reply-filter').value = '';
        filterTable();
    });

    // Load bookings (your existing loadBookings function)
    loadBookings();
});

// Your existing loadBookings function remains the same
// ...
