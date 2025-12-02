document.addEventListener('DOMContentLoaded', () => {
    // --- Food Anatomy Interaction ---
    const dishContainer = document.getElementById('dish-container');

    if (dishContainer) {
        dishContainer.addEventListener('click', () => {
            dishContainer.classList.toggle('exploded');
        });
    }

    // --- Delivery Tracking Simulation ---
    const steps = document.querySelectorAll('.step');
    const progressBar = document.getElementById('track-progress');
    const scooter = document.getElementById('delivery-scooter');
    const simulateBtn = document.getElementById('simulate-delivery');

    let currentStep = 0;
    let isSimulating = false;

    if (simulateBtn) {
        simulateBtn.addEventListener('click', () => {
            if (isSimulating) return;
            isSimulating = true;
            currentStep = 0;
            updateTracker();

            const interval = setInterval(() => {
                currentStep++;
                if (currentStep >= steps.length) {
                    clearInterval(interval);
                    isSimulating = false;
                    return;
                }
                updateTracker();
            }, 1500); // Change step every 1.5 seconds
        });
    }

    function updateTracker() {
        // Update Steps
        steps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update Progress Bar
        const progress = (currentStep / (steps.length - 1)) * 100;
        if (progressBar) progressBar.style.width = `${progress}%`;

        // Update Scooter Position
        if (scooter) scooter.style.left = `${progress}%`;
    }
});
