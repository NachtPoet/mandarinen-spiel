/**
 * animations.js
 * Animations utility functions for the Mandarinen game
 */

// Create confetti effect when finding words or completing levels
function createConfetti(amount = 10) {
  const container = document.getElementById('gameContainer');
  
  for (let i = 0; i < amount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random confetti styles
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-5vh';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = (Math.random() * 10 + 5) + 'px';
      
      // Add the confetti to the container
      container.appendChild(confetti);
      
      // Animate the confetti
      const fallDuration = Math.random() * 2 + 1;
      confetti.style.animation = `fall ${fallDuration}s linear forwards`;
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove();
      }, fallDuration * 1000);
    }, i * 100);
  }
}

// Add shine effect to an element
function addShineEffect(element) {
  const shine = document.createElement('div');
  shine.className = 'shine-effect';
  element.appendChild(shine);
  
  // Trigger animation
  setTimeout(() => {
    shine.style.animation = 'shine 1.5s ease-in-out';
    setTimeout(() => {
      shine.remove();
    }, 1500);
  }, 10);
}

// Update progress bar with animation
function updateProgressBar(current, total, progressBarElement) {
  if (!progressBarElement) return;
  
  const percentage = (current / total) * 100;
  
  // Use requestAnimationFrame for smooth animation
  requestAnimationFrame(() => {
    progressBarElement.style.width = percentage + '%';
    
    // Add glow at certain milestones
    if (current > 0 && current % Math.ceil(total / 4) === 0) {
      progressBarElement.classList.add('progress-milestone');
      setTimeout(() => {
        progressBarElement.classList.remove('progress-milestone');
      }, 1000);
    }
  });
}

// Add shake animation to an element
function shakeElement(element, intensity = 'medium') {
  if (!element) return;
  
  const intensityValue = {
    'light': 'shake-light',
    'medium': 'shake-medium',
    'hard': 'shake-hard'
  }[intensity] || 'shake-medium';
  
  element.classList.add(intensityValue);
  
  setTimeout(() => {
    element.classList.remove(intensityValue);
  }, 500);
}

// Export functions to global scope
window.createConfetti = createConfetti;
window.addShineEffect = addShineEffect;
window.updateProgressBar = updateProgressBar;
window.shakeElement = shakeElement; 