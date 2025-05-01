// Simulate dynamic data updates
function updateDashboardData() {
    // In a real app, you would fetch this data from an API
    const pending = Math.floor(Math.random() * 50) + 10;
    const confirmed = Math.floor(Math.random() * 200) + 100;
    const total = pending + confirmed;

    document.getElementById("pending-value").textContent = pending;
    document.getElementById("confirmed-value").textContent = confirmed;
    document.getElementById("total-value").textContent = total;
}

// Update data every 5 seconds to simulate live data
setInterval(updateDashboardData, 3000);


// Initialize the page
// Set active nav item
document.addEventListener("DOMContentLoaded", function() {
    // Set active nav item based on current page
    const currentPage = window.location.pathname.split("/").pop();
    const navItems = document.querySelectorAll(".nav-links li");
    
    navItems.forEach(item => {
        const page = item.getAttribute("data-page");
        
        // Set active state on page load
        if (currentPage === page || 
            (currentPage === "" && page === "dashboard.html") ||
            (currentPage === "index.html" && page === "dashboard.html")) {
            item.classList.add("active");
        }
        
        // Handle click events
        item.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(i => i.classList.remove("active"));
            
            // Add active class to clicked item
            this.classList.add("active");
            
            // Navigate to the new page after a small delay
            setTimeout(() => {
                window.location.href = this.getAttribute("data-page");
            }, 100);
        });
    });
    
    updateDashboardData();
});
