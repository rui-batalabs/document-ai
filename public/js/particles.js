//Generate particles
particlesJS('particles-js', {
    particles: {
      number: {
        value: 100, // Number of particles
        density: { enable: true, value_area: 800 } // Density of particles
      },
      color: {
        value: '#ffffff' // Particle color (white)
      },
      shape: {
        type: 'circle', // Particle shape
        stroke: { width: 0, color: '#000000' } // No stroke
      },
      opacity: {
        value: 0.5, // Particle opacity
        random: true, // Random opacity for particles
        anim: { enable: true, speed: 1, opacity_min: 0 } // Animation for opacity
      },
      size: {
        value: 3, // Size of the particles
        random: true, // Random size for particles
        anim: { enable: true, speed: 5, size_min: 0.1 } // Animation for particle size
      },
      line_linked: {
        enable: true, // Enable lines between particles
        distance: 150, // Distance between particles to form a line
        color: '#ffffff', // Line color (white)
        opacity: 0.4, // Line opacity
        width: 1 // Line width
      },
      move: {
        enable: true, // Enable particle movement
        speed: 2, // Speed of particle movement
        direction: 'random', // Random movement direction
        random: true, // Random movement pattern
        straight: false, // No straight-line movement
        out_mode: 'out', // Particles will exit the screen when they move out
        bounce: false // No bounce when particles hit edges
      }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: 'repulse' } // Interactivity: particles repel on hover
      }
    },
    retina_detect: true // Detect high DPI screens and adjust particles accordingly
  });
 